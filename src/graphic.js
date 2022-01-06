import NationalBarChart from './national-bar-chart.js';
import StackedBarChart from './stacked-bar.js';
import CityStackedBar from './mpp_cities.js';
import { abbrevMonth } from 'charts/utilities.js';

// Single set of vertical bars
initNationalBar();
initCityBars();

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

function initCityBars() {
  var mobileBreak = 250;

  var chartList = [
    {
      container: 'san-diego-cali',
      data: SANDIEGODATA,
    },
    {
      container: 'san-antonio-texas',
      data: SANANTONIODATA,
    },
    {
      container: 'harlingen-texas',
      data: HARLINGENDATA,
    },
    {
      container: 'el-paso-texas',
      data: ELPASODATA,
    },
  ];

  for (const city in chartList) {
    const value = chartList[city];
    new CityStackedBar({
      containerId: value['container'],
      data: value['data'],
      bandKey: 'month',
      valueKeyLow: 'not_mpp',
      valueKeyHigh: 'mpp',
      marginLeft: 20,
      marginRight: 0,
      xAxisTickFormat: (d) => {
        return d.replace('-', '. ');
      },
      yAxisTickFormat: (d) => {
        return d > 0 ? `${d / 1000}k` : 0;
      },
      aspectRatio: (width) => {
        return width < mobileBreak ? 7 / 6 : 9 / 6;
      },
    });
  }
}
