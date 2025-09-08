import { Segment } from '../core/Segment.js';

/**
 * NM1 - Individual or Organizational Name
 * Used for entity names in various loops
 */
export class SegmentNM1 extends Segment {
  constructor(entityIdCode = '', entityTypeQualifier = '', lastName = '', firstName = '', middleName = '', namePrefix = '', nameSuffix = '', idCodeQualifier = '', idCode = '', entityRelationshipCode = '', entityIdentifierCode = '') {
    super('NM1');
    this.fields = Array(12).fill('');
    
    // Set initial values if provided
    if (entityIdCode) this.fields[0] = entityIdCode;
    if (entityTypeQualifier) this.fields[1] = entityTypeQualifier;
    if (lastName) this.fields[2] = lastName;
    if (firstName) this.fields[3] = firstName;
    if (middleName) this.fields[4] = middleName;
    if (namePrefix) this.fields[5] = namePrefix;
    if (nameSuffix) this.fields[6] = nameSuffix;
    if (idCodeQualifier) this.fields[7] = idCodeQualifier;
    if (idCode) this.fields[8] = idCode;
    if (entityRelationshipCode) this.fields[9] = entityRelationshipCode;
    if (entityIdentifierCode) this.fields[10] = entityIdentifierCode;
  }

  // Getters and setters for each field
  set NM101_EntityIdCode(val) { this.fields[0] = val; }
  get NM101_EntityIdCode() { return this.fields[0]; }
  
  set NM102_EntityTypeQualifier(val) { this.fields[1] = val; }
  get NM102_EntityTypeQualifier() { return this.fields[1]; }
  
  set NM103_NameLastOrOrganizationName(val) { this.fields[2] = val; }
  get NM103_NameLastOrOrganizationName() { return this.fields[2]; }
  
  set NM104_NameFirst(val) { this.fields[3] = val; }
  get NM104_NameFirst() { return this.fields[3]; }
  
  set NM105_NameMiddle(val) { this.fields[4] = val; }
  get NM105_NameMiddle() { return this.fields[4]; }
  
  set NM106_NamePrefix(val) { this.fields[5] = val; }
  get NM106_NamePrefix() { return this.fields[5]; }
  
  set NM107_NameSuffix(val) { this.fields[6] = val; }
  get NM107_NameSuffix() { return this.fields[6]; }
  
  set NM108_IdCodeQualifier(val) { this.fields[7] = val; }
  get NM108_IdCodeQualifier() { return this.fields[7]; }
  
  set NM109_IdCode(val) { this.fields[8] = val; }
  get NM109_IdCode() { return this.fields[8]; }
  
  set NM110_EntityRelationshipCode(val) { this.fields[9] = val; }
  get NM110_EntityRelationshipCode() { return this.fields[9]; }
  
  set NM111_EntityIdentifierCode(val) { this.fields[10] = val; }
  get NM111_EntityIdentifierCode() { return this.fields[10]; }
}
