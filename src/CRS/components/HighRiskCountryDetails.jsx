import { memo, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { ControlledRadioGroup } from '../../components/CustomRadioGroup'
import { ControlledSelect } from '../../components/CustomSelect'
import { Collapse } from '@mui/material'
import reasonableExplanations from '../../data/reasonableExplanations.json'

const HighRiskCountryDetails = ({ control, detailsErrors = {}, countries, taxResidenceCodes, showOtherJurisdictionQuestion, onCountryAdded }) => {
  const holdResidenceInOtherJurisdiction = useWatch({
    control,
    name: 'highRiskCountryDetails.holdResidenceInOtherJurisdiction',
  })
  const spentNinetyDaysInOtherJurisdictionCountryPreviousYear = useWatch({
    control,
    name: 'highRiskCountryDetails.spentNinetyDaysInOtherJurisdictionCountryPreviousYear',
  })
  const spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry = useWatch({
    control,
    name: 'highRiskCountryDetails.spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry',
  })
  const countryOfTaxResidencespentNinetyDays = useWatch({
    control,
    name: 'highRiskCountryDetails.countryOfTaxResidencespentNinetyDays',
  })
  const filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry = useWatch({
    control,
    name: 'highRiskCountryDetails.filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry',
  })
  const countryOfTaxResidencePersonalIncomeTax = useWatch({
    control,
    name: 'highRiskCountryDetails.countryOfTaxResidencePersonalIncomeTax',
  })

  const countryNames = useMemo(
    () => new Map((countries || []).map((country) => [country.value, country.name])),
    [countries],
  )
  const isTaxResidenceCountry = (countryCode) => taxResidenceCodes.includes(countryCode)
  const countryName = (countryCode) => countryNames.get(countryCode) || countryCode

  const handleHoldResidenceCountryChange = (countryCode) => {
    onCountryAdded(countryCode)
  }

  const handleSpentNinetyDaysAddChange = (answer) => {
    if (answer === true) {
      onCountryAdded(spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry)
    }
  }

  const handleIncomeTaxAddChange = (answer) => {
    if (answer === true) {
      onCountryAdded(filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
      {showOtherJurisdictionQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ControlledRadioGroup
            name="highRiskCountryDetails.holdResidenceInOtherJurisdiction"
            control={control}
            option1="Yes"
            option2="No"
            error={detailsErrors?.holdResidenceInOtherJurisdiction?.message}
            label="Do you hold residence rights in any other jurisdiction(s)?"
          />

          <Collapse in={holdResidenceInOtherJurisdiction === true} timeout={250} mountOnEnter unmountOnExit>
            <ControlledSelect
              name="highRiskCountryDetails.holdResidenceInOtherJurisdictionCountry"
              control={control}
              options={countries || []}
              label="Please specify the country"
              error={detailsErrors?.holdResidenceInOtherJurisdictionCountry?.message}
              isCountry={true}
              isEditMode={true}
              onChange={handleHoldResidenceCountryChange}
            />
          </Collapse>
        </div>
      )}

      <ControlledRadioGroup
        name="highRiskCountryDetails.spentNinetyDaysInOtherJurisdictionCountryPreviousYear"
        control={control}
        option1="Yes"
        option2="No"
        error={detailsErrors?.spentNinetyDaysInOtherJurisdictionCountryPreviousYear?.message}
        label="Have you spent more than 90 days in any other jurisdiction(s) during the previous year?"
      />

      <Collapse in={spentNinetyDaysInOtherJurisdictionCountryPreviousYear === true} timeout={250} mountOnEnter unmountOnExit>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ControlledSelect
            name="highRiskCountryDetails.spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry"
            control={control}
            options={countries || []}
            label="Please specify the country"
            error={detailsErrors?.spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry?.message}
            isCountry={true}
            isEditMode={true}
          />

          <Collapse
            in={!isTaxResidenceCountry(spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry) &&
              !!spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry}
            timeout={300}
            mountOnEnter
            unmountOnExit
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ControlledRadioGroup
                  name="highRiskCountryDetails.countryOfTaxResidencespentNinetyDays"
                  control={control}
                  option1="Yes"
                  option2="No"
                  error={detailsErrors?.countryOfTaxResidencespentNinetyDays?.message}
                  label={`Do you want to add ${countryName(spentNinetyDaysInOtherJurisdictionCountryPreviousYearCountry)} as country of tax residence?`}
                  onChange={handleSpentNinetyDaysAddChange}
                />

                <Collapse in={countryOfTaxResidencespentNinetyDays === false} timeout={250} mountOnEnter unmountOnExit>
                  <ControlledSelect
                    name="highRiskCountryDetails.ninetyDaysReasonCode"
                    control={control}
                    options={reasonableExplanations}
                    label="Account Holder Reasonable Explanation related to the country(ies) of Tax Residence"
                    error={detailsErrors?.ninetyDaysReasonCode?.message}
                    isEditMode={true}
                  />
                </Collapse>
            </div>
          </Collapse>
        </div>
      </Collapse>

      <ControlledSelect
        name="highRiskCountryDetails.filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry"
        control={control}
        options={countries || []}
        label="In which jurisdiction(s) have you filled personal income tax returns during the previous year?"
        error={detailsErrors?.filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry?.message}
        isCountry={true}
        isEditMode={true}
      />

      <Collapse
        in={!isTaxResidenceCountry(filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry) &&
          !!filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry}
        timeout={300}
        mountOnEnter
        unmountOnExit
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ControlledRadioGroup
              name="highRiskCountryDetails.countryOfTaxResidencePersonalIncomeTax"
              control={control}
              option1="Yes"
              option2="No"
              error={detailsErrors?.countryOfTaxResidencePersonalIncomeTax?.message}
              label={`Do you want to add ${countryName(filledPersonalIncomeTaxInOtherJurisdictionCountryPreviousYearCountry)} as country of tax residence?`}
              onChange={handleIncomeTaxAddChange}
            />

            <Collapse in={countryOfTaxResidencePersonalIncomeTax === false} timeout={250} mountOnEnter unmountOnExit>
              <ControlledSelect
                name="highRiskCountryDetails.incomeTaxReasonCode"
                control={control}
                options={reasonableExplanations}
                label="Account Holder Reasonable Explanation related to the country(ies) of Tax Residence"
                error={detailsErrors?.incomeTaxReasonCode?.message}
                isEditMode={true}
              />
            </Collapse>
        </div>
      </Collapse>
    </div>
  )
}

export default memo(HighRiskCountryDetails)
