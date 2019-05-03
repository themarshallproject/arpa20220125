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

  initBaseGraphic() {
    this.svg = this.containerEl.append('svg');
    this.chart = this.svg.append('g').attr('class', 'chart-g');
  }
}
