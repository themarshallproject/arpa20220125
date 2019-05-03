import GraphicBase from './graphic-templates/graphic-base.js';

$(document).ready(() => {
  const graphic = new GraphicBase({
    containerId: 'g-chart-canvas',
  });

  console.log(graphic.getBaseMeasurements())
});
