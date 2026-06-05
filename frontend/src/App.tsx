import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { DesignSystem } from "./pages/DesignSystem";
import { Employees } from "./pages/Employees";
import { EmployeeDetail } from "./pages/EmployeeDetail";

// Temporary component placeholders for routing
const DashboardPlaceholder = () => <div className="text-2xl font-bold text-slate-100">Dashboard (Placeholder)</div>;

function App() {
  const isDev = import.meta.env.DEV;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPlaceholder />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/employees/:id/edit" element={<EmployeeDetail />} />
          {isDev && <Route path="/design-system" element={<DesignSystem />} />}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
