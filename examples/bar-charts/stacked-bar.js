import * as utilities from 'charts/utilities.js';
import VerticalBarChart from 'charts/bar-chart-vertical.js';

export default class StackedBarChart extends VerticalBarChart {
  initDataElements() {
    this.nacBarRects = this.chart.append('g').attr('class', 'g-chart-bars')
    .selectAll('.bar-rect-nac')
    .data(this.data)
      .enter()
    .append('rect')
      .attr('class', (d) => {
        return `bar-rect-nac bar-nac-${ utilities.slugify(d[this.config.bandKey]) }`
      })

    this.barRects = this.chart.append('g').attr('class', 'g-chart-bars')
      .selectAll('.bar-rect')
      .data(this.data)
        .enter()
      .append('rect')
        .attr('class', (d) => {
          return `bar-rect bar-${ utilities.slugify(d[this.config.bandKey]) }`;
        })
  }

    initLabels() {
      this.chart.append('defs')
        .append('marker')
        .attr('id', 'dd-graphic-arrow')
        .attr("refX", 11)
        .attr("refY", 6)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("markerUnits","userSpaceOnUse")
        .attr("orient", "auto")
        .append("path")
        // arrow pointing down
        .attr("d", "M 6 0 12 6 6 12")
        // arrow pointing up
        // .attr("d", "M 18 0 12 6 18 12")

      this.annotation = this.chart.append('g').attr('class', 'g-annotation')

      this.annotation
        .append('line')
          .attr('class', 'one-fifty-line')

      this.annotation
        .append('line')
          .attr('class', 'above-arrow')

      this.annotation
        .append('text')
          .attr('class', 'more-cases-text')

      this.annotation
        .append('text')
          .attr('class', 'more-cases-text-1')

    }

  updateDataElements() {
    // Bars at the botton should go 0 to 150
    this.nacBarRects
      .attr('x', (d) => {
        return this.xScale(d[this.config.bandKey]);
      })
      .attr('y', this.yScale(150))
      .attr('width', this.xScale.bandwidth())
      .attr('height', Math.abs(this.yScale(0) - this.yScale(150)))
      .attr('fill', 'red')

    // Bars at the top should go 150 to data
    // nacBarRects and barRects were going to be different colors
    // not anymore!
    this.barRects
      .attr('x', (d) => {
        return this.xScale(d[this.config.bandKey]);
      })
      .attr('y', (d) => {
        const thisValue = d[this.config.valueKey];
        if (thisValue >= 0) {
          return this.yScale(d[this.config.valueKey]);
        } else {
          return this.yScale(150);
        }
      })
      .attr('width', this.xScale.bandwidth())
      .attr('height', (d) => {
        return Math.abs(this.yScale(150) - this.yScale(d[this.config.valueKey]));
      })
  }

  updateLabels() {
    this.annotation
      .select('.one-fifty-line')
      .attr('x1', 0)
      .attr('x2', this.size.chartWidth)
      .attr('y1', this.yScale(150))
      .attr('y2', this.yScale(150))

    this.annotation
      .select('.above-arrow')
      .attr('x1', (this.xScale.step() - this.xScale.bandwidth()) / 2)
      .attr('x2', (this.xScale.step() - this.xScale.bandwidth()) / 2)
      .attr('y2', this.size.chartHeight/9 * 6)
      .attr('y1', this.size.chartHeight/9 * 1 + 15)
      .attr("marker-end","url(#dd-graphic-arrow)")


    this.annotation
      .select('.more-cases-text')
      .text('National')
      .attr('x', (this.xScale.step() - this.xScale.bandwidth()) / 3)
      .attr('y', this.size.chartHeight/9 * 1 - 5 /* font-size: 14px */)

    this.annotation
      .select('.more-cases-text-1')
      .text('standard')
      .attr('x', (this.xScale.step() - this.xScale.bandwidth()) / 3)
      .attr('y', this.size.chartHeight/9 * 1 + 9)
  }

}
