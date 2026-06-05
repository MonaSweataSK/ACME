import { useState } from "react";
import { User, ShieldAlert, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Dropdown } from "../components/ui/Dropdown";
import { Spinner } from "../components/ui/Spinner";

export function DesignSystem() {
  const [dropdownValue, setDropdownValue] = useState("");

  const dropdownOptions = [
    { value: "hr", label: "Human Resources", icon: <User size={16} /> },
    { value: "finance", label: "Finance & Payroll", icon: <CreditCard size={16} /> },
    { value: "security", label: "Security", icon: <ShieldAlert size={16} /> },
  ];

  return (
    <div className="space-y-16 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">Design System UI Kit</h1>
        <p className="text-slate-400">Development Environment Testing Ground</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-slate-800 pb-2">Buttons</h2>
        <div className="flex flex-wrap items-end gap-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Primary</p>
            <Button variant="primary">Submit Revision</Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Secondary</p>
            <Button variant="secondary">Cancel</Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Danger</p>
            <Button variant="danger">Deactivate</Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Loading State</p>
            <Button variant="primary" loading>Processing</Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Sizes</p>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">Small</Button>
              <Button variant="secondary" size="md">Medium</Button>
              <Button variant="secondary" size="lg">Large</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-slate-800 pb-2">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Standard Text</p>
            <Input placeholder="Enter employee name..." leftIcon={<User size={16} />} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Password with Toggle</p>
            <Input type="password" placeholder="Enter secure pin..." />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Validation Error</p>
            <Input placeholder="user@acme.com" error="Invalid email format" />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-slate-800 pb-2">Searchable Dropdown</h2>
        <div className="max-w-xs space-y-2">
           <p className="text-sm text-slate-400">With Icons & Search</p>
           <Dropdown
             options={dropdownOptions}
             value={dropdownValue}
             onChange={setDropdownValue}
             placeholder="Assign Department"
           />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-slate-800 pb-2">Toasts & Feedback</h2>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => toast.success("Salary revision saved successfully!", { position: 'top-right' })}>
            Success (Top Right)
          </Button>
          <Button variant="secondary" onClick={() => toast.error("Validation failed.", { position: 'top-center' })}>
            Error (Top Center)
          </Button>
          <Button variant="secondary" onClick={() => toast.info("System maintenance.", { position: 'bottom-right' })}>
            Info (Bottom Right)
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-slate-800 pb-2">Spinners</h2>
        <div className="flex items-center gap-6 p-4 rounded-lg bg-slate-900 border border-slate-800 w-fit">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="small" className="text-slate-400" />
            <span className="text-xs text-slate-500">Small</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="medium" className="text-indigo-400" />
            <span className="text-xs text-slate-500">Medium</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="large" className="text-violet-500" />
            <span className="text-xs text-slate-500">Large</span>
          </div>
        </div>
      </section>
    </div>
  );
}
