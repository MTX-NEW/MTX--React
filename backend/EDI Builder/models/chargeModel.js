export const chargeModel = [
  {
    charge_id: 1,
    claim_id: 101,
    charge_number: 'CH001',
    claim_number: 'CLM12345',

    // Procedure + Service Line Info
    cpt: '99213',
    charge_pos: '11',
    diagnosis_pointer: '1',
    from_dos: '2025-08-01',
    to_dos: '2025-08-01',
    mod1: '25',
    mod2: '',
    mod3: '',
    mod4: '',
    fee: '100.00',
    units: 1,
    service_description: 'Office Visit - Established Patient',

    // NDC (if applicable)
    ndc_number: '',
    ndc_unit: null,
    ndc_qualifier_code: '',

    // CAS Adjustments (up to 6, typically use top 1–3)
    adj: [
      {
        group_code: 'CO',
        reason_code: '45',
        amount: 20.00,
        quantity: 1
      },
      {
        group_code: 'PR',
        reason_code: '1',
        amount: 30.00,
        quantity: 1
      }
    ],

    // Optional: charge notes, RX, etc.
    charge_note: 'Patient seen for follow-up.',
    rx_number: '',

    // For SVD segment / secondary payer
    parent_paid: 50.00,
    cas_co: 20.00,
    cas_pr: 30.00,
    parent_cpt: '',
    parent_charge_unit: null
  },

];
