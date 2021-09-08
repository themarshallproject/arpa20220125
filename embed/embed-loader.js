export default class TMPGraphicEmbed {
  constructor(config) {
    this.containerEl = document.getElementById(config.id);
    this.graphicUrl = config.graphicUrl;
    this.jsUrl = config.jsUrl;
    this.cssUrl = config.cssUrl;

    this.loadCSS();
    this.getEmbedBody();
  }


  getEmbedBody() {
    const embedRequest = new XMLHttpRequest();
    embedRequest.addEventListener('load', () => this.initEmbed(embedRequest.response));
    embedRequest.open('GET', this.graphicUrl, true)
    embedRequest.send();
  }


  initEmbed(response) {
    this.containerEl.innerHTML = response;
    this.loadJavascript();
  }


  loadCSS() {
    if (this.cssUrl) {
      const cssLink = document.createElement('link');
      cssLink.rel = "stylesheet";
      cssLink.href = this.cssUrl;
      this.containerEl.before(cssLink);
    }
  }


  loadJavascript() {
    if (this.jsUrl) {
      const jsLink = document.createElement('script');
      jsLink.type = "text/javascript";
      jsLink.src = this.jsUrl;
      this.containerEl.after(jsLink);
    } else {
      console.log('no js to load')
    }
  }
}
