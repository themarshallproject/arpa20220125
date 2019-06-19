import * as d3 from 'd3';
import * as utilities from './utilities.js';
import GraphicBase from './graphic-base.js';

/* * * * *
 * GRAPHIC WITH AXES
 *
 * Extends GraphicBase.
 *
 * Some scaffolding for setting up data-driven graphics with axes. This module
 * won't serve all axis-based graphics because it defaults to linear scales, but
 * it can be easily extended by specific graphic classes to incorporate other
 * data formats.
 * * * * */
export default class GraphicWithAxes extends GraphicBase {

  constructor(config) {
    super(config);
  }


  // Check if any required keys are missing from the config.
  checkConfigKeys(config) {
    const className = 'GraphicWithAxes';
    const requiredKeys = ['containerId', 'data', 'xKey', 'yKey'];
    this.ensureRequired(className, config, requiredKeys);
  }


  // Fill in default values for undefined config options. Some are already
  // defined in the GraphicBase class. This function preserves any
  // already-defined config options, which means you can pass literally any
  // sort of data through to your graphic.
  setConfigDefaults(config) {
    // Set defaults specific to this class first
    const classConfig = _.defaults(config, {
      marginLeft: 20,
      marginBottom: 20,
      xDataFormat: (d) => { return +d },
      yDataFormat: (d) => { return +d },
      xAxisTickFormat: (d) => { return utilities.addCommas(d) },
      yAxisTickFormat: (d) => { return utilities.addCommas(d) },
      xAxisTicks: null,
      yAxisTicks: null,
      xAxisTickArguments: null,
      yAxisTickArguments: null,
      xAxisTickValues: null,
      yAxisTickValues: null,
    });

    // Then set the basic defaults
    super.setConfigDefaults(classConfig);
  }


  // Initialize the graphic, set up scales and axis objects, add axis elements
  // to the DOM and size/position the SVG elements.
  initGraphic() {
    this.initBaseGraphic();
    this.initScales();
    this.initAxes();
    this.initAxisElements();
    this.sizeAndPositionGraphic();
  }


  // Initialize scale properties on the class instance. We're only using values
  // from the data; any values specific to DOM elements will be set in `calculateSales`.
  initScales() {
    const { xDomain, yDomain } = this.getScaleExtents();

    this.xScale = d3.scaleLinear()
      .domain(xDomain);

    this.yScale = d3.scaleLinear()
      .domain(yDomain);
  }


  // Get the extent of x and y values for setting scale domain. We return a min/max
  // array for each domain by default, but in an extended version of the class, this
  // function could be rewritten to return domains in different formats.
  getScaleExtents() {
    const xMin = this.config.roundedXMin || d3.min(this.data, (d)=> { return this.config.xDataFormat(d[this.config.xKey]) });
    const xMax = this.config.roundedXMax || d3.max(this.data, (d)=> { return this.config.xDataFormat(d[this.config.xKey]) });
    const yMin = this.config.roundedYMin || d3.min(this.data, (d)=> { return this.config.yDataFormat(d[this.config.yKey]) });
    const yMax = this.config.roundedYMax || d3.max(this.data, (d)=> { return this.config.yDataFormat(d[this.config.yKey]) });

    return {
      xDomain: [xMin, xMax],
      yDomain: [yMin, yMax]
    }
  }


  // Add axis methods to the class. We add not only an x axis and a yaxis but
  // also a "grid" that just stretches tick lines across the chart.
  initAxes() {
    this.xAxis = d3.axisBottom()
      .scale(this.xScale)
      .tickSizeOuter(0)
      .tickArguments(this.config.xAxisTickArguments)
      .tickValues(this.config.xAxisTickValues)
      .ticks(this.config.xAxisTicks)
      .tickFormat(this.config.xAxisTickFormat);

    this.yAxis = d3.axisLeft()
      .scale(this.yScale)
      .tickSizeOuter(0)
      .tickArguments(this.config.yAxisTickArguments)
      .tickValues(this.config.yAxisTickValues)
      .ticks(this.config.yAxisTicks)
      .tickFormat(this.config.yAxisTickFormat);

    this.yGrid = d3.axisLeft()
      .scale(this.yScale)
      .tickArguments(this.config.yAxisTickArguments)
      .tickValues(this.config.yAxisTickValues)
      .ticks(this.config.yAxisTicks)
      .tickFormat('');
  }


  // Add SVG groups where axes will be initialized.
  initAxisElements() {
    this.yGridElement = this.chart.append('g')
      .attr('class', 'y grid');

    this.xAxisElement = this.chart.append('g')
      .attr('class', 'x axis');

    this.yAxisElement = this.chart.append('g')
      .attr('class', 'y axis');
  }


  // Getting the correct size of all SVG elements and putting them in the right
  // place. In the process this updates the `this.size` object and the range
  // of our scales.
  sizeAndPositionGraphic() {
    // This gets the base measurements (width, height, margins) and assigns them
    // to `this.size`, then sets the size and position of the svg and the chart.
    super.sizeBaseSVG();
    // Update the scales' range with new dimensions
    this.calculateScales();
    // Draw the axis elements
    this.updateAxisElements();
  }


  // Set scale ranges to the latest pixel values.
  calculateScales() {
    this.xScale.range([0, this.size.chartWidth]);
    this.yScale.range([this.size.chartHeight, 0]);
  }


  // Call the axis methods on our axis containers to apply them to the latest
  // pixel sizes.
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


  // Redraw the graphic, re-calculating the size and positions. This is called
  // on `tmp_resize` in the constructor.
  redrawGraphic() {
    this.sizeAndPositionGraphic();
  }
}
