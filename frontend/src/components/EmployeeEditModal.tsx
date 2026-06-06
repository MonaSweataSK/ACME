import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, User, Building } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Dropdown } from './ui/Dropdown';
import { Spinner } from './ui/Spinner';
import { Modal } from './ui/Modal';

interface EmployeeDetailData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  department: { id: string; name: string };
  designation: { id: string; name: string };
  country: { id: string; name: string };
}

interface EmployeeEditModalProps {
  employeeId: string | null;
  onClose: () => void;
}

export function EmployeeEditModal({ employeeId, onClose }: EmployeeEditModalProps) {
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [countryId, setCountryId] = useState('');

  // 1. Fetch Employee Data
  const { data: employee, isLoading: isEmpLoading } = useQuery<EmployeeDetailData>({
    queryKey: ['employee', employeeId],
    queryFn: () => api.get(`/employees/${employeeId}`),
    enabled: !!employeeId,
  });

  // 2. Populate local state once data loads
  useEffect(() => {
    if (employee) {
      setFirstName(employee.firstName);
      setLastName(employee.lastName);
      setStatus(employee.status);
      setDepartmentId(employee.department.id);
      setDesignationId(employee.designation.id);
      setCountryId(employee.country.id);
    }
  }, [employee]);

  // Reset designation if department changes
  useEffect(() => {
    if (employee && departmentId !== employee.department.id) {
      setDesignationId('');
    }
  }, [departmentId, employee]);

  // 3. Fetch Metadata for dropdowns
  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get<{id: string, name: string}[]>('/metadata/departments'),
    enabled: !!employeeId,
  });

  const { data: desigs } = useQuery({
    queryKey: ['designations', departmentId],
    queryFn: () => api.get<{id: string, name: string}[]>(`/metadata/designations${departmentId ? `?departmentId=${departmentId}` : ''}`),
    enabled: !!employeeId,
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => api.get<{id: string, name: string}[]>('/metadata/countries'),
    enabled: !!employeeId,
  });

  // 4. Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/employees/${employeeId}`, data),
    onSuccess: () => {
      toast.success('Employee updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update employee');
    }
  });

  const handleSave = () => {
    if (!firstName || !lastName || !departmentId || !designationId || !countryId || !status) {
      toast.error('Please fill out all required fields');
      return;
    }

    updateMutation.mutate({
      firstName,
      lastName,
      departmentId,
      designationId,
      countryId,
      status
    });
  };

  return (
    <Modal isOpen={!!employeeId} onClose={onClose} title="Edit Employee">
      {isEmpLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="large" className="text-indigo-500" />
        </div>
      ) : !employee ? (
        <div className="text-center py-12 text-slate-400">Employee not found</div>
      ) : (
        <div className="space-y-6">
          {/* Personal Details */}
          <div className="bg-[#09090b]/50 border border-slate-800 rounded-lg p-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <User size={16} className="text-indigo-400" />
              Personal Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">First Name</label>
                <Input 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Last Name</label>
                <Input 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</label>
                <Dropdown
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'INACTIVE', label: 'Inactive' }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div className="bg-[#09090b]/50 border border-slate-800 rounded-lg p-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building size={16} className="text-indigo-400" />
              Work Assignment
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Country / Location</label>
                <Dropdown
                  value={countryId}
                  onChange={setCountryId}
                  placeholder="Select Country"
                  options={countries?.map(c => ({ value: c.id, label: c.name })) || []}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Department</label>
                <Dropdown
                  value={departmentId}
                  onChange={setDepartmentId}
                  placeholder="Select Department"
                  options={depts?.map(d => ({ value: d.id, label: d.name })) || []}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Designation</label>
                <Dropdown
                  value={designationId}
                  onChange={setDesignationId}
                  placeholder="Select Designation"
                  options={desigs?.map(d => ({ value: d.id, label: d.name })) || []}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleSave} 
              loading={updateMutation.isPending}
              className="gap-2"
            >
              <Save size={16} />
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
