import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { TransitionGroup } from 'react-transition-group'
import ResidencyRow from './components/ResidencyRow'
import HighRiskCountryDetails from './components/HighRiskCountryDetails'
import { Button, Collapse } from '@mui/material'
import countriesData from '../data/countries.json'
import { HIGH_RISK_COUNTRIES } from '../constants/constants'
import { createCrsSchema, yupFormResolver } from './validationSchema'
const CustomModal = lazy(() => import('../components/CustomModal'))

const EMPTY_LOCALES = {}
const EMPTY_VALUES = []
const MAX_COUNTRIES = 5
const HOLD_RESIDENCE_COUNTRY_FIELD = 'highRiskCountryDetails.holdResidenceInOtherJurisdictionCountry'

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

    const [openAddCountryModal, setOpenAddCountryModal] = useState(false);
    const [pendingCountryCode, setPendingCountryCode] = useState(null)
    const [showMaxCountriesMessage, setShowMaxCountriesMessage] = useState(false)

    // Watch only the values that affect the surrounding CRS form. Watching the
    // entire array makes every TIN keystroke re-render the form shell.
    const countryCodeNames = useMemo(
        () => fields.map((_, index) => `countryOfTaxResidence.${index}.countryOfTaxResidenceCode`),
        [fields],
    )
    const residenceRightsNames = useMemo(
        () => fields.map((_, index) => (
            `countryOfTaxResidence.${index}.obtainResidenceRightsUnderCitizenshipByInvestmentScheme`
        )),
        [fields],
    )
    const countryCodes = useWatch({ control, name: countryCodeNames })
    const residenceRights = useWatch({ control, name: residenceRightsNames })
    const taxResidenceCodeKey = (countryCodes || EMPTY_VALUES).filter(Boolean).join('|')
    const taxResidenceCodes = useMemo(
        () => (taxResidenceCodeKey ? taxResidenceCodeKey.split('|') : []),
        [taxResidenceCodeKey],
    )
    const highRiskCountryCount = useMemo(
        () => (countryCodes || EMPTY_VALUES).filter((code) => HIGH_RISK_COUNTRIES.includes(code)).length,
        [countryCodes],
    )
    const hasHighRiskCountryWithResidenceRights = useMemo(
        () => (countryCodes || EMPTY_VALUES).some((code, index) => (
            HIGH_RISK_COUNTRIES.includes(code) && (residenceRights || EMPTY_VALUES)[index] === true
        )),
        [countryCodes, residenceRights],
    )

    const appendCountryToTaxResidence = useCallback((countryCode, sourceFieldName) => {
        if (!countryCode || taxResidenceCodes.includes(countryCode)) return

        if (fields.length >= MAX_COUNTRIES) {
            setShowMaxCountriesMessage(true)
            if (sourceFieldName) setValue(sourceFieldName, null)
            return
        }

        append(createCountryResidence(countryCode))
    }, [append, fields.length, setValue, taxResidenceCodes])

    const requestCountryAddition = useCallback((countryCode) => {
        if (!countryCode || taxResidenceCodes.includes(countryCode)) return

        setPendingCountryCode(countryCode)
        setOpenAddCountryModal(true)
    }, [taxResidenceCodes])

    const clearPendingCountry = useCallback(() => {
        setValue(HOLD_RESIDENCE_COUNTRY_FIELD, null)
        setPendingCountryCode(null)
        setOpenAddCountryModal(false)
    }, [setValue])

    const addPendingCountry = useCallback(() => {
        if (!pendingCountryCode) {
            setOpenAddCountryModal(false)
            return
        }

        appendCountryToTaxResidence(pendingCountryCode, HOLD_RESIDENCE_COUNTRY_FIELD)
        setPendingCountryCode(null)
        setOpenAddCountryModal(false)
    }, [appendCountryToTaxResidence, pendingCountryCode])

    const appendEmptyCountry = useCallback(() => {
        if (fields.length >= MAX_COUNTRIES) {
            setShowMaxCountriesMessage(true)
            return
        }

        append(createCountryResidence())
    }, [append, fields.length])

    const countryNames = useMemo(
        () => new Map(countries.map((country) => [country.value, country.name])),
        [countries],
    )
    const residencyRows = useMemo(() => fields.map((item, index) => (
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
    )), [control, countries, errors, fields, remove, setValue, taxResidenceCodes])

    const onSubmit = useCallback(() => {}, [])

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
                        {residencyRows}
                    </TransitionGroup>
                </div>

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
                        onCountrySelected={requestCountryAddition}
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

            {openAddCountryModal && (
                <Suspense fallback={null}>
                    <CustomModal
                        open
                        onClose={clearPendingCountry}
                        content={`Do you want to add ${countryNames.get(pendingCountryCode) || pendingCountryCode || 'this'} Country as Country of Tax Residence ?`}
                        cancelButtonText="No"
                        actionButtonText="Yes"
                        onCancelClick={clearPendingCountry}
                        onActionClick={addPendingCountry}
                    />
                </Suspense>
            )}
        </div>
    )
}

export default CRS
