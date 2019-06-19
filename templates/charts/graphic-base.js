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
    this.checkConfigKeys(config);

    this.$containerEl = $(`#${config.containerId}`);
    this.containerEl = d3.select(`#${config.containerId}`);
    this.setConfigDefaults(config);
    this.data = this.config.data;

    if (this.config.responsive) {
      $(window).on('tmp_resize', () => {
        this.redrawGraphic();
      });
    }

    this.initGraphic();
  }


  // Check if any required keys are missing from the config.
  checkConfigKeys(config) {
    this.ensureRequired('GraphicBase', config, ['containerId']);
  }


  // Return error message for each required key missing from config.
  ensureRequired(name, object, requiredKeys) {
    const errors = [];

    requiredKeys.forEach((key) => {
      if (typeof object[key] === 'undefined') {
        errors.push(`Required key ${key} missing from config options`);
      }
    });

    if (errors.length > 0) {
      console.error(`Error calling ${name}:\n${errors.join('\n')}`);
    }
  }


  // Fill in default values for undefined config options. This preserves any
  // already-defined config options, which means you can pass literally any
  // sort of data through to your graphic.
  setConfigDefaults(config) {
    this.config = _.defaults(config, {
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
    this.containerEl.classed('g-tmp-chart', true);
    this.svg = this.containerEl.append('svg');
    this.chart = this.svg.append('g').attr('class', 'chart-g');
  }


  // Graphics default to filling their container width
  getSVGWidth() {
    return this.$containerEl.width();
  }


  // Graphics default to basing their height as a proportion of the chart width.
  getSVGHeight() {
    const svgWidth = this.getSVGWidth();
    // However, this proportion may need to be expressed through a function
    // rather than a set value.
    const aspectMultiplier = this.evalConfigOption('aspectRatio', { svgWidth: svgWidth });

    return aspectMultiplier * svgWidth;
  }


  // Return a chartWidth/chartHeight that is useful in scale calculations, so
  // we don't have to worry about calculating around margins.
  getBaseMeasurements() {
    const svgWidth = this.getSVGWidth();
    const svgHeight = this.getSVGHeight();
    const marginTop = this.evalConfigOption('marginTop', { svgWidth: svgWidth });
    const marginRight = this.evalConfigOption('marginRight', { svgWidth: svgWidth });
    const marginBottom = this.evalConfigOption('marginBottom', { svgWidth: svgWidth });
    const marginLeft = this.evalConfigOption('marginLeft', { svgWidth: svgWidth });

    return {
      chartWidth: svgWidth - marginLeft - marginRight,
      chartHeight: svgHeight - marginTop - marginBottom,
      marginTop: marginTop,
      marginRight: marginRight,
      marginBottom: marginBottom,
      marginLeft: marginLeft,
    }
  }


  // Set the size of the SVG and offset the chart group by the top and left margins.
  sizeBaseSVG() {
    this.size = this.getBaseMeasurements();

    // The SVG should include margins in its width and height.
    this.svg
      .attr('width', this.size.chartWidth + this.size.marginLeft + this.size.marginRight)
      .attr('height', this.size.chartHeight + this.size.marginTop + this.size.marginBottom);

    // Offset the chart group by top and left margins.
    this.chart
      .attr('transform', `translate(${ this.size.marginLeft }, ${ this.size.marginTop })`);
  }


  // Redraw the graphic, re-calculating the size and positions. This is called
  // on `tmp_resize` in the constructor.
  redrawGraphic() {
    this.sizeBaseSVG();
  }


  // Some config options might be a fixed value, some might be a function.
  // Here's a wrapper to get the value given the config option name only.
  evalConfigOption(optionName, args) {
    const configOption = this.config[optionName];
    let configValue = configOption;

    if (typeof(configOption) === 'function') {
      configValue = configOption.call(this, args);
    }

    return configValue;
  }


}
