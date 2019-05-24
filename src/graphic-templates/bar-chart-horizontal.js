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
      barHeight: 20,
      barPadding: 0.1,
      roundBarSize: false,
      xDataFormat: (d) => { return +d },
      yDataFormat: (d) => { return d },
      xAxisTickFormat: (d) => { return utilities.addCommas(d) },
      yAxisTickFormat: (d) => { return d },
      labelFormat: (d) => { return utilities.addCommas(d) }
    });

    // Then set the basic defaults
    super.setConfigDefaults(classConfig);
  }
}
