import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { DesignSystem } from "./pages/DesignSystem";
import { Employees } from "./pages/Employees";
import { EmployeeDetail } from "./pages/EmployeeDetail";

function App() {
  const isDev = import.meta.env.DEV;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          {isDev && <Route path="/design-system" element={<DesignSystem />} />}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
