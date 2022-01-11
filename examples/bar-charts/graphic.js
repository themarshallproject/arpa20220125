import * as utilities from '../../templates/charts/utilities.js';
import NationalBarChart from './national-bar-chart.js';
import StackedBarChart from './stacked-bar.js';
import HorizontalBarChart from '../../templates/charts/bar-chart-horizontal.js';
import CityStackedBar from './mpp_cities.js';

$(document).ready(() => {
  // Single set of vertical bars
  initNationalBar();
  // Small multiples of stacked bars
  initCityBars();
  // Sidebar vertical bar chart
  initSidebarVertical();
  // Sidebar horizontal bar chart
  initSidebarHorizontal();
});

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
      return width < mobileBreak ? utilities.abbrevMonth(d) : d;
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

  $.each(chartList, (index, value) => {
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
  });
}

function initSidebarVertical() {
  const barChartMC = new StackedBarChart({
    containerId: 'dd-chart-one',
    data: CASE_DATA,
    bandKey: 'year',
    valueKey: 'case',
    barPadding: 0.4,
    marginLeft: 30,
    marginRight: 0,
    roundedYMax: 500,
    yAxisTicks: 5,
  });
}

function initSidebarHorizontal() {
  const paymentChart = new HorizontalBarChart({
    containerId: 'dd-chart-two',
    data: PAYMENT_DATA,
    bandKey: 'event',
    valueKey: 'pay',
    marginLeft: 80,
    marginRight: 30,
    marginBottom: 0,
    roundedXMax: 200,
    barPadding: 0.3,
    labelFormat: (d) => {
      return d == 180 ? `$${d}` : d;
    },
    marginTop: 0,
  });
}
