export class TypedElementRelatedCausesInfo {
  constructor(segment, elementNumber, subElementSeparator = ':') {
    this.segment = segment;
    this.elementNumber = elementNumber;
    this.subElementSeparator = subElementSeparator;

    this.relatedCausesCode1 = '';
    this.relatedCausesCode2 = '';
    this.relatedCausesCode3 = '';
    this.stateOrProvinceCode = '';
    this.countryCode = '';
  }

  set _1_RelatedCausesCode(val) {
    this.relatedCausesCode1 = val;
    this.updateElement();
  }

  get _1_RelatedCausesCode() {
    return this.relatedCausesCode1;
  }

  set _2_RelatedCausesCode(val) {
    this.relatedCausesCode2 = val;
    this.updateElement();
  }

  get _2_RelatedCausesCode() {
    return this.relatedCausesCode2;
  }

  set _3_RelatedCausesCode(val) {
    this.relatedCausesCode3 = val;
    this.updateElement();
  }

  get _3_RelatedCausesCode() {
    return this.relatedCausesCode3;
  }

  set _4_StateOrProvinceCode(val) {
    this.stateOrProvinceCode = val;
    this.updateElement();
  }

  get _4_StateOrProvinceCode() {
    return this.stateOrProvinceCode;
  }

  set _5_CountryCode(val) {
    this.countryCode = val;
    this.updateElement();
  }

  get _5_CountryCode() {
    return this.countryCode;
  }

  updateElement() {
    const composite = [
      this.relatedCausesCode1,
      this.relatedCausesCode2,
      this.relatedCausesCode3,
      this.stateOrProvinceCode,
      this.countryCode
    ].join(this.subElementSeparator).replace(
      new RegExp(`${this.subElementSeparator}+$`), ''
    );

    // Adjust for 0-based indexing in your Segment
    this.segment.set(this.elementNumber , composite);
  }
}
