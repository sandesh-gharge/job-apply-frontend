// ─────────────────────────────────────────────────────────────────────────────
// JobCountPipe — Phase 1 test
//
// What this pipe does:
//   Counts how many jobs in an array match a given JobStatus.
//   transform(jobs, 'Open')     → 2  (if 2 jobs have status 'Open')
//   transform(jobs, 'Rejected') → 1
//   transform(jobs, 'Applied')  → 0  (if no jobs have that status)
//
// Why no TestBed:
//   Same reason as CatClassPipe — no inject(), no Angular DI, plain class.
//
// New concept introduced here vs CatClassPipe:
//   - The input is a complex type (JobDetails[] + JobStatus enum)
//   - We build a shared fixture (mockJobs) so all tests use consistent data
//   - .toEqual() is shown alongside .toBe() to learn the difference
//   - it.each uses %i (integer placeholder) as well as %s
// ─────────────────────────────────────────────────────────────────────────────

import { JobCountPipe } from './job-count.pipe';
import { JobDetails, JobStatus } from '@app/utils/entities/job-details';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED FIXTURE
//
// A fixture is test data that represents realistic inputs.
// Defined at module scope (outside describe) because it never changes —
// it is the same for every test in this file.
//
// It covers:
//   Open × 2, Applied × 1, Rejected × 1, Offer × 1
// so every test has a known expected count to assert against.
// ─────────────────────────────────────────────────────────────────────────────
const mockJobs: JobDetails[] = [
  {
    companyName: 'Alpha Corp',
    role: 'Frontend Developer',
    companyLocation: 'Berlin',
    appliedDate: '2025-01-01',
    status: 'Open',
    jobDescription: 'Angular role',
  },
  {
    companyName: 'Beta Ltd',
    role: 'Full Stack Developer',
    companyLocation: 'Munich',
    appliedDate: '2025-01-05',
    status: 'Open',
    jobDescription: 'Node + Angular',
  },
  {
    companyName: 'Gamma GmbH',
    role: 'Backend Developer',
    companyLocation: 'Hamburg',
    appliedDate: '2025-01-10',
    status: 'Applied',
    jobDescription: 'NestJS role',
  },
  {
    companyName: 'Delta AG',
    role: 'Software Engineer',
    companyLocation: 'Frankfurt',
    appliedDate: '2025-01-12',
    status: 'Rejected',
    jobDescription: 'Java role',
  },
  {
    companyName: 'Epsilon Inc',
    role: 'Tech Lead',
    companyLocation: 'Stuttgart',
    appliedDate: '2025-01-15',
    status: 'Offer',
    jobDescription: 'Leadership role',
  },
];

describe('JobCountPipe', () => {

  let pipe: JobCountPipe;

  beforeEach(() => {
    pipe = new JobCountPipe();
  });

  // ─── Smoke test ────────────────────────────────────────────────────────────
  // Confirms instantiation works before running any logic tests.
  // If this fails, something is broken at the import/class level.
  // ───────────────────────────────────────────────────────────────────────────
  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  // ─── it.each() with status counts ──────────────────────────────────────────
  // Each row: [status to filter by, expected count from mockJobs above]
  //
  // %s → string placeholder (status name)
  // %i → integer placeholder (expected count)
  //
  // .toBe() is correct here because transform() returns a number (primitive).
  // For numbers: 2 === 2, so strict equality works perfectly.
  // ───────────────────────────────────────────────────────────────────────────
  it.each([
    // [status,          expectedCount]
    ['Open',             2],   // Alpha Corp + Beta Ltd
    ['Applied',          1],   // Gamma GmbH
    ['Rejected',         1],   // Delta AG
    ['Offer',            1],   // Epsilon Inc
    ['Withdrawn',        0],   // no withdrawn jobs in fixture
    ['1st Interview',    0],   // no interview jobs in fixture
  ] as [JobStatus, number][])(
    // %s → status string (first param), %i → integer count (second param)
    'counts %s jobs: expects %i result(s)',
    (status, expectedCount) => {
      const result = pipe.transform(mockJobs, status);
      expect(result).toBe(expectedCount);
    }
  );

  // ─── Edge case: empty array ─────────────────────────────────────────────────
  // The pipe uses .filter().length — an empty array always returns 0.
  // This is a boundary condition: the minimum possible input.
  // ───────────────────────────────────────────────────────────────────────────
  it('returns 0 when jobs array is empty', () => {
    const result = pipe.transform([], 'Open');
    expect(result).toBe(0);
  });

  // ─── Edge case: all jobs match ──────────────────────────────────────────────
  // The pipe should return the full array length when every item matches.
  // This tests the upper boundary of the filter.
  // ───────────────────────────────────────────────────────────────────────────
  it('returns the total count when all jobs have the same status', () => {
    const allOpen: JobDetails[] = [
      { ...mockJobs[0], status: 'Open' },
      { ...mockJobs[1], status: 'Open' },
      { ...mockJobs[2], status: 'Open' },
    ];

    const result = pipe.transform(allOpen, 'Open');

    // .toBe() — returns a number, strict equality is correct
    expect(result).toBe(3);

    // .toEqual() would also work for primitives, but .toBe() is preferred
    // for numbers and strings because it's more precise (checks type too)
    // expect(result).toEqual(3); ← also valid, just less idiomatic
  });

  // ─── Return type verification ───────────────────────────────────────────────
  // Confirms the pipe returns a number (not undefined, not a string).
  // Uses typeof assertion — a TypeScript-level guard surfaced in tests.
  // ───────────────────────────────────────────────────────────────────────────
  it('always returns a number', () => {
    const result = pipe.transform(mockJobs, 'Open');
    expect(typeof result).toBe('number');
  });

  // ─── Immutability check ─────────────────────────────────────────────────────
  // The pipe must NOT modify the original array (pure pipe contract).
  // .filter() creates a new array, so the original stays unchanged.
  // This tests an important contract of pure pipes.
  // ───────────────────────────────────────────────────────────────────────────
  it('does not mutate the input array', () => {
    const originalLength = mockJobs.length;

    pipe.transform(mockJobs, 'Open');

    // .toBe() — comparing a number (length), strict equality is correct
    expect(mockJobs.length).toBe(originalLength);
  });

  // ─── Demonstrating .not ────────────────────────────────────────────────────
  // .not negates any matcher. Use it when you want to assert what something
  // is NOT, rather than what it IS.
  // ───────────────────────────────────────────────────────────────────────────
  it('does not return the total job count when filtered by a specific status', () => {
    const result = pipe.transform(mockJobs, 'Open'); // should be 2, not 5
    expect(result).not.toBe(mockJobs.length);        // must NOT equal total (5)
    expect(result).not.toBe(0);                       // must NOT equal zero
  });
});
