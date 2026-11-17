import { useCallback, useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { TransitionGroup } from 'react-transition-group'
import ResidencyRow from './components/ResidencyRow'
import HighRiskCountryDetails from './components/HighRiskCountryDetails'
import { Button, Collapse } from '@mui/material'
import CustomModal from '../components/CustomModal'
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
    const [indiciaQuestionQueue, setIndiciaQuestionQueue] = useState([])
    const [activeIndiciaQuestion, setActiveIndiciaQuestion] = useState(null)
    const [indiciaDecisions, setIndiciaDecisions] = useState({})
    const [indiciaExplanationRequirements, setIndiciaExplanationRequirements] = useState([])
    const [indiciaExplanations, setIndiciaExplanations] = useState({})
    const [indiciaExplanationErrors, setIndiciaExplanationErrors] = useState({})

    const countryOfTaxResidence = useWatch({ control, name: 'countryOfTaxResidence' }) || []
    const taxResidenceCodeKey = countryOfTaxResidence
        .map((field) => field?.countryOfTaxResidenceCode)
        .filter(Boolean)
        .join('|')
    const taxResidenceCodes = useMemo(
        () => (taxResidenceCodeKey ? taxResidenceCodeKey.split('|') : []),
        [taxResidenceCodeKey],
    )
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

    const onSubmit = (values) => {
        const missingIndiciaCountries = getMissingIndiciaCountries(values)
        const unansweredIndiciaCountries = missingIndiciaCountries.filter(
            ({ countryCode }) => indiciaDecisions[countryCode] === undefined,
        )

        if (unansweredIndiciaCountries.length) {
            setIndiciaQuestionQueue(unansweredIndiciaCountries)
            setActiveIndiciaQuestion(unansweredIndiciaCountries[0])
            return
        }

        const missingExplanations = indiciaExplanationRequirements.reduce((errorsForCountries, requirement) => {
            if (!indiciaExplanations[requirement.countryCode]) {
                errorsForCountries[requirement.countryCode] = 'Please select a reasonable explanation.'
            }
            return errorsForCountries
        }, {})

        if (Object.keys(missingExplanations).length) {
            setIndiciaExplanationErrors(missingExplanations)
            return
        }

        console.log("submitting.....")
    }

    const handleIndiciaAnswer = (answer) => {
        if (!activeIndiciaQuestion) return

        if (answer === true && fields.length >= MAX_COUNTRIES) {
            setShowMaxCountriesMessage(true)
            const remainingQuestions = indiciaQuestionQueue
                .slice(1)
                .filter(({ countryCode }) => countryCode !== activeIndiciaQuestion.countryCode)
            setIndiciaQuestionQueue(remainingQuestions)
            setActiveIndiciaQuestion(remainingQuestions[0] || null)
            return
        }

        const { countryCode } = activeIndiciaQuestion
        setIndiciaDecisions((currentDecisions) => ({
            ...currentDecisions,
            [countryCode]: answer,
        }))

        if (answer === true) {
            appendCountryToTaxResidence(countryCode)
        }

        if (answer === false) {
            setIndiciaExplanationRequirements((currentRequirements) => (
                currentRequirements.some((requirement) => requirement.countryCode === countryCode)
                    ? currentRequirements
                    : [...currentRequirements, activeIndiciaQuestion]
            ))
        }

        const remainingQuestions = indiciaQuestionQueue
            .slice(1)
            .filter(({ countryCode: queuedCountryCode }) => queuedCountryCode !== countryCode)
        setIndiciaQuestionQueue(remainingQuestions)
        setActiveIndiciaQuestion(remainingQuestions[0] || null)
    }

    const handleIndiciaExplanationChange = (countryCode, value) => {
        setIndiciaExplanations((currentExplanations) => ({
            ...currentExplanations,
            [countryCode]: value,
        }))
        setIndiciaExplanationErrors((currentErrors) => {
            if (!currentErrors[countryCode]) return currentErrors

            const nextErrors = { ...currentErrors }
            delete nextErrors[countryCode]
            return nextErrors
        })
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

                {indiciaExplanationRequirements.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                        {indiciaExplanationRequirements.map((requirement) => (
                            <ControlledSelect
                                key={requirement.countryCode}
                                name={`indiciaReasonCode.${requirement.countryCode}`}
                                control={control}
                                options={reasonableExplanations}
                                label={`Reasonable Explanation related to the country(ies) of Tax Residence (${countryNames.get(requirement.countryCode) || requirement.countryCode})`}
                                error={indiciaExplanationErrors[requirement.countryCode]}
                                isEditMode={true}
                                onChange={(value) => handleIndiciaExplanationChange(requirement.countryCode, value)}
                            />
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

            <CustomModal
                open={!!activeIndiciaQuestion}
                onClose={() => {}}
                title="CRS Indicia"
                content={activeIndiciaQuestion
                    ? `Do you want to add ${countryNames.get(activeIndiciaQuestion.countryCode) || activeIndiciaQuestion.countryCode} completed in the ${activeIndiciaQuestion.sourceLabel} as country of tax residence?`
                    : ''}
                cancelButtonText="No"
                actionButtonText="Yes"
                onCancelClick={() => handleIndiciaAnswer(false)}
                onActionClick={() => handleIndiciaAnswer(true)}
            />

        </div>
    )
}

export default CRS
