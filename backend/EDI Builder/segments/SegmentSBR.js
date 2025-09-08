import { Segment } from "../core/Segment.js";

export class SegmentSBR extends Segment {
  constructor() {
    super("SBR");
    this.fields = Array(9).fill("");
  }

  set SBR01_PayerResponsibilitySequenceNumberCode(val) {this.fields[0] = val; }
  set SBR02_IndividualRelationshipCode(val) {this.fields[1] = val;}
  set SBR03_PolicyOrGroupNumber(val) {this.fields[2] = val; }
  set SBR04_GroupName(val) {this.fields[3] = val; }
  set SBR05_InsuranceTypeCode(val) {this.fields[4] = val; }
  set SBR06_CoordinationOfBenefitsCode(val) {this.fields[5] = val; }
  set SBR07_YesNoCode(val) {this.fields[6] = val; }
  set SBR08_EmploymentStatusCode(val) {this.fields[7] = val; }
  set SBR09_ClaimFilingIndicatorCode(val) {this.fields[8] = val; }
  }