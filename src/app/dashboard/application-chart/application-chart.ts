import { Component, input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobDetails } from '../../utils/entities/job-details';
import { TranslationService } from '../../utils/services/translation/translation.service';

export type TimeFilter = '24h' | '1D' | '2D' | '1W' | '1M';
export type ChartType = 'bar' | 'line';

export interface ChartBucket {
  id: string;
  label: string;
  sublabel: string;
  count: number;
  interviewsCount: number;
  offersCount: number;
  rejectedCount: number;
  jobs: JobDetails[];
  x?: number;
  y?: number;
  barX?: number;
  barY?: number;
  barWidth?: number;
  barHeight?: number;
}

@Component({
  selector: 'app-application-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-chart.html',
  styleUrl: './application-chart.scss'
})
export class ApplicationChartComponent {
  public translate = inject(TranslationService);

  // Inputs
  jobs = input<JobDetails[]>([]);

  // State
  selectedTimeFilter = signal<TimeFilter>('1W');
  selectedChartType = signal<ChartType>('bar');
  hoveredIndex = signal<number | null>(null);

  // Chart Dimensions
  readonly svgWidth = 700;
  readonly svgHeight = 260;
  readonly paddingLeft = 45;
  readonly paddingRight = 25;
  readonly paddingTop = 35;
  readonly paddingBottom = 45;

  readonly drawWidth = this.svgWidth - this.paddingLeft - this.paddingRight;
  readonly drawHeight = this.svgHeight - this.paddingTop - this.paddingBottom;

  setTimeFilter(filter: TimeFilter) {
    this.selectedTimeFilter.set(filter);
    this.hoveredIndex.set(null);
  }

  setChartType(type: ChartType) {
    this.selectedChartType.set(type);
  }

  // Calculated Buckets based on selected TimeFilter
  buckets = computed<ChartBucket[]>(() => {
    const allJobs = this.jobs();
    const filter = this.selectedTimeFilter();
    const now = new Date();

    return this.generateBucketsForFilter(allJobs, filter, now);
  });

  // KPI Stats
  totalAppliedInPeriod = computed(() => {
    return this.buckets().reduce((acc, b) => acc + b.count, 0);
  });

  dailyAverage = computed(() => {
    const total = this.totalAppliedInPeriod();
    const filter = this.selectedTimeFilter();
    let days = 7;
    if (filter === '24h' || filter === '1D') days = 1;
    else if (filter === '2D') days = 2;
    else if (filter === '1W') days = 7;
    else if (filter === '1M') days = 30;

    return (total / days).toFixed(1);
  });

  peakPeriod = computed(() => {
    const b = this.buckets();
    if (b.length === 0) return 'N/A';
    let max = b[0];
    for (const bucket of b) {
      if (bucket.count > max.count) max = bucket;
    }
    return max.count > 0 ? max.label : 'N/A';
  });

  interviewRateInPeriod = computed(() => {
    const b = this.buckets();
    let totalJobs = 0;
    let totalInterviews = 0;
    for (const bucket of b) {
      totalJobs += bucket.count;
      totalInterviews += bucket.interviewsCount;
    }
    if (totalJobs === 0) return '0%';
    return Math.round((totalInterviews / totalJobs) * 100) + '%';
  });

  // Max value for Y-axis scaling
  maxCount = computed(() => {
    const maxInBuckets = Math.max(...this.buckets().map(b => b.count), 0);
    return Math.max(maxInBuckets, 4); // Min 4 so graph has scale headroom
  });

  // Y-Axis Gridlines
  yGridlines = computed(() => {
    const max = this.maxCount();
    const steps = 4; // 0, 25%, 50%, 75%, 100%
    const lines = [];
    for (let i = 0; i <= steps; i++) {
      const value = Math.round((max / steps) * (steps - i));
      const y = this.paddingTop + (this.drawHeight / steps) * i;
      lines.push({ value, y });
    }
    return lines;
  });

  // Processed Buckets with Chart SVG Coordinates
  chartBuckets = computed<ChartBucket[]>(() => {
    const rawBuckets = this.buckets();
    const max = this.maxCount();
    const n = rawBuckets.length;
    if (n === 0) return [];

    const slotWidth = this.drawWidth / n;
    const barW = Math.min(42, slotWidth * 0.55);

    return rawBuckets.map((b, i) => {
      const centerX = this.paddingLeft + (i + 0.5) * slotWidth;
      const heightRatio = Math.min(1, b.count / max);
      const barH = heightRatio * this.drawHeight;
      const centerY = this.paddingTop + (this.drawHeight - barH);

      return {
        ...b,
        x: centerX,
        y: centerY,
        barX: centerX - barW / 2,
        barY: centerY,
        barWidth: barW,
        barHeight: Math.max(barH, 3) // min 3px height visually
      };
    });
  });

  // SVG Smooth Bezier Path for Line Chart
  linePathD = computed(() => {
    const points = this.chartBuckets();
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M ${points[0].x},${points[0].y}`;
    }

    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cp1X = p1.x! + (p2.x! - p1.x!) / 2;
      const cp1Y = p1.y!;
      const cp2X = p1.x! + (p2.x! - p1.x!) / 2;
      const cp2Y = p2.y!;
      d += ` C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${p2.x},${p2.y}`;
    }
    return d;
  });

  // SVG Line Area Fill Path
  areaPathD = computed(() => {
    const points = this.chartBuckets();
    if (points.length === 0) return '';
    const lineD = this.linePathD();
    const lastP = points[points.length - 1];
    const firstP = points[0];
    const bottomY = this.paddingTop + this.drawHeight;

    return `${lineD} L ${lastP.x},${bottomY} L ${firstP.x},${bottomY} Z`;
  });

  // Hovered item helper
  hoveredBucket = computed(() => {
    const idx = this.hoveredIndex();
    if (idx === null) return null;
    return this.chartBuckets()[idx] || null;
  });

  private generateBucketsForFilter(jobs: JobDetails[], filter: TimeFilter, now: Date): ChartBucket[] {
    const buckets: ChartBucket[] = [];

    if (filter === '24h') {
      // 6 buckets of 4 hours leading up to now
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getTime() - (i + 1) * 4 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - i * 4 * 60 * 60 * 1000);

        const startStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const matchingJobs = jobs.filter(j => this.isJobInDateRange(j, start, end));

        buckets.push(this.buildBucket(
          `24h-${5 - i}`,
          `${startStr}`,
          `${startStr} - ${endStr}`,
          matchingJobs
        ));
      }
    } else if (filter === '1D') {
      // Today 00:00 to 23:59 split into 6 blocks of 4 hours
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      for (let i = 0; i < 6; i++) {
        const start = new Date(todayStart.getTime() + i * 4 * 60 * 60 * 1000);
        const end = new Date(todayStart.getTime() + (i + 1) * 4 * 60 * 60 * 1000);

        const startHour = String(i * 4).padStart(2, '0') + ':00';
        const endHour = String((i + 1) * 4).padStart(2, '0') + ':00';

        const matchingJobs = jobs.filter(j => this.isJobInDateRange(j, start, end));

        buckets.push(this.buildBucket(
          `1D-${i}`,
          startHour,
          `Today ${startHour} - ${endHour}`,
          matchingJobs
        ));
      }
    } else if (filter === '2D') {
      // Last 48 hours split into 6 blocks of 8 hours
      const start48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      for (let i = 0; i < 6; i++) {
        const start = new Date(start48h.getTime() + i * 8 * 60 * 60 * 1000);
        const end = new Date(start48h.getTime() + (i + 1) * 8 * 60 * 60 * 1000);

        const isToday = start.getDate() === now.getDate();
        const prefix = isToday ? 'Today' : 'Yest';
        const hourStr = String(start.getHours()).padStart(2, '0') + 'h';

        const matchingJobs = jobs.filter(j => this.isJobInDateRange(j, start, end));

        buckets.push(this.buildBucket(
          `2D-${i}`,
          `${prefix} ${hourStr}`,
          `${start.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${hourStr}`,
          matchingJobs
        ));
      }
    } else if (filter === '1W') {
      // Last 7 days (including today)
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

        const dayName = date.toLocaleDateString([], { weekday: 'short' });
        const sublabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

        const matchingJobs = jobs.filter(j => this.isJobInDateRange(j, start, end));

        buckets.push(this.buildBucket(
          `1W-${6 - i}`,
          dayName,
          `${dayName}, ${sublabel}`,
          matchingJobs
        ));
      }
    } else if (filter === '1M') {
      // Last 30 days divided into 6 5-day intervals
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getTime() - (i + 1) * 5 * 24 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - i * 5 * 24 * 60 * 60 * 1000);

        const label = `${start.getDate()}/${start.getMonth() + 1}`;
        const sublabel = `${start.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;

        const matchingJobs = jobs.filter(j => this.isJobInDateRange(j, start, end));

        buckets.push(this.buildBucket(
          `1M-${5 - i}`,
          label,
          sublabel,
          matchingJobs
        ));
      }
    }

    return buckets;
  }

  private isJobInDateRange(job: JobDetails, start: Date, end: Date): boolean {
    if (!job.appliedDate) return false;
    const jobDate = new Date(job.appliedDate);
    if (isNaN(jobDate.getTime())) return false;
    return jobDate >= start && jobDate <= end;
  }

  private buildBucket(id: string, label: string, sublabel: string, matchingJobs: JobDetails[]): ChartBucket {
    const interviewsCount = matchingJobs.filter(j => j.status?.includes('Interview')).length;
    const offersCount = matchingJobs.filter(j => j.status === 'Offer').length;
    const rejectedCount = matchingJobs.filter(j => j.status === 'Rejected').length;

    return {
      id,
      label,
      sublabel,
      count: matchingJobs.length,
      interviewsCount,
      offersCount,
      rejectedCount,
      jobs: matchingJobs
    };
  }
}
