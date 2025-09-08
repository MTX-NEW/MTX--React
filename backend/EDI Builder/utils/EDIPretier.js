export class EdiPrettier {
  static format(node, indentLevel = 0) {
    const indent = '  '.repeat(indentLevel);
    let lines = [];

    if (!node) return '';

    // Case: Interchange (top level)
    if (node.groups) {
      lines.push(this.formatSegment(node.isa, indentLevel));
      for (const group of node.groups) {
        lines.push(this.format(group, indentLevel + 1));
      }
      lines.push(this.formatSegment(node.createIEASegment(), indentLevel));
      return lines.join('\n');
    }

    // Case: Function Group
    if (node.transactions) {
      lines.push(this.formatSegment(node.gs, indentLevel));
      for (const txn of node.transactions) {
        lines.push(this.format(txn, indentLevel + 1));
      }
      lines.push(this.formatSegment(node.createGESegment(), indentLevel));
      return lines.join('\n');
    }

    // Case: Transaction
    if (node.st && node.bht) {
      lines.push(this.formatSegment(node.st, indentLevel));
      lines.push(this.formatSegment(node.bht, indentLevel));
      
      for (const loop of node.loops || []) {
        lines.push(this.format(loop, indentLevel + 1));
      }
      
      lines.push(this.formatSegment(node.createSESegment(), indentLevel));
      return lines.join('\n');
    }

    // Case: Loop
    if (node.segments || node.subLoops) {
      // Check if this is a TypedLoopNM1 or similar loop with a primary segment
      let hasFirstSegmentAsLoopIdentifier = false;
      
      if (node.segments && node.segments.length > 0) {
        const firstSeg = node.segments[0];
        // Check if first segment is NM1, HL, or other loop identifier segments
        if (firstSeg.tag === 'NM1' || firstSeg.tag === 'HL' || firstSeg.tag === 'ST' || firstSeg.tag === 'BHT') {
          hasFirstSegmentAsLoopIdentifier = true;
        }
      }
      
      // Format segments in this loop
      for (let i = 0; i < (node.segments || []).length; i++) {
        const seg = node.segments[i];
        if (hasFirstSegmentAsLoopIdentifier && i === 0) {
          // First segment (loop identifier) at current indent level
          lines.push(this.formatSegment(seg, indentLevel));
        } else {
          // Other segments indented one level deeper
          lines.push(this.formatSegment(seg, indentLevel + 1));
        }
      }
      
      // Format sub-loops with increased indentation
      for (const subLoop of node.subLoops || []) {
        lines.push(this.format(subLoop, indentLevel + 1));
      }
      
      return lines.join('\n');
    }

    // Case: Single Segment
    if (node.tag) {
      return this.formatSegment(node, indentLevel);
    }

    return '';
  }

  static formatSegment(segment, indentLevel = 0) {
    if (!segment || !segment.tag) return '';
    
    const indent = '  '.repeat(indentLevel);
    
    // Handle trimming trailing nulls in fields
    const trimmed = [...(segment.fields || [])];
    while (trimmed.length && (trimmed.at(-1) == null || trimmed.at(-1) === '')) {
      trimmed.pop();
    }
    const filled = trimmed.map(f => f ?? '');
    
    return `${indent}${segment.tag}*${filled.join('*')}~`;
  }
}
