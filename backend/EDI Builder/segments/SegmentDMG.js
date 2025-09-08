import { Segment } from "../core/Segment.js";

export class SegmentDMG extends Segment {
    constructor(){
        super("DMG");
        this.fields = Array(3).fill("");
    }

    set DMG01_DateTimePeriodFormatQualifier(val) { this.fields[0]=val; } 
    set DMG02_DateOfBirth(val) { this.fields[1]=val; }
    set DMG03_Gender(val) { this.fields[2] = val; }
}