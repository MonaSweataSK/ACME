import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Dropdown } from '../components/ui/Dropdown';
import { Spinner } from '../components/ui/Spinner';
import { cn } from '../lib/utils';

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  department: string;
  designation: string;
  currentSalary: {
    totalCtc: number;
    currencyCode: string;
  } | null;
}

interface EmployeesResponse {
  data: Employee[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function Employees() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [status, setStatus] = useState('');
  const [countryId, setCountryId] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setDesignationId('');
  }, [departmentId]);

  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get<{id: string, name: string}[]>('/metadata/departments')
  });

  const { data: desigs } = useQuery({
    queryKey: ['designations', departmentId],
    queryFn: () => api.get<{id: string, name: string}[]>(`/metadata/designations${departmentId ? `?departmentId=${departmentId}` : ''}`)
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => api.get<{id: string, name: string}[]>('/metadata/countries')
  });

  const { data, isLoading, isError, isFetching } = useQuery<EmployeesResponse>({
    queryKey: ['employees', page, debouncedSearch, departmentId, designationId, status, countryId],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (departmentId) params.append('departmentId', departmentId);
      if (designationId) params.append('designationId', designationId);
      if (status) params.append('status', status);
      if (countryId) params.append('countryId', countryId);
      
      return api.get(`/employees?${params.toString()}`);
    }
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Employee Directory</h1>
          <p className="text-sm text-slate-400">Manage your workforce and compensation.</p>
        </div>
        
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search name, email, or code..."
            leftIcon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
        <div className="w-48">
          <Dropdown
            placeholder="All Departments"
            value={departmentId}
            onChange={(val) => { setDepartmentId(val); setPage(1); }}
            options={[{ value: '', label: 'All Departments' }, ...(depts?.map(d => ({ value: d.id, label: d.name })) || [])]}
          />
        </div>
        <div className="w-48">
          <Dropdown
            placeholder="All Designations"
            value={designationId}
            onChange={(val) => { setDesignationId(val); setPage(1); }}
            options={[{ value: '', label: 'All Designations' }, ...(desigs?.map(d => ({ value: d.id, label: d.name })) || [])]}
          />
        </div>
        <div className="w-40">
          <Dropdown
            placeholder="All Status"
            value={status}
            onChange={(val) => { setStatus(val); setPage(1); }}
            options={[
              { value: '', label: 'All Status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' }
            ]}
          />
        </div>
        <div className="w-48">
          <Dropdown
            placeholder="All Countries"
            value={countryId}
            onChange={(val) => { setCountryId(val); setPage(1); }}
            options={[{ value: '', label: 'All Countries' }, ...(countries?.map(c => ({ value: c.id, label: c.name })) || [])]}
          />
        </div>
        {(departmentId || designationId || status || countryId) && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => {
              setDepartmentId('');
              setDesignationId('');
              setStatus('');
              setCountryId('');
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-slate-800 bg-[#09090b]/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-right">Total CTC</th>
                <th className="px-6 py-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Spinner size="medium" className="mx-auto text-indigo-500 mb-2" />
                    <p>Loading directory...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-400">
                    Failed to load directory.
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    No employees found matching your criteria.
                  </td>
                </tr>
              ) : (
                data?.data.map((emp) => (
                  <tr 
                    key={emp.id} 
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{emp.employeeCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {emp.email.toLowerCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">{emp.designation}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{emp.department}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-300">
                      {emp.currentSalary
                        ? formatCurrency(emp.currentSalary.totalCtc, emp.currentSalary.currencyCode)
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-4">
                        <div 
                          className={cn(
                            "h-3 w-3 rounded-full",
                            emp.status === 'ACTIVE' 
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" 
                              : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                          )} 
                          title={`Status: ${emp.status}`}
                        />
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employees/${emp.id}/edit`);
                          }}
                        >
                          <Pencil size={14} className="text-slate-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && data.meta.totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-900/30">
            <div className="text-xs text-slate-500 flex items-center gap-4">
              <span>
                Showing <span className="font-medium text-slate-300">{(data.meta.page - 1) * data.meta.limit + 1}</span> to{' '}
                <span className="font-medium text-slate-300">
                  {Math.min(data.meta.page * data.meta.limit, data.meta.total)}
                </span>{' '}
                of <span className="font-medium text-slate-300">{data.meta.total}</span> records
              </span>
              {isFetching && <Spinner size="small" className="text-indigo-400" />}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft size={16} />
              </Button>
              <div className="text-xs font-medium text-slate-300 px-2">
                Page {page} of {data.meta.totalPages}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages || isFetching}
                className="h-8 w-8 p-0"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
