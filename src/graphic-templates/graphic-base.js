import * as d3 from 'd3';

/* * * * *
 * GRAPHIC BASE
 *
 * The most basic graphic template class. This adds an SVG to the given container
 * and sets it up with a chart group, config options and responsive sizing. This
 * is meant to be extended into all sorts of wacky, beautiful charts.
 * * * * */
export default class GraphicBase {

  // Constructor: Sets the most basic class properties and fills in config defaults.
  // Listens for resize.
  constructor(config) {
    this.$containerEl = $(`#${config.containerId}`);
    this.containerEl = d3.select(`#${config.containerId}`);
    this.config = this.setConfigDefaults(config);

    if (this.config.responsive) {
      $(window).on('tmp_resize', () => {
        this.redrawGraphic();
      });
    }

    this.initGraphic();
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


  // Initialize the graphic and size it. We call this separately from the
  // constructor because this will differ from template to template.
  initGraphic() {
    this.initBaseGraphic();
    this.sizeBaseSVG();
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
    const marginTop = this.evalConfigOption('marginTop');
    const marginRight = this.evalConfigOption('marginRight');
    const marginBottom = this.evalConfigOption('marginBottom');
    const marginLeft = this.evalConfigOption('marginLeft');

    return {
      chartWidth: chartWidth - marginLeft + marginRight,
      chartHeight: chartHeight - marginTop + marginBottom,
      marginTop: marginTop,
      marginRight: marginRight,
      marginBottom: marginBottom,
      marginLeft: marginLeft,
    }
  }


  // Set the size of the SVG and offset the chart group by the top and left margins.
  sizeBaseSVG() {
    const size = this.getBaseMeasurements();

    // The SVG should include margins in its width and height.
    this.svg
      .attr('width', size.chartWidth + size.marginLeft + size.marginRight)
      .attr('height', size.chartHeight + size.marginTop + size.marginBottom);

    // Offset the chart group by top and left margins.
    this.chart
      .attr('transform', `translate(${ size.marginLeft }, ${ size.marginTop })`);
  }


  // Redraw the graphic, re-calculating the size and positions. This is called
  // on `tmp_resize` in the constructor.
  redrawGraphic() {
    this.sizeBaseSVG();
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
