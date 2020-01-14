$(document).ready(() => {
  $('body').css('background', 'lightcyan');
});

$(document).ready(() => {
  const $test1 = $('#test-graphic-1');
  $test1.css('background', 'gold');
});


import ChartBase from 'charts/chart-base.js';

$(document).ready(() => {
  const $test2 = $('#test-graphic-2');
  $test2.html('This html has been replaced. <div id="dynamic-div"></div> <img src="test-2/assets/test-arrow-next-70.png" />');

  const testChart = new ChartBase({
    containerId: 'dynamic-div',
    aspectRatio: 12/5,
  })
});
