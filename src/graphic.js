import ChartBase from 'charts/chart-base.js';
import ChartWithAxes from 'charts/axis-base.js';
import VerticalBarChart from 'charts/bar-chart-vertical.js';
import HorizontalBarChart from 'charts/bar-chart-horizontal.js';

$(document).ready(() => {
  createBaseExample();
  createAxesExample();
  createBarExample();
});

// Kind of a silly example, but let's say we wanna draw stuff on an SVG
// without it being a real chart-chart
function createBaseExample() {
  const exampleBaseChart = new ChartBase({
    containerId: 'g-chart-example-base',
    aspectRatio: 0.5,
    marginTop: 40,
    marginLeft: 40
  });

  exampleBaseChart.chart.append('circle')
    .attr('r', 100)
    .attr('cx', .5 * exampleBaseChart.size.chartWidth)
    .attr('cy', .5 * exampleBaseChart.size.chartHeight);
}

function createAxesExample() {
  const exampleAxisChart = new ChartWithAxes({
    containerId: 'g-chart-example-axes',
    data: AXIS_DATA,
    xKey: 'value_x',
    yKey: 'value_y',
    //aspectRatio: function(size) { return size.svgWidth < 600 ? 0.5 : 0.7; },
    //marginTop: 40,
    //marginLeft: 40,
    //xAxisTicks: 6,
    //yAxisTicks: 8,
    //roundedYMax: 8000,
    //roundedXMax: 10
  });
}

function createBarExample() {
  const exampleVerticalBarChart = new VerticalBarChart({
    containerId: 'g-chart-example-vertical-bars',
    data: BARS_DATA,
    bandKey: 'value_x',
    valueKey: 'value_y',
    aspectRatio: function(size) { return size.svgWidth < 600 ? 0.9 : 0.7; },
    marginTop: 20,
    marginRight: 10,
    marginBottom: 40,
    marginLeft: 40,
    yAxisTicks: 5,
    roundedYMax: 8000
  });

  const exampleHorizontalBarChart = new HorizontalBarChart({
    containerId: 'g-chart-example-horizontal-bars',
    data: BARS_DATA,
    bandKey: 'value_x',
    valueKey: 'value_y',
    aspectRatio: function(size) { return size.svgWidth < 600 ? 0.7 : 0.5; },
    marginTop: 20,
    marginRight: 20,
    marginBottom: 40,
    marginLeft: 70,
    roundedXMax: 8000

  });

  const exampleNegativeVerticalBars = new VerticalBarChart({
    containerId: 'g-chart-example-negative-vertical-bars',
    data: NEG_BARS_DATA,
    bandKey: 'animal',
    valueKey: 'score',
    aspectRatio: 0.6,
    marginLeft: 40,
    yAxisTicks: 5,
    roundedYMin: -10
  });

  const exampleNegativeHorizontalBars = new HorizontalBarChart({
    containerId: 'g-chart-example-negative-horizontal-bars',
    data: NEG_BARS_DATA,
    bandKey: 'animal',
    valueKey: 'score',
    aspectRatio: 0.6,
    xAxisTickValues: [-8, 0, 8, 16, 24],
    roundedXMax: 24,
    marginLeft: 80
  });
}
