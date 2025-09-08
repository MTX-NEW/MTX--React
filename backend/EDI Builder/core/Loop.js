import { Segment } from './Segment.js';

export class Loop {
  constructor(name = '') {
    this.name = name;
    this.segments = [];
    this.subLoops = [];
  }

  addSegment(segment) {
    this.segments.push(segment);
    return segment;
  }

  addLoop(loop) {
    this.subLoops.push(loop);
    return loop;
  }

  AddHLoop(hlId, hlCode, hasChild = false, parentId = '') {
    const hlSegment = new Segment('HL');
    hlSegment.set(0, hlId);
    if (parentId) hlSegment.set(1, parentId);
    hlSegment.set(2, hlCode);
    hlSegment.set(3, hasChild ? '1' : '0');

    const loop = new Loop(`HL-${hlId}`);
    loop.addSegment(hlSegment);

    this.addLoop(loop);
    return loop;
  }


  toString() {
    return [
      ...this.segments.map(seg => seg.toString()),
      ...this.subLoops.map(loop => loop.toString())
    ].join('\n');
  }
}
