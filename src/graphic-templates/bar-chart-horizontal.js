import * as d3 from 'd3';
import * as utilities from './utilities.js';
import VerticalBarChart from './bar-chart-vertical.js';

/* * * * *
 * HORIZONTAL BAR CHART
 *
 * Extends VerticalBarChart.
 *
 * A basic responsive bar chart that displays horizontal bars. For vertical
 * bars, see the VerticalBarChart class that this extends.
 * * * * */
export default class HorizontalBarChart extends VerticalBarChart {

  constructor(config) {
    super(config);

    // Set this class so chart styles apply properly
    this.containerEl.classed('g-tmp-bar-chart-vertical', false);
    this.containerEl.classed('g-tmp-bar-chart-horizontal', true);
  }


  // Fill in default values for undefined config options. Most are already
  // defined in the VerticalBarChart class. This function preserves any
  // already-defined config options, which means you can pass literally any
  // sort of data through to your graphic.
  setConfigDefaults(config) {
    // Set defaults specific to this class first
    const classConfig = _.defaults(config, {
      xAxisTickFormat: (d) => { return utilities.addCommas(d) },
      yAxisTickFormat: (d) => { return d },
    });

    // Then set the basic defaults
    super.setConfigDefaults(classConfig);
  }


  // Initialize scale properties on the class instance.
  initScales() {
    const { xDomain, yDomain } = this.getScaleExtents();

    this.xScale = d3.scaleLinear()
      .domain(xDomain);

    this.yScale = d3.scaleBand()
      .round(this.config.roundBarSize)
      .padding(this.config.barPadding)
      .domain(yDomain);
  }


  // Get the extent of x and y values for setting scale domain. The y domain
  // is an array of band names (not *that* kind) because the data is categorical.
  getScaleExtents() {
    const yDomain = this.data.map((d) => { return d[this.config.bandKey] })
    // Get max/min values for x axis, defaulting to the specified values if present
    let xMax = this.config.roundedXMax || d3.max(this.data, (d)=> { return this.config.valueDataFormat(d[this.config.valueKey]) });
    let xMin = this.config.roundedXMin || d3.min(this.data, (d)=> { return this.config.valueDataFormat(d[this.config.valueKey]) });

    // For bar charts, always include a zero baseline
    xMin = xMin > 0 ? 0 : xMin;
    xMax = xMax < 0 ? 0 : xMax;

    return {
      xDomain: [xMin, xMax],
      yDomain: yDomain
    }
  }


  // Add axis methods to the class.
  initAxes() {
    super.initAxes();

    this.xGrid = d3.axisBottom()
      .scale(this.xScale)
      .tickFormat('');
  }


  // Add SVG groups where axes will be initialized.
  initAxisElements() {
    this.xGridElement = this.chart.append('g')
      .attr('class', 'x grid');

    this.xAxisElement = this.chart.append('g')
      .attr('class', 'x axis');

    this.yAxisElement = this.chart.append('g')
      .attr('class', 'y axis');
  }


  // Set scale ranges to the latest pixel values.
  calculateScales() {
    this.xScale.range([0, this.size.chartWidth]);
    this.yScale.range([0, this.size.chartHeight]);
  }


  // Update the size and positioning of any data-driven elements of the chart.
  updateDataElements() {
    this.barRects
      .attr('x', (d) => {
        const thisValue = d[this.config.valueKey];
        if (thisValue >= 0) {
          return this.xScale(0);
        } else {
          return this.xScale(d[this.config.valueKey]);
        }
      })
      .attr('y', (d) => {
        return this.yScale(d[this.config.bandKey]);
      })
      .attr('width', (d) => {
        return Math.abs(this.xScale(d[this.config.valueKey]) - this.xScale(0));
      })
      .attr('height', this.yScale.bandwidth())
  }


  // This updates the positioning of the labels on our bars.
  updateLabels() {
    // To get labels to line up with the axis labels, we should use the same `dy`
    // value as axis text.
    const labelDy = this.yAxisElement.select('.tick').select('text').attr('dy');

    // Bars are sized horizontally, so labels will run inside or outside the
    // side edge of the bar.
    this.barLabels
      .attr('dy', labelDy)
      .attr('x', (d,i,labelArray) => {
        const xValue = d[this.config.valueKey];
        const xPos = this.xScale(xValue);
        const textSize = this.barLabels.filter((bar_d,bar_i) => { return bar_i == i; })
          .node()
            .getBoundingClientRect()
              .width;
        const thisLabel = d3.select(labelArray[i]);

        if (xValue >= 0) {
          thisLabel.classed('label-positive', true);
        } else {
          thisLabel.classed('label-negative', true);
        }

        // If there is no room for the label to fit to the right of the bar, place it just inside
        // the bar.
        if (xPos + textSize > this.size.chartWidth + this.size.marginRight) {
          thisLabel.classed('label-out', false).classed('label-in', true);
          return xPos - 5;
        } else if (xValue < 0 && xPos <= 0) {
          // Of it there is no room for the label to fit to the left of the bar, place it
          // just inside the left edge.
          thisLabel.classed('label-out', false).classed('label-in', true);
          return xPos + 5;
        } else if (xValue >= 0) {
          // If the value is positive and doesn't exceed the right boundary of the chart,
          // place it just right of the bar.
          thisLabel.classed('label-in', false).classed('label-out', true);
          return xPos + 5;
        } else {
          // If the value is negative and doesn't exceed the left boundary of the chart,
          // place it just left of the bar.
          thisLabel.classed('label-in', false).classed('label-out', true);
          return xPos - 5;
        }
      })
      .attr('y', (d) => {
        return this.yScale(d[this.config.bandKey]) + (this.yScale.bandwidth() / 2);
      });
  }


  updateAxisElements() {
    // This function does some translating of elements to get the axes in the
    // right places. Here we use chartHeight instead of chartWidth for those
    // translations.
    this.yAxisElement
      .call(this.yAxis);

    this.yAxisElement.select('.domain')
      .attr('transform', `translate(${ this.xScale(0) }, 0)`);

    this.xAxisElement
      .attr('transform', `translate(0, ${ this.size.chartHeight })`)
      .call(this.xAxis);

    this.xGridElement
      .call(this.xGrid
        .tickSize(this.size.chartHeight, 0));
  }

}
