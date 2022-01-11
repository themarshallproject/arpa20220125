import * as d3 from 'd3';
import ChartWithAxes from '../../templates/charts/axis-base.js';

export default class LineChart extends ChartWithAxes {
  constructor(config) {
    super(config);
    this.containerEl.classed('g-tmp-chart', true);
  }

  checkConfigKeys(config) {
    const requiredKeys = [
      'containerId',
      'data',
      'xKey',
      'yKey',
      'xDomain',
      'yDomain',
    ];
    this.ensureRequired(config, requiredKeys);
  }

  initChart() {
    this.initBaseChart();
    this.initScales();
    this.initAxes();
    this.initAxisElements();
    this.initDataElements();
    this.initAnnotations();
    this.sizeAndPositionChart();
  }

  initScales() {
    this.xScale = d3.scaleLinear().domain(this.config.xDomain);

    this.yScale = d3.scaleLinear().domain(this.config.yDomain);
  }

  initDataElements() {
    this.line = this.chart
      .append('g')
      .attr('class', 'g-line-chart')
      .datum(this.config.data)
      .append('path')
      .attr('class', `line-chart-path ${this.config.yKey}`);
  }

  initAnnotations() {}

  updateDataElements() {
    var lineGenerator = d3
      .line()
      .x((d) => {
        return this.xScale(d[this.config.xKey]);
      })
      .y((d) => {
        return this.yScale(d[this.config.yKey]);
      });

    this.line.attr('d', lineGenerator);
  }

  updateAnnotations() {}

  sizeAndPositionChart() {
    super.sizeAndPositionChart();
    this.updateDataElements();
    this.updateAnnotations();
  }
}
