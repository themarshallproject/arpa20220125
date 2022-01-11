# Chart templates

This is the documentation for our chart templates, which can be found
in `templates/charts/`.

<!-- Auto-generated table of contents! -->
<!-- This section will update itself if you make changes to the headers. -->

## Table of Contents

<!-- toc -->

- [Getting started](#getting-started)
  - [Importing templates](#importing-templates)
  - [Importing styles](#importing-styles)
- [Individual template config options](#individual-template-config-options)
  - [ChartBase](#chartbase)
  - [ChartWithAxes](#chartwithaxes)
  - [VerticalBarChart](#verticalbarchart)
  - [HorizontalBarChart](#horizontalbarchart)

<!-- tocstop -->

## Getting started

All the charts in these templates use d3.js (version 5), which will be
automatically installed when you set up a new chart or run `npm install`.

### Importing templates

Each template can be imported into your javascript as an ES6 module and
instantiated as a chart object. For example, here's how you would
create a new bar chart in the div `#g-chart-example`:

```js
import HorizontalBarChart from '../templates/charts/bar-chart-horizontal.js';

const BARS_DATA = [
  {
    name: 'Bar 1',
    value: '20',
  },
  {
    name: 'Bar 2',
    value: '10',
  },
];

const exampleChart = new HorizontalBarChart({
  containerId: 'g-chart-example',
  data: BARS_DATA,
  bandKey: 'name',
  valueKey: 'value',
});
```

### Importing styles

Stylesheets can be found in `templates/charts/stylesheets/` and
imported in your `graphic.scss` file.

```scss
@import '../templates/charts/stylesheets/chart-with-axes.scss';
@import '../templates/charts/stylesheets/chart-labels.scss';
```

## Individual template config options

Each chart type accepts an object of config options to customize the
chart. All charts must include a `containerId`, which is used to select
the DOM element where the chart will be drawn.

### ChartBase

Options for the <a href="chart-base.js">base template</a>, which just draws an SVG. All of these
options will be available to other templates.

<a name="containerId" href="#containerId">#</a> config<strong>.containerId</strong> - <em>String</em>. **Required.**

The id of the DOM element where the chart will be drawn. Should not
include the `#` identifier.

<a name="responsive" href="#responsive">#</a>
config<strong>.responsive</strong> - <em>Boolean</em>. Default value: `true`

Whether the chart should redraw on `tmp_resize`.

<a name="aspectRatio" href="#aspectRatio">#</a>
config<strong>.aspectRatio</strong> - <em>Number</em> or <em>Function</em>. Default value:
`4/3`

The aspect ratio of the chart canvas, expressed as a ratio of width to height.
Any positive finite value is accepted, though for readability we prefer
a math expression (e.g. `16/9`) to a decimal value (e.g. `1.77`).
A higher value will be a shallower chart; a lower value will be a
taller chart. The default value, `4/3`, represents a chart with a height that
is three-quarters of its width.

Can be expressed as a function with one argument,
the width of the chart SVG in pixels, to set values responsively.

**Example:** _Setting aspect ratio responsively_

The example below sets an aspect ratio of 4:3 for charts with a width
smaller than 600px, and a ratio of 16:9 for wider charts.

```
const mobileBreak = 600;

const responsiveChart = new ChartBase({
  containerId: 'g-chart-example',
  aspectRatio: (width) => { return width < mobileBreak ? 4/3 : 16/9 }
});
```

<a name="marginTop" href="#marginTop">#</a>
config<strong>.marginTop</strong> - <em>Number</em> or <em>Function</em>. Default value: `10`

The space between the top edge of the SVG and the area where the chart
itself is drawn.

Can be expressed as a function with one argument,
the width of the chart SVG in pixels, to set values responsively.

<a name="marginRight" href="#marginRight">#</a>
config<strong>.marginRight</strong> - <em>Number</em> or <em>Function</em>. Default value: `10`

The space between the right edge of the SVG and the area where the chart
itself is drawn.

Can be expressed as a function with one argument,
the width of the chart SVG in pixels, to set values responsively.

<a name="marginBottom" href="#marginBottom">#</a>
config<strong>.marginBottom</strong> - <em>Number</em> or <em>Function</em>. Default value: `10`

The space between the bottom edge of the SVG and the area where the chart
itself is drawn.

Can be expressed as a function with one argument,
the width of the chart SVG in pixels, to set values responsively.

<a name="marginLeft" href="#marginLeft">#</a>
config<strong>.marginLeft</strong> - <em>Number</em> or <em>Function</em>. Default value: `10`

The space between the left edge of the SVG and the area where the chart
itself is drawn.

Can be expressed as a function with one argument,
the width of the chart SVG in pixels, to set values responsively.

---

### ChartWithAxes

Options for the <a href="axis-base.js">chart with axes template</a>,
which extends `ChartBase` and draws X and Y axes onto the SVG.

Inherits all config options made available by `ChartBase`.

<a name="data" href="#data">#</a>
config<strong>.data</strong> - <em>Array</em>. **Required.**

An array of data. If no rounded min/max values are defined, the range of
any data scales will calculate the maximum and minimum values from this
data to serve as the range.

<a name="xKey" href="#xKey">#</a>
config<strong>.xKey</strong> - <em>String</em>. **Required.**

The name of the property through which the x value can be accessed
in each datum.

<a name="yKey" href="#yKey">#</a>
config<strong>.yKey</strong> - <em>String</em>. **Required.**

The name of the property through which the y value can be accessed
in each datum.

<a name="xDataFormat" href="#xDataFormat">#</a>
config<strong>.xDataFormat</strong> - <em>Function</em>. Default value: `(d) => { return +d; }`

A function that accesses and/or formats the x data value.

<a name="yDataFormat" href="#yDataFormat">#</a>
config<strong>.yDataFormat</strong> - <em>Function</em>. Default value: `(d) => { return +d; }`

A function that accesses and/or formats the y data value.

<a name="roundedXMin" href="#roundedXMin">#</a>
config<strong>.roundedXMin</strong> - <em>Number, Date</em>. Default value:
`null`

If the x data uses a numeric scale, this value will be used to set the
minimum value of the xScale range (and thus the minimum value displayed
on the x axis). Useful for setting your axes to tidy, rounded values.

<a name="roundedYMin" href="#roundedYMin">#</a>
config<strong>.roundedYMin</strong> - <em>Number, Date</em>. Default value:
`null`

If the y data uses a numeric scale, this value will be used to set the
minimum value of the yScale range (and thus the minimum value displayed
on the y axis). Useful for setting your axes to tidy, rounded values.

<a name="roundedXMax" href="#roundedXMax">#</a>
config<strong>.roundedXMax</strong> - <em>Number, Date</em>. Default value:
`null`

If the x data uses a numeric scale, this value will be used to set the
maximum value of the xScale range (and thus the maximum value displayed
on the x axis). Useful for setting your axes to tidy, rounded values.

<a name="roundedYMax" href="#roundedYMax">#</a>
config<strong>.roundedYMax</strong> - <em>Number, Date</em>. Default value:
`null`

If the y data uses a numeric scale, this value will be used to set the
maximum value of the yScale range (and thus the maximum value displayed
on the y axis). Useful for setting your axes to tidy, rounded values.

<a name="xAxisTickFormat" href="#xAxisTickFormat">#</a>
config<strong>.xAxisTickFormat</strong> - <em>Function</em>. Default value:
`(d, width) => { return utilities.addCommas(d) }`

A function that formats the tick labels along the x axis. The function
is passed two arguments: `d`, representing the value of the tick, and
`width`, the width of the chart SVG, which can be used to format the
ticks responsively.

**Example:** _Setting tick format responsively_

The example below formats ticks as `1k`, `2k`, etc. for charts narrower
than 600px and `1,000`, `2,000`, etc. for wider charts.

```
const mobileBreak = 600;

const responsiveChart = new ChartWithAxes({
  containerId: 'g-chart-example',
  data: EXAMPLE_DATA,
  xKey: 'x',
  yKey: 'y',
  xAxisTickFormat: (d, width) => { return width < mobileBreak ? `${ d / 1000 }k` : utilities.addCommas(d) }
});
```

<a name="yAxisTickFormat" href="#yAxisTickFormat">#</a>
config<strong>.yAxisTickFormat</strong> - <em>Function</em>. Default value:
`(d, width) => { return utilities.addCommas(d) }`

A function that formats the tick labels along the y axis. The function
is passed two arguments: `d`, representing the value of the tick, and
`width`, the width of the chart SVG, which can be used to format the
ticks responsively.

<a name="xAxisTicks" href="#xAxisTicks">#</a>
config<strong>.xAxisTicks</strong><br>
<a name="yAxisTicks" href="#yAxisTicks">#</a>
config<strong>.yAxisTicks</strong><br>
<a name="xAxisTickArguments" href="#xAxisTickArguments">#</a>
config<strong>.xAxisTickArguments</strong><br>
<a name="yAxisTickArguments" href="#yAxisTickArguments">#</a>
config<strong>.yAxisTickArguments</strong><br>
<a name="xAxisTickValues" href="#xAxisTickValues">#</a>
config<strong>.xAxisTickValues</strong><br>
<a name="yAxisTickValues" href="#yAxisTickValues">#</a>
config<strong>.yAxisTickValues</strong>

Implementing d3.js's axis tick options for the x and y axes,
respectively. [See the d3 documentation.](https://github.com/d3/d3-axis#axis_ticks)

Can be expressed as a function with one argument,
the width of the chart SVG in pixels, to set values responsively.

---

### VerticalBarChart

Options for the <a href="bar-chart-vertical.js">vertical bar chart template</a>,
which extends `ChartWithAxes` and draws a bar chart with bars running
vertically.

Inherits all config options made available by `ChartBase` and
`ChartWithAxes`, with some new default values noted below.

To make it as easy as possible to convert from a vertical bar chart to a
horizontal bar chart, the config options reference data by `band` and
`value` rather than `x` and `y`. `band` refers to the category or
name of each bar (i.e. the independent variable), while `value`
refers to the size of each bar (the dependent variable).

<a name="bandKey" href="#bandKey">#</a>
config<strong>.bandKey</strong> - <em>String</em>. **Required.**

The name of the property through which the bar's band can be accessed
in each datum.

<a name="valueKey" href="#valueKey">#</a>
config<strong>.valueKey</strong> - <em>String</em>. **Required.**

The name of the property through which the bar's value can be accessed
in each datum.

<a name="bandDataFormat" href="#bandDataFormat">#</a>
config<strong>.bandDataFormat</strong> - <em>Function</em>. Default value: `(d) => { return d; }`

A function that accesses and/or formats the band data value.

<a name="valueDataFormat" href="#valueDataFormat">#</a>
config<strong>.valueDataFormat</strong> - <em>Function</em>. Default value: `(d) => { return +d; }`

A function that accesses and/or formats the value data value.

<a name="barPadding" href="#barPadding">#</a>
config<strong>.barPadding</strong> - <em>Number</em>. Default value:
`0.1`

A value between 0 and 1 that sets the inner and outer padding of each band. Refer to the [d3.js
documentation](https://github.com/d3/d3-scale#band_padding) for
`band.padding()`.

<a name="roundBarSize" href="#roundBarSize">#</a>
config<strong>.roundBarSize</strong> - <em>Boolean</em>. Default value:
`false`

If true, the start and stop position of each band will be integers.
Refer to the [d3.js documentation](https://github.com/d3/d3-scale#band_round) for `band.round()`.

<a name="labelFormat" href="#labelFormat">#</a>
config<strong>.labelFormat</strong> - <em>Function</em>. Default value: `(d) => { return utilities.addCommas(d) }`

A function that formats the label displayed with each bar.

<a name="xAxisTickFormat" href="#xAxisTickFormat">#</a>
config<strong>.xAxisTickFormat</strong> - <em>Function</em>. Default value:
`(d, width) => { return d }`

A function that formats the tick labels along the x axis. The function
is passed two arguments: `d`, representing the value of the tick, and
`width`, the width of the chart SVG, which can be used to format the
ticks responsively.

<a name="yAxisTickFormat" href="#yAxisTickFormat">#</a>
config<strong>.yAxisTickFormat</strong> - <em>Function</em>. Default value:
`(d, width) => { return utilities.addCommas(d) }`

A function that formats the tick labels along the y axis. The function
is passed two arguments: `d`, representing the value of the tick, and
`width`, the width of the chart SVG, which can be used to format the
ticks responsively.

---

### HorizontalBarChart

<a name="xAxisTickFormat" href="#xAxisTickFormat">#</a>
config<strong>.xAxisTickFormat</strong> - <em>Function</em>. Default value:
`(d, width) => { return utilities.addCommas(d) }`

A function that formats the tick labels along the x axis. The function
is passed two arguments: `d`, representing the value of the tick, and
`width`, the width of the chart SVG, which can be used to format the
ticks responsively.

<a name="yAxisTickFormat" href="#yAxisTickFormat">#</a>
config<strong>.yAxisTickFormat</strong> - <em>Function</em>. Default value:
`(d, width) => { return d }`

A function that formats the tick labels along the y axis. The function
is passed two arguments: `d`, representing the value of the tick, and
`width`, the width of the chart SVG, which can be used to format the
ticks responsively.
