import GraphicBase from './graphic-templates/graphic-base.js';
import GraphicWithAxes from './graphic-templates/axis-base.js';
import BarChart from './graphic-templates/bar-chart.js';

$(document).ready(() => {
  createBaseExample();
  createAxesExample();
  createBarExample();
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
  const exampleAxisGraphic = new GraphicWithAxes({
    containerId: 'g-chart-example-axes',
    data: AXIS_DATA,
    keyX: 'value_x',
    keyY: 'value_y',
    aspectRatio: function() { return this.$containerEl.width() < 600 ? 0.5 : 0.7; },
    marginTop: 40,
    marginLeft: 40,
  });
}

function createBarExample() {
  const exampleBarChart = new BarChart({
    containerId: 'g-chart-example-bars',
    data: BARS_DATA,
    keyX: 'value_x',
    keyY: 'value_y',
    orientation: 'horizontal',
    aspectRatio: function() { return this.$containerEl.width() < 600 ? 0.9 : 0.7; },
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 70,
    marginRight: 40,
    roundedYMax: 8000
  });
}
