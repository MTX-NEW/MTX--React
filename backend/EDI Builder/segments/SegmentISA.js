import { Segment } from '../core/Segment.js';
import { ediClientSetting } from '../models/ediClientSetting.js';
import { formatDateYYMMDD, formatTimeHHMM } from '../core/utils.js';


export class SegmentISA extends Segment {
  constructor(controlNumber = 1, date = new Date()) {
    super('ISA');
    this.fields = [
      '00', 
      ''.padEnd(10),
      '00',
      ''.padEnd(10),
      'ZZ', 
      ediClientSetting.ISA06.padEnd(15),
      'ZZ', 
      ediClientSetting.ISA08.padEnd(15),
      formatDateYYMMDD(date),
      formatTimeHHMM(date),
      '^', 
      '00501',
      controlNumber.toString().padStart(9, '0'),
      '1', 
      'P', 
      ':'
    ];
  }

  get ISA01_AuthorizationInformationQualifier() { return this.fields[0]; }
  set ISA01_AuthorizationInformationQualifier(value) { this.fields[0] = value || '00'; }

  get ISA02_AuthorizationInformation() { return this.fields[1]; }
  set ISA02_AuthorizationInformation(value) { this.fields[1] = (value || '').padEnd(10); }

  get ISA03_SecurityInformationQualifier() { return this.fields[2]; }
  set ISA03_SecurityInformationQualifier(value) { this.fields[2] = value || '00'; }

  get ISA04_SecurityInformation() { return this.fields[3]; }
  set ISA04_SecurityInformation(value) { this.fields[3] = (value || '').padEnd(10); }

  get ISA05_InterchangeIdQualifier() { return this.fields[4]; }
  set ISA05_InterchangeIdQualifier(value) { this.fields[4] = value || 'ZZ'; }

  get ISA06_InterchangeSenderId() { return this.fields[5]; }
  set ISA06_InterchangeSenderId(value) { this.fields[5] = (value || '').padEnd(15); }

  get ISA07_InterchangeIdQualifier() { return this.fields[6]; }
  set ISA07_InterchangeIdQualifier(value) { this.fields[6] = value || 'ZZ'; }

  get ISA08_InterchangeReceiverId() { return this.fields[7]; }
  set ISA08_InterchangeReceiverId(value) { this.fields[7] = (value || '').padEnd(15); }

  get ISA11_RepetitionSeparator() { return this.fields[10]; }
  set ISA11_RepetitionSeparator(value) { this.fields[10] = value || '^'; }

  get ISA12_InterchangeControlVersionNumber() { return this.fields[11]; }
  set ISA12_InterchangeControlVersionNumber(value) { this.fields[11] = value || '00501'; }

  get ISA14_AcknowledgmentRequested() { return this.fields[13]; }
  set ISA14_AcknowledgmentRequested(value) { this.fields[13] = value || '0'; }

  get ISA15_UsageIndicator() { return this.fields[14]; }
  set ISA15_UsageIndicator(value) { this.fields[14] = value || 'P'; }

  get ISA16_ComponentElementSeparator() { return this.fields[15]; }
  set ISA16_ComponentElementSeparator(value) { this.fields[15] = value || ':'; }
}

