import * as d3 from 'd3';
import * as utilities from './utilities.js';
import GraphicWithAxes from './axis-base.js';

export default class BarChart extends GraphicWithAxes {
  constructor(config) {
    super(config);
  }


  setConfigDefaults(config) {
    // Set defaults specific to this class first
    const classConfig = _.defaults(config, {
      barWidth: 20,
      barPadding: 0.1,
      orientation: 'vertical',
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


  initGraphic() {
    this.initBaseGraphic();
    this.initScales();
    this.initAxes();
    this.initAxisElements();
    this.initDataElements();
    this.initLabels();
    this.sizeAndPositionGraphic();
  }


  initScales() {
    const { yDomain } = this.getScaleExtents();
    const xDomain = BARS_DATA.map((d) => { return d[this.config.keyX] })
    const yMin = yDomain[0] > 0 ? 0 : yDomain[0];

    this.xScale = d3.scaleBand()
      .round(this.config.roundBarSize)
      .padding(this.config.barPadding)
      .domain(xDomain);

    this.yScale = d3.scaleLinear()
      .domain([yMin, yDomain[1]]);
  }


  initAxes() {
    if (this.evalConfigOption('orientation') === 'vertical') {
      super.initAxes();
    } else {
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


  updateDataElements() {
    if (this.evalConfigOption('orientation') === 'vertical') {
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


  updateLabels() {
    if (this.evalConfigOption('orientation') === 'vertical') {
      this.barLabels
        .attr('x', (d) => {
          return this.xScale(d[this.config.keyX]) + (this.xScale.bandwidth() / 2);
        })
        .attr('y', (d,i,labelArray) => {
          const yPos = this.yScale(d[this.config.keyY]);
          const textSize = this.barLabels.filter((bar_d,bar_i) => { return bar_i == i; })
            .node()
              .getBoundingClientRect()
                .height;

          if (yPos < textSize - this.size.marginTop) {
            d3.select(labelArray[i]).classed('label-out', false).classed('label-in', true);
            return yPos + 5 + textSize;
          } else {
            d3.select(labelArray[i]).classed('label-in', false).classed('label-out', true);
            return yPos - 5;
          }
        })
    } else {
      this.barLabels
        .attr('x', (d,i,labelArray) => {
          const yPos = this.yScale(d[this.config.keyY]);
          const textSize = this.barLabels.filter((bar_d,bar_i) => { return bar_i == i; })
            .node()
              .getBoundingClientRect()
                .width;

          if (yPos + textSize > this.size.chartWidth + this.size.marginRight) {
            d3.select(labelArray[i]).classed('label-out', false).classed('label-in', true);
            return yPos - 5;
          } else {
            d3.select(labelArray[i]).classed('label-in', false).classed('label-out', true);
            return yPos + 5;
          }
        })
        .attr('y', (d) => {
          return this.xScale(d[this.config.keyX]) + (this.xScale.bandwidth() / 2);
        })
    }
  }


  calculateScales() {
    if (this.evalConfigOption('orientation') === 'vertical') {
      super.calculateScales();
    } else {
      this.xScale.range([this.size.chartHeight, 0]);
      this.yScale.range([0, this.size.chartWidth]);
    }
  }

  updateAxisElements() {
    if (this.evalConfigOption('orientation') === 'vertical') {
      super.updateAxisElements();
    } else {
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


  sizeAndPositionGraphic() {
    super.sizeAndPositionGraphic();
    this.containerEl.classed(`g-tmp-bar-chart-vertical g-tmp-bar-chart-horizontal`, false);
    this.containerEl.classed(`g-tmp-bar-chart-${ this.evalConfigOption('orientation') }`, true);
    this.updateDataElements();
    this.updateLabels();
  }
}
