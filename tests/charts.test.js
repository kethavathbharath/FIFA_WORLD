/**
 * @file charts.test.js
 * @description Unit tests for NexusCharts Palette and Configuration helpers
 */

const NexusCharts = require('../js/charts.js');

describe('NexusCharts Configuration Library Unit Tests', () => {

  test('Verify colors palette declarations exist with correct HEX codes', () => {
    expect(NexusCharts.colors).toBeDefined();
    
    // Assert HEX colors are valid
    expect(NexusCharts.colors.cyan).toBe('#00F7FF');
    expect(NexusCharts.colors.pink).toBe('#FF0087');
    expect(NexusCharts.colors.green).toBe('#4DFFBE');
    expect(NexusCharts.colors.gold).toBe('#FFDE73');
    expect(NexusCharts.colors.purple).toBe('#A78BFA');
    expect(NexusCharts.colors.orange).toBe('#FF8C42');
    expect(NexusCharts.colors.textPrimary).toBe('#FFFFFF');
    expect(NexusCharts.colors.textSecondary).toBe('#94A3B8');
  });

  test('Verify chart configuration creation wrappers are exported', () => {
    expect(NexusCharts.createLineChart).toBeInstanceOf(Function);
    expect(NexusCharts.createBarChart).toBeInstanceOf(Function);
    expect(NexusCharts.createDoughnutChart).toBeInstanceOf(Function);
    expect(NexusCharts.createGauge).toBeInstanceOf(Function);
    expect(NexusCharts.createHeatmap).toBeInstanceOf(Function);
    expect(NexusCharts.createRadar).toBeInstanceOf(Function);
    expect(NexusCharts.createSparkline).toBeInstanceOf(Function);
    expect(NexusCharts.updateGauge).toBeInstanceOf(Function);
    expect(NexusCharts.updateLineChart).toBeInstanceOf(Function);
    expect(NexusCharts.destroyChart).toBeInstanceOf(Function);
  });
});
