import * as utilities from 'charts/utilities.js';
import NationalBarChart from './mpp_national.js'
import CityStackedBar from './mpp_cities.js'
import LineChart from './line-chart.js'

// Wait for document ready before executing code that interacts with the DOM
$(document).ready(() => {
  // SINGLE SET OF BARS OR LINES
  initNationalBar();

  // HIGHLIGHT WITHIN AN OBJECT
  initCityBars();

  initFirstChart();
  initSecondChart();
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


function initCityBars() {
  var mobileBreak = 250

  var chartList = [{
    "container":"san-diego-cali",
    "data":SANDIEGODATA,
  }, {
    "container":"san-antonio-texas",
    "data":SANANTONIODATA
  }, {
    "container":"harlingen-texas",
    "data":HARLINGENDATA
  }, {
    "container":"el-paso-texas",
    "data":ELPASODATA
  }]

  $.each(chartList, (index, value) => {
    new CityStackedBar({
      containerId: value["container"],
      data: value["data"],
      bandKey: "month",
      valueKeyLow: "not_mpp",
      valueKeyHigh: "mpp",
      marginLeft: 20,
      marginRight: 0,
      xAxisTickFormat: (d) => { return d.replace("-", ". ")},
      yAxisTickFormat: (d) => { return d > 0 ? `${d/1000}k` : 0} ,
      aspectRatio: (width) => { return width < mobileBreak ? 7/6 : 9/6},
    })
  })
}

function initFirstChart() {
  var xDomainShare = [1988, 2019]
  var xAxisTickValuesShare = [1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018]
  var marginLeftShare = 40
  var xAxisTickFormatShare = (d) => { return d }
  var aspectRatioShare = 16/9

  const propertyCrimeHistoric = new LineChart({
    containerId: 'property-crime-historic',
    data: HISTORICDATA,
    xKey: 'year',
    yKey: 'property_crime_per_100k',
    marginLeft: marginLeftShare,
    xDomain: xDomainShare,
    yDomain: [0, 6750],
    yAxisTickValues: [0, 1500, 3000, 4500, 6000],
    xAxisTickFormat: xAxisTickFormatShare,
    xAxisTickValues: xAxisTickValuesShare,
    aspectRatio: aspectRatioShare
  })

  const violentCrimeHistoric = new LineChart({
    containerId: 'violent-crime-historic',
    data: HISTORICDATA,
    xKey: 'year',
    yKey: 'violent_per_100k',
    marginLeft: marginLeftShare,
    xDomain: xDomainShare,
    yDomain: [0, 1125],
    yAxisTickValues: [0, 250, 500, 750, 1000],
    xAxisTickFormat: xAxisTickFormatShare,
    xAxisTickValues: xAxisTickValuesShare,
    aspectRatio: aspectRatioShare
  })
}

function initSecondChart() {
  var xDomainShare = [2013, 2018.1]
  var xAxisTickValuesShare = [2013, 2014, 2015, 2016, 2017, 2018]
  var marginLeftShare = 30
  var xAxisTickFormatShare = (d) => { return d == 2013 ? d : `'${ d-2000 }` }
  var aspectRatioShare = 6/4

  const murderRate = new LineChart({
    containerId: 'murder-rate',
    data: VIOLENTCRIMEDATA,
    xKey: 'year',
    yKey: 'murder_per_100k',
    marginLeft: marginLeftShare,
    xDomain: xDomainShare,
    yDomain: [0, 12],
    yAxisTickValues: [0, 2, 4, 6, 8, 10],
    xAxisTickFormat: xAxisTickFormatShare,
    xAxisTickValues: xAxisTickValuesShare,
    aspectRatio: aspectRatioShare
  })

  const rapeRate = new LineChart({
    containerId: 'rape-rate',
    data: VIOLENTCRIMEDATA,
    xKey: 'year',
    yKey: 'rape_per_100k',
    marginLeft: marginLeftShare,
    xDomain: xDomainShare,
    yDomain: [0, 60],
    yAxisTickValues: [0, 10, 20, 30, 40, 50],
    xAxisTickFormat: xAxisTickFormatShare,
    xAxisTickValues: xAxisTickValuesShare,
    aspectRatio: aspectRatioShare
  })

  const robbertRate = new LineChart({
    containerId: 'robbery-rate',
    data: VIOLENTCRIMEDATA,
    xKey: 'year',
    yKey: 'robbery_per_100k',
    marginLeft: marginLeftShare,
    xDomain: xDomainShare,
    yDomain: [0, 180],
    xAxisTickFormat: xAxisTickFormatShare,
    xAxisTickValues: xAxisTickValuesShare,
    yAxisTickValues: [0, 30, 60, 90, 120, 150],
    aspectRatio: aspectRatioShare
  })

  const assaultRate = new LineChart({
    containerId: 'assault-rate',
    data: VIOLENTCRIMEDATA,
    xKey: 'year',
    yKey: 'aggravated_assault_per_100k',
    marginLeft: marginLeftShare,
    xDomain: xDomainShare,
    yDomain: [0, 360],
    yAxisTickValues: [0, 60, 120, 180, 240, 300],
    xAxisTickFormat: xAxisTickFormatShare,
    xAxisTickValues: xAxisTickValuesShare,
    aspectRatio: aspectRatioShare
  })
}
