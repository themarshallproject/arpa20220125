import HorizontalBarChart from 'charts/bar-chart-horizontal.js';

export default class PaymentChart extends HorizontalBarChart {

  sizeAndPositionChart() {
    super.sizeAndPositionChart();
    this.resetYTicks();
  }

  // Move Y ticks to the left edge of the graphic
  resetYTicks() {
    this.yAxisElement
      .selectAll('text')
      .attr('x', (0 - this.config.marginLeft))
  }

}
