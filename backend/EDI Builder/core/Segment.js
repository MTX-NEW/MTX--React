export class Segment {
  constructor(tag, firstField = '') {
    this.tag = tag;
    this.fields = [];
    if (firstField) this.fields[0] = firstField;
  }

  set(index, value) {
    this.fields[index] = value;
  }

  toString(delim = '*') {
    const trimmed = [...this.fields];

    // Trim only trailing nulls/empty strings
    while (trimmed.length && (trimmed[trimmed.length - 1] === null || trimmed[trimmed.length - 1] === '')) {
      trimmed.pop();
    }

    // Replace nulls in the middle with empty strings
    const filled = trimmed.map(f => f ?? '');

    return `${this.tag}${delim}${filled.join(delim)}~`;
  }
}