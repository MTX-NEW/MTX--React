import { Segment } from "../core/Segment.js";

/** @type {SegmentN3} */


export class SegmentN3 extends Segment {
    constructor() {
        super('N3');
        this.fields = Array(2).fill('');
    }
    set N301_AddressLine1(val) { this.fields[0] = val; }
    set N302_AddressLine2(val) { this.fields[1] = val; }
}