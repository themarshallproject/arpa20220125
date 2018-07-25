// This is a modified version of the NYT's ai2html resizer script.
// The original script is here: https://github.com/newsdev/ai2html/blob/gh-pages/_includes/resizer-script.html

(function() {
  // only want one resizer on the page
  if (document.documentElement.className.indexOf("g-resizer-v3-init") > -1) return;
  document.documentElement.className += " g-resizer-v3-init";
  // require IE9+
  if (!("querySelector" in document)) return;
  function resizer() {
    var elements = Array.prototype.slice.call(document.querySelectorAll(".g-artboard[data-min-width]")),
      widthById = {};
    elements.forEach(function(el) {
      // TMP update: allow for max-width constraints for individual artboards
      // In order to fuss with the ai2html script as little as possible, use
      // attributes set on the parent's parent element (sizingWrapper) to apply
      // a max-width on the artboard's parent.
      var parent = el.parentNode,
        sizingWrapper = parent.parentNode,
        width = widthById[sizingWrapper.id] || sizingWrapper.getBoundingClientRect().width,
        minwidth = el.getAttribute("data-min-width"),
        maxwidth = el.getAttribute("data-max-width");

      var graphicName = parent.id.replace('box',''),
          artboardName = el.id.replace(graphicName, ''),
          constrainedWidthAttr = 'data-constrain-' + artboardName;

      widthById[sizingWrapper.id] = width;

      if (+minwidth <= width && (+maxwidth >= width || maxwidth === null)) {
        var constrainedWidth = sizingWrapper.getAttribute(constrainedWidthAttr);
        if (constrainedWidth) {
          parent.style.maxWidth = constrainedWidth + 'px';
        } else {
          parent.style.maxWidth = '';
        }

        el.style.display = "block";
      } else {
        el.style.display = "none";
      }
    });
    try {
      if (window.parent && window.parent.$) {
        window.parent.$("body").trigger("resizedcontent", [window]);
      }
      if (window.require) {
        require(['foundation/main'], function() {
          require(['shared/interactive/instances/app-communicator'], function(AppCommunicator) {
            AppCommunicator.triggerResize();
          });
        });
      }
    } catch(e) { console.log(e); }
  }

  document.addEventListener('DOMContentLoaded', resizer);
  // feel free to replace throttle with _.throttle, if available
  window.addEventListener('resize', _.throttle(resizer, 200));
})();
