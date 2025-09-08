import { Segment } from '../core/Segment.js';


/** @type {SegmentHI} */

export class SegmentHI extends Segment {
  constructor() {
    super('HI');
    this.fields = Array(12).fill('');
  }

  set HI01_HealthCareCodeInformation(val) { this.fields[0] = val; }
  set HI02_HealthCareCodeInformation(val) { this.fields[1] = val; }
  set HI03_HealthCareCodeInformation(val) { this.fields[2] = val; }
  set HI04_HealthCareCodeInformation(val) { this.fields[3] = val; }
  set HI05_HealthCareCodeInformation(val) { this.fields[4] = val; }
  set HI06_HealthCareCodeInformation(val) { this.fields[5] = val; }
  set HI07_HealthCareCodeInformation(val) { this.fields[6] = val; }
  set HI08_HealthCareCodeInformation(val) { this.fields[7] = val; }
  set HI09_HealthCareCodeInformation(val) { this.fields[8] = val; }
  set HI10_HealthCareCodeInformation(val) { this.fields[9] = val; }
  set HI11_HealthCareCodeInformation(val) { this.fields[10] = val; }
  set HI12_HealthCareCodeInformation(val) { this.fields[11] = val; }
}

