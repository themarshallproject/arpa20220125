import GraphicBase from './graphic-templates/graphic-base.js';
import GraphicWithAxes from './graphic-templates/axis-base.js';
import VerticalBarChart from './graphic-templates/bar-chart-vertical.js';
import HorizontalBarChart from './graphic-templates/bar-chart-horizontal.js';

$(document).ready(() => {
  createBaseExample();
  createAxesExample();
  createBarExample();
  createVerticalBarExample();
});

// Kind of a silly example, but let's say we wanna draw stuff on an SVG
// without it being a real chart-chart
function createBaseExample() {
  /*
  const exampleBaseGraphic = new GraphicBase({
    containerId: 'g-chart-example-base',
    aspectRatio: 0.5,
    marginTop: 40,
    marginLeft: 40
  });

  exampleBaseGraphic.chart.append('circle')
    .attr('r', 100)
    .attr('cx', .5 * exampleBaseGraphic.size.chartWidth)
    .attr('cy', .5 * exampleBaseGraphic.size.chartHeight);
    */
}

function createAxesExample() {
  /*
  const exampleAxisGraphic = new GraphicWithAxes({
    containerId: 'g-chart-example-axes',
    data: AXIS_DATA,
    keyX: 'value_x',
    keyY: 'value_y',
    aspectRatio: function(size) { return size.svgWidth < 600 ? 0.5 : 0.7; },
    marginTop: 40,
    marginLeft: 40,
  });
  */
}

function createBarExample() {
  const exampleHorizontalBarChart = new HorizontalBarChart({
    containerId: 'g-chart-example-horizontal-bars',
    data: BARS_DATA,
    bandKey: 'value_x',
    valueKey: 'value_y',
    aspectRatio: function(size) { return size.svgWidth < 600 ? 0.9 : 0.7; },
    marginTop: 20,
    marginRight: 10,
    marginBottom: 40,
    marginLeft: 80,
    roundedXMax: 8000

  });
}

function createVerticalBarExample() {
  const exampleVerticalBarChart = new VerticalBarChart({
    containerId: 'g-chart-example-vertical-bars',
    data: BARS_DATA,
    bandKey: 'value_x',
    valueKey: 'value_y',
    orientation: 'vertical',
    aspectRatio: function(size) { return size.svgWidth < 600 ? 0.9 : 0.7; },
    marginTop: 20,
    marginRight: 40,
    marginBottom: 40,
    marginLeft: 40,
    roundedYMax: 8000
  });
}
