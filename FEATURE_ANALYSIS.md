# MTX Feature Analysis Report

**Analysis Date:** February 16, 2026  
**Based on:** New Requirement Document for MTX.docx

This document compares the requirements document against the current implementation, organized by functional modules.

---

## Table of Contents

1. [User & Authentication](#1-user--authentication)
2. [Member/Patient](#2-memberpatient)
3. [Trip/Booking](#3-tripbooking)
4. [Scheduling & Route Planning](#4-scheduling--route-planning)
5. [Driver](#5-driver)
6. [Vehicle](#6-vehicle)
7. [Clinic Portal](#7-clinic-portal)
8. [Communication & Notifications](#8-communication--notifications)
9. [Billing & Claims](#9-billing--claims)
10. [HR & Compliance](#10-hr--compliance)
11. [Reporting & Dashboards](#11-reporting--dashboards)
12. [Audit & Logging](#12-audit--logging)
13. [Security & Compliance](#13-security--compliance)

---

## 1. User & Authentication

### Not Implemented
| Feature | Description |
|---------|-------------|
| MFA (Multi-Factor Authentication) | No MFA for admin/sensitive roles as required by security standards. |
| SSO Support (SAML/OIDC) | No Single Sign-On integration with Identity Provider. |
| Role Hierarchy | No permission inheritance between roles. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| Role-Based Access Control | UserGroup, UserType, GroupPermission, PagePermission models exist with UI. | Not fully enforced across all API endpoints. No role hierarchy. |
| User Management | All Users, User Groups, User Types pages exist. | No user activity log or login history. |

### Implemented with Issues
| Feature | Issue |
|---------|-------|
| Authentication Tokens | JWT with refresh tokens implemented but no explicit token expiry handling or session timeout warnings in UI. |
| Password Security | Bcrypt hashing implemented but no password policy enforcement (complexity, expiry, history). |
| User Group Permissions | Many-to-many permissions exist but enforcement at controller level may be inconsistent across different endpoints. |
| Page Permissions | PagePermission model exists but modified file in git status suggests active development/issues. |

---

## 2. Member/Patient

### Not Implemented
| Feature | Description |
|---------|-------------|
| Payer-Specific Eligibility Rules | No eligibility checks based on payer rules/authorization at booking time. |
| Member Eligibility Verification | No real-time eligibility verification against payer systems. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| Member Management | Members page with demographics, payer info. | No eligibility status field or eligibility check integration. |
| Member Profiles | Basic demographics and contact info stored. | Insurance expiry tracking, program status validation missing. |

### Implemented with Issues
| Feature | Issue |
|---------|-------|
| Input Validation | PHI fields may accept invalid data. Not all required fields properly validated. |

---

## 3. Trip/Booking

### Not Implemented
| Feature | Description |
|---------|-------------|
| Minimum Distance Enforcement (4 miles) | System must reject/flag requests under 4 miles. Backend calculates distance but no validation logic exists. |
| Rideshare Rules (max 2 members) | System should combine up to 2 members per vehicle with different pickup addresses. No rideshare grouping logic exists. |
| Equipment & Vehicle Match Validation | No automatic validation that wheelchair/stretcher/bariatric bookings are assigned to properly equipped vehicles. |
| Recurring Booking Management | No UI to view/edit/manage recurring series after creation. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| Booking Creation | Trip creation with types (one_way, round_trip, multi_stop), member details, pickup/dropoff, mobility needs, special instructions. | Escorts, oxygen, bariatric, language needs fields may be incomplete. No eligibility verification. |
| Recurring Bookings | Blanket trips with date range and day selection supported. | No dialysis schedule templates. No series management UI. |
| Trip Filtering | Multiple filters (date, status, driver, program, city, search). | No saved filter presets. |
| Trip-Level Documentation | Mileage logs, signatures stored. | Reason codes, incident notes attachment for audit may be incomplete. |

### Implemented with Issues
| Feature | Issue |
|---------|-------|
| Distance Calculation | Distance is calculated via Google Maps API but stored without validation. Trips under 4 miles are created without warning. |
| Trip Status Flow | Multiple statuses exist but no validation that status transitions follow correct order. |

---

## 4. Scheduling & Route Planning

### Not Implemented
| Feature | Description |
|---------|-------------|
| Automated Route Optimization | No algorithm for suggested routes with time windows, vehicle capacity, equipment needs, and rideshare constraints. |
| Unassigned Pool Dashboard | Dedicated view/endpoint for all bookings appearing in pool for planning/dispatch is missing. |
| ETA Recalculation | Dynamic ETA recalculation with traffic and status updates not implemented. |
| Time Window Constraints | No configurable pickup tolerance and maximum ride time/detour thresholds for rideshare. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| Dispatch Assignments | Manual driver assignment with SMS notification option. | No auto-assignment rules, no automated dispatch based on availability/proximity. |
| Route Management | Trip legs with sequence, status, pickup/dropoff locations exist. | No route sequencing optimization for multi-stop trips. |

### Implemented with Issues
| Feature | Issue |
|---------|-------|
| Manual Assignment | Works but no validation of driver availability or vehicle compatibility. |

---

## 5. Driver

### Not Implemented
| Feature | Description |
|---------|-------------|
| Photo Capture | Photo capture for proof of delivery, incidents, or documentation not available in driver app. |
| Incident Reporting System | No incident reporting model, endpoints, or UI for injuries, equipment problems, delays with notes/photos. |
| Offline Mode | No capability to cache assigned trips and sync when online. |
| Real-Time Location Tracking | No GPS tracking or real-time ride-tracking map. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| Driver Status Updates | Status updates (en route, arrived, boarded, completed, canceled, no-show) implemented. | No real-time push updates to dispatchers. Status sync may have delays. |
| Signature Capture | Driver and member signature capture working via SignaturePad component. | No caregiver signature option explicitly. |
| Navigation Integration | Google Maps directions link available. | No embedded turn-by-turn navigation within app. |
| Driver Profiles | Basic profile with contact, hourly rate, payment structure, signature, profile image. | License info, certifications, background check status, vehicle assignments, availability calendar missing. |
| Driver App Workflow | Trip list, trip details, status updates, navigation, odometer entry. | Mobile-optimized layout may not be fully responsive. |

### Implemented with Issues
| Feature | Issue |
|---------|-------|
| Odometer Tracking | Pickup and dropoff odometer readings captured but no validation for logical consistency (dropoff > pickup). |
| Driver Assignment SMS | SMS is sent on driver assignment but only basic message. No confirmation that driver received/acknowledged. |

---

## 6. Vehicle

### Not Implemented
| Feature | Description |
|---------|-------------|
| Vehicle Capacity Validation | No validation that vehicle capacity matches booking requirements. |
| Equipment Matching | No automatic matching of wheelchair/stretcher/bariatric equipment to bookings. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| Vehicle Management | Vehicles page with maintenance schedule, parts/suppliers, documents. | No vehicle capacity/equipment tracking tied to booking validation. |

### Implemented with Issues
*No known issues with current vehicle implementation.*

---

## 7. Clinic Portal

### Not Implemented
| Feature | Description |
|---------|-------------|
| Clinic Portal - Booking Interface | Clinic POC page shows "Coming Soon". No booking/return request form for clinic staff. |
| Clinic Portal - Status View | No clinic-specific trip status dashboard. |
| Clinic Portal - Limited Editing | No ability for clinic staff to edit/cancel only their own requests. |
| Clinic Portal Authentication | No separate clinic login/portal with limited access. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| Clinic Data | Clinic information displayed in trip management table. | Full clinic portal functionality missing. |

### Implemented with Issues
*Clinic portal is not implemented enough to have issues.*

---

## 8. Communication & Notifications

### Not Implemented
| Feature | Description |
|---------|-------------|
| IVR/Phone Call Notifications | Twilio integration exists for SMS only; no IVR automated call system. |
| Email Notifications | No email notification system for booking confirmations, reminders, delays, cancellations. |
| Push Notifications | No in-app push notification system for patients, caregivers, clinic staff, drivers. |
| Two-Way Messaging | No messaging or call-back functionality between dispatcher/driver/patient. |
| Notification Preferences | No user notification preferences/settings UI. |
| Notification Templates | No configurable notification templates. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| SMS Notifications | Twilio SMS for driver assignment notifications. | No SMS for booking confirmations, reminders, ETA updates, delays, cancellations, no-show follow-ups. |

### Implemented with Issues
| Feature | Issue |
|---------|-------|
| Driver Assignment SMS | Basic message sent but no retry mechanism or delivery confirmation. |

---

## 9. Billing & Claims

### Not Implemented
| Feature | Description |
|---------|-------------|
| Payment Reconciliation | No payment amount/date tracking, remittance advice processing, or void/adjustment handling. |
| Denial/Rejection Handling | No workflow for handling rejected claims. |
| Third-Party Billing API | No API integration to third-party billing systems. |
| Payer-Specific Formats | No payer-specific EDI format variations. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| Fare Calculation Engine | Complex billing with base rates, per-mile, CPT codes, urban/rural rates. | Special service fees, negotiated rates, copay handling may be incomplete. |
| Claims Data Export (EDI 837) | Full EDI 837 builder implementation with batch processing. | No payer-specific format variations. |
| Billing Status Tracking | Status field (unbilled, ready_for_billing, claim_generated, billed, paid). | No payment amount/date tracking. No outstanding/void tracking. |
| Batch Processing | Batch and BatchDetail models with UI for batch operations. | Limited batch editing after creation. |

### Implemented with Issues
| Feature | Issue |
|---------|-------|
| Claim Generation | Claims can be generated but backend has "fudge factors" in mileage calculations (hardcoded adjustments) which may not align with actual payer requirements. |
| Claims Status | Status values exist but no workflow enforcement (e.g., cannot mark paid before submitted). |

---

## 10. HR & Compliance

### Not Implemented
| Feature | Description |
|---------|-------------|
| Driver Certifications Management | No model or UI for CPR, safe patient handling, background check tracking with expiry dates. |
| Training Records Management | No training completion tracking, expiration reminders, or compliance reporting. |
| Credentialing Workflow | No document upload and verification workflow for required driver credentials. |
| Payroll Integration | No integration with external payroll systems. |
| HR Dashboard | No HR overview dashboard with compliance status. |
| Employee Directory | No dedicated employee list/profile pages. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| Time and Attendance | TimeSheet model with clock-in/out, breaks, overtime, hour types. | No integration with payroll systems. |
| Time Off Requests | TimeOffRequest model with approval workflow and UI. | PTO balance tracking may be missing. |
| Incentives | AddIncentive component for adding bonuses. | Limited incentive management. |

### Implemented with Issues
| Feature | Issue |
|---------|-------|
| Time Tracking | Auto clock-in/out on pickup/dropoff exists but may conflict with manual timesheet entries. |

---

## 11. Reporting & Dashboards

### Not Implemented
| Feature | Description |
|---------|-------------|
| Operational Dashboards | No real-time active trips, on-time performance, wait times, utilization dashboards. |
| Financial Reports | No trips by payer, revenue, outstanding claims, average fare reports. |
| Safety & Incident Reports | No incident log or safety KPIs reporting. |
| Workforce Reports | No driver performance or certification compliance reports. |
| Custom Exportable Reports | No report builder or scheduled report delivery. |
| Main Dashboard | No main dashboard/home page with KPIs. |
| Analytics | No charts/graphs for business metrics. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| Timesheet Charts | Bar/pie charts in EmployeeTimesheetHistory. | No operational or financial dashboard charts. |
| Trip Summaries | Lightweight endpoint for table display. | No aggregate statistics or trend analysis. |

### Implemented with Issues
*No known issues - reporting is largely not implemented.*

---

## 12. Audit & Logging

### Not Implemented
| Feature | Description |
|---------|-------------|
| Full Audit Trail System | No dedicated audit log table tracking booking creation/modification, user actions, driver statuses. |
| Audit Logs Viewer UI | No frontend interface to view audit trails or change history. |
| Data Retention Policy | No configurable retention periods for PHI, claims, driver docs. |
| Change History | No tracking of what changed, who changed it, when. |
| Action Logging | No create, update, delete action logging. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| Timestamps | `created_at`, `updated_at` on most models. | No full change tracking. |
| Created By Tracking | `created_by` fields in some models (Trip, Claim). | Not consistent across all models. |

### Implemented with Issues
*Audit logging is largely not implemented.*

---

## 13. Security & Compliance

### Not Implemented
| Feature | Description |
|---------|-------------|
| MFA (Multi-Factor Authentication) | No MFA for admin/sensitive roles. |
| HIPAA-Specific Controls | No explicit HIPAA audit logging, PHI access controls, breach notification procedures. |
| SSO Support (SAML/OIDC) | No Single Sign-On integration with Identity Provider. |
| Data Encryption at Rest | No explicit data encryption at rest. |
| API Rate Limiting | No rate limiting on API endpoints. |
| Security Event Monitoring | No monitoring for suspicious activities. |
| Session Management | No explicit session timeout or concurrent session controls. |

### Partially Implemented
| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| RBAC Enforcement | Structure exists with models and UI. | Not fully enforced across all API endpoints. |
| Input Validation | Some validation in controllers. | Not comprehensive. PHI fields may accept invalid data. |

### Implemented with Issues
| Feature | Issue |
|---------|-------|
| CORS Configuration | CORS is configured but settings may be too permissive for production HIPAA compliance. |
| API Error Handling | Error responses may expose internal implementation details useful to attackers. |
| Password Security | Bcrypt hashing implemented but no password policy enforcement (complexity, expiry, history). |

---

## Summary by Module

| Module | Not Implemented | Partial | Issues |
|--------|-----------------|---------|--------|
| User & Authentication | 3 | 2 | 4 |
| Member/Patient | 2 | 2 | 1 |
| Trip/Booking | 4 | 4 | 2 |
| Scheduling & Route Planning | 4 | 2 | 1 |
| Driver | 4 | 5 | 2 |
| Vehicle | 2 | 1 | 0 |
| Clinic Portal | 4 | 1 | 0 |
| Communication & Notifications | 6 | 1 | 1 |
| Billing & Claims | 4 | 4 | 2 |
| HR & Compliance | 6 | 3 | 1 |
| Reporting & Dashboards | 7 | 2 | 0 |
| Audit & Logging | 5 | 2 | 0 |
| Security & Compliance | 7 | 2 | 3 |
| **TOTAL** | **58** | **31** | **17** |

---

## Priority Recommendations

### Critical (Security/Compliance)
1. Implement MFA for admin/sensitive roles
2. Add full HIPAA audit logging
3. Enforce RBAC across all endpoints
4. Implement minimum 4-mile distance validation

### High Priority (Core Business Rules)
1. Rideshare grouping logic (max 2 members)
2. Equipment/vehicle match validation
3. Eligibility verification at booking
4. Incident reporting system

### Medium Priority (Operations)
1. Route optimization algorithm
2. Automated dispatch
3. Email/push notifications
4. Operational dashboards
5. Clinic portal implementation

### Lower Priority (Enhancement)
1. IVR system
2. Offline mode
3. Real-time tracking
4. Custom reports

---

*This analysis is based on codebase review and may not reflect runtime behavior or recent changes not yet committed.*
