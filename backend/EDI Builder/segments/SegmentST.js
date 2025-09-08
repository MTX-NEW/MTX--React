import { Segment } from '../core/Segment.js';

export class SegmentST extends Segment {
  constructor(controlNumber = 1) {
    super('ST');
    this.fields = [
      '837',
      controlNumber.toString().padStart(4, '0'),
      '005010X222A1'
    ];
  }
}
