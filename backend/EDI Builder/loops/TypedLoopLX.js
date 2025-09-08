import { Loop } from '../core/Loop.js';
import { Segment } from '../core/Segment.js';

export class TypedLoopLX extends Loop {
  constructor() {
    super(`LX`);
    this.LX = new Segment('LX');
    this.addSegment(this.LX);
  }

  set LX01_AssignedNumber(value) {
    this.LX.fields[0] = value;
  }
}
