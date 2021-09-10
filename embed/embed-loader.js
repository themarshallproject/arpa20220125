export default class TMPGraphicEmbed {
  constructor(config) {
    this.containerEl = document.getElementById(config.id);
    this.baseUrl = config.baseUrl;
    this.graphicPath = config.graphicPath;
    this.graphicSlug = this.containerEl.dataset.tmpSlug;

    this.loadManifest();
  }


  getRequest(url, callback) {
    const req = new XMLHttpRequest();
    req.addEventListener('load', () => {
      callback(req.response);
    });
    req.open('GET', url, true)
    req.send();
  }


  loadManifest() {
    const manifestUrl = `${ this.baseUrl }/rev-manifest.json`;
    this.getRequest(manifestUrl, (data) => this.loadGraphic(JSON.parse(data)));
  }


  loadGraphic(data) {
    const skipResources = this.checkSharedResources();
    const graphicUrl = `${ this.baseUrl }/${ data[this.graphicPath] }`;
    const jsUrl = `${ this.baseUrl }/${ data['graphic.js'] }`;
    const cssUrl = `${ this.baseUrl }/${ data['graphic.css'] }`;

    if (!this.skipResources) {
      this.loadCSS(cssUrl);
    }

    this.getEmbedBody(graphicUrl, jsUrl);
  }


  checkSharedResources() {
    const sharedEmbeds = document.querySelectorAll(`[data-tmp-slug="${ this.graphicSlug }"]`);
    return this.containerEl != sharedEmbeds[0];
  }


  getEmbedBody(graphicUrl, jsUrl) {
    this.getRequest(graphicUrl, (data) => this.initEmbed(data, jsUrl));
  }


  initEmbed(response, jsUrl) {
    this.containerEl.innerHTML = response;
    if (!this.skipResources) {
      this.loadJavascript(jsUrl);
    }
  }


  loadCSS(cssUrl) {
    if (cssUrl) {
      const cssLink = document.createElement('link');
      cssLink.rel = "stylesheet";
      cssLink.href = cssUrl;
      this.containerEl.before(cssLink);
    }
  }


  loadJavascript(jsUrl) {
    if (jsUrl) {
      const jsLink = document.createElement('script');
      jsLink.type = "text/javascript";
      jsLink.src = jsUrl;
      this.containerEl.after(jsLink);
    }
  }
}
