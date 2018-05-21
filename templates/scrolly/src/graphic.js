$(document).ready(function() {
  var containerWidth,
    numSteps,
    scrollTop,
    windowWidth,
    windowHeight,
    mainTop,
    mainHeight,
    graphicHeight,
    headerHeight,
    svgWidth,
    svgHeight,
    scrollDiffTop,
    scrollDiffBottom,
    xScale,
    yScale,
    scalingFactor,
    previousStep;
  var mode = "";
  var graphicEl = d3.select(".graphic-container-inner");
  var containerEl = d3.select(".graphic-container");
  var mainTextEl = d3.select(".maintext");
  var step = -1;
  var texts = d3.selectAll(".prefix-scrolly-text")._groups[0];
  var numSteps = texts.length;
  var transitionDuration = 350;
  var BREAKPOINT = 900;
  var MAX_WIDTH = 700;

  // Edge has multiple weird SVG glitches that I was not able to resolve, so
  // if you encounter these too, you might be interested in this.
  var isEdge = navigator.userAgent.indexOf('Edge') > -1;
  if (isEdge) {
    d3.select('body').classed('edge-browser', true);
    // Bail on the rest of the JS
    return;
  }

  // Polyfill for NodeList.forEach
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }


  // Reposition the graphic when everything has loaded.
  window.addEventListener('load', resize);
  window.addEventListener('resize', _.debounce(resize, 100));
  window.addEventListener('scroll', onScroll);


  initialize();
  setParams();
  onScroll();
  animate();


  function animate() {
    var currentStep = getCurrStep();

    if (currentStep > -1 && currentStep < numSteps - 1) {
      if (mode != "fixed") {
        setFixed();
        mode = "fixed";
      }
    } else {
      if (mode != "absolute") {
        if (scrollDiffTop > 0) {
          setAbsolute("above");
        } else {
          setAbsolute("below");
        }
        mode = "absolute";
      }
    }

    evaluateStep(currentStep);
    requestAnimationFrame(animate);
  }


  function evaluateStep(currstep) {
    if (currstep === previousStep) {
      return;
    }

    console.log("step: ", currstep);
    setParams();

    // If we're just initializing then run the transitions instantaneously.
    var duration;
    if (previousStep === undefined) {
      // Give it some small duration, because I encountered a weird bug where linear gradient
      // stop colors would fail to re-render if they changed instantaneously. If they are
      // transitioned, the bug seems to disappear. Chrome 66.
      duration = 100;
    }

    updateAll(currstep, duration);
    previousStep = currstep;

    d3.select('#switchpoint-debug')
      .style('top', getSwitchPointForIndex(currstep) + 'px')
    d3.select('#switchpoint-debug-2')
      .style('top', getSwitchPointForIndex(currstep + 1) + 'px')
  }


  function getCurrStep() {
    if (scrollDiffTop <= 0 && scrollDiffBottom + windowHeight >= 0) {
      var currentStep = -1;
      var currentEl;
      var nextEl;

      texts.forEach(function(el, i) {
        var distToStep = getMeasuringPoint(el) - scrollTop - getSwitchPointForIndex(i);

        if (distToStep < 0) {
          currentStep = i;
          currentEl = el;
        } else if (!nextEl) {
          nextEl = el;
        }
      });

      // TODO delete this debug nonsense when you're deploying
      if (currentEl) {
        d3.select('#measure-debug')
          .style('top', getMeasuringPoint(currentEl)  + 'px');
      }
      if (nextEl) {
        d3.select('#measure-debug-2')
          .style('top', getMeasuringPoint(nextEl)  + 'px');
      }

      return currentStep;
    } else {
      if (scrollDiffBottom < 0) {
        return numSteps - 1;
      } else {
        return -1;
      }
    }
  }


  // This is the point on the text element that should be used to trigger a
  // switch to the next step.
  function getMeasuringPoint(el) {
    return el.offsetTop + el.children[0].offsetTop;
  }


  // This is the point on the screen that should be compared to the measure
  // point of each text element to trigger the switch to the next step. This is
  // pretty manual, certainly less than ideal.
  function getSwitchPointForIndex(i) {
    if (windowWidth > 767) {
      return windowHeight * 4 / 5 - headerHeight;
    } else {
      return windowHeight / 2 - 100;
    }
  }


  function setFixed() {
    console.log("setting fixed")
    graphicEl
      .style("position", "fixed")
      .style("top", 0);
  }


  function setAbsolute(pos) {
    console.log("setting absolute", pos)
    if (pos == "below") {
      var lastText = d3.select('.prefix-scrolly-text:last-child').node();
      var measurePoint = getMeasuringPoint(lastText);
      var switchPoint = getSwitchPointForIndex(4);
      var position = measurePoint - switchPoint;

      graphicEl.style("position", "absolute")
        .style("top", position + "px");
    } else {
      console.log('setting absolute top ', mainTop)
      graphicEl.style("position", "absolute")
        .style("top", mainTop + "px");
    }
  }


  function initialize() {
    xScale = d3.scaleLinear()
      .domain([0, 100]);

    yScale = d3.scaleLinear()
      .domain([0, 100]);

    sizeScale = d3.scaleLinear()
      .range([0, 1.0]);
  }


  function setParams() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight
    containerWidth = containerEl.node().offsetWidth;

    mainTop = mainTextEl.node().offsetTop;
    mainHeight = mainTextEl.node().offsetHeight;
    graphicHeight = graphicEl.node().offsetHeight;
    headerHeight = d3.select("header").node().offsetHeight;

    var svgLeftMargin;
    var svg = graphicEl.select("svg").node();

    // Firefox can't return the dimensions of an svg through client* ffs
    // https://bugzilla.mozilla.org/show_bug.cgi?id=874811
    var svgRect = svg.getBoundingClientRect();
    svgHeight = svgRect.height;

    if (windowWidth > BREAKPOINT) {
      svgWidth = containerWidth * 0.6;
      svgLeftMargin = containerWidth * 0.4;
    } else if (windowWidth > 767) {
      svgLeftMargin = 0;
      svgWidth = containerWidth;
    } else {
      svgWidth = containerWidth;
      svgLeftMargin = 0;
    }

    explanationTileWidth = svgWidth / 5;

    graphicEl.select('svg')
      .style('margin-left', svgLeftMargin + 'px')
      .style('width', svgWidth + 'px');

    graphicEl
      .style('width', containerWidth + 'px')

    xScale.range([0, svgWidth]);
    yScale.range([0, svgHeight]);
    scalingFactor = svgWidth / MAX_WIDTH;
  }

  function onScroll() {
    scrollTop = $(window).scrollTop();
    scrollDiffTop = mainTop - scrollTop;
    scrollDiffBottom = mainTop + mainHeight - window.innerHeight - scrollTop;
  }


  function resize() {
    setParams();
    onScroll();
    // Force everything to update.
    previousStep = undefined;
    evaluateStep(getCurrStep());
    // Force a a repositioning check if the resize has moved us from fixed to absolute,
    // or vice versa.
    mode = "";
  }


  // This is where the magic happens and you define your sequential states.
  function getStateDefinitions() {
    return [
      {
        // First you specify a selector whose states you are defining. Be
        // careful about overlapping selectors, where multiple selectors refer
        // to the same object. If you must do this (it will likely come up),
        // don't animate the same property using different selectors.  For each
        // element-attribute pair, they should be animated in the same
        // sequence.  Failure to do this can lead to unexpected results. This
        // is a pretty annoying restriction at times, and might be an area for
        // future development of this template.
        selector: '.prefix-example-object',
        // This is your list of states. -1 denotes the initial state, and
        // persists until the graphic container switches into a fixed position.
        // You will almost always want to specify this initial state, even if
        // the element is invisible to start out with.
        states: {
          // You can specify any number of attributes/styles/class changes/text
          // changes within this list.
          "-1": [
            {
              // The attribute to animate. NOTE: It is much better from a
              // performance perspective to prefer attributes over styles,
              // whenever possible, when animating svgs.
              attribute: 'transform',
              // The value to animate to. Can be a constant or a function.
              // Functions receive the data (if any) and index, as usual with
              // d3 functions. Also as usual, 'this' will be bound to the
              // element in question.
              value: function(d) {
                var x = xScale(d.initialX);
                var y = d.initialY * scalingFactor + yScale(50);
                return 'translate(' + x + ' ' + y + ')';
              }
            },
          ],
          // Subsequent states are defined like so.
          1: [
            {
              attribute: 'transform',
              value: function(d, i) {
                return "translate(" + (i * explanationTileWidth + explanationTileWidth / 2) + " " + yScale(50) + ")";
              }
            }
          ]
        }
      },
      // There are several accepted forms for these selector/state objects.
      // This is the short form where a single attribute changes values in
      // different states.
      {
        selector: '.dt-scene-object',
        states: {
          '-1': { attribute: 'opacity', value: 0 },
          0: { attribute: 'opacity', value: 1 },
        },
      },
      {
        selector: '.dt-bar-bg',
        // You can also specify changes in this longest form which allows you
        // to declare specific delays, durations, or delayCounts (which is a
        // multiple of the base duration value, useful for sequencing
        // animations).
        states: {
          3: {
            delayCount: 1,
            changes: [
              { attribute: 'width', value: svgWidth },
            ]
          },
        }
      },
    ];
  }


  function updateAll(step, durationOverride) {
    console.log("updateing to ", step)
    stateDefinitions = getStateDefinitions();
    stateDefinitions.forEach(function(stateData) {
      var keys = Object.keys(stateData.states).map(function (x) {
        return parseInt(x, 10);
      }).sort();
      var closestIndex = getClosestStep(keys, step);

      if (closestIndex === undefined) {
        return;
      }

      var currentState = stateData.states[closestIndex];
      var duration = cascade(durationOverride, currentState.duration, transitionDuration);

      // TODO this leads to some transitions getting delayed when the shouldn't be, if
      // there is a delay on the current state, but the actual action is happening because
      // of a reversion to an initial state. The way out of this may be to keep track of
      // delay / duration on a per attribute basis. A little hairy, but something you might
      // want in other cases too.
      var delay = cascade(currentState.delay, (currentState.delayCount || 0) * duration, 0);

      var changeList = getChangeList(stateData, closestIndex)

      var selection = d3.selectAll(stateData.selector);

      // Transitions are namespaced to the in-use selector, so that multiple
      // transitions can act on the same element at once. Note that you will
      // still run into trouble if those transitions are trying to animate the
      // same element.
      var transition = selection
        .transition(stateData.selector)
        .duration(duration)
        .delay(delay);

      changeList.forEach(function(change) {
        if (change.attribute == "text") {
          selection.text(change.value);
        } else if (change.attribute == "class") {
          selection.classed(change.value, true);
        } else if (change.attribute == "removeclass") {
          selection.classed(change.value, false);
        } else if (change.style) {
          selection.style(change.style, change.value);
        } else {
          transition.attr(change.attribute, change.value);
        }
      });
    });
  }


  // Accumulate a set of states into a unified changelist.
  function getChangeList(stateData, closestIndex) {
    var stateChanges = [];
    var accumulatedAttributes = {};
    var accumulatedStyles = {};
    for (var i = -1; i <= closestIndex; i++) {
      var state = stateData.states[i];
      if (!state) {
        continue;
      }

      var changes = Array.isArray(state.changes) ? state.changes : state;

      // Auto wrap objects in an array to allow for shorthand when only one
      // attribute is changing.
      changes = Array.isArray(changes) ? changes : [changes];

      changes.forEach(function(change) {
        if (change.attribute === 'class' || change.attribute === 'removeclass') {
          stateChanges.push(change);
        } else if (change.style) {
          accumulatedStyles[change.style] = change.value;
        } else {
          accumulatedAttributes[change.attribute] = change.value;
        }
      })
    }

    Object.keys(accumulatedAttributes).forEach(function(key) {
      stateChanges.push({
        attribute: key,
        value: accumulatedAttributes[key]
      });
    });

    Object.keys(accumulatedStyles).forEach(function(key) {
      stateChanges.push({
        style: key,
        value: accumulatedStyles[key]
      });
    });

    return stateChanges;
  }


  function getClosestStep(array, step) {
    if (array.indexOf(step) != -1) {
      return step;
    }

    var nextIndex = _.findIndex(array, function(element) {
      return element > step;
    });

    if (nextIndex == -1) {
      return array[array.length - 1];
    }

    return array[nextIndex - 1];
  }


  // Return first defined value in args.
  function cascade() {
    return _.find(arguments, function(x) {
      return x !== undefined;
    });
  }
});
