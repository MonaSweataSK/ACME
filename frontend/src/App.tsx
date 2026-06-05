import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";

// Temporary component placeholders for routing
const DashboardPlaceholder = () => <div className="text-2xl font-bold">Dashboard (Placeholder)</div>;
const EmployeesPlaceholder = () => <div className="text-2xl font-bold">Employee Directory (Placeholder)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPlaceholder />} />
          <Route path="/employees" element={<EmployeesPlaceholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
