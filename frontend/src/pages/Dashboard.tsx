import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, DollarSign, TrendingUp, Activity, Download } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell 
} from 'recharts';
import { api } from '../lib/api';
import { Dropdown } from '../components/ui/Dropdown';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { cn } from '../lib/utils';

interface AnalyticsData {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    totalPayrollUSD: number;
    averageSalaryUSD: number;
    medianSalaryUSD: number;
  };
  departmentDistribution: {
    departmentName: string;
    headcount: number;
    averageSalaryUSD: number;
    minSalaryUSD: number;
    maxSalaryUSD: number;
    totalPayrollUSD: number;
  }[];
  countryDistribution: {
    countryName: string;
    headcount: number;
    averageSalaryUSD: number;
    totalPayrollUSD: number;
  }[];
  salaryBands: {
    range: string;
    employeeCount: number;
  }[];
  recentRevisions: {
    employeeCode: string;
    name: string;
    effectiveDate: string;
    totalCtcUSD: number;
    reason: string;
  }[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

export function Dashboard() {
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [countryId, setCountryId] = useState('');

  // Fetch metadata for filters
  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get<{id: string, name: string}[]>('/metadata/departments')
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => api.get<{id: string, name: string}[]>('/metadata/countries')
  });

  // Fetch analytics
  const { data, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ['analytics', departmentId, status, countryId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (departmentId) params.append('departmentId', departmentId);
      if (status) params.append('status', status);
      if (countryId) params.append('countryId', countryId);
      return api.get(`/analytics?${params.toString()}`);
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard',
    }).format(amount);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (departmentId) params.append('departmentId', departmentId);
      if (status) params.append('status', status);
      if (countryId) params.append('countryId', countryId);
      
      const blob = await api.get<Blob>(`/analytics/export?${params.toString()}`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Analytics Overview</h1>
          <p className="text-sm text-slate-400">High-level insights into your workforce and compensation.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-40">
            <Dropdown
              placeholder="All Departments"
              value={departmentId}
              onChange={setDepartmentId}
              options={[{ value: '', label: 'All Departments' }, ...(depts?.map(d => ({ value: d.id, label: d.name })) || [])]}
            />
          </div>
          <div className="w-36">
            <Dropdown
              placeholder="All Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: '', label: 'All Status' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' }
              ]}
            />
          </div>
          <div className="w-40">
            <Dropdown
              placeholder="All Countries"
              value={countryId}
              onChange={setCountryId}
              options={[{ value: '', label: 'All Countries' }, ...(countries?.map(c => ({ value: c.id, label: c.name })) || [])]}
            />
          </div>
          <Button variant="secondary" className="gap-2" onClick={handleExport}>
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="large" className="text-indigo-500" />
        </div>
      ) : isError || !data ? (
        <div className="p-12 text-center text-red-400 border border-red-500/20 bg-red-500/5 rounded-lg">
          Failed to load analytics data.
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#09090b]/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total Employees</p>
                  <h3 className="text-3xl font-bold text-slate-100 mt-1">{data.summary.totalEmployees}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Users size={20} />
                </div>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="text-emerald-400 font-medium bg-emerald-400/10 px-1.5 py-0.5 rounded">
                  {data.summary.activeEmployees} Active
                </span>
                <span>/ {data.summary.inactiveEmployees} Inactive</span>
              </div>
            </div>

            <div className="bg-[#09090b]/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total Payroll</p>
                  <h3 className="text-3xl font-bold text-slate-100 mt-1">{formatCurrency(data.summary.totalPayrollUSD)}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Annualized USD equivalence
              </div>
            </div>

            <div className="bg-[#09090b]/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Average Salary</p>
                  <h3 className="text-3xl font-bold text-slate-100 mt-1">{formatCurrency(data.summary.averageSalaryUSD)}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Across all selected roles
              </div>
            </div>

            <div className="bg-[#09090b]/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Median Salary</p>
                  <h3 className="text-3xl font-bold text-slate-100 mt-1">{formatCurrency(data.summary.medianSalaryUSD)}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Activity size={20} />
                </div>
              </div>
              <div className="text-xs text-slate-500">
                P50 USD equivalence
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#09090b]/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-slate-200 mb-6">Department Headcount & Payroll</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="departmentName" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                    <RechartsTooltip 
                      cursor={{ fill: '#1e293b' }}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar yAxisId="left" dataKey="headcount" name="Headcount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="averageSalaryUSD" name="Avg Salary" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#09090b]/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-slate-200 mb-6">Geographic Distribution</h3>
              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.countryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="headcount"
                      nameKey="countryName"
                    >
                      {data.countryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {data.countryDistribution.map((c, i) => (
                  <div key={c.countryName} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {c.countryName} ({c.headcount})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#09090b]/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-slate-200 mb-6">Salary Distribution Bands (USD)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.salaryBands} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="range" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      cursor={{ fill: '#1e293b' }}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Bar dataKey="employeeCount" name="Employees" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#09090b]/50 border border-slate-800 rounded-xl flex flex-col overflow-hidden backdrop-blur-sm">
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-base font-semibold text-slate-200">Recent Revisions</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {data.recentRevisions.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">No recent revisions found.</div>
                ) : (
                  <div className="space-y-1">
                    {data.recentRevisions.map((rev, i) => (
                      <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-800/30 rounded-lg transition-colors">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{rev.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 font-mono">{rev.employeeCode}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{rev.reason}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">{formatCurrency(rev.totalCtcUSD)}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(rev.effectiveDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
