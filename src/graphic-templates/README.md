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

Inherits all config options made available by `GraphicBase`.

<a name="data" href="#data">#</a>
<strong>config.data</strong> - <em>Array</em>. Default value: `[]`

An array of data. If no rounded min/max values are defined, the range of
any data scales will calculate the maximum and minimum values from this
data to serve as the range.

<a name="xKey" href="#xKey">#</a>
<strong>config.xKey</strong> - <em>String</em>. Default value: `x`

The name of the property through which the x value can be accessed
in each datum.

<a name="yKey" href="#yKey">#</a>
<strong>config.yKey</strong> - <em>String</em>. Default value: `y`

The name of the property through which the y value can be accessed
in each datum.

<a name="xDataFormat" href="#xDataFormat">#</a>
<strong>config.xDataFormat</strong> - <em>Function</em>. Default value: `(d) => { return +d; }`

A function that accesses and/or formats the x data value.

<a name="yDataFormat" href="#yDataFormat">#</a>
<strong>config.yDataFormat</strong> - <em>Function</em>. Default value: `(d) => { return +d; }`

A function that accesses and/or formats the y data value.

<a name="roundedXMin" href="#roundedXMin">#</a>
<strong>config.roundedXMin</strong> - <em>Number, Date</em>. Default value:
`null`

If the x data uses a numeric scale, this value will be used to set the
minimum value of the xScale range (and thus the minimum value displayed
on the x axis). Useful for setting your axes to tidy, rounded values.

<a name="roundedYMin" href="#roundedYMin">#</a>
<strong>config.roundedYMin</strong> - <em>Number, Date</em>. Default value:
`null`

If the y data uses a numeric scale, this value will be used to set the
minimum value of the yScale range (and thus the minimum value displayed
on the y axis). Useful for setting your axes to tidy, rounded values.

<a name="roundedXMax" href="#roundedXMax">#</a>
<strong>config.roundedXMax</strong> - <em>Number, Date</em>. Default value:
`null`

If the x data uses a numeric scale, this value will be used to set the
maximum value of the xScale range (and thus the maximum value displayed
on the x axis). Useful for setting your axes to tidy, rounded values.

<a name="roundedYMax" href="#roundedYMax">#</a>
<strong>config.roundedYMax</strong> - <em>Number, Date</em>. Default value:
`null`

If the y data uses a numeric scale, this value will be used to set the
maximum value of the yScale range (and thus the maximum value displayed
on the y axis). Useful for setting your axes to tidy, rounded values.

<a name="xAxisTickFormat" href="#xAxisTickFormat">#</a>
<strong>config.xAxisTickFormat</strong> - <em>Function</em>. Default value:
`(d) => { return utilities.addCommas(d) }`

A function that formats the tick labels along the x axis.

<a name="yAxisTickFormat" href="#yAxisTickFormat">#</a>
<strong>config.yAxisTickFormat</strong> - <em>Function</em>. Default value:
`(d) => { return utilities.addCommas(d) }`

A function that formats the tick labels along the y axis.

<a name="axisTickOptions" href="#axisTickOptions">#</a>
<strong>config.xAxisTicks, config.yAxisTicks</strong> - Default value:
`null`<br>
<strong>config.xAxisTickArguments, config.yAxisTickArguments</strong> - Default value:
`null`<br>
<strong>config.xAxisTickValues, config.yAxisTickValues</strong> - Default value:
`null`

Implementing d3.js's axis tick options for the x and y axes,
respectively. [See the d3 documentation.](#TODO)


### Vertical bar chart

Options for the <a href="bar-chart-vertical.js">vertical bar chart template</a>,
which extends `GraphicWithAxes` and draws a bar chart with bars running
vertically.

Inherits all config options made available by `GraphicBase` and
`GraphicWithAxes`, with some new default values noted below.

To make it as easy as possible to convert from a vertical bar chart to a
horizontal bar chart, the config options reference data by `band` and
`value` rather than `x` and `y`. `band` refers to the category or
name of each bar (i.e. the independent variable), while `value`
refers to the size of each bar (the dependent variable).

<a name="barWidth" href="#barWidth">#</a>
<strong>config.barWidth</strong> - <em>Number</em>. Default value:
`20`

The width of a single bar.

<a name="barPadding" href="#barPadding">#</a>
<strong>config.barPadding</strong> - <em>Number</em>. Default value:
`0.1`

TKTKTKTK.

<a name="roundBarSize" href="#roundBarSize">#</a>
<strong>config.roundBarSize</strong> - <em>Boolean</em>. Default value:
`false`

TKTKTKTK.

<a name="bandKey" href="#bandKey">#</a>
<strong>config.bandKey</strong> - <em>String</em>. Default value: `x`

The name of the property through which the bar's band can be accessed
in each datum.

<a name="valueKey" href="#valueKey">#</a>
<strong>config.valueKey</strong> - <em>String</em>. Default value: `y`

The name of the property through which the bar's value can be accessed
in each datum.

<a name="bandDataFormat" href="#bandDataFormat">#</a>
<strong>config.bandDataFormat</strong> - <em>Function</em>. Default value: `(d) => { return d; }`

A function that accesses and/or formats the band data value.

<a name="valueDataFormat" href="#valueDataFormat">#</a>
<strong>config.valueDataFormat</strong> - <em>Function</em>. Default value: `(d) => { return +d; }`

A function that accesses and/or formats the value data value.

<a name="labelFormat" href="#labelFormat">#</a>
<strong>config.labelFormat</strong> - <em>Function</em>. Default value: `(d) => { return utilities.addCommas(d) }`

A function that formats the label displayed with each bar.


TKTK: What to do about axis tick functions?
- should labelformat receive entire datum?

      xAxisTickFormat: (d) => { return d },
      yAxisTickFormat: (d) => { return utilities.addCommas(d) },
      labelFormat: (d) => { return utilities.addCommas(d) }


### Horizontal bar chart

      xAxisTickFormat: (d) => { return utilities.addCommas(d) },
      yAxisTickFormat: (d) => { return d },
