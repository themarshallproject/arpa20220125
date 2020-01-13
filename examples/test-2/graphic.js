import ChartBase from 'charts/chart-base.js';

$(document).ready(() => {
  const $test2 = $('#test-graphic-2');
  $test2.html('This html has been replaced. <div id="dynamic-div"></div> <img src="assets/test-arrow-next-70.png" />');

  const testChart = new ChartBase({
    containerId: 'dynamic-div',
    aspectRatio: 12/5,
  })
});
