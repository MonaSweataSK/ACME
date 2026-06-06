import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Building, MapPin, Calendar, Mail, CheckCircle2, XCircle, Briefcase, Pencil } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmployeeEditModal } from '../components/EmployeeEditModal';
import { cn } from '../lib/utils';

interface SalaryRecord {
  id: string;
  effectiveDate: string;
  baseSalary: number;
  bonus: number;
  allowances: number;
  totalCtc: number;
  currencyCode: string;
  reason: string;
  isActive: boolean;
}

interface EmployeeDetailData {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  joinDate: string;
  department: { id: string; name: string };
  designation: { id: string; name: string };
  country: { id: string; name: string; currency_code: string };
  salaryHistory: SalaryRecord[];
}

export function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const { data: employee, isLoading, isError } = useQuery<EmployeeDetailData>({
    queryKey: ['employee', id],
    queryFn: () => api.get(`/employees/${id}`),
    enabled: !!id,
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="large" className="text-indigo-500" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-400">Employee Not Found</h2>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/employees')}>
          Return to Directory
        </Button>
      </div>
    );
  }

  const activeSalary = employee.salaryHistory.find(s => s.isActive);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={() => navigate('/employees')} className="h-9 w-9 p-0">
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            {employee.firstName} {employee.lastName}
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium border",
              employee.status === 'ACTIVE' 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              {employee.status}
            </span>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setIsEditing(true)} 
              className="ml-2 h-7 px-2 gap-1.5"
            >
              <Pencil size={12} />
              Edit
            </Button>
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">{employee.employeeCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Profile Overview Card */}
          <div className="bg-[#09090b]/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <User size={18} className="text-indigo-400" />
              Profile Details
            </h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email Address</p>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail size={14} className="text-slate-500" />
                  {employee.email.toLowerCase()}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Join Date</p>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar size={14} className="text-slate-500" />
                  {formatDate(employee.joinDate)}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Department</p>
                <div className="flex items-center gap-2 text-slate-300">
                  <Building size={14} className="text-slate-500" />
                  {employee.department.name}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Designation</p>
                <div className="flex items-center gap-2 text-slate-300">
                  <Briefcase size={14} className="text-slate-500" />
                  {employee.designation.name}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Location</p>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={14} className="text-slate-500" />
                  {employee.country.name}
                </div>
              </div>
            </div>
          </div>

          {/* Salary History Card */}
          <div className="bg-[#09090b]/50 backdrop-blur-sm border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-slate-200">Compensation History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Effective Date</th>
                    <th className="px-6 py-3 font-medium">Reason</th>
                    <th className="px-6 py-3 font-medium text-right">Base</th>
                    <th className="px-6 py-3 font-medium text-right">Bonus + Alw</th>
                    <th className="px-6 py-3 font-medium text-right">Total CTC</th>
                    <th className="px-6 py-3 font-medium text-center">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {employee.salaryHistory.map((record) => (
                    <tr key={record.id} className={cn("hover:bg-slate-800/20", record.isActive ? "bg-indigo-950/10" : "")}>
                      <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                        {formatDate(record.effectiveDate)}
                      </td>
                      <td className="px-6 py-4">
                        {record.reason}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatCurrency(record.baseSalary, record.currencyCode)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatCurrency(record.bonus + record.allowances, record.currencyCode)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-200">
                        {formatCurrency(record.totalCtc, record.currencyCode)}
                      </td>
                      <td className="px-6 py-4 flex justify-center">
                        {record.isActive ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="text-slate-600" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Current Compensation Snapshot Sidebar */}
        <div className="col-span-1 space-y-6">
          <div className="bg-gradient-to-b from-indigo-950/40 to-[#09090b]/50 backdrop-blur-sm border border-indigo-500/20 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-6">Current Compensation</h3>
            
            {activeSalary ? (
              <div className="space-y-6">
                <div>
                  <p className="text-3xl font-bold text-slate-100 mb-1">
                    {formatCurrency(activeSalary.totalCtc, activeSalary.currencyCode)}
                  </p>
                  <p className="text-xs text-slate-400">Total Annual CTC</p>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Base Salary</span>
                    <span className="font-medium text-slate-200">{formatCurrency(activeSalary.baseSalary, activeSalary.currencyCode)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Target Bonus</span>
                    <span className="font-medium text-slate-200">{formatCurrency(activeSalary.bonus, activeSalary.currencyCode)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Allowances</span>
                    <span className="font-medium text-slate-200">{formatCurrency(activeSalary.allowances, activeSalary.currencyCode)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic">No active salary record found.</div>
            )}
          </div>
        </div>
      </div>

      <EmployeeEditModal 
        employeeId={isEditing ? id || null : null} 
        onClose={() => setIsEditing(false)} 
      />
    </div>
  );
}
