import GraphicBase from './graphic-templates/graphic-base.js';

$(document).ready(() => {
  createBaseExample();
});

// Kind of a silly example, but let's say we wanna draw stuff on an SVG
// without it being a real chart-chart
function createBaseExample() {

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
}
