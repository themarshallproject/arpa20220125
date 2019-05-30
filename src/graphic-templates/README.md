# Graphic templates

## Table of contents

TK

## Getting started

All the graphics in these templates use d3.js (version 5). Make sure you have that
installed:

```
npm install --save-dev d3
```

Each template can be imported into your javascript as an ES6 module and
instantiated as a graphic object. For example, here's how you would
create a new bar chart in the div `#g-chart-example`:

```
import HorizontalBarChart from './graphic-templates/bar-chart-horizontal.js';

const BARS_DATA = [
  {
    name: 'Bar 1',
    value: '20'
  },
  {
    name: 'Bar 2',
    value: '10'
  }
];

const exampleChart = new HorizontalBarChart({
  containerId: 'g-chart-example',
  data: BARS_DATA,
  bandKey: 'name',
  valueKey: 'value',
});


```


## Config options

### Graphic base

      data: [],
      responsive: true,
      aspectRatio: .75,
      marginTop: 10,
      marginRight: 10,
      marginBottom: 10,
      marginLeft: 10,

### Graphic with axes

      data: [],
      keyX: 'x',
      keyY: 'y',
      responsive: true,
      aspectRatio: .75,
      marginTop: 10,
      marginRight: 10,
      marginBottom: 10,
      marginLeft: 10,
      xDataFormat: (d) => { return +d },
      yDataFormat: (d) => { return +d },
      xAxisTickFormat: (d) => { return utilities.addCommas(d) },
      yAxisTickFormat: (d) => { return utilities.addCommas(d) },
      xAxisTicks: null,
      yAxisTicks: null,
      xAxisTickArguments: null,
      yAxisTickArguments: null,
      xAxisTickValues: null,
      yAxisTickValues: null,
      roundedXMin
      roundedXMax
      roundedYMin
      roundedYMax


### Vertical bar chart

      bandKey: 'value_x',
      valueKey: 'value_y',
      barWidth: 20,
      barPadding: 0.1,
      roundBarSize: false,
      bandDataFormat: (d) => { return d },
      valueDataFormat: (d) => { return +d },
      xAxisTickFormat: (d) => { return d },
      yAxisTickFormat: (d) => { return utilities.addCommas(d) },
      labelFormat: (d) => { return utilities.addCommas(d) }


### Horizontal bar chart

      xAxisTickFormat: (d) => { return utilities.addCommas(d) },
      yAxisTickFormat: (d) => { return d },
