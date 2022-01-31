export function addCommas(s) {
  const num_s = +s;
  return num_s.toLocaleString('en-US').replace(/\.0+$/, '');
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/_+/g, '-') // Replace _ with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export function abbrevYear(text) {
  return `'${text.slice(2)}`;
}

export function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

export function abbrevMonth(text) {
  return text == 'January'
    ? 'Jan.'
    : text == 'February'
    ? 'Feb.'
    : text == 'March'
    ? 'Mar.'
    : text == 'April'
    ? 'Apr.'
    : text == 'August'
    ? 'Aug.'
    : text == 'September'
    ? 'Sept.'
    : text == 'October'
    ? 'Oct.'
    : text == 'November'
    ? 'Nov.'
    : text == 'December'
    ? 'Dec.'
    : text;
}
