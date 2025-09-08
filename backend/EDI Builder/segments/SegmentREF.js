import { Segment } from "../core/Segment.js";

/** @type {SegmentREF} */
export class SegmentREF extends Segment {
    constructor() {
        super('REF');
        this.fields = Array(4).fill('');
    }

    set REF01_ReferenceIdQualifier(val) { this.fields[0] = val; }
    set REF02_ReferenceId(val) { this.fields[1] = val; }
    set REF03_Description(val) { this.fields[2] = val; }
    set REF04_ReferenceId(val) { this.fields[3] = val; }
}
