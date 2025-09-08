import { Loop } from '../core/Loop.js';
import { Segment } from '../core/Segment.js';
import { TypedElementRelatedCausesInfo } from '../core/TypedElementRelatedCausesInfo.js';
import { TypedElementServiceLocationInfo } from '../core/TypedElementServiceLocationInfo.js';

export class TypedLoopCLM extends Loop {
  constructor() {
    super('CLM');

    this.clmSegment = new Segment('CLM');
    this.addSegment(this.clmSegment);

    this._clm05 = new TypedElementServiceLocationInfo(this.clmSegment, 4); // CLM05 index = 4 (0-based)
    this._clm11 = new TypedElementRelatedCausesInfo(this.clmSegment, 10); // CLM11 index = 10 (0-based)
  }

  set CLM01_PatientControlNumber(val) { this.clmSegment.set(0, val); }
  set CLM02_TotalClaimChargeAmount(val) { this.clmSegment.set(1, val); }
  set CLM03_ClaimFilingIndicatorCode(val) { this.clmSegment.set(2, val); }
  set CLM04_NonInstitutionalClaimTypeCode(val) { this.clmSegment.set(3, val); }

  get CLM05() { return this._clm05; }

  set CLM06_ProviderOrSupplierSignatureIndicator(val) { this.clmSegment.set(5, val); }
  set CLM07_ProviderAcceptAssignmentCode(val) { this.clmSegment.set(6, val); }
  set CLM08_BenefitsAssignmentCertificationIndicator(val) { this.clmSegment.set(7, val); }
  set CLM09_ReleaseOfInformationCode(val) { this.clmSegment.set(8, val); }
  set CLM10_PatientSignatureSourceCode(val) { this.clmSegment.set(9, val); }

  get CLM11() { return this._clm11; }

  set CLM12_SpecialProgramCode(val) { this.clmSegment.set(11, val); }
  set CLM20_DelayReasonCode(val) { this.clmSegment.set(19, val); }
}
