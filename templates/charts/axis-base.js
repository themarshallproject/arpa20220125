import * as d3 from 'd3';
import { addCommas, isNullOrUndefined } from './utilities.js';
import ChartBase from './chart-base.js';

/* * * * *
 * CHART WITH AXES
 *
 * Extends ChartBase.
 *
 * Some scaffolding for setting up data-driven charts with axes. This module
 * won't serve all axis-based charts because it defaults to linear scales, but
 * it can be easily extended by specific chart classes to incorporate other
 * data formats.
 * * * * */
export default class ChartWithAxes extends ChartBase {

  constructor(config) {
    super(config);
  }


  // Check if any required keys are missing from the config.
  checkConfigKeys(config) {
    const requiredKeys = ['containerId', 'data', 'xKey', 'yKey'];
    this.ensureRequired(config, requiredKeys);
  }


  // Fill in default values for undefined config options. Some are already
  // defined in the ChartBase class. This function preserves any
  // already-defined config options, which means you can pass literally any
  // sort of data through to your chart.
  setConfigDefaults(config) {
    // Set defaults specific to this class first
    const classConfig = _.defaults(config, {
      marginLeft: 20,
      marginBottom: 20,
      xDataFormat: (d) => { return +d },
      yDataFormat: (d) => { return +d },
      xAxisTickFormat: (d) => { return addCommas(d) },
      yAxisTickFormat: (d) => { return addCommas(d) },
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


  // Initialize the chart, set up scales and axis objects, add axis elements
  // to the DOM and size/position the SVG elements.
  initChart() {
    this.initBaseChart();
    this.initScales();
    this.initAxes();
    this.initAxisElements();
    this.sizeAndPositionChart();
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
    const xMin = isNullOrUndefined(this.config.roundedXMin)
      ? d3.min(this.data, (d)=> { return this.config.xDataFormat(d[this.config.xKey]) })
      : this.config.roundedXMin;

    const xMax = isNullOrUndefined(this.config.roundedXMax)
      ? d3.max(this.data, (d)=> { return this.config.xDataFormat(d[this.config.xKey]) })
      : this.config.roundedXMax;

    const yMin = isNullOrUndefined(this.config.roundedYMin)
      ? d3.min(this.data, (d)=> { return this.config.yDataFormat(d[this.config.yKey]) })
      : this.config.roundedYMin;

    const yMax = isNullOrUndefined(this.config.roundedYMax)
      ? d3.max(this.data, (d)=> { return this.config.yDataFormat(d[this.config.yKey]) })
      : this.config.roundedYMax;

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
      .tickSizeOuter(0);

    this.yAxis = d3.axisLeft()
      .scale(this.yScale)
      .tickSizeOuter(0);

    this.yGrid = d3.axisLeft()
      .scale(this.yScale)
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
  sizeAndPositionChart() {
    // This gets the base measurements (width, height, margins) and assigns them
    // to `this.size`, then sets the size and position of the svg and the chart.
    super.sizeBaseSVG();
    // Update the scales' range with new dimensions
    this.calculateScales();
    // Draw the axis elements
    this.updateAxisFunctions();
    this.updateAxisElements();
  }


  // Set scale ranges to the latest pixel values.
  calculateScales() {
    this.xScale.range([0, this.size.chartWidth]);
    this.yScale.range([this.size.chartHeight, 0]);
  }


  // Update axis functions to use the evaluated output of each option.
  // Pass an object containing the chart width so options can be set
  // responsively.
  updateAxisFunctions() {
    const chartWidth = this.getSVGWidth();

    this.xAxis
      .tickArguments(this.evaluateOption('xAxisTickArguments'))
      .tickValues(this.evaluateOption('xAxisTickValues'))
      .ticks(this.evaluateOption('xAxisTicks'))
      .tickFormat((d) => {
        return this.config.xAxisTickFormat.call(this, d, chartWidth);
      });

    this.yAxis
      .tickArguments(this.evaluateOption('yAxisTickArguments'))
      .tickValues(this.evaluateOption('yAxisTickValues'))
      .ticks(this.evaluateOption('yAxisTicks'))
      .tickFormat((d) => {
        return this.config.yAxisTickFormat.call(this, d, chartWidth);
      });

    this.yGrid
      .tickArguments(this.evaluateOption('yAxisTickArguments'))
      .tickValues(this.evaluateOption('yAxisTickValues'))
      .ticks(this.evaluateOption('yAxisTicks'));
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


  // Redraw the chart, re-calculating the size and positions. This is called
  // on `tmp_resize` in the constructor.
  redrawChart() {
    this.sizeAndPositionChart();
  }
}
