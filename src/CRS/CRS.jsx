import React, { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import ResidencyRow from './components/ResidencyRow'
import HighRiskCountryDetails from './components/HighRiskCountryDetails'
import CRSIndiciaDetails from './components/CRSIndiciaDetails'
import { Button } from '@mui/material'
import countriesData from '../data/countries.json'
import { HIGH_RISK_COUNTRIES } from '../constants/constants'
import { useStore } from '../providers/StateProvider'
import { crsSchema, yupFormResolver } from './validationSchema'



const CRS = () => {
    const initialState = {
        countryOfTaxResidenceCode: '',
        notApplicableTIN: false,
        taxIdentificationNumber: '',
        explanationForReasonB: '',
        hasHighRiskCountries: false,
        reasonForNotFillingTINNumber: '',
        obtainResidenceRightsUnderCitizenshipByInvestmentScheme: null,
        incomeJurisdiction: null,
    }

    const { kycDetails } = useStore()

    const { control, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            countryOfTaxResidence: [initialState],
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
            indiciaCheck: {
                countryOfResidency: {
                    addCountryAsTaxResidence: null,
                    reasonableExplanation: null,
                },
                residentialAddressCountry: {
                    addCountryAsTaxResidence: null,
                    reasonableExplanation: null,
                },
                employmentDetailsCountry: {
                    addCountryAsTaxResidence: null,
                    reasonableExplanation: null,
                },
            },
        },
        shouldUnregister: true,
        mode: "onChange",
        resolver: yupFormResolver(crsSchema),
    })

    const { fields, append, remove, } = useFieldArray({
        control,
        name: "countryOfTaxResidence"
    })

    const [countries, setCountries] = useState(countriesData || [])
    const [hasReviewedCRS, setHasReviewedCRS] = useState(false)
    const countryOfTaxResidence = useWatch({ control, name: 'countryOfTaxResidence' }) || []
    const taxResidenceCodes = countryOfTaxResidence.map((field) => field?.countryOfTaxResidenceCode).filter(Boolean)
    const highRiskCountryFields = countryOfTaxResidence.filter((field) => HIGH_RISK_COUNTRIES.includes(field?.countryOfTaxResidenceCode))
    const hasHighRiskCountryWithResidenceRights = highRiskCountryFields.some(
        (field) => field.obtainResidenceRightsUnderCitizenshipByInvestmentScheme === true
    )

    const appendCountryToTaxResidence = (countryCode) => {
        if (!countryCode || taxResidenceCodes.includes(countryCode)) return

        append({
            ...initialState,
            countryOfTaxResidenceCode: countryCode,
        })
    }

    const crsIndicia = [
        {
            key: 'countryOfResidency',
            countryCode: kycDetails?.personalInformation?.personalDetails?.countryOfResidency,
            fieldName: 'Country of Residency in Personal details',
        },
        {
            key: 'residentialAddressCountry',
            countryCode: kycDetails?.residenceDetails?.residenceAddress?.country,
            fieldName: 'Country in Residential Address',
        },
        {
            key: 'employmentDetailsCountry',
            countryCode: kycDetails?.employmentDetails?.country,
            fieldName: 'Country in Employment details',
        },
    ]

    const onSubmit = () => {
        console.log("submitting.....")
        const hasMissingIndicia = crsIndicia.some((item) => (
            item.countryCode && !taxResidenceCodes.includes(item.countryCode)
        ))

        setValue('hasCRSIndicia', hasMissingIndicia)
        setHasReviewedCRS(true)
    }

    console.log({kycDetails})
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
                    paddingBottom: '112px',
                }}
                onSubmit={handleSubmit(onSubmit)}
                id="crs-self-certification-form"
            >
                <div style={{ display: "flex", flexDirection: 'column', gap: '24px' }}>
                    {fields.map((item, index) => (
                        <ResidencyRow
                            key={item.id}
                            index={index}
                            control={control}
                            errors={errors}
                            canRemove={fields.length > 1}
                            onRemove={() => remove(index)}
                            fields={fields}
                            countries={countries || []}
                            selectedCountryCodes={taxResidenceCodes}
                        />
                    ))}
                </div>

                {fields?.length < 5 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                        <Button variant='contained' type="button" onClick={() => append(initialState)}>Add Country</Button>
                    </div>
                )}

                {hasHighRiskCountryWithResidenceRights && (
                    <HighRiskCountryDetails
                        control={control}
                        errors={errors}
                        countries={countries || []}
                        taxResidenceCodes={taxResidenceCodes}
                        showOtherJurisdictionQuestion={highRiskCountryFields.length < 2}
                        onCountryAdded={appendCountryToTaxResidence}
                    />
                )}

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
