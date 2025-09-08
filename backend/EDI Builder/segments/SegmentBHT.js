import { Segment } from '../core/Segment.js';
import { formatDateYYYYMMDD, formatTimeHHMM } from '../core/utils.js';

export class SegmentBHT extends Segment {
  constructor() {
    super('BHT');
    this.fields = Array(6).fill('');
  }

  set BHT01_HierarchicalStructureCode(value) {
    this.fields[0] = value;
  }

  set BHT02_TransactionSetPurposeCode(value) {
    this.fields[1] = value;
  }

  set BHT03_ReferenceIdentification(value) {
    this.fields[2] = value;
  }

  set BHT04_Date(value) {
    this.fields[3] = formatDateYYYYMMDD(value);
  }

  set BHT05_Time(value) {
    this.fields[4] = formatTimeHHMM(value);
  }

  set BHT06_TransactionTypeCode(value) {
    this.fields[5] = value;
  }
}


