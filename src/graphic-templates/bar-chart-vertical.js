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
      xDataFormat: (d) => { return d },
      yDataFormat: (d) => { return +d },
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
    // Use the default getScaleExtents() to get y extent
    const { yDomain } = this.getScaleExtents();
    const xDomain = BARS_DATA.map((d) => { return d[this.config.keyX] })
    // For bar charts, always use a zero baseline
    const yMin = yDomain[0] > 0 ? 0 : yDomain[0];

    this.xScale = d3.scaleBand()
      .round(this.config.roundBarSize)
      .padding(this.config.barPadding)
      .domain(xDomain);

    this.yScale = d3.scaleLinear()
      .domain([yMin, yDomain[1]]);
  }


  // Add axis methods to the class.
  initAxes() {
    // The bar chart defaults to a "vertical" orientation, in which bars are
    // scaled vertically in accordance with the data value.
    if (this.evalConfigOption('orientation') === 'vertical') {
      super.initAxes();
    } else {
      // However, if the chart's orientation is `horizontal`, the axes need to
      // be flipped. I'm not sure there's any good way to do this without being
      // confusing. Under the `horizontal` setting, `x` refers to the independent
      // variable and `y` refers to the dependent variable, rather than meaning
      // horizontal or vertical positioning.

      // So the x axis runs along the left side of the chart.
      this.xAxis = d3.axisLeft()
        .scale(this.xScale)
        .tickSizeOuter(0)
        .tickFormat(this.config.xAxisTickFormat);

      this.yAxis = d3.axisBottom()
        .scale(this.yScale)
        .tickSizeOuter(0)
        .tickFormat(this.config.yAxisTickFormat);

      this.yGrid = d3.axisBottom()
        .scale(this.yScale)
        .tickFormat('');
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
          return `bar-rect bar-${ utilities.slugify(d[this.config.keyX]) }`;
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
          return `data-label data-label-${ utilities.slugify(d[this.config.keyX]) }`;
        })
        .text((d) => {
          return this.config.labelFormat(d[this.config.keyY]);
        });
  }


  // Update the size and positioning of any data-driven elements of the chart.
  // This depends on the `orientation` setting, which runs the bars vertically or
  // horizontally.
  updateDataElements() {
    if (this.evalConfigOption('orientation') === 'vertical') {
      // Bars are sized vertically
      this.barRects
        .attr('x', (d) => {
          return this.xScale(d[this.config.keyX]);
        })
        .attr('y', (d) => {
          return this.yScale(d[this.config.keyY]);
        })
        .attr('width', this.xScale.bandwidth())
        .attr('height', (d) => {
          return this.yScale(0) - this.yScale(d[this.config.keyY]);
        })
    } else {
      // Bars are sized horizontally
      //
      // When `orientation` is `horizontal`, `x` refers to the independent
      // variable and `y` refers to the dependent variable, rather than meaning
      // horizontal or vertical positioning.
      this.barRects
        .attr('x', (d) => {
          return this.yScale(0);
        })
        .attr('y', (d) => {
          return this.xScale(d[this.config.keyX]);
        })
        .attr('width', (d) => {
          return this.yScale(d[this.config.keyY]);
        })
        .attr('height', this.xScale.bandwidth())
    }
  }


  // This updates the positioning of the labels on our bars.
  // This depends on the `orientation` setting, which runs the bars vertically or
  // horizontally.
  updateLabels() {
    if (this.evalConfigOption('orientation') === 'vertical') {
      // Bars are sized vertically, so labels will run at the top or bottom of a bar
      this.barLabels
        .attr('x', (d) => {
          // Position in the horizontal center of the bar
          return this.xScale(d[this.config.keyX]) + (this.xScale.bandwidth() / 2);
        })
        .attr('y', (d,i,labelArray) => {
          const yPos = this.yScale(d[this.config.keyY]);
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
    } else {
      // Bars are sized horizontally, so labels will run beside the bar.
      // When `orientation` is `horizontal`, `x` refers to the independent
      // variable and `y` refers to the dependent variable, rather than meaning
      // horizontal or vertical positioning.
      this.barLabels
        .attr('x', (d,i,labelArray) => {
          const yPos = this.yScale(d[this.config.keyY]);
          const textSize = this.barLabels.filter((bar_d,bar_i) => { return bar_i == i; })
            .node()
              .getBoundingClientRect()
                .width;

          // If there is no room for the label to fit next to the bar, place it just inside
          // the bar.
          if (yPos + textSize > this.size.chartWidth + this.size.marginRight) {
            d3.select(labelArray[i]).classed('label-out', false).classed('label-in', true);
            return yPos - 5;
          } else {
            // Otherwise, place the label just outside the bar.
            d3.select(labelArray[i]).classed('label-in', false).classed('label-out', true);
            return yPos + 5;
          }
          // TODO negative bar positioning
        })
        .attr('y', (d) => {
          return this.xScale(d[this.config.keyX]) + (this.xScale.bandwidth() / 2);
        })
    }
  }


  // Set the scale ranges to the latest pixel values.
  // This depends on the `orientation` setting, which runs the bars vertically or
  // horizontally.
  calculateScales() {
    // Default to using width for xScale range and height for yScale range.
    if (this.evalConfigOption('orientation') === 'vertical') {
      super.calculateScales();
    } else {
      // When `orientation` is `horizontal`, `x` refers to the independent
      // variable and `y` refers to the dependent variable, rather than meaning
      // horizontal or vertical positioning.
      // So we use height for the independent variable range and width for the
      // dependent variable range.
      this.xScale.range([this.size.chartHeight, 0]);
      this.yScale.range([0, this.size.chartWidth]);
    }
  }


  // Call the axis methods on our axis containers to apply them to the latest
  // pixel sizes. This depends on the `orientation` setting, which runs the
  // bars vertically or horizontally.
  updateAxisElements() {
    if (this.evalConfigOption('orientation') === 'vertical') {
      super.updateAxisElements();
    } else {
      // This function does some translating of elements to get the axes in the
      // right places. Here we use chartHeight instead of chartWidth for those
      // translations.
      this.xAxisElement
        .call(this.xAxis);

      this.yAxisElement
        .attr('transform', `translate(0, ${ this.size.chartHeight })`)
        .call(this.yAxis);

      this.yGridElement
        .call(this.yGrid
          .tickSize(this.size.chartHeight, 0));
    }
  }


  // Update the size and position of all DOM elements with the latest pixel values.
  sizeAndPositionGraphic() {
    super.sizeAndPositionGraphic();

    // Reset the orientation class, which is used by the CSS.
    this.containerEl.classed(`g-tmp-bar-chart-vertical g-tmp-bar-chart-horizontal`, false);
    this.containerEl.classed(`g-tmp-bar-chart-${ this.evalConfigOption('orientation') }`, true);
    this.updateDataElements();
    this.updateLabels();
  }
}
