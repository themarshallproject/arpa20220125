import VerticalBarChart from 'charts/bar-chart-vertical.js';

export default class NationalBarChart extends VerticalBarChart {
  getScaleExtents() {
    const xDomain = this.data.map((d) => {
      return d[this.config.bandKey];
    });

    return {
      xDomain: xDomain,
      yDomain: [0, 6500],
    };
  }
}
