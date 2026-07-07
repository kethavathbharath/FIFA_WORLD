/**
 * @file a11y.test.js
 * @description Integration unit tests verifying accessibility parameters
 */

const fs = require('fs');
const path = require('path');

describe('Accessibility Standards Verification (A11y)', () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.join(__dirname, '../index.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
  });

  test('Verify tablist role exists on sidebar navigation', () => {
    expect(htmlContent).toContain('role="tablist"');
  });

  test('Verify tab role exists on all navigation menu items', () => {
    const tabMatches = htmlContent.match(/role="tab"/g) || [];
    expect(tabMatches.length).toBe(6); // 6 core modules
  });

  test('Verify focusable keyboard navigation using tabindex', () => {
    const tabindexMatches = htmlContent.match(/tabindex="0"/g) || [];
    expect(tabindexMatches.length).toBe(6); // 6 core modules must be focusable
  });

  test('Verify screen readers ignores decorative icons using aria-hidden', () => {
    expect(htmlContent).toContain('aria-hidden="true"');
    const ariaHiddenMatches = htmlContent.match(/aria-hidden="true"/g) || [];
    expect(ariaHiddenMatches.length).toBe(6);
  });

  test('Verify explicit labels are declared for screen readers using aria-label', () => {
    expect(htmlContent).toContain('aria-label=');
    const ariaLabelMatches = htmlContent.match(/aria-label="/g) || [];
    expect(ariaLabelMatches.length).toBeGreaterThanOrEqual(7);
  });
});
