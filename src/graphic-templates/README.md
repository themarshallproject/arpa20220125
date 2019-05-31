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

Each chart type accepts an object of config options to customize the
chart. All charts must include a `containerId`, which is used to select
the DOM element where the chart will be drawn.

### Required options

<a name="containerId" href="#containerId">#</a> <strong>config.containerId</strong> - <em>String</em>

The id of the DOM element where the chart will be drawn. Should not
include the `#` identifier.

### GraphicBase options

Options for the <a href="graphic-base.js">base template</a>, which just draws an SVG. All of these
options will be available to other templates.

<a name="responsive" href="#responsive">#</a>
<strong>config.responsive</strong> - <em>Boolean</em>. Default value: `true`

Whether the chart should redraw on `tmp_resize`.

<a name="aspectRatio" href="#aspectRatio">#</a>
<strong>config.aspectRatio</strong> - <em>Number</em>. Default value:
`.75`

The aspect ratio of the chart canvas, expressed as a ratio of height to
width. A lower value will be a shallower chart; a higher value will be a
taller chart. The default value, `0.75`, represents a chart with a height that
is 75% of its width.

<a name="marginTop" href="#marginTop">#</a>
<strong>config.marginTop</strong> - <em>Number</em>. Default value: `10`

The space between the top edge of the SVG and the area where the chart
itself is drawn.

<a name="marginRight" href="#marginRight">#</a>
<strong>config.marginRight</strong> - <em>Number</em>. Default value: `10`

The space between the right edge of the SVG and the area where the chart
itself is drawn.

<a name="marginBottom" href="#marginBottom">#</a>
<strong>config.marginBottom</strong> - <em>Number</em>. Default value: `10`

The space between the bottom edge of the SVG and the area where the chart
itself is drawn.

<a name="marginLeft" href="#marginLeft">#</a>
<strong>config.marginLeft</strong> - <em>Number</em>. Default value: `10`

The space between the left edge of the SVG and the area where the chart
itself is drawn.


### GraphicWithAxes options

Options for the <a href="axis-base.js">graphic with axes template</a>,
which extends `GraphicBase` and draws X and Y axes onto the SVG.

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
