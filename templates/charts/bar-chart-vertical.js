import * as d3 from 'd3';
import * as utilities from './utilities.js';
import ChartWithAxes from './axis-base.js';

/* * * * *
 * VERTICAL BAR CHART
 *
 * Extends ChartWithAxes.
 *
 * A basic responsive bar chart that displays vertical bars. For horizontal
 * bars, see the HorizontalBarChart class that extends this one.
 * * * * */
export default class VerticalBarChart extends ChartWithAxes {

  constructor(config) {
    super(config);

    this.containerEl.classed('g-tmp-bar-chart-vertical', true);
  }


  // Check if any required keys are missing from the config.
  checkConfigKeys(config) {
    const requiredKeys = ['containerId', 'data', 'bandKey', 'valueKey'];
    this.ensureRequired(config, requiredKeys);
  }


  // Fill in default values for undefined config options. Some are already
  // defined in the ChartWithAxes class. This function preserves any
  // already-defined config options, which means you can pass literally any
  // sort of data through to your chart.
  setConfigDefaults(config) {
    // Set defaults specific to this class first
    const classConfig = _.defaults(config, {
      barPadding: 0.1,
      roundBarSize: false,
      bandDataFormat: (d) => { return d },
      valueDataFormat: (d) => { return +d },
      xAxisTickFormat: (d) => { return d },
      yAxisTickFormat: (d) => { return utilities.addCommas(d) },
      labelFormat: (d) => { return utilities.addCommas(d) }
    });

    // Then set the basic defaults
    super.setConfigDefaults(classConfig);
  }


  // Initialize the chart, set up scales and axis objects, add elements
  // to the DOM and size/position the SVG elements.
  initChart() {
    this.initBaseChart();
    this.initScales();
    this.initAxes();
    this.initAxisElements();
    this.initDataElements();
    this.initLabels();
    this.sizeAndPositionChart();
  }


  // Initialize scale properties on the class instance. Rather than the
  // default linearScale for the xScale, we are using a band scale where
  // the domain is set to each of the x values of the data.
  initScales() {
    const { xDomain, yDomain } = this.getScaleExtents();

    this.xScale = d3.scaleBand()
      .round(this.config.roundBarSize)
      .padding(this.config.barPadding)
      .domain(xDomain);

    this.yScale = d3.scaleLinear()
      .domain(yDomain);
  }


  // Get the extent of x and y values for setting scale domain. The x domain
  // is an array of band names (not *that* kind) because the data is categorical.
  getScaleExtents() {
    const xDomain = this.data.map((d) => { return d[this.config.bandKey] })
    // Get max/min values for y axis, defaulting to the specified values if present
    let yMax = this.config.roundedYMax || d3.max(this.data, (d)=> { return this.config.valueDataFormat(d[this.config.valueKey]) });
    let yMin = this.config.roundedYMin || d3.min(this.data, (d)=> { return this.config.valueDataFormat(d[this.config.valueKey]) });

    // For bar charts, always include a zero baseline
    yMin = yMin > 0 ? 0 : yMin;
    yMax = yMax < 0 ? 0 : yMax;

    return {
      xDomain: xDomain,
      yDomain: [yMin, yMax]
    }
  }


  // Add SVG elements based on data to the chart.
  initDataElements() {
    this.barRects = this.chart.append('g').attr('class', 'g-chart-bars')
      .selectAll('.bar-rect')
      .data(this.data)
        .enter()
      .append('rect')
        .attr('class', (d) => {
          return `bar-rect bar-${ utilities.slugify(d[this.config.bandKey]) }`;
        })
  }


  // Add value labels to each of the bars.
  initLabels() {
    this.barLabels = this.chart.append('g').attr('class', 'g-chart-labels')
      .selectAll('.data-label')
      .data(this.data)
        .enter()
      .append('text')
        .attr('class', (d) => {
          return `data-label data-label-${ utilities.slugify(d[this.config.bandKey]) }`;
        })
        .text((d) => {
          return this.config.labelFormat(d[this.config.valueKey]);
        });
  }


  // Update the size and positioning of any data-driven elements of the chart.
  updateDataElements() {
    this.barRects
      .attr('x', (d) => {
        return this.xScale(d[this.config.bandKey]);
      })
      .attr('y', (d) => {
        const thisValue = d[this.config.valueKey];
        if (thisValue >= 0) {
          return this.yScale(d[this.config.valueKey]);
        } else {
          return this.yScale(0);
        }
      })
      .attr('width', this.xScale.bandwidth())
      .attr('height', (d) => {
        return Math.abs(this.yScale(0) - this.yScale(d[this.config.valueKey]));
      })
  }


  // This updates the positioning of the labels on our bars.
  updateLabels() {
    // Bars are sized vertically, so labels will run at the top or bottom of a bar
    this.barLabels
      .attr('x', (d) => {
        // Position in the horizontal center of the bar
        return this.xScale(d[this.config.bandKey]) + (this.xScale.bandwidth() / 2);
      })
      .attr('y', (d,i,labelArray) => {
        const yValue = d[this.config.valueKey];
        const yPos = this.yScale(yValue);
        const textSize = this.barLabels.filter((bar_d,bar_i) => { return bar_i == i; })
          .node()
            .getBoundingClientRect()
              .height;

        // If there is no room for the label to run above the bar, place it just inside
        // the top of the bar.
        if (yPos < textSize - this.size.marginTop) {
          d3.select(labelArray[i]).classed('label-out', false).classed('label-in', true);
          return yPos + 5 + textSize;
        } else if ( yPos > this.size.chartHeight - textSize) {
          // Or if the label is placed lower than the height of the chart itself, place it
          // just inside the bottom of the bar (for negative bars).
          d3.select(labelArray[i]).classed('label-out', false).classed('label-in', true);
          return yPos - 5;
        } else if (yValue >= 0) {
          // If the value is positive and doesn't exceed the bounds of the chart, place it
          // just above the top of the bar
          d3.select(labelArray[i]).classed('label-in', false).classed('label-out', true);
          return yPos - 5;
        } else {
          // If the value is negative and doesn't exceed the bounds of the chart, place it
          // just below the bottom of the bar.
          d3.select(labelArray[i]).classed('label-in', false).classed('label-out', true);
          return yPos + textSize;
        }
      })
  }


  // Update the size and position of all DOM elements with the latest pixel values.
  sizeAndPositionChart() {
    super.sizeAndPositionChart();

    this.updateDataElements();
    this.updateLabels();
  }
}
