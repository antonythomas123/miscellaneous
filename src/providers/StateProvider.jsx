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
            country: "IN",
            workTelephoneCode: "971"
        },
        residenceDetails: {
            residenceAddress: {
                country: "SL",
                mobileCode1: "971",
                mobileCode2: "971"
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