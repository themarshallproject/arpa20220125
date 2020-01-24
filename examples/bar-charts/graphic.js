import * as utilities from 'charts/utilities.js';
import NationalBarChart from './national-bar-chart.js'
import StackedBarChart from './stacked-bar.js'
import PaymentChart from './payment-chart.js'

$(document).ready(() => {
  initNationalBar();
  initSidebarVertical();
  initSidebarHorizontal();
});

function initNationalBar() {
  var mobileBreak = 740

  const barNation = new NationalBarChart({
    containerId: "re-national-chart",
    data: NATIONALDATA,
    aspectRatio: (width) => {return width < mobileBreak ? 2/1 : 3/1},
    bandKey: "month",
    valueKey: "mpp",
    marginTop: (width) => { return width < mobileBreak ? 15 : 20},
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 30,
    marginTop: 15,
    xAxisTickFormat: (d, width) => { return width < mobileBreak ? utilities.abbrevMonth(d) : d},
  })
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
    yAxisTicks: 5
  });
}

function initSidebarHorizontal() {
  const paymentChart = new PaymentChart({
    containerId: 'dd-chart-two',
    data: PAYMENT_DATA,
    bandKey: "event",
    valueKey: "pay",
    marginLeft: 80,
    marginRight: 30,
    marginBottom: 0,
    roundedXMax: 200,
    barPadding: 0.3,
    labelFormat: (d) => {return d == 180 ? `$${ d }` : d
  },
    marginTop: 0
  })
}
