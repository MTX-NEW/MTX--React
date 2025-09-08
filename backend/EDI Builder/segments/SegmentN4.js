import { Segment } from "../core/Segment.js";

/** @type {SegmentN4} */
export class SegmentN4 extends Segment {
    constructor() {
        super('N4');
        this.fields = Array(3).fill('');
    }

    set N401_CityName(val) { this.fields[0] = val; }
    set N402_StateOrProvinceCode(val) { this.fields[1] = val; }
    set N403_PostalCode(val) { this.fields[2] = val; }
}