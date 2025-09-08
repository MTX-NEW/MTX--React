import { Segment } from '../core/Segment.js';
import { formatDateYYYYMMDD, formatTimeHHMM } from '../core/utils.js';
import {ediClientSetting} from '../models/ediClientSetting.js'

export class SegmentGS extends Segment {
  constructor(controlNumber = 1, date = new Date()) {
    super('GS');
    this.controlNumber = controlNumber; // Store control number for trailer reference
    this.fields = [
      'HC',
      ediClientSetting.GS02,
      ediClientSetting.GS03,
      formatDateYYYYMMDD(date),
      formatTimeHHMM(date),
      controlNumber.toString(),
      'X',
      ediClientSetting.GS08
    ];
  }

  // Add getter and setter properties to allow dynamic updates
  get GS02_ApplicationSendersCode() { return this.fields[1]; }
  set GS02_ApplicationSendersCode(value) { this.fields[1] = value || ediClientSetting.GS02; }

  get GS03_ApplicationReceiversCode() { return this.fields[2]; }
  set GS03_ApplicationReceiversCode(value) { this.fields[2] = value || ediClientSetting.GS03; }

  get GS06_GroupControlNumber() { return this.fields[5]; }
  set GS06_GroupControlNumber(value) { this.fields[5] = value || this.controlNumber.toString(); }

  get GS07_ResponsibleAgencyCode() { return this.fields[6]; }
  set GS07_ResponsibleAgencyCode(value) { this.fields[6] = value || 'X'; }

  get GS08_VersionReleaseIndustryIdCode() { return this.fields[7]; }
  set GS08_VersionReleaseIndustryIdCode(value) { this.fields[7] = value || ediClientSetting.GS08; }
}
