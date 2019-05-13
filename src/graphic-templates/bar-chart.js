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
  }


  updateLabels() {
    this.barLabels
      .attr('x', (d) => {
        return this.xScale(d[this.config.keyX]) + (this.xScale.bandwidth() / 2);
      })
      .attr('y', (d,i) => {
        const yPos = this.yScale(d[this.config.keyY]) - 5;
        const barHeight = this.barRects.filter((bar_d,bar_i) => { return bar_i == i; }).attr('height');
        const textHeight = this.barLabels.filter((bar_d,bar_i) => { return bar_i == i; })
          .node()
            .getBoundingClientRect()
              .height;

        if (yPos < textHeight - this.size.marginTop) {
          return yPos + 5 + textHeight;
        } else {
          return yPos;
        }
      })
  }


  sizeAndPositionGraphic() {
    super.sizeAndPositionGraphic();
    this.updateDataElements();
    this.updateLabels();
  }
}
