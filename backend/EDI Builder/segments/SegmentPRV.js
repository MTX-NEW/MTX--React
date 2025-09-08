import { Segment } from '../core/Segment.js';

export class SegmentPRV extends Segment {
  constructor() {
    super('PRV');
    this.fields = Array(6).fill('');
  }

  set PRV01_ProviderCode(val) { this.fields[0] = val; }            
  set PRV02_ReferenceIdQualifier(val) { this.fields[1] = val; }    
  set PRV03_ProviderTaxonomyCode(val) { this.fields[2] = val; }    
  set PRV04_StateOrProvinceCode(val) { this.fields[3] = val; }
  set PRV05_ProviderSpecialtyInformation(val) { this.fields[4] = val; }
  set PRV06_ProviderOrganizationCode(val) { this.fields[5] = val; }

}
