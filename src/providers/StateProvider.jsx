import { useMemo, useState } from "react";
import { StateContext } from "./StateContext";

const StateProvider = ({ children }) => {
    const [kycDetails, setKycDetails] = useState({
        personalInformation: {
            personalDetails: {
                countryOfResidency: "AE",
                nationality: "AE"
            }
        },
        employmentDetails: {
            country: "AE"
        },
        residenceDetails: {
            residenceAddress: {
                country: "AE"
            }
        }
    })
    const value = useMemo(() => ({ kycDetails, setKycDetails }), [kycDetails])

    return (
        <StateContext.Provider value={value}>
            {children}
        </StateContext.Provider>
    )
}

export default StateProvider
