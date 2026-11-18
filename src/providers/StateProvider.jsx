import { createContext, useContext, useState } from "react";

export const StateContext = createContext(null)

export const useStore = () => useContext(StateContext)


const StateProvider = ({ children }) => {
    const [kycDetails, setKycDetails] = useState({
        personalInformation: {
            personalDetails: {
                countryOfResidency: "AE",
                nationality: "AE"
            }
        },
        employmentDetails: {
            country: "IN"
        },
        residenceDetails: {
            residenceAddress: {
                country: "SL"
            }
        }
    })
    return (
        <StateContext.Provider value={{ kycDetails, setKycDetails }}>
            {children}
        </StateContext.Provider>
    )
}

export default StateProvider