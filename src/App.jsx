import CRS from "./CRS/CRS"
import StateProvider from "./providers/StateProvider"

function App() {

  return (
    <StateProvider>
      <CRS />
    </StateProvider>
  )
}

export default App
