import { SegmentST } from '../segments/SegmentST.js';
import { SegmentBHT } from '../segments/SegmentBHT.js';
import { Loop } from './Loop.js';
import { Segment } from './Segment.js';
export class Transaction {
  constructor(controlNumber = 1) {
    this.st = new SegmentST(controlNumber);
    this.bht = new SegmentBHT();
    this.loops = [];
  }

  addSegment(segment) {
    this.loops.push(segment); // for compatibility
    return segment;
  }

  addLoop(loop) {
    this.loops.push(loop);
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

  createSESegment() {
    const segmentCount = 2 + this.getSegmentCount() + 1; // ST + BHT + content + SE
    const se = {
      tag: 'SE',
      fields: [segmentCount.toString(), this.st.fields[1].padStart(4, '0')]
    };
    return se;
  }


  toString() {
    const content = this.loops.map(x => x.toString()).join('\n');
  
    const segmentCount = 2 + this.getSegmentCount() + 1; // ST + BHT + content + SE
    return `${this.st.toString()}\n${this.bht.toString()}\n${content}\nSE*${segmentCount}*${this.st.fields[1].padStart(4, '0')}~`;
  }

  getSegmentCount() {
    return this.loops.reduce((count, loop) => {
      return count + this.countLoopSegments(loop);
    }, 0);
  }

  countLoopSegments(loop) {
    let count = 0;
    // Count segments in this loop
    if (loop.segments) {
      count += loop.segments.length;
    }
    // Count segments in sub-loops recursively
    if (loop.subLoops) {
      count += loop.subLoops.reduce((subCount, subLoop) => {
        return subCount + this.countLoopSegments(subLoop);
      }, 0);
    }
    return count;
  }
}
