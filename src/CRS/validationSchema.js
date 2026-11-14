import * as yup from 'yup'
import { HIGH_RISK_COUNTRIES } from '../constants/constants.js'

const defaultMessages = {
  countryOfTaxResidence: 'Please select a country of tax residence.',
  taxIdentificationNumber: 'Please enter your tax identification number or mark it as not applicable.',
  reasonForNotFillingTINNumber: 'Please select a reason for not filling the TIN number.',
  explanationForReasonB: 'Please provide an explanation for reason B.',
  yesOrNo: 'Please select Yes or No.',
  specifyCountry: 'Please specify the country.',
  reasonableExplanation: 'Please select a reasonable explanation.',
  atLeastOneCountry: 'Please add at least one country of tax residence.',
}

const getValidationContext = (values) => {
  const countryOfTaxResidence = Array.isArray(values?.countryOfTaxResidence)
    ? values.countryOfTaxResidence
    : []
  const taxResidenceCodes = countryOfTaxResidence
    .map((country) => country?.countryOfTaxResidenceCode)
    .filter(Boolean)
  const highRiskCountryCount = countryOfTaxResidence.filter((country) => (
    HIGH_RISK_COUNTRIES.includes(country?.countryOfTaxResidenceCode)
  )).length

  return {
    taxResidenceCodes,
    highRiskCountryCount,
    hasHighRiskCountryWithResidenceRights: countryOfTaxResidence.some((country) => (
      HIGH_RISK_COUNTRIES.includes(country?.countryOfTaxResidenceCode) &&
      country?.obtainResidenceRightsUnderCitizenshipByInvestmentScheme === true
    )),
  }
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
      then: (schema) => schema.required(messages.taxIdentificationNumber),
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

  const highRiskCountryDetailsSchema = yup.object({
    holdResidenceInOtherJurisdiction: optionalBoolean().when(
      ['$hasHighRiskCountryWithResidenceRights', '$highRiskCountryCount'],
      ([hasHighRiskCountry, highRiskCountryCount], schema) => (
        hasHighRiskCountry && highRiskCountryCount < 2
          ? schema.required(messages.yesOrNo)
          : schema
      ),
    ),
    holdResidenceInOtherJurisdictionCountry: optionalString().when(
      [
        '$hasHighRiskCountryWithResidenceRights',
        '$highRiskCountryCount',
        'holdResidenceInOtherJurisdiction',
      ],
      ([hasHighRiskCountry, highRiskCountryCount, holdsResidence], schema) => (
        hasHighRiskCountry && highRiskCountryCount < 2 && holdsResidence === true
          ? schema.required(messages.specifyCountry)
          : schema
      ),
    ),
    spentNinetyDaysInOtherJurisdictionCountryPreviousYear: optionalBoolean().when(
      '$hasHighRiskCountryWithResidenceRights',
      {
        is: true,
        then: (schema) => schema.required(messages.yesOrNo),
      },
    ),
    spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry: optionalString().when(
      ['$hasHighRiskCountryWithResidenceRights', 'spentNinetyDaysInOtherJurisdictionCountryPreviousYear'],
      ([hasHighRiskCountry, spentNinetyDays], schema) => (
        hasHighRiskCountry && spentNinetyDays === true
          ? schema.required(messages.specifyCountry)
          : schema
      ),
    ),
    filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry: optionalString().when(
      '$hasHighRiskCountryWithResidenceRights',
      {
        is: true,
        then: (schema) => schema.required(messages.specifyCountry),
      },
    ),
    countryOfTaxResidencePersonalIncomeTax: optionalBoolean().when(
      [
        '$hasHighRiskCountryWithResidenceRights',
        '$taxResidenceCodes',
        'filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry',
      ],
      ([hasHighRiskCountry, taxResidenceCodes, countryCode], schema) => (
        hasHighRiskCountry &&
        countryCode &&
        !taxResidenceCodes.includes(countryCode)
          ? schema.required(messages.yesOrNo)
          : schema
      ),
    ),
    countryOfTaxResidencespentNinetyDays: optionalBoolean().when(
      [
        '$hasHighRiskCountryWithResidenceRights',
        '$taxResidenceCodes',
        'spentNinetyDaysInOtherJurisdictionCountryPreviousYear',
        'spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry',
      ],
      ([hasHighRiskCountry, taxResidenceCodes, spentNinetyDays, countryCode], schema) => (
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
        '$hasHighRiskCountryWithResidenceRights',
        '$taxResidenceCodes',
        'countryOfTaxResidencespentNinetyDays',
        'spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry',
      ],
      ([hasHighRiskCountry, taxResidenceCodes, addCountry, countryCode], schema) => (
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
        '$hasHighRiskCountryWithResidenceRights',
        '$taxResidenceCodes',
        'countryOfTaxResidencePersonalIncomeTax',
        'filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry',
      ],
      ([hasHighRiskCountry, taxResidenceCodes, addCountry, countryCode], schema) => (
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
}

const setNestedError = (errors, path, error) => {
  const segments = String(path || 'root').match(/[^.[\]]+/g) || ['root']
  let current = errors

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] ??= error
      return
    }

    current[segment] ??= Number.isInteger(Number(segments[index + 1])) ? [] : {}
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
    const validationErrors = error.inner.length ? error.inner : [error]

    validationErrors.forEach(({ path, type, message }) => {
      setNestedError(errors, path, { type: type || 'validation', message })
    })

    return { values: {}, errors }
  }
}
