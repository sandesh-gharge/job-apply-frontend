import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoTaskService, HealthResponse } from '../utils/services/demo-task.service';
import { ToastService } from '../utils/services/toast.service';
import { TranslationService } from '../utils/services/translation/translation.service';

@Component({
  selector: 'app-demo-task',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demo-task.html',
  styleUrls: ['./demo-task.scss']
})
export class DemoTaskComponent {
  public translate = inject(TranslationService);
  private demoTaskService = inject(DemoTaskService);
  private toastService = inject(ToastService);

  public healthStatus = signal<HealthResponse | null>(null);
  public loading = signal<boolean>(false);

  checkHealth(): void {
    this.loading.set(true);
    this.demoTaskService.checkHealth().subscribe({
      next: (res) => {
        this.healthStatus.set(res);
        this.toastService.show(this.translate.t().demoTask.toastSuccess, 'success');
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show(this.translate.t().demoTask.toastError, 'error');
        this.loading.set(false);
      }
    });
  }
}
