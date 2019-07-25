import * as d3 from 'd3';

export function addCommas(s) {
  const num_s = +s;
  return num_s.toLocaleString("en-US").replace(/\.0+$/, "");
}

export function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/_+/g, '-')           // Replace _ with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export function abbrevYear(text) {
  return `'${ text.slice(2) }`
}

export function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

export function wrapText(text, width, lineHeight=1.1) {
  text.each(function() {
    const text = d3.select(this),
          x = text.attr('x') || 0,
          y = text.attr('y') || 0;

    let lineNumber = 0,
        line = [],
        dy = parseFloat(text.attr('dy')) || 0,
      word,
      words;

    if (text.selectAll('tspan').size() > 0) {
      const tspanText = [];
      text.selectAll('tspan').each(function() { tspanText.push(d3.select(this).text()) });
      words = tspanText.join(' ').split(/\s+/).reverse();
    } else {
      words = text.text().split(/\s+/).reverse();
    }

    let tspan = text.text(null).append('tspan')
      .attr('x', x)
      .attr('y', y)
      .attr('dy', dy + 'em');

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));

      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text.append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}
