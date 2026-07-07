/**
 * @file charts.js
 * @description NEXUS Charts — Shared Chart.js and Apache ECharts factory functions
 * for line charts, bar charts, gauge visualizations, and color palette management.
 * @module NexusCharts
 */

const NexusCharts = (() => {
  'use strict';

  // ─── Color Palette ─────────────────────────────────────────
  const colors = {
    cyan: '#00F7FF',
    cyanDim: 'rgba(0, 247, 255, 0.15)',
    cyanFill: 'rgba(0, 247, 255, 0.08)',
    pink: '#FF0087',
    pinkDim: 'rgba(255, 0, 135, 0.15)',
    pinkFill: 'rgba(255, 0, 135, 0.08)',
    green: '#4DFFBE',
    greenDim: 'rgba(77, 255, 190, 0.15)',
    greenFill: 'rgba(77, 255, 190, 0.08)',
    gold: '#FFDE73',
    goldDim: 'rgba(255, 222, 115, 0.15)',
    purple: '#A78BFA',
    purpleDim: 'rgba(167, 139, 250, 0.15)',
    purpleFill: 'rgba(167, 139, 250, 0.08)',
    orange: '#FF8C42',
    orangeDim: 'rgba(255, 140, 66, 0.15)',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#475569',
    gridLine: 'rgba(255, 255, 255, 0.05)',
    gridLineBold: 'rgba(255, 255, 255, 0.1)'
  };

  // ─── Chart.js Default Configuration ────────────────────────
  const chartJsDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colors.textSecondary,
          font: { family: 'Inter', size: 11 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 18, 25, 0.95)',
        titleColor: colors.textPrimary,
        bodyColor: colors.textSecondary,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: 'Inter', size: 12, weight: '600' },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
        displayColors: true,
        boxPadding: 4
      }
    },
    scales: {
      x: {
        grid: { color: colors.gridLine, drawBorder: false },
        ticks: { color: colors.textMuted, font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { color: colors.gridLine, drawBorder: false },
        ticks: { color: colors.textMuted, font: { family: 'JetBrains Mono', size: 10 } }
      }
    }
  };

  // ─── Create Line Chart (Chart.js) ──────────────────────────
  function createLineChart(canvasId, labels, datasets, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {return null;}

    const ctx = canvas.getContext('2d');
    
    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        ...chartJsDefaults,
        ...options,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: { radius: 2, hoverRadius: 5 },
          line: { tension: 0.4, borderWidth: 2 }
        }
      }
    });
  }

  // ─── Create Bar Chart (Chart.js) ───────────────────────────
  function createBarChart(canvasId, labels, datasets, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {return null;}

    const ctx = canvas.getContext('2d');

    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        ...chartJsDefaults,
        ...options,
        indexAxis: options.horizontal ? 'y' : 'x',
        elements: {
          bar: { borderRadius: 4, borderSkipped: false }
        }
      }
    });
  }

  // ─── Create Doughnut Chart (Chart.js) ──────────────────────
  function createDoughnutChart(canvasId, labels, data, chartColors, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {return null;}

    const ctx = canvas.getContext('2d');

    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: chartColors,
          borderColor: 'rgba(10, 10, 15, 0.8)',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: colors.textSecondary,
              font: { family: 'Inter', size: 11 },
              padding: 16,
              usePointStyle: true
            }
          },
          tooltip: chartJsDefaults.plugins.tooltip
        },
        ...options
      }
    });
  }

  // ─── Create ECharts Gauge ──────────────────────────────────
  function createGauge(containerId, value, label, color, max = 100) {
    const container = document.getElementById(containerId);
    if (!container) {return null;}

    const chart = echarts.init(container, null, { renderer: 'canvas' });

    const option = {
      backgroundColor: 'transparent',
      series: [{
        type: 'gauge',
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max: max,
        radius: '90%',
        progress: {
          show: true,
          width: 12,
          itemStyle: { color }
        },
        pointer: { show: false },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [[1, 'rgba(255,255,255,0.06)']]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: {
          offsetCenter: [0, '65%'],
          fontSize: 11,
          color: colors.textSecondary,
          fontFamily: 'Inter'
        },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '20%'],
          fontSize: 22,
          fontWeight: 'bold',
          fontFamily: 'JetBrains Mono',
          formatter: '{value}%',
          color: color
        },
        data: [{ value: Math.round(value), name: label }]
      }]
    };

    chart.setOption(option);
    
    // Handle resize — deferred to avoid forced reflow during init
    requestAnimationFrame(() => {
      const resizeObserver = new ResizeObserver(() => chart.resize());
      resizeObserver.observe(container);
    });
    
    return chart;
  }

  // ─── Create ECharts Heatmap ────────────────────────────────
  function createHeatmap(containerId, data, xLabels, yLabels) {
    const container = document.getElementById(containerId);
    if (!container) {return null;}

    const chart = echarts.init(container, null, { renderer: 'canvas' });

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(15, 18, 25, 0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        textStyle: { color: colors.textPrimary, fontFamily: 'Inter', fontSize: 12 },
        formatter: (params) => `${yLabels[params.value[1]]}<br/>Occupancy: <strong>${params.value[2]}%</strong>`
      },
      grid: {
        left: '15%',
        right: '5%',
        top: '5%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: xLabels,
        axisLabel: { color: colors.textMuted, fontSize: 9, fontFamily: 'Inter' },
        axisLine: { lineStyle: { color: colors.gridLine } },
        splitArea: { show: false }
      },
      yAxis: {
        type: 'category',
        data: yLabels,
        axisLabel: { color: colors.textMuted, fontSize: 9, fontFamily: 'Inter' },
        axisLine: { lineStyle: { color: colors.gridLine } },
        splitArea: { show: false }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: false,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: [colors.greenDim, colors.green, colors.gold, colors.orange, colors.pink]
        },
        textStyle: { color: colors.textMuted, fontSize: 10 },
        show: false
      },
      series: [{
        name: 'Occupancy',
        type: 'heatmap',
        data: data,
        label: {
          show: true,
          color: colors.textPrimary,
          fontSize: 10,
          fontFamily: 'JetBrains Mono',
          formatter: (p) => p.value[2] + '%'
        },
        emphasis: {
          itemStyle: { borderColor: colors.cyan, borderWidth: 2 }
        },
        itemStyle: {
          borderColor: 'rgba(10, 10, 15, 0.8)',
          borderWidth: 2,
          borderRadius: 4
        }
      }]
    };

    chart.setOption(option);
    
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(container);

    return chart;
  }

  // ─── Create ECharts Radar ──────────────────────────────────
  function createRadar(containerId, indicators, data, label) {
    const container = document.getElementById(containerId);
    if (!container) {return null;}

    const chart = echarts.init(container, null, { renderer: 'canvas' });

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'rgba(15, 18, 25, 0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        textStyle: { color: colors.textPrimary, fontFamily: 'Inter' }
      },
      radar: {
        indicator: indicators,
        axisName: {
          color: colors.textSecondary,
          fontSize: 10,
          fontFamily: 'Inter'
        },
        splitLine: { lineStyle: { color: colors.gridLine } },
        splitArea: { areaStyle: { color: ['transparent'] } },
        axisLine: { lineStyle: { color: colors.gridLine } }
      },
      series: [{
        type: 'radar',
        data: [{
          value: data,
          name: label,
          areaStyle: { color: colors.cyanFill },
          lineStyle: { color: colors.cyan, width: 2 },
          itemStyle: { color: colors.cyan }
        }]
      }]
    };

    chart.setOption(option);

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(container);

    return chart;
  }

  // ─── Update Gauge Value ────────────────────────────────────
  function updateGauge(chart, value) {
    if (!chart) {return;}
    chart.setOption({
      series: [{ data: [{ value: Math.round(value) }] }]
    });
  }

  // ─── Update Line Chart ─────────────────────────────────────
  function updateLineChart(chart, labels, datasets) {
    if (!chart) {return;}
    chart.data.labels = labels;
    datasets.forEach((ds, i) => {
      if (chart.data.datasets[i]) {
        chart.data.datasets[i].data = ds.data;
      }
    });
    chart.update('none');
  }

  // ─── Destroy Chart ─────────────────────────────────────────
  function destroyChart(chart) {
    if (!chart) {return;}
    if (chart.destroy) {chart.destroy();}
    if (chart.dispose) {chart.dispose();}
  }

  // ─── Create Mini Spark Line (for inline use) ───────────────
  function createSparkline(canvasId, data, color = colors.cyan) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {return null;}

    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data,
          borderColor: color,
          backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
          fill: true,
          borderWidth: 1.5,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: { line: { tension: 0.4 } }
      }
    });
  }

  return {
    colors,
    createLineChart,
    createBarChart,
    createDoughnutChart,
    createGauge,
    createHeatmap,
    createRadar,
    createSparkline,
    updateGauge,
    updateLineChart,
    destroyChart
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NexusCharts;
}
