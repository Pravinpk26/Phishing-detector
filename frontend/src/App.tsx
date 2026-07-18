import Dashboard from "./pages/Dashboard";
import { ScanProvider } from "./context/ScanContext";

function App() {

    return (

        <ScanProvider>

            <Dashboard />

        </ScanProvider>

    );

}

export default App;