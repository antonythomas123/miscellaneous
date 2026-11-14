import { createContext, useContext } from "react";

export const StateContext = createContext(null)

export const useStore = () => useContext(StateContext)
