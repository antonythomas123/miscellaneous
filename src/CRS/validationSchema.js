import * as yup from 'yup'
import { HIGH_RISK_COUNTRIES } from '../constants/constants.js'
import { AUTO_TIN_VALIDATIONS } from '../data/autoTinValidations.js'

const defaultMessages = {
  countryOfTaxResidence: 'Please select a country of tax residence.',
  taxIdentificationNumber: 'Please enter your tax identification number or mark it as not applicable.',
  reasonForNotFillingTINNumber: 'Please select a reason for not filling the TIN number.',
  explanationForReasonB: 'Please provide an explanation for reason B.',
  yesOrNo: 'Please select Yes or No.',
  specifyCountry: 'Please specify the country.',
  reasonableExplanation: 'Please select a reasonable explanation.',
  atLeastOneCountry: 'Please add at least one country of tax residence.',
  tinNumericOnly: 'TIN can only contain numbers.',
  tinAlphaNumericOnly: 'TIN can only contain English letters and numbers.',
  tinInvalidCharacters: 'TIN can only contain English letters, numbers and special characters.',
  tinLengthExact: 'TIN must be {min} characters long.',
  tinLengthRange: 'TIN must be between {min} and {max} characters long.',
}

export const createCrsSchema = (locales = {}) => {
  const messages = { ...defaultMessages, ...(locales?.validation || locales) }
  const optionalString = () => yup.string().nullable().notRequired()
  const optionalBoolean = () => yup.boolean().nullable().notRequired()

  const countryOfTaxResidenceSchema = yup.object({
    countryOfTaxResidenceCode: yup.string().required(messages.countryOfTaxResidence),
    notApplicableTIN: optionalBoolean(),
    taxIdentificationNumber: optionalString().when('notApplicableTIN', {
      is: (notApplicableTIN) => notApplicableTIN !== true,
      then: (schema) => schema
        .required(messages.taxIdentificationNumber)
        .test('tin-characters', function validateTinCharacters(value) {
          const rule = AUTO_TIN_VALIDATIONS[this.parent?.countryOfTaxResidenceCode]
          if (!rule || !value) return true

          if (rule.acceptSpecialChar) {
            // English letters, numbers and special characters (printable ASCII)
            return /^[\x20-\x7E]+$/.test(value) || this.createError({ message: messages.tinInvalidCharacters })
          }
          if (rule.isAlphaNumeric) {
            return /^[A-Za-z0-9]+$/.test(value) || this.createError({ message: messages.tinAlphaNumericOnly })
          }
          return /^[0-9]+$/.test(value) || this.createError({ message: messages.tinNumericOnly })
        })
        .test('tin-length', function validateTinLength(value) {
          const rule = AUTO_TIN_VALIDATIONS[this.parent?.countryOfTaxResidenceCode]
          if (!rule || !value) return true
          if (value.length >= rule.min && value.length <= rule.max) return true

          const template = rule.min === rule.max ? messages.tinLengthExact : messages.tinLengthRange
          return this.createError({
            message: template.replace('{min}', rule.min).replace('{max}', rule.max),
          })
        }),
    }),
    explanationForReasonB: optionalString().when('reasonForNotFillingTINNumber', {
      is: 'B',
      then: (schema) => schema.required(messages.explanationForReasonB),
    }),
    reasonForNotFillingTINNumber: optionalString().when('notApplicableTIN', {
      is: true,
      then: (schema) => schema.required(messages.reasonForNotFillingTINNumber),
    }),
    obtainResidenceRightsUnderCitizenshipByInvestmentScheme: optionalBoolean().when(
      'countryOfTaxResidenceCode',
      {
        is: (countryCode) => HIGH_RISK_COUNTRIES.includes(countryCode),
        then: (schema) => schema.required(messages.yesOrNo),
      },
    ),
  })

  // The high-risk questions depend on all tax residence rows, so the schema is built from the form values
  // (instead of passing a validation context from a custom resolver).
  return yup.lazy((values) => {
    const countryOfTaxResidence = Array.isArray(values?.countryOfTaxResidence)
      ? values.countryOfTaxResidence
      : []
    const taxResidenceCodes = countryOfTaxResidence
      .map((country) => country?.countryOfTaxResidenceCode)
      .filter(Boolean)
    const highRiskCountryCount = countryOfTaxResidence.filter((country) => (
      HIGH_RISK_COUNTRIES.includes(country?.countryOfTaxResidenceCode)
    )).length
    const hasHighRiskCountry = countryOfTaxResidence.some((country) => (
      HIGH_RISK_COUNTRIES.includes(country?.countryOfTaxResidenceCode) &&
      country?.obtainResidenceRightsUnderCitizenshipByInvestmentScheme === true
    ))

    const highRiskCountryDetailsSchema = yup.object({
      holdResidenceInOtherJurisdiction: hasHighRiskCountry && highRiskCountryCount < 2
        ? optionalBoolean().required(messages.yesOrNo)
        : optionalBoolean(),
      holdResidenceInOtherJurisdictionCountry: optionalString().when(
        ['holdResidenceInOtherJurisdiction'],
        ([holdsResidence], schema) => (
          hasHighRiskCountry && highRiskCountryCount < 2 && holdsResidence === true
            ? schema.required(messages.specifyCountry)
            : schema
        ),
      ),
      spentNinetyDaysInOtherJurisdictionCountryPreviousYear: hasHighRiskCountry
        ? optionalBoolean().required(messages.yesOrNo)
        : optionalBoolean(),
      spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry: optionalString().when(
        ['spentNinetyDaysInOtherJurisdictionCountryPreviousYear'],
        ([spentNinetyDays], schema) => (
          hasHighRiskCountry && spentNinetyDays === true
            ? schema.required(messages.specifyCountry)
            : schema
        ),
      ),
      filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry: hasHighRiskCountry
        ? optionalString().required(messages.specifyCountry)
        : optionalString(),
      countryOfTaxResidencePersonalIncomeTax: optionalBoolean().when(
        ['filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry'],
        ([countryCode], schema) => (
          hasHighRiskCountry &&
          countryCode &&
          !taxResidenceCodes.includes(countryCode)
            ? schema.required(messages.yesOrNo)
            : schema
        ),
      ),
      countryOfTaxResidencespentNinetyDays: optionalBoolean().when(
        [
          'spentNinetyDaysInOtherJurisdictionCountryPreviousYear',
          'spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry',
        ],
        ([spentNinetyDays, countryCode], schema) => (
          hasHighRiskCountry &&
          spentNinetyDays === true &&
          countryCode &&
          !taxResidenceCodes.includes(countryCode)
            ? schema.required(messages.yesOrNo)
            : schema
        ),
      ),
      ninetyDaysReasonCode: optionalString().when(
        [
          'countryOfTaxResidencespentNinetyDays',
          'spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry',
        ],
        ([addCountry, countryCode], schema) => (
          hasHighRiskCountry &&
          addCountry === false &&
          countryCode &&
          !taxResidenceCodes.includes(countryCode)
            ? schema.required(messages.reasonableExplanation)
            : schema
        ),
      ),
      incomeTaxReasonCode: optionalString().when(
        [
          'countryOfTaxResidencePersonalIncomeTax',
          'filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry',
        ],
        ([addCountry, countryCode], schema) => (
          hasHighRiskCountry &&
          addCountry === false &&
          countryCode &&
          !taxResidenceCodes.includes(countryCode)
            ? schema.required(messages.reasonableExplanation)
            : schema
        ),
      ),
    })

    return yup.object({
      countryOfTaxResidence: yup.array()
        .required(messages.atLeastOneCountry)
        .min(1, messages.atLeastOneCountry)
        .of(countryOfTaxResidenceSchema),
      highRiskCountryDetails: highRiskCountryDetailsSchema.required(),
    })
  })
}