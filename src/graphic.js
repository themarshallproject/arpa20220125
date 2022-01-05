import NationalBarChart from './national-bar-chart.js';
import { abbrevMonth } from 'charts/utilities.js';

// Single set of vertical bars
initNationalBar();

function initNationalBar() {
  var mobileBreak = 740;

  const barNation = new NationalBarChart({
    containerId: 're-national-chart',
    data: NATIONALDATA,
    aspectRatio: (width) => {
      return width < mobileBreak ? 2 / 1 : 3 / 1;
    },
    bandKey: 'month',
    valueKey: 'mpp',
    marginTop: (width) => {
      return width < mobileBreak ? 15 : 20;
    },
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 30,
    marginTop: 15,
    xAxisTickFormat: (d, width) => {
      return width < mobileBreak ? abbrevMonth(d) : d;
    },
  });
}
