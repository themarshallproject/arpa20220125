import * as d3 from 'd3';
import * as utilities from 'charts/utilities.js';
import VerticalBarChart from 'charts/bar-chart-vertical.js'

export default class CityStackedBar extends VerticalBarChart{
  // Check if any required keys are missing from the config.
  checkConfigKeys(config) {
    const requiredKeys = ['containerId', 'data', 'bandKey', 'valueKeyLow', 'valueKeyHigh'];
    this.ensureRequired(config, requiredKeys);
  }

  initLabels() {}

  updateLabels() {}

  getScaleExtents() {
    const xDomain = this.data.map((d) => { return d[this.config.bandKey] })

    return {
      xDomain: xDomain,
      yDomain: [0, 4500]
    }
  }

  initDataElements() {
    this.barLow = this.chart.append('g').attr('class', 'g-chart-bars')
      .selectAll('.bar-rect-low')
      .data(this.data)
        .enter()
      .append('rect')
        .attr('class', 'bar-rect-low')

    this.barHigh = this.chart.append('g').attr('class', 'g-chart-bars')
      .selectAll('.bar-rect-high')
      .data(this.data)
        .enter()
      .append('rect')
        .attr('class', 'bar-rect-high')
    }

  updateDataElements() {
    this.barLow
      .attr('x', (d) => {
        return this.xScale(d[this.config.bandKey])
      })
      .attr('y', (d) => {
        const thisValue = d[this.config.valueKeyLow];
        if (thisValue >= 0) {
          return this.yScale(thisValue);
        } else {
          return this.yScale(0);
        }
      })
      .attr('width', this.xScale.bandwidth())
      .attr('height', (d) => {
        return Math.abs(this.yScale(0) - this.yScale(d[this.config.valueKeyLow]));
      })

    this.barHigh
      .attr('x', (d) => {
        return this.xScale(d[this.config.bandKey])
      })
      .attr('y', (d) => {
        const thisValue = Number(d[this.config.valueKeyLow]);
        const stackingValue = Number(d[this.config.valueKeyHigh]);
        // console.log(thisValue+stackingValue)
        return this.yScale(thisValue+stackingValue);
      })
      .attr('width', this.xScale.bandwidth())
      .attr('height', (d) => {
        return Math.abs(this.yScale(0) - this.yScale(d[this.config.valueKeyHigh]));
      })
      .attr('fill', 'red')
    }

  resetYTicks() {
    this.yAxisElement
      .selectAll('text')
      .attr('x', -8)
  }

  sizeAndPositionChart() {
    super.sizeAndPositionChart();
    this.resetYTicks();
  }
}
