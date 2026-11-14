import { memo, useCallback, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { Collapse } from '@mui/material'
import { ControlledSelect } from '../../components/CustomSelect'
import { ControlledTextField } from '../../components/CustomTextField'
import { ControlledCheckbox } from '../../components/CustomCheckbox'
import { ControlledRadioGroup } from '../../components/CustomRadioGroup'
import reasonForNotFillingData from '../../data/reasonsForNotFilling.json'
import { HIGH_RISK_COUNTRIES } from '../../constants/constants'

const ResidencyRow = ({ index, control, setValue, rowErrors, canRemove, onRemove, countries, selectedCountryCodes }) => {
  const base = `countryOfTaxResidence.${index}`

  const notApplicabeTIN = useWatch({ control, name: `${base}.notApplicableTIN` })
  const reason = useWatch({ control, name: `${base}.reasonForNotFillingTINNumber` })
  const countryOfTaxResidenceCode = useWatch({ control, name: `${base}.countryOfTaxResidenceCode` })

  const isHighRiskCountry = HIGH_RISK_COUNTRIES.includes(countryOfTaxResidenceCode)
  const countryNames = useMemo(
    () => new Map((countries || []).map((country) => [country.value, country.name])),
    [countries],
  )
  const residenceCountry = countryNames.get(countryOfTaxResidenceCode)
  const availableCountries = useMemo(
    () => countries?.filter((country) => (
      country?.value === countryOfTaxResidenceCode || !selectedCountryCodes?.includes(country?.value)
    )) || [],
    [countries, countryOfTaxResidenceCode, selectedCountryCodes],
  )
  const handleNotApplicableTINChange = useCallback((isNotApplicable) => {
    if (isNotApplicable) {
      setValue(`${base}.taxIdentificationNumber`, '')
    }
  }, [base, setValue])
  const handleRemove = useCallback(() => onRemove(index), [index, onRemove])


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
        <span>Country {index + 1}</span>
        {canRemove && <span onClick={handleRemove}>Delete</span>}
      </div>

      <ControlledSelect
        name={`${base}.countryOfTaxResidenceCode`}
        control={control}
        options={availableCountries}
        label="Country"
        error={rowErrors?.countryOfTaxResidenceCode?.message}
        isCountry={true}
        isEditMode={true}
      />

      <ControlledTextField
        name={`${base}.taxIdentificationNumber`}
        control={control}
        label="Tax Identification number"
        isEditMode={true}
        disabled={notApplicabeTIN}
        error={rowErrors?.taxIdentificationNumber?.message}
      />

      <div style={{ display: 'flex', gap: '8px' }}>
        <ControlledCheckbox
          name={`${base}.notApplicableTIN`}
          control={control}
          onChange={handleNotApplicableTINChange}
        />
        <span>TIN is not applicable</span>

      </div>

      <Collapse in={notApplicabeTIN} timeout={250} mountOnEnter unmountOnExit>
        <ControlledSelect
          name={`${base}.reasonForNotFillingTINNumber`}
          control={control}
          isEditMode={true}
          options={reasonForNotFillingData}
          label="Reason for not filling TIN number"
          error={rowErrors?.reasonForNotFillingTINNumber?.message}
        />
      </Collapse>

      <Collapse in={reason === "B"} timeout={250} mountOnEnter unmountOnExit>
        <ControlledTextField
          name={`${base}.explanationForReasonB`}
          control={control}
          isEditMode={true}
          label="Explanation for reason B"
          error={rowErrors?.explanationForReasonB?.message}
        />
      </Collapse>


      <Collapse in={isHighRiskCountry} timeout={300} mountOnEnter unmountOnExit>
        <ControlledRadioGroup
          name={`${base}.obtainResidenceRightsUnderCitizenshipByInvestmentScheme`}
          control={control}
          option1={"Yes"}
          option2={"No"}
          error={rowErrors?.obtainResidenceRightsUnderCitizenshipByInvestmentScheme?.message}
          label={`Did you obtain residence rights in ${residenceCountry} under a Citizenship by investment/Residency by Investment scheme`}
        />
      </Collapse>
    </div>
  )
}

export default memo(ResidencyRow)
