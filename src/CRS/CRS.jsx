import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { TransitionGroup } from 'react-transition-group'
import ResidencyRow from './components/ResidencyRow'
import HighRiskCountryDetails from './components/HighRiskCountryDetails'
import { Button, Collapse } from '@mui/material'
import { ControlledRadioGroup } from '../components/CustomRadioGroup'
import { ControlledSelect } from '../components/CustomSelect'
import reasonableExplanations from '../data/reasonableExplanations.json'
import countriesData from '../data/countries.json'
import { HIGH_RISK_COUNTRIES } from '../constants/constants'
import { createCrsSchema, yupFormResolver } from './validationSchema'
import { useStore } from '../providers/StateProvider'

const EMPTY_LOCALES = {}
const MAX_COUNTRIES = 5

const CRS_INDICIA_SOURCES = [
    {
        key: 'personalDetailsCountryOfResidency',
        path: ['personalInformation', 'personalDetails', 'countryOfResidency'],
        label: 'Country of Residency in Personal details section',
    },
    {
        key: 'residentialAddressCountry',
        path: ['residenceDetails', 'residenceAddress', 'country'],
        label: 'Country in Residential Address',
    },
    {
        key: 'employmentCountry',
        path: ['employmentDetails', 'country'],
        label: 'Country in Employment details',
    },
]

const getNestedValue = (object, path) => path.reduce((value, key) => value?.[key], object)

const initialCountryResidence = {
    countryOfTaxResidenceCode: '',
    notApplicableTIN: false,
    taxIdentificationNumber: '',
    explanationForReasonB: '',
    hasHighRiskCountries: false,
    reasonForNotFillingTINNumber: '',
    obtainResidenceRightsUnderCitizenshipByInvestmentScheme: null,
    incomeJurisdiction: null,
}

const createCountryResidence = (countryCode = '') => ({
    ...initialCountryResidence,
    countryOfTaxResidenceCode: countryCode,
})


const CRS = ({ locales = EMPTY_LOCALES }) => {
    const { kycDetails } = useStore() || {}
    const crsSchema = useMemo(() => createCrsSchema(locales), [locales])
    const resolver = useMemo(() => yupFormResolver(crsSchema), [crsSchema])
    const defaultValues = useMemo(() => ({
        countryOfTaxResidence: [createCountryResidence()],
        highRiskCountryDetails: {
            holdResidenceInOtherJurisdiction: null,
            holdResidenceInOtherJurisdictionCountry: null,
            spentNinetyDaysInOtherJurisdictionCountryPreviousYear: null,
            spentNinetyDaysInOtherJurisdictionCountryPreviousYearTwo: null,
            spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry: null,
            spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountryTwo: null,
            reasonForSpentNinetyDaysInOtherJurisdictionCountryPreviousYear: null,
            reasonForSpentNinetyDaysInOtherJurisdictionCountryPreviousYearTwo: null,
            otherReasonExplanationsForSpentNinetyDaysInOtherJurisdictionCountryPreviousYear: null,
            otherReasonExplanationsForSpentNinetyDaysInOtherJurisdictionCountryPreviousYearTwo: null,
            filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYear: null,
            filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearTwo: null,
            filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry: null,
            reasonForFilledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYear: null,
            reasonForFilledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearTwo: null,
            otherReasonExplanationsForFilledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYear: null,
            otherReasonExplanationsForFilledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearTwo: null,
            countryOfTaxResidencePersonalIncomeTax: null,
            countryOfTaxResidencespentNinetyDays: null,
            countryOfTaxResidencespentNinetyDaysTwo: null,
            ninetyDaysReasonCode: null,
            incomeTaxReasonCode: null,
        },
        hasCRSIndicia: false,
        indiciaCheck: null,
    }), [])

    const { control, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues,
        shouldUnregister: true,
        mode: "onSubmit",
        reValidateMode: "onChange",
        resolver,
    })

    const { fields, append, remove, } = useFieldArray({
        control,
        name: "countryOfTaxResidence"
    })

    const countries = countriesData

    const [showMaxCountriesMessage, setShowMaxCountriesMessage] = useState(false)
    const [indiciaQuestions, setIndiciaQuestions] = useState([])
    const [indiciaErrors, setIndiciaErrors] = useState({})
    const indiciaSectionRef = useRef(null)

    const countryOfTaxResidence = useWatch({ control, name: 'countryOfTaxResidence' }) || []

    // A row appended with a country code can lose its form value (shouldUnregister + StrictMode's
    // simulated unmount/remount), leaving the row visible but missing from the watched values.
    // Restore it from the field array item so the table and the indicia questions stay in sync.
    useEffect(() => {
        fields.forEach((item, rowIndex) => {
            const currentCode = countryOfTaxResidence[rowIndex]?.countryOfTaxResidenceCode
            if (item.countryOfTaxResidenceCode && (currentCode === undefined || currentCode === null)) {
                setValue(`countryOfTaxResidence.${rowIndex}.countryOfTaxResidenceCode`, item.countryOfTaxResidenceCode)
            }
        })
    }, [fields, countryOfTaxResidence, setValue])
    const taxResidenceCodeKey = countryOfTaxResidence
        .map((field) => field?.countryOfTaxResidenceCode)
        .filter(Boolean)
        .join('|')
    const taxResidenceCodes = useMemo(
        () => (taxResidenceCodeKey ? taxResidenceCodeKey.split('|') : []),
        [taxResidenceCodeKey],
    )
    const indiciaAnswers = useWatch({ control, name: 'indiciaAddCountry' }) || {}
    const highRiskCountryCount = countryOfTaxResidence.filter((field) => (
        HIGH_RISK_COUNTRIES.includes(field?.countryOfTaxResidenceCode)
    )).length
    const hasHighRiskCountryWithResidenceRights = countryOfTaxResidence.some(
        (field) => HIGH_RISK_COUNTRIES.includes(field?.countryOfTaxResidenceCode) &&
            field.obtainResidenceRightsUnderCitizenshipByInvestmentScheme === true
    )

    const countryNames = useMemo(
        () => new Map(countries.map((country) => [country.value, country.name])),
        [countries],
    )

    const getMissingIndiciaCountries = useCallback((values) => {
        const selectedCodes = (values?.countryOfTaxResidence || [])
            .map((country) => country?.countryOfTaxResidenceCode)
            .filter(Boolean)
        const missingCountries = []

        CRS_INDICIA_SOURCES.forEach((source) => {
            const countryCode = getNestedValue(kycDetails, source.path)
            if (!countryCode || selectedCodes.includes(countryCode)) return

            missingCountries.push({
                countryCode,
                sourceLabel: source.label,
            })
        })

        return missingCountries
    }, [kycDetails])

    const appendCountryToTaxResidence = useCallback((countryCode, sourceFieldName) => {
        if (!countryCode || taxResidenceCodes.includes(countryCode)) return

        if (fields.length >= MAX_COUNTRIES) {
            setShowMaxCountriesMessage(true)
            if (sourceFieldName) setValue(sourceFieldName, null)
            return
        }

        append(createCountryResidence(countryCode))
    }, [append, fields.length, setValue, taxResidenceCodes])

    const appendEmptyCountry = useCallback(() => {
        if (fields.length >= MAX_COUNTRIES) {
            setShowMaxCountriesMessage(true)
            return
        }

        append(createCountryResidence())
    }, [append, fields.length])

    const clearIndiciaError = (countryCode, key) => {
        setIndiciaErrors((currentErrors) => {
            if (!currentErrors[countryCode]?.[key]) return currentErrors

            const nextErrors = { ...currentErrors }
            delete nextErrors[countryCode]
            return nextErrors
        })
    }

    // Reacts to the radio's form value (not its onChange payload) and only acts when the answer changes
    const previousIndiciaAnswers = useRef({})
    useEffect(() => {
        indiciaQuestions.forEach(({ countryCode }) => {
            const answer = indiciaAnswers[countryCode]
            if (answer === previousIndiciaAnswers.current[countryCode]) return
            previousIndiciaAnswers.current[countryCode] = answer

            if (answer === true) {
                // no-op when the country is already in the table, so toggling never duplicates it
                clearIndiciaError(countryCode, 'answer')
                appendCountryToTaxResidence(countryCode, `indiciaAddCountry.${countryCode}`)
            }

            if (answer === false) {
                clearIndiciaError(countryCode, 'answer')
                const rowIndex = countryOfTaxResidence.findIndex(
                    (field) => field?.countryOfTaxResidenceCode === countryCode,
                )
                if (rowIndex === -1) return

                if (fields.length > 1) {
                    remove(rowIndex)
                } else {
                    setValue(`countryOfTaxResidence.${rowIndex}`, createCountryResidence())
                }
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indiciaAnswers, indiciaQuestions])

    const scrollToIndiciaSection = () => {
        requestAnimationFrame(() => indiciaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    }

    const onSubmit = (values) => {
        const missingIndiciaCountries = getMissingIndiciaCountries(values).filter(
            (country, position, list) => list.findIndex((item) => item.countryCode === country.countryCode) === position,
        )
        const isAlreadyAsked = (countryCode) => indiciaQuestions.some((question) => question.countryCode === countryCode)

        // 1. Questions already shown must be resolved before moving on
        const nextErrors = {}
        missingIndiciaCountries.filter(({ countryCode }) => isAlreadyAsked(countryCode)).forEach(({ countryCode }) => {
            const answer = values?.indiciaAddCountry?.[countryCode]
            if (answer === true) {
                nextErrors[countryCode] = { answer: 'Please add this country to the countries of tax residence, or select No.' }
            } else if (answer !== false) {
                nextErrors[countryCode] = { answer: 'Please select Yes or No.' }
            } else if (!values?.indiciaReasonCode?.[countryCode]) {
                nextErrors[countryCode] = { reason: 'Please select a reasonable explanation.' }
            }
        })
        setIndiciaErrors(nextErrors)

        if (Object.keys(nextErrors).length) {
            scrollToIndiciaSection()
            return
        }

        // 2. Ask only one new indicia question per review click
        const nextQuestion = missingIndiciaCountries.find(({ countryCode }) => !isAlreadyAsked(countryCode))
        if (nextQuestion) {
            setIndiciaQuestions((currentQuestions) => [...currentQuestions, nextQuestion])
            scrollToIndiciaSection()
            return
        }

        console.log("submitting.....")
    }

    return (
        <div
            style={{
                position: 'relative',
                height: '100dvh',
                overflow: 'hidden',
            }}
        >
            <form
                style={{
                    height: '100%',
                    overflowY: 'auto',
                    boxSizing: 'border-box',
                    paddingBottom: '200px',
                }}
                onSubmit={handleSubmit(onSubmit)}
                id="crs-self-certification-form"
            >
                <div style={{ display: "flex", flexDirection: 'column', gap: '24px' }}>
                    <TransitionGroup component={null}>
                        {fields.map((item, index) => (
                            <Collapse
                                key={item.id}
                                timeout={350}
                                mountOnEnter
                                unmountOnExit
                            >
                                <ResidencyRow
                                    index={index}
                                    control={control}
                                    setValue={setValue}
                                    rowErrors={errors?.countryOfTaxResidence?.[index]}
                                    canRemove={fields.length > 1}
                                    onRemove={remove}
                                    countries={countries}
                                    selectedCountryCodes={taxResidenceCodes}
                                />
                            </Collapse>
                        ))}
                    </TransitionGroup>
                </div>

                {indiciaQuestions.length > 0 && (
                    <div ref={indiciaSectionRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
                        {indiciaQuestions.map(({ countryCode, sourceLabel }) => (
                            <div key={countryCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <ControlledRadioGroup
                                    name={`indiciaAddCountry.${countryCode}`}
                                    control={control}
                                    option1="Yes"
                                    option2="No"
                                    error={indiciaErrors[countryCode]?.answer}
                                    label={`Do you want to add ${countryNames.get(countryCode) || countryCode} completed in the ${sourceLabel} as country of tax residence?`}
                                />

                                <Collapse in={indiciaAnswers[countryCode] === false && !taxResidenceCodes.includes(countryCode)} timeout={250} mountOnEnter unmountOnExit>
                                    <ControlledSelect
                                        name={`indiciaReasonCode.${countryCode}`}
                                        control={control}
                                        options={reasonableExplanations}
                                        label="Reasonable Explanation related to the country(ies) of Tax Residence"
                                        error={indiciaErrors[countryCode]?.reason}
                                        isEditMode={true}
                                        onChange={() => clearIndiciaError(countryCode, 'reason')}
                                    />
                                </Collapse>
                            </div>
                        ))}
                    </div>
                )}

                {fields?.length < MAX_COUNTRIES && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                        <Button variant='contained' type="button" onClick={appendEmptyCountry}>Add Country</Button>
                    </div>
                )}

                <Collapse
                    in={hasHighRiskCountryWithResidenceRights}
                    timeout={350}
                    mountOnEnter
                    unmountOnExit
                >
                    <HighRiskCountryDetails
                        control={control}
                        detailsErrors={errors?.highRiskCountryDetails}
                        countries={countries}
                        taxResidenceCodes={taxResidenceCodes}
                        showOtherJurisdictionQuestion={highRiskCountryCount < 2}
                        onCountryAdded={appendCountryToTaxResidence}
                    />
                </Collapse>

            </form>

            <div
                style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: 1,
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderTop: '1px solid #eee',
                }}
            >
                {showMaxCountriesMessage && (
                    <div style={{ color: 'red', background: '#FF7F7F', borderRadius: '8px', padding: '12px', marginBottom: '24px' }}>
                        Only five countries can be added as Country(ies) of Tax Residence
                    </div>
                )}
                <Button
                    variant="contained"
                    type="submit"
                    form="crs-self-certification-form"
                    fullWidth
                >
                    Review CRS Self certification form
                </Button>
            </div>

        </div>
    )
}

export default CRS