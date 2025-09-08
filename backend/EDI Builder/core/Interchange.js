import { SegmentISA } from '../segments/SegmentISA.js';
import { FunctionGroup } from './FunctionGroup.js';

export class Interchange {
  constructor(date = new Date(), controlNumber = 1) {
    this.date = date;
    this.controlNumber = controlNumber;
    this.isa = new SegmentISA(controlNumber, date);
    this.groups = [];
  }

  addFunctionGroup(functionalIdCode, groupControlNumber, version) {
    const group = new FunctionGroup(functionalIdCode, groupControlNumber, version);
    this.groups.push(group);
    return group;
  }

  createIEASegment() {
    const iea = {
      tag: 'IEA',
      fields: ['1', this.controlNumber.toString().padStart(9, '0')]
    };
    return iea;
  }
  
  toString() {
    const groupStrings = this.groups.map(g => g.toString()).join('\n');
    return `${this.isa.toString()}\n${groupStrings}\nIEA*1*${this.controlNumber.toString().padStart(9, '0')}~`;
  }
}