import * as d3 from 'd3';
import * as utilities from './utilities.js';
import VerticalBarChart from './bar-chart-vertical.js';

export default class HorizontalBarChart extends VerticalBarChart {

  constructor(config) {
    super(config);
  }


  // Fill in default values for undefined config options. Some are already
  // defined in the GraphicWithAxes class. This function preserves any
  // already-defined config options, which means you can pass literally any
  // sort of data through to your graphic.
  setConfigDefaults(config) {
    // Set defaults specific to this class first
    const classConfig = _.defaults(config, {
    });

    // Then set the basic defaults
    super.setConfigDefaults(classConfig);
  }


  // Initialize scale properties on the class instance. Rather than the
  // default linearScale for the xScale, we are using a band scale where
  // the domain is set to each of the x values of the data.
  initScales() {
    // Use the default getScaleExtents() to get y extent
    const { yDomain } = this.getScaleExtents();
    const xDomain = BARS_DATA.map((d) => { return d[this.config.keyX] })
    // For bar charts, always use a zero baseline
    const yMin = yDomain[0] > 0 ? 0 : yDomain[0];

    this.xScale = d3.scaleBand()
      .round(this.config.roundBarSize)
      .padding(this.config.barPadding)
      .domain(xDomain);

    this.yScale = d3.scaleLinear()
      .domain([yMin, yDomain[1]]);
  }

}
