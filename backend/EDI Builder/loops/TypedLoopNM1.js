import { Loop } from '../core/Loop.js';
import { Segment } from '../core/Segment.js';

export class TypedLoopNM1 extends Loop {
  constructor(nm101) {
    super(`NM1-${nm101}`);
    this.nm1 = new Segment('NM1', nm101);
    this.addSegment(this.nm1);
  }

  set NM102_EntityTypeQualifier(val) { this.nm1.set(1, val); }
  set NM103_NameLastOrOrganizationName(val) { this.nm1.set(2, val); }
  set NM104_NameFirst(val) { this.nm1.set(3, val); }
  set NM105_NameMiddle(val) { this.nm1.set(4, val); }
  set NM106_NamePrefix(val) { this.nm1.set(5, val); }
  set NM107_NameSuffix(val) { this.nm1.set(6, val); }
  set NM108_IdCodeQualifier(val) { this.nm1.set(7, val); }
  set NM109_IdCode(val) { this.nm1.set(8, val); }
}
