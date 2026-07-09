// ─────────────────────────────────────────────────────────────────────────────
// CatClassPipe — Phase 1 test
//
// What this pipe does:
//   Converts a category string into a safe CSS class name.
//   "Software Engineer" → "software-engineer"
//   "C# Developer"      → "c--developer"
//
// Why no TestBed:
//   CatClassPipe has no inject(), no constructor dependencies, no Angular DI.
//   It is a plain class with one method — we instantiate it directly with `new`.
//
// globals: true is set in vitest.config.ts, so describe/it/expect are available
// globally without any imports.
// ─────────────────────────────────────────────────────────────────────────────

import { CatClassPipe } from './cat-class.pipe';

// ─── describe() ──────────────────────────────────────────────────────────────
// Groups all tests for CatClassPipe under one label.
// The label appears in the test runner output.
// ─────────────────────────────────────────────────────────────────────────────
describe('CatClassPipe', () => {

  // Declared here (outside beforeEach) so every it() inside this describe
  // can reference `pipe` without redeclaring it.
  let pipe: CatClassPipe;

  // ─── beforeEach() ──────────────────────────────────────────────────────────
  // Runs before EVERY it() in this describe block.
  // Creates a fresh pipe instance so tests never share state.
  // ───────────────────────────────────────────────────────────────────────────
  beforeEach(() => {
    pipe = new CatClassPipe(); // direct instantiation — no TestBed needed
  });

  // ─── it() — basic case ─────────────────────────────────────────────────────
  // A single focused test to demonstrate the AAA pattern clearly:
  //   Arrange → Act → Assert
  // ───────────────────────────────────────────────────────────────────────────
  it('should create an instance', () => {
    // ARRANGE: done by beforeEach above
    // ACT + ASSERT combined: verify the instance was created
    expect(pipe).toBeTruthy();
  });

  // ─── it.each() — parameterized tests ───────────────────────────────────────
  // Runs the same assertion body multiple times with different data rows.
  // Each inner array maps positionally to the callback parameters:
  //   [input, expected] → (input, expected) => { ... }
  //
  // %s in the description is filled with the value at that position.
  // Each row produces an independently reported test in the output.
  // ───────────────────────────────────────────────────────────────────────────
  it.each([
    // [input,                expected]                  // what is being tested
    ['Software Engineer',    'software-engineer'],       // space → single dash
    ['C# Developer',         'c--developer'],            // '#' and ' ' → two dashes
    ['Full-Stack',           'full-stack'],              // existing hyphen is preserved (it IS a-z0-9 minus)
    ['Angular 21',           'angular-21'],              // digit is preserved by [^a-z0-9]
    ['UPPERCASE ONLY',       'uppercase-only'],          // toLowerCase + space → dash
    ['react.js',             'react-js'],                // dot → dash
    ['node/express',         'node-express'],            // slash → dash
    ['',                     ''],                        // empty string edge case
  ])('transforms "%s" → "%s"', (input, expected) => {
    // ACT
    const result = pipe.transform(input);

    // ASSERT
    // .toBe() uses === (strict equality) — correct for string comparisons
    expect(result).toBe(expected);
  });

  // ─── Focused tests for specific regex behaviours ───────────────────────────
  // Explicit it() tests make the intent clearer for complex rules.
  // These complement the table above — they read like specifications.
  // ───────────────────────────────────────────────────────────────────────────

  it('lowercases all characters', () => {
    // Even if the regex replacement does nothing, casing must change
    const result = pipe.transform('ANGULAR');
    expect(result).toBe('angular');
  });

  it('replaces consecutive special characters with consecutive dashes', () => {
    // "C# " has two non-alphanumeric chars → '--'
    const result = pipe.transform('C# ');
    expect(result).toBe('c--');
  });

  it('preserves numbers in the output', () => {
    const result = pipe.transform('Angular21');
    // Numbers (0-9) are in the allowed set [a-z0-9] so they survive unchanged
    expect(result).toBe('angular21');
  });

  it('does not trim leading or trailing dashes', () => {
    // The pipe replaces chars but does not add extra trimming logic
    // " Angular " → '-angular-' because leading/trailing spaces become dashes
    const result = pipe.transform(' Angular ');
    expect(result).toBe('-angular-');
  });
});
