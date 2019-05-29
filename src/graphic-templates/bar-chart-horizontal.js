import * as d3 from 'd3';
import * as utilities from './utilities.js';
import VerticalBarChart from './bar-chart-vertical.js';

export default class HorizontalBarChart extends VerticalBarChart {

  constructor(config) {
    super(config);

    this.containerEl.classed('g-tmp-bar-chart-vertical', false);
    this.containerEl.classed('g-tmp-bar-chart-horizontal', true);
  }


  // Fill in default values for undefined config options. Some are already
  // defined in the GraphicWithAxes class. This function preserves any
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


  getScaleExtents() {
    const xMax = this.config.roundedXMax || d3.max(this.data, (d)=> { return this.config.valueDataFormat(d[this.config.valueKey]) });
    let xMin = this.config.roundedXMin || d3.min(this.data, (d)=> { return this.config.valueDataFormat(d[this.config.valueKey]) });
    // For bar charts, always use a zero baseline
    xMin = xMin > 0 ? 0 : xMin;
    const yDomain = this.data.map((d) => { return d[this.config.bandKey] })

    return {
      xDomain: [xMin, xMax],
      yDomain: yDomain
    }
  }


  // Add axis methods to the class.
  initAxes() {
    this.yAxis = d3.axisLeft()
      .scale(this.yScale)
      .tickSizeOuter(0)
      .tickFormat(this.config.yAxisTickFormat);

    this.xAxis = d3.axisBottom()
      .scale(this.xScale)
      .tickSizeOuter(0)
      .tickFormat(this.config.xAxisTickFormat);

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


  // Update the size and positioning of any data-driven elements of the chart.
  // This depends on the `orientation` setting, which runs the bars vertically or
  // horizontally.
  updateDataElements() {
    this.barRects
      .attr('x', (d) => {
        return this.xScale(0);
      })
      .attr('y', (d) => {
        return this.yScale(d[this.config.bandKey]);
      })
      .attr('width', (d) => {
        return this.xScale(d[this.config.valueKey]) - this.xScale(0);
      })
      .attr('height', this.yScale.bandwidth())
  }


  // This updates the positioning of the labels on our bars.
  updateLabels() {
    this.barLabels
      .attr('x', (d,i,labelArray) => {
        const xPos = this.xScale(d[this.config.valueKey]);
        const textSize = this.barLabels.filter((bar_d,bar_i) => { return bar_i == i; })
          .node()
            .getBoundingClientRect()
              .width;

        // If there is no room for the label to fit next to the bar, place it just inside
        // the bar.
        if (xPos + textSize > this.size.chartWidth + this.size.marginRight) {
          d3.select(labelArray[i]).classed('label-out', false).classed('label-in', true);
          return xPos - 5;
        } else {
          // Otherwise, place the label just outside the bar.
          d3.select(labelArray[i]).classed('label-in', false).classed('label-out', true);
          return xPos + 5;
        }
        // TODO negative bar positioning
      })
      .attr('y', (d) => {
        return this.yScale(d[this.config.bandKey]) + (this.yScale.bandwidth() / 2);
      })
  }


  updateAxisElements() {
    // This function does some translating of elements to get the axes in the
    // right places. Here we use chartHeight instead of chartWidth for those
    // translations.
    this.yAxisElement
      .call(this.yAxis);

    this.xAxisElement
      .attr('transform', `translate(0, ${ this.size.chartHeight })`)
      .call(this.xAxis);

    this.xGridElement
      .call(this.xGrid
        .tickSize(this.size.chartHeight, 0));
  }
  
}
