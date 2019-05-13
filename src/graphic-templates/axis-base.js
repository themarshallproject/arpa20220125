import * as d3 from 'd3';
import * as utilities from './utilities.js';
import GraphicBase from './graphic-base.js';

export default class GraphicWithAxes extends GraphicBase {
  constructor(config) {
    super(config);
  }


  setConfigDefaults(config) {
    // Set defaults specific to this class first
    const classConfig = _.defaults(config, {
      keyX: 'x',
      keyY: 'y',
      marginLeft: 20,
      marginBottom: 20,
      xDataFormat: (d) => { return +d },
      yDataFormat: (d) => { return +d },
      xAxisTickFormat: (d) => { return utilities.addCommas(d) },
      yAxisTickFormat: (d) => { return utilities.addCommas(d) },
    });

    // Then set the basic defaults
    super.setConfigDefaults(classConfig);
  }


  initGraphic() {
    this.initBaseGraphic();
    this.initScales();
    this.initAxes();
    this.sizeAndPositionGraphic();
  }


  initScales() {
    const { xDomain, yDomain } = this.getScaleExtents();

    this.xScale = d3.scaleLinear()
      .domain(xDomain);

    this.yScale = d3.scaleLinear()
      .domain(yDomain);
  }


  getScaleExtents() {
    const xMin = this.config.roundedXMin || d3.min(this.data, (d)=> { return this.config.xDataFormat(d[this.config.keyX]) });
    const xMax = this.config.roundedXMax || d3.max(this.data, (d)=> { return this.config.xDataFormat(d[this.config.keyX]) });
    const yMin = this.config.roundedYMin || d3.min(this.data, (d)=> { return this.config.yDataFormat(d[this.config.keyY]) });
    const yMax = this.config.roundedYMax || d3.max(this.data, (d)=> { return this.config.yDataFormat(d[this.config.keyY]) });

    return {
      xDomain: [xMin, xMax],
      yDomain: [yMin, yMax]
    }
  }


  initAxes() {
    // Add axis methods to the class
    this.xAxis = d3.axisBottom()
      .scale(this.xScale)
      .tickSizeOuter(0)
      .tickFormat(this.config.xAxisTickFormat);

    this.yAxis = d3.axisLeft()
      .scale(this.yScale)
      .tickSizeOuter(0)
      .tickFormat(this.config.yAxisTickFormat);

    this.yGrid = d3.axisLeft()
      .scale(this.yScale)
      .tickFormat('');

    // Add SVG containers for axes
    this.yGridElement = this.chart.append('g')
      .attr('class', 'y grid');

    this.xAxisElement = this.chart.append('g')
      .attr('class', 'x axis');

    this.yAxisElement = this.chart.append('g')
      .attr('class', 'y axis');
  }


  sizeAndPositionGraphic() {
    // This gets the base measurements (width, height, margins) and assigns them
    // to `this.size`, then sets the size and position of the svg and the chart.
    super.sizeBaseSVG();
    // Update the scales' range with new dimensions
    this.calculateScales();
    // Draw the axis elements
    this.updateAxisElements();
  }


  calculateScales() {
    this.xScale.range([0, this.size.chartWidth]);
    this.yScale.range([this.size.chartHeight, 0]);
  }


  updateAxisElements() {
    this.xAxisElement
      .attr('transform', `translate(0, ${ this.size.chartHeight })`)
      .call(this.xAxis);

    this.xAxisElement.select('.domain')
      .attr('transform', `translate(0, ${ this.yScale(0) - this.size.chartHeight })`);

    this.yAxisElement
      .call(this.yAxis);

    this.yGridElement
      .call(this.yGrid
        .tickSize(-this.size.chartWidth, 0));
  }


  redrawGraphic() {
    this.sizeAndPositionGraphic();
  }
}
