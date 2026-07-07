/**
 * @file charts.test.js
 * @description Unit tests for NexusCharts Palette and Configuration helpers
 */

// Mock external browser libraries
global.echarts = {
  init: jest.fn(() => ({
    setOption: jest.fn(),
    dispose: jest.fn(),
    resize: jest.fn()
  }))
};

global.Chart = class {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.data = config.data || { labels: [], datasets: [] };
  }
  destroy() {}
  update() {}
};

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock HTMLCanvasElement.prototype.getContext to prevent console warnings in JSDOM
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn()
}));

const NexusCharts = require('../js/charts.js');

describe('NexusCharts Configuration Library Unit Tests', () => {

  beforeEach(() => {
    // Clean up body
    document.body.innerHTML = '';
  });

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

  test('Invoke createLineChart and update/destroy', () => {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'line-chart');
    document.body.appendChild(canvas);

    const chart = NexusCharts.createLineChart('line-chart', ['Jan'], [{ label: 'Fans', data: [100] }]);
    expect(chart).toBeDefined();

    NexusCharts.updateLineChart(chart, ['Jan', 'Feb'], [{ label: 'Fans', data: [100, 200] }]);
    NexusCharts.destroyChart(chart);
  });

  test('Invoke createBarChart', () => {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'bar-chart');
    document.body.appendChild(canvas);

    const chart = NexusCharts.createBarChart('bar-chart', ['Gate A'], [50], 'Flow', '#00F7FF');
    expect(chart).toBeDefined();
    NexusCharts.destroyChart(chart);
  });

  test('Invoke createDoughnutChart', () => {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'doughnut-chart');
    document.body.appendChild(canvas);

    const chart = NexusCharts.createDoughnutChart('doughnut-chart', ['Active'], [100], ['#00F7FF']);
    expect(chart).toBeDefined();
    NexusCharts.destroyChart(chart);
  });

  test('Invoke createGauge and updateGauge', () => {
    global.requestAnimationFrame = (cb) => cb();
    const div = document.createElement('div');
    div.setAttribute('id', 'gauge-chart');
    document.body.appendChild(div);

    const chart = NexusCharts.createGauge('gauge-chart', 75, 'Load', '#00F7FF');
    expect(chart).toBeDefined();
    
    NexusCharts.updateGauge(chart, 80);
  });

  test('Invoke createHeatmap', () => {
    global.requestAnimationFrame = (cb) => cb();
    const div = document.createElement('div');
    div.setAttribute('id', 'heatmap-chart');
    document.body.appendChild(div);

    const chart = NexusCharts.createHeatmap('heatmap-chart', ['Col1'], ['Row1'], [[0, 0, 50]]);
    expect(chart).toBeDefined();

    // Trigger formatter manually to verify coverage
    const mockInit = global.echarts.init;
    const mockInstance = mockInit.mock.results[mockInit.mock.results.length - 1].value;
    const option = mockInstance.setOption.mock.calls[0][0];
    
    const tooltipText = option.tooltip.formatter({ value: [0, 0, 50] });
    expect(tooltipText).toContain('Occupancy: <strong>50%</strong>');

    const labelText = option.series[0].label.formatter({ value: [0, 0, 50] });
    expect(labelText).toBe('50%');
  });

  test('Invoke createRadar', () => {
    const div = document.createElement('div');
    div.setAttribute('id', 'radar-chart');
    document.body.appendChild(div);

    const chart = NexusCharts.createRadar('radar-chart', [{ name: 'Stat', max: 100 }], [[50]], 'Metric', '#00F7FF');
    expect(chart).toBeDefined();
  });

  test('Invoke createSparkline', () => {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'spark-chart');
    document.body.appendChild(canvas);

    const chart = NexusCharts.createSparkline('spark-chart', [1, 2, 3], '#00F7FF');
    expect(chart).toBeDefined();
    NexusCharts.destroyChart(chart);
  });
});

