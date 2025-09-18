import type { ChecklistItem } from "@/context/checklist-context";

export const mockAiAnalysis: ChecklistItem[] = [
  {
    id: "IAS_40.74",
    reference: "IAS 40.74",
    question:
      "Does the entity apply disclosures required under IFRS 16 based on ownership/lease type?",
    status: "Yes",
    comment:
      "The entity has properly disclosed the IFRS 16 requirements for leased properties on page 47 of the financial report.",
  },
  {
    id: "IAS_40.84E_b",
    reference: "IAS 40.84E(b)",
    question:
      "If reclassified under Amendments to IAS 40, are those amounts disclosed?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.75_a",
    reference: "IAS 40.75(a)",
    question:
      "Does the entity disclose whether it applies the fair value model or the cost model?",
    status: "Yes",
    comment:
      "The entity clearly states on page 32 that it applies the fair value model for all investment properties.",
  },
  {
    id: "IAS_40.14",
    reference: "IAS 40.14",
    question: "If classification is difficult, are the criteria disclosed?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IFRS_13.5-7",
    reference: "IFRS 13.5-7",
    question: "Are fair value measurement disclosures provided as per IFRS 13?",
    status: "Yes",
    comment:
      "Detailed fair value measurement disclosures are provided in Note 15, including the fair value hierarchy and valuation techniques.",
  },
  {
    id: "IAS_40.75_d",
    reference: "IAS 40.75(d)",
    question: "Is the fair value based on an independent valuer's assessment?",
    status: "Yes",
    comment:
      "The entity discloses that all properties were valued by Jones Lang LaSalle, an independent valuation firm, as of December 31, 2023.",
  },
  {
    id: "IAS_40.75_e",
    reference: "IAS 40.75(e)",
    question: "If no independent valuation, is that fact disclosed?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.75_f",
    reference: "IAS 40.75(f)",
    question:
      "Are the following amounts included in profit or loss: rental income from investment property and operating expenses (with/without rental income)?",
    status: "Yes",
    comment:
      "Rental income and direct operating expenses are disclosed in Note 7, with separate disclosure for properties generating rental income and those that did not.",
  },
  {
    id: "IAS_40.32C",
    reference: "IAS 40.32C",
    question:
      "Is cumulative fair value change disclosed when switching from cost to fair value pool?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.75_g",
    reference: "IAS 40.75(g)",
    question: "Are restrictions on realisability disclosed?",
    status: "No",
    comment:
      "The entity does not appear to disclose any restrictions on the realisability of investment property or remittance of income and proceeds of disposal.",
  },
  {
    id: "IAS_40.75_h",
    reference: "IAS 40.75(h)",
    question: "Are there contractual obligations related to the property?",
    status: "Yes",
    comment:
      "Contractual obligations to purchase, construct, or develop investment property are disclosed in Note 22.",
  },
  {
    id: "IAS_40.76",
    reference: "IAS 40.76",
    question:
      "Is there a reconciliation of carrying amounts (start vs end of period) including additions, assets held for sale, net fair value adjustments, exchange differences, and transfers?",
    status: "Yes",
    comment:
      "A detailed reconciliation is provided in Note 15, showing opening and closing balances with all required components.",
  },
  {
    id: "IAS_40.77",
    reference: "IAS 40.77",
    question: "If a valuation is adjusted, is the reconciliation disclosed?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.78_description",
    reference: "IAS 40.78",
    question:
      "If fair value can't be reliably measured, is the investment property described?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.78_reason",
    reference: "IAS 40.78",
    question:
      "If fair value can't be reliably measured, is the reason for lack of measurement explained?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.78_range",
    reference: "IAS 40.78",
    question:
      "If fair value can't be reliably measured, is a range of fair value estimates given?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.78_disposal_disclosure",
    reference: "IAS 40.78",
    question:
      "On disposal, was it disclosed that the property wasn't carried at fair value?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.78_disposal_gain",
    reference: "IAS 40.78",
    question: "On disposal, was gain/loss disclosed?",
    status: "Yes",
    comment:
      "Gains and losses on disposal are disclosed in Note 8, with a breakdown by property.",
  },
  {
    id: "IAS_40.79_depreciation_methods",
    reference: "IAS 40.79",
    question: "Are depreciation methods disclosed?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.79_useful_lives",
    reference: "IAS 40.79",
    question: "Are useful lives or depreciation rates disclosed?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.79_gross_accumulated",
    reference: "IAS 40.79",
    question:
      "Is gross and accumulated depreciation shown (beginning/end of period)?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.79_reconciliation",
    reference: "IAS 40.79",
    question: "Is a reconciliation of carrying amount shown?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.79_assets_held_for_sale",
    reference: "IAS 40.79",
    question: "Are assets held for sale disclosed?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.79_impairment",
    reference: "IAS 40.79",
    question: "Are impairment losses and reversals disclosed?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.79_translation",
    reference: "IAS 40.79",
    question: "Are translation differences shown?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.79_transfers",
    reference: "IAS 40.79",
    question:
      "Are transfers from inventories or owner-occupied property shown?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.79_fair_value",
    reference: "IAS 40.79",
    question: "Is the fair value of the property disclosed?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.79_no_fair_value_description",
    reference: "IAS 40.79",
    question:
      "If fair value cannot be reliably measured, is a description provided?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.79_no_fair_value_explanation",
    reference: "IAS 40.79",
    question:
      "If fair value cannot be reliably measured, is an explanation included?",
    status: "N/A",
    comment: "",
  },
  {
    id: "IAS_40.79_no_fair_value_range",
    reference: "IAS 40.79",
    question:
      "If fair value cannot be reliably measured, is a range of estimates provided?",
    status: "N/A",
    comment: "",
  },
];
