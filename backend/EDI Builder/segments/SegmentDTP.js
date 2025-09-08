import { Segment } from "../core/Segment.js";

/** @type {SegmentDTP} */


export class SegmentDTP extends Segment {
    constructor() {
        super('DTP');
        this.fields = Array(3).fill('');
    }
    set DTP01_DateTimeQualifier(val) { this.fields[0] = val; }
    set DTP02_DateTimePeriodFormatQualifier(val) { this.fields[1] = val; }
    set DTP03_DateTimePeriod(val) { this.fields[2] = val; }
}