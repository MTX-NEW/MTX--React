import { Segment } from "../core/Segment.js";

export class SegmentPAT extends Segment {
  constructor() {
    super("PAT");
    this.fields = Array(9).fill("");
  }
  
    set PAT01_RelationshipCode(val) { this.fields[0] = val; }
    set PAT02_PatientStatus(val) { this.fields[1] = val; }
    set PAT03_PatientLocation(val) { this.fields[2] = val; }
    set PAt04_StudentStatusCode(val) {this.fields[3] =val;}
    set PAT05_DateTimeQualifier(val) {this.fields[4] =val;}
    set PAT06_DateTimePeriod(val) {this.fields[5] =val;}
    set PAT07_MeasurementCode(val) {this.fields[6] =val;}
    set PAT08_Weight(val) {this.fields[7] =val;}
    set PAT09_ResponseCode (val) {this.fields[8] =val;}

}