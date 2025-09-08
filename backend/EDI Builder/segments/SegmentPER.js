import { Segment } from '../core/Segment.js';


/** @type {SegmentPER} */

export class SegmentPER extends Segment {
  constructor() {
    super('PER');
    this.fields = Array(6).fill('');
  }

  set PER01_ContactFunctionCode(val) { this.fields[0] = val; }
  set PER02_Name(val) { this.fields[1] = val; }
  set PER03_CommunicationNumberQualifier1(val) { this.fields[2] = val; }
  set PER04_CommunicationNumber1(val) { this.fields[3] = val; }
  set PER05_CommunicationNumberQualifier2(val) { this.fields[4] = val; }
  set PER06_CommunicationNumber2(val) { this.fields[5] = val; }
  
}

