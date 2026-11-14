import * as yup from 'yup'
import { HIGH_RISK_COUNTRIES } from '../constants/constants'

const optionalString = () => yup.string().nullable().notRequired()
const optionalBoolean = () => yup.boolean().nullable().notRequired()

const requiredString = (value) => typeof value === 'string' && value.trim().length > 0

const getValidationContext = (values) => {
  const countryOfTaxResidence = Array.isArray(values?.countryOfTaxResidence)
    ? values.countryOfTaxResidence
    : []
  const taxResidenceCodes = countryOfTaxResidence
    .map((country) => country?.countryOfTaxResidenceCode)
    .filter(requiredString)
  const highRiskCountryFields = countryOfTaxResidence.filter((country) => (
    HIGH_RISK_COUNTRIES.includes(country?.countryOfTaxResidenceCode)
  ))

  return {
    taxResidenceCodes,
    highRiskCountryFields,
    hasHighRiskCountryWithResidenceRights: highRiskCountryFields.some((country) => (
      country?.obtainResidenceRightsUnderCitizenshipByInvestmentScheme === true
    )),
  }
}

const isHighRiskFlowActive = (testContext) => (
  testContext.options?.context?.hasHighRiskCountryWithResidenceRights === true
)

const isDifferentTaxResidence = (countryCode, testContext) => {
  const taxResidenceCodes = testContext.options?.context?.taxResidenceCodes || []
  return requiredString(countryCode) && !taxResidenceCodes.includes(countryCode)
}

const countryOfTaxResidenceSchema = yup.object({
  countryOfTaxResidenceCode: optionalString().test(
    'country-of-tax-residence-required',
    'Please select a country of tax residence.',
    requiredString,
  ),
  notApplicableTIN: optionalBoolean(),
  taxIdentificationNumber: optionalString().test(
    'tax-identification-number-required',
    'Please enter your tax identification number or mark it as not applicable.',
    function (value) {
      return this.parent.notApplicableTIN === true || requiredString(value)
    },
  ),
  explanationForReasonB: optionalString().test(
    'reason-b-explanation-required',
    'Please provide an explanation for reason B.',
    function (value) {
      return this.parent.reasonForNotFillingTINNumber !== 'B' || requiredString(value)
    },
  ),
  hasHighRiskCountries: optionalBoolean(),
  reasonForNotFillingTINNumber: optionalString().test(
    'reason-for-not-filling-tin-required',
    'Please select a reason for not filling the TIN number.',
    function (value) {
      return this.parent.notApplicableTIN !== true || requiredString(value)
    },
  ),
  obtainResidenceRightsUnderCitizenshipByInvestmentScheme: optionalBoolean().test(
    'investment-residence-answer-required',
    'Please select Yes or No.',
    function (value) {
      return (
        !HIGH_RISK_COUNTRIES.includes(this.parent.countryOfTaxResidenceCode) ||
        typeof value === 'boolean'
      )
    },
  ),
  incomeJurisdiction: optionalString(),
})

const highRiskCountryDetailsSchema = yup.object({
  holdResidenceInOtherJurisdiction: optionalBoolean().test(
    'other-jurisdiction-answer-required',
    'Please select Yes or No.',
    function (value) {
      const context = this.options?.context || {}
      return (
        !isHighRiskFlowActive(this) ||
        context.highRiskCountryFields.length >= 2 ||
        typeof value === 'boolean'
      )
    },
  ),
  holdResidenceInOtherJurisdictionCountry: optionalString().test(
    'other-jurisdiction-country-required',
    'Please specify the country.',
    function (value) {
      return (
        !isHighRiskFlowActive(this) ||
        this.options.context.highRiskCountryFields.length >= 2 ||
        this.parent.holdResidenceInOtherJurisdiction !== true ||
        requiredString(value)
      )
    },
  ),
  spentNinetyDaysInOtherJurisdictionCountryPreviousYear: optionalBoolean().test(
    'spent-ninety-days-answer-required',
    'Please select Yes or No.',
    function (value) {
      return !isHighRiskFlowActive(this) || typeof value === 'boolean'
    },
  ),
  spentNinetyDaysInOtherJurisdictionCountryPreviousYearTwo: optionalBoolean(),
  spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry: optionalString().test(
    'spent-ninety-days-country-required',
    'Please specify the country.',
    function (value) {
      return (
        !isHighRiskFlowActive(this) ||
        this.parent.spentNinetyDaysInOtherJurisdictionCountryPreviousYear !== true ||
        requiredString(value)
      )
    },
  ),
  spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountryTwo: optionalString(),
  reasonForSpentNinetyDaysInOtherJurisdictionCountryPreviousYear: optionalString(),
  reasonForSpentNinetyDaysInOtherJurisdictionCountryPreviousYearTwo: optionalString(),
  otherReasonExplanationsForSpentNinetyDaysInOtherJurisdictionCountryPreviousYear: optionalString(),
  otherReasonExplanationsForSpentNinetyDaysInOtherJurisdictionCountryPreviousYearTwo: optionalString(),
  filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYear: optionalBoolean(),
  filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearTwo: optionalBoolean(),
  filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry: optionalString().test(
    'income-tax-country-required',
    'Please specify the country.',
    function (value) {
      return !isHighRiskFlowActive(this) || requiredString(value)
    },
  ),
  reasonForFilledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYear: optionalString(),
  reasonForFilledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearTwo: optionalString(),
  otherReasonExplanationsForFilledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYear: optionalString(),
  otherReasonExplanationsForFilledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearTwo: optionalString(),
  countryOfTaxResidencePersonalIncomeTax: optionalBoolean().test(
    'income-tax-add-country-answer-required',
    'Please select Yes or No.',
    function (value) {
      const countryCode = this.parent.filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry
      return (
        !isHighRiskFlowActive(this) ||
        !isDifferentTaxResidence(countryCode, this) ||
        typeof value === 'boolean'
      )
    },
  ),
  countryOfTaxResidencespentNinetyDays: optionalBoolean().test(
    'spent-ninety-days-add-country-answer-required',
    'Please select Yes or No.',
    function (value) {
      const countryCode = this.parent.spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry
      return (
        !isHighRiskFlowActive(this) ||
        this.parent.spentNinetyDaysInOtherJurisdictionCountryPreviousYear !== true ||
        !isDifferentTaxResidence(countryCode, this) ||
        typeof value === 'boolean'
      )
    },
  ),
  countryOfTaxResidencespentNinetyDaysTwo: optionalBoolean(),
  ninetyDaysReasonCode: optionalString().test(
    'spent-ninety-days-reason-required',
    'Please select a reasonable explanation.',
    function (value) {
      const countryCode = this.parent.spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry
      return (
        !isHighRiskFlowActive(this) ||
        this.parent.countryOfTaxResidencespentNinetyDays !== false ||
        !isDifferentTaxResidence(countryCode, this) ||
        requiredString(value)
      )
    },
  ),
  incomeTaxReasonCode: optionalString().test(
    'income-tax-reason-required',
    'Please select a reasonable explanation.',
    function (value) {
      const countryCode = this.parent.filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry
      return (
        !isHighRiskFlowActive(this) ||
        this.parent.countryOfTaxResidencePersonalIncomeTax !== false ||
        !isDifferentTaxResidence(countryCode, this) ||
        requiredString(value)
      )
    },
  ),
})

export const crsSchema = yup.object({
  countryOfTaxResidence: yup.array()
    .required('Please add at least one country of tax residence.')
    .min(1, 'Please add at least one country of tax residence.')
    .of(countryOfTaxResidenceSchema),
  highRiskCountryDetails: highRiskCountryDetailsSchema.required(),
  hasCRSIndicia: optionalBoolean(),
  indiciaCheck: yup.mixed().notRequired(),
})

const setNestedError = (errors, path, error) => {
  const segments = String(path || 'root').match(/[^.[\]]+/g) || ['root']
  let current = errors

  segments.forEach((segment, index) => {
    const isLastSegment = index === segments.length - 1

    if (isLastSegment) {
      current[segment] ??= error
      return
    }

    const nextSegmentIsIndex = /^\d+$/.test(segments[index + 1])
    current[segment] ??= nextSegmentIsIndex ? [] : {}
    current = current[segment]
  })
}

export const yupFormResolver = (schema) => async (values) => {
  try {
    const validatedValues = await schema.validate(values, {
      abortEarly: false,
      context: getValidationContext(values),
    })

    return { values: validatedValues, errors: {} }
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) throw error

    const errors = {}
    const validationErrors = error.inner.length > 0 ? error.inner : [error]

    validationErrors.forEach((validationError) => {
      setNestedError(errors, validationError.path, {
        type: validationError.type || 'validation',
        message: validationError.message,
      })
    })

    return { values: {}, errors }
  }
}
