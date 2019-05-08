import GraphicBase from './graphic-templates/graphic-base.js';
import GraphicWithAxes from './graphic-templates/axis-base.js';

$(document).ready(() => {
  createBaseExample();
  createAxesExample();
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
    roundedXMax: 10,
    roundedYMin: -10,
    roundedYMax: 10,
  });
}
