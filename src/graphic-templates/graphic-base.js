import * as d3 from 'd3';

export default class GraphicBase {
  constructor(config) {
    this.$containerEl = $(`#${config.containerId}`);
    this.containerEl = d3.select(`#${config.containerId}`);
    this.config = this.setConfigDefaults(config);

    this.initBaseGraphic();

    if (this.config.responsive) {
      $(window).on('tmp_resize', () => {
        //this.redrawGraphic();
      });
    }
  }

  // Fill in default values for undefined config options
  setConfigDefaults(config) {
    return _.defaults(config, {
      responsive: true,
      aspectRatio: .75,
      marginTop: 10,
      marginRight: 10,
      marginBottom: 10,
      marginLeft: 10,
    });
  }

  // Add the SVG and a chart container to the page
  initBaseGraphic() {
    this.svg = this.containerEl.append('svg');
    this.chart = this.svg.append('g').attr('class', 'chart-g');
  }

  // Graphics default to filling their container width
  getChartWidth() {
    return this.$containerEl.width();
  }

  // Graphics default to basing their height as a proportion of the chart width.
  getChartHeight() {
    const chartWidth = this.getChartWidth();
    // However, this proportion may need to be expressed through a function
    // rather than a set value.
    const aspectMultiplier = this.evalConfigOption('aspectRatio');

    return aspectMultiplier * chartWidth;
  }

  // Return a chartWidth/chartHeight that is useful in scale calculations, so
  // we don't have to worry about calculating around margins.
  getBaseMeasurements() {
    const chartWidth = this.getChartWidth();
    const chartHeight = this.getChartHeight();

    return {
      chartWidth: chartWidth - this.config.marginLeft - this.config.marginRight,
      chartHeight: chartHeight - this.config.marginTop - this.config.marginBottom,
    }
  }

  // Some config options might be a fixed value, some might be a function.
  // Here's a wrapper to get the value given the config option name only.
  evalConfigOption(optionName) {
    const configOption = this.config[optionName];
    let configValue = configOption;

    if (typeof(configOption) === 'function') {
      configValue = configOption();
    }

    return configValue;
  }
}
