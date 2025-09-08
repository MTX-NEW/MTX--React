export class TypedElementServiceLocationInfo {
  constructor(segment, elementNumber, subElementSeparator = ':') {
    this.segment = segment;
    this.elementNumber = elementNumber; // 1-based position
    this.subElementSeparator = subElementSeparator;

    this.facilityCodeValue = '';
    this.facilityCodeQualifier = '';
  }

  set _1_FacilityCodeValue(val) {
    this.facilityCodeValue = val;
    this.updateElement();
  }

  get _1_FacilityCodeValue() {
    return this.facilityCodeValue;
  }

  set _2_FacilityCodeQualifier(val) {
    this.facilityCodeQualifier = val;
    this.updateElement();
  }

  get _2_FacilityCodeQualifier() {
    return this.facilityCodeQualifier;
  }

  set _3_ClaimFrequencyTypeCode(val) {
    this.claimFrequencyTypeCode = val;
    this.updateElement();
  }

  get _3_ClaimFrequencyTypeCode() {
    return this.claimFrequencyTypeCode;
  }

  updateElement() {
    const composite = [
      this.facilityCodeValue,
      this.facilityCodeQualifier,
      this.claimFrequencyTypeCode
    ].join(this.subElementSeparator).replace(
      new RegExp(`${this.subElementSeparator}+$`), ''
    );

    // Adjust for 0-based indexing in your Segment
    this.segment.set(this.elementNumber, composite);
  }
}
