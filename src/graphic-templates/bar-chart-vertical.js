import * as d3 from 'd3';
import * as utilities from './utilities.js';
import GraphicWithAxes from './axis-base.js';

/* * * * *
 * BAR CHART
 *
 * Extends GraphicWithAxes.
 *
 * A basic responsive bar chart that can display either horizontal bars
 * or vertical bars.
 * * * * */
export default class VerticalBarChart extends GraphicWithAxes {

  constructor(config) {
    super(config);

    this.containerEl.classed('g-tmp-bar-chart-vertical', true);
  }


  // Fill in default values for undefined config options. Some are already
  // defined in the GraphicWithAxes class. This function preserves any
  // already-defined config options, which means you can pass literally any
  // sort of data through to your graphic.
  setConfigDefaults(config) {
    // Set defaults specific to this class first
    const classConfig = _.defaults(config, {
      barWidth: 20,
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


  // Initialize the graphic, set up scales and axis objects, add elements
  // to the DOM and size/position the SVG elements.
  initGraphic() {
    this.initBaseGraphic();
    this.initScales();
    this.initAxes();
    this.initAxisElements();
    this.initDataElements();
    this.initLabels();
    this.sizeAndPositionGraphic();
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


  // Get the extent of x and y values for setting scale domain. We return a min/max
  // array for each domain by default, but in an extended version of the class, this
  // function could be rewritten to return domains in different formats.
  getScaleExtents() {
    const xDomain = this.data.map((d) => { return d[this.config.bandKey] })
    const yMax = this.config.roundedYMax || d3.max(this.data, (d)=> { return this.config.valueDataFormat(d[this.config.valueKey]) });
    let yMin = this.config.roundedYMin || d3.min(this.data, (d)=> { return this.config.valueDataFormat(d[this.config.valueKey]) });
    // For bar charts, always use a zero baseline
    yMin = yMin > 0 ? 0 : yMin;

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
  // This depends on the `orientation` setting, which runs the bars vertically or
  // horizontally.
  updateDataElements() {
    // Bars are sized vertically
    this.barRects
      .attr('x', (d) => {
        return this.xScale(d[this.config.bandKey]);
      })
      .attr('y', (d) => {
        return this.yScale(d[this.config.valueKey]);
      })
      .attr('width', this.xScale.bandwidth())
      .attr('height', (d) => {
        return this.yScale(0) - this.yScale(d[this.config.valueKey]);
      })
  }


  // This updates the positioning of the labels on our bars.
  // This depends on the `orientation` setting, which runs the bars vertically or
  // horizontally.
  updateLabels() {
    // Bars are sized vertically, so labels will run at the top or bottom of a bar
    this.barLabels
      .attr('x', (d) => {
        // Position in the horizontal center of the bar
        return this.xScale(d[this.config.bandKey]) + (this.xScale.bandwidth() / 2);
      })
      .attr('y', (d,i,labelArray) => {
        const yPos = this.yScale(d[this.config.valueKey]);
        const textSize = this.barLabels.filter((bar_d,bar_i) => { return bar_i == i; })
          .node()
            .getBoundingClientRect()
              .height;

        // If there is no room for the label to run above the bar, place it just inside
        // the top of the bar.
        if (yPos < textSize - this.size.marginTop) {
          d3.select(labelArray[i]).classed('label-out', false).classed('label-in', true);
          return yPos + 5 + textSize;
        } else {
          // Otherwise, place the label directly on top of the bar.
          d3.select(labelArray[i]).classed('label-in', false).classed('label-out', true);
          return yPos - 5;
        }
        // TODO negative bar positioning
      })
  }


  // Update the size and position of all DOM elements with the latest pixel values.
  sizeAndPositionGraphic() {
    super.sizeAndPositionGraphic();

    this.updateDataElements();
    this.updateLabels();
    console.log(this);
  }
}
