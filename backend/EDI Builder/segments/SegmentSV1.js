import { Segment } from "../core/Segment.js";

export class SegmentSV1 extends Segment {
  constructor() {
    super("SV1");
    this.fields = Array(7).fill("");
  }

  set SV101_CompositeMedicalProcedure(val) {this.fields[0] = val; }
  set SV102_MonetaryAmount(val) {this.fields[1] = val;}
  set SV103_UnitBasisMeasCode(val) {this.fields[2] = val; }
  set SV104_Quantity(val) {this.fields[3] = val; }
  set SV105_FacilityCode(val) {this.fields[4] = val; }

  set SV107_CompDiagCodePointer(val) {this.fields[6] = val; }

  }