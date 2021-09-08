export default class TMPGraphicEmbed {
  constructor(containerId, graphicUrl, jsUrl) {
    this.containerEl = document.getElementById(containerId);
    this.graphicUrl = graphicUrl;
    this.jsUrl = jsUrl;

    this.getEmbedBody();
  }


  getEmbedBody() {
    const embedRequest = new XMLHttpRequest();
    embedRequest.addEventListener('load', (r) => this.initEmbed(r));
    embedRequest.open('GET', this.graphicUrl, true)
    embedRequest.send();
  }


  initEmbed(response) {
    this.containerEl.innerHtml = response;
    this.loadJavascript();
  }


  loadJavascript() {
    if (this.jsUrl) {
      console.log('load js here')
    } else {
      console.log('no js to load')
    }
  }
}
