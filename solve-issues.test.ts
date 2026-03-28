import { describe, it, expect } from 'vitest';
import {
  buildClaudePrompt,
  buildPrBodyPrompt,
  type Issue,
} from './solve-issues';

const makeIssue = (overrides?: Partial<Issue>): Issue => ({
  number: 42,
  title: 'Add dark mode',
  body: 'Implement a dark mode toggle in the header.',
  ...overrides,
});

describe('buildClaudePrompt', () => {
  it('includes the issue number', () => {
    const prompt = buildClaudePrompt(makeIssue());
    expect(prompt).toContain('#42');
  });

  it('includes the issue title', () => {
    const prompt = buildClaudePrompt(makeIssue());
    expect(prompt).toContain('Add dark mode');
  });

  it('includes the issue body', () => {
    const prompt = buildClaudePrompt(makeIssue());
    expect(prompt).toContain('Implement a dark mode toggle in the header.');
  });

  it('includes the repo name', () => {
    const prompt = buildClaudePrompt(makeIssue());
    expect(prompt).toContain('jbburns/timezone-slider');
  });

  it('includes instructions to run tests', () => {
    const prompt = buildClaudePrompt(makeIssue());
    expect(prompt).toContain('Run the existing tests');
  });

  it('includes instructions to run build', () => {
    const prompt = buildClaudePrompt(makeIssue());
    expect(prompt).toContain('npm run build');
  });

  it('includes instructions to commit with issue reference', () => {
    const prompt = buildClaudePrompt(makeIssue());
    expect(prompt).toContain('references issue #42');
  });

  it('includes instructions to keep changes minimal', () => {
    const prompt = buildClaudePrompt(makeIssue());
    expect(prompt).toContain('Keep changes minimal');
  });

  it('does not include feedback section when no feedback', () => {
    const prompt = buildClaudePrompt(makeIssue());
    expect(prompt).not.toContain('Additional Feedback');
  });

  it('includes feedback when provided', () => {
    const prompt = buildClaudePrompt(makeIssue(), 'The button is in the wrong place');
    expect(prompt).toContain('Additional Feedback from Review');
    expect(prompt).toContain('The button is in the wrong place');
  });

  it('handles empty body', () => {
    const prompt = buildClaudePrompt(makeIssue({ body: '' }));
    expect(prompt).toContain('#42');
    expect(prompt).toContain('Add dark mode');
  });
});

describe('buildPrBodyPrompt', () => {
  it('includes the issue number', () => {
    const prompt = buildPrBodyPrompt(makeIssue());
    expect(prompt).toContain('#42');
  });

  it('includes the issue title', () => {
    const prompt = buildPrBodyPrompt(makeIssue());
    expect(prompt).toContain('Add dark mode');
  });

  it('includes the issue body', () => {
    const prompt = buildPrBodyPrompt(makeIssue());
    expect(prompt).toContain('Implement a dark mode toggle in the header.');
  });

  it('asks for Fixes #N', () => {
    const prompt = buildPrBodyPrompt(makeIssue());
    expect(prompt).toContain('Fixes #42');
  });

  it('asks for no markdown code fences', () => {
    const prompt = buildPrBodyPrompt(makeIssue());
    expect(prompt).toContain('No markdown code fences');
  });

  it('handles different issue numbers', () => {
    const prompt = buildPrBodyPrompt(makeIssue({ number: 99, title: 'Fix bug' }));
    expect(prompt).toContain('#99');
    expect(prompt).toContain('Fix bug');
    expect(prompt).toContain('Fixes #99');
  });
});
