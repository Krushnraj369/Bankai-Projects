import React, { useState, useCallback, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import { TestCaseFormData, Status, Priority, Severity, Environment, Platform, TestType } from '../types';
import * as Constants from '../constants';
import { testCaseService } from '../services/testCaseService';
import { configurationService } from '../services/configurationService';

interface CreateTestCaseProps {
  onSuccess: () => void;
}

// ============================================================================
// HELPER COMPONENTS (DEFINED OUTSIDE TO PREVENT RE-RENDERS/FOCUS LOSS)
// ============================================================================

const SectionHeader = React.memo(({ title }: { title: string }) => (
  <div className="flex items-center gap-2 mb-4 mt-8 pb-2 border-b border-border">
    <div className="w-1 h-5 bg-primary-600 rounded-full"></div>
    <h3 className="text-base md:text-lg font-bold text-heading uppercase tracking-wide">{title}</h3>
  </div>
));

interface InputGroupProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  children?: React.ReactNode;
  error?: string;
}

const InputGroup = React.memo(({ label, name, type = 'text', required = false, value, onChange, children, error }: InputGroupProps) => (
  <div className="space-y-1">
    <label htmlFor={name} className={`block text-xs font-semibold uppercase tracking-wider ${error ? 'text-rose-500' : 'text-muted'}`}>
      {label} {required && <span className={`${error ? 'text-rose-500' : 'text-rose-500'}`}>*</span>}
    </label>
    {children ? children : (
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 md:px-4 py-2 bg-background border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 transition-all hover:bg-surface ${
          error 
            ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' 
            : 'border-border focus:ring-primary-500 focus:border-transparent'
        }`}
      />
    )}
    {error && (
      <div className="flex items-center gap-1 mt-1 text-rose-500 animate-in fade-in slide-in-from-top-1 duration-200">
        <AlertCircle size={12} />
        <span className="text-xs font-medium">{error}</span>
      </div>
    )}
  </div>
));

interface SelectGroupProps extends InputGroupProps {
  options: { label: string; value: string }[];
}

const SelectGroup = React.memo(({ label, name, options, required = false, value, onChange, error }: SelectGroupProps) => {
  const hasError = !!error;
  return (
    <InputGroup label={label} name={name} required={required} error={error}>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-3 md:px-4 py-2 bg-background border rounded-lg text-sm text-heading appearance-none focus:outline-none focus:ring-2 hover:bg-surface transition-all ${
            hasError
              ? 'border-rose-500 focus:ring-rose-500'
              : 'border-border focus:ring-primary-500'
          }`}
        >
          <option value="">Select {label}...</option>
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className={`w-4 h-4 ${hasError ? 'text-rose-500' : 'text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </InputGroup>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CreateTestCase: React.FC<CreateTestCaseProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Dynamic Options
  const [products, setProducts] = useState<string[]>([]);
  const [qaNames, setQaNames] = useState<string[]>([]);
  const [environments, setEnvironments] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const p = await configurationService.getDropdownOptions('PRODUCTS');
      const q = await configurationService.getDropdownOptions('QA_NAMES');
      const e = await configurationService.getDropdownOptions('ENVIRONMENTS');
      const pl = await configurationService.getDropdownOptions('PLATFORMS');
      setProducts(p);
      setQaNames(q);
      setEnvironments(e);
      setPlatforms(pl);
    };
    fetchOptions();
  }, []);

  const [formData, setFormData] = useState<TestCaseFormData>({
    subject: '',
    status: Status.Draft,
    priority: Priority.Medium,
    qaName: '',
    product: '',
    crNumber: '',
    moduleCode: '',
    screenCode: '',
    fieldName: '',
    executionDate: new Date().toISOString().split('T')[0],
    platform: Platform.Web,
    environment: Environment.QA,
    testType: TestType.Functional,
    reviewer: '',
    expectedOutput: '',
    testSteps: '',
    preconditions: '',
    postConditions: '',
    defectType: '',
    severity: Severity.Minor,
    testCategory: '',
    browser: '',
    deviceType: '',
    operatingSystem: '',
    locale: 'en-US',
    releaseVersion: '',
    testSuite: ''
  });

  // useCallback prevents function recreation on every render
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required Text Fields
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.moduleCode.trim()) newErrors.moduleCode = 'Module Code is required';
    if (!formData.testSteps.trim()) newErrors.testSteps = 'Test Steps are required';
    if (!formData.expectedOutput.trim()) newErrors.expectedOutput = 'Expected Output is required';
    
    // Required Dropdowns
    if (!formData.product) newErrors.product = 'Product is required';
    if (!formData.qaName) newErrors.qaName = 'QA Name is required';
    if (!formData.platform) newErrors.platform = 'Platform is required';
    if (!formData.environment) newErrors.environment = 'Environment is required';
    if (!formData.testType) newErrors.testType = 'Test Type is required';
    if (!formData.executionDate) newErrors.executionDate = 'Execution Date is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      await testCaseService.create(formData);
      alert('Test Case Created Successfully!');
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Failed to create test case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl shadow-xl border border-border overflow-hidden mb-12">
      
      {/* Header Info Banner */}
      <div className="bg-slate-900 p-4 md:p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-xl md:text-2xl font-bold">Create New Test Case</h2>
           <p className="text-slate-400 text-xs md:text-sm mt-1">Fill in the details below. All fields marked with * are mandatory.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button type="button" className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors text-center">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? 'Saving...' : 'Save Case'}
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        
        {/* Error Summary Alert */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3 text-rose-700 dark:text-rose-300">
             <AlertCircle className="shrink-0 mt-0.5" size={20} />
             <div>
               <h4 className="font-bold text-sm">Please correct the following errors:</h4>
               <ul className="mt-1 text-xs list-disc list-inside space-y-0.5 opacity-80">
                 {Object.entries(errors).slice(0, 3).map(([key, msg]) => (
                   <li key={key}>{msg}</li>
                 ))}
                 {Object.keys(errors).length > 3 && <li>...and {Object.keys(errors).length - 3} more fields.</li>}
               </ul>
             </div>
          </div>
        )}

        {/* SECTION 1: CORE INFORMATION */}
        <div className="mt-0">
          <SectionHeader title="Core Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="lg:col-span-3">
              <InputGroup label="Subject / Summary" name="subject" value={formData.subject} onChange={handleChange} required error={errors.subject} />
            </div>
            <InputGroup label="CR Number" name="crNumber" value={formData.crNumber} onChange={handleChange} />
            
            <SelectGroup label="Status" name="status" value={formData.status} onChange={handleChange} options={Constants.enumToOptions(Status)} required error={errors.status} />
            <SelectGroup label="Priority" name="priority" value={formData.priority} onChange={handleChange} options={Constants.enumToOptions(Priority)} required error={errors.priority} />
            <SelectGroup label="Severity" name="severity" value={formData.severity} onChange={handleChange} options={Constants.enumToOptions(Severity)} />
            <SelectGroup label="Test Type" name="testType" value={formData.testType} onChange={handleChange} options={Constants.enumToOptions(TestType)} required error={errors.testType} />
          </div>
        </div>

        {/* SECTION 2: PRODUCT & ASSIGNMENT */}
        <SectionHeader title="Product & Assignment" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <SelectGroup label="Product" name="product" value={formData.product} onChange={handleChange} options={products.map(v => ({label: v, value: v}))} required error={errors.product} />
            <InputGroup label="Module Code" name="moduleCode" value={formData.moduleCode} onChange={handleChange} required error={errors.moduleCode} />
            <InputGroup label="Screen Code" name="screenCode" value={formData.screenCode} onChange={handleChange} />
            <InputGroup label="Field Name" name="fieldName" value={formData.fieldName} onChange={handleChange} />
            
            <SelectGroup label="QA Name" name="qaName" value={formData.qaName} onChange={handleChange} options={qaNames.map(v => ({label: v, value: v}))} required error={errors.qaName} />
            <SelectGroup label="Reviewer" name="reviewer" value={formData.reviewer} onChange={handleChange} options={Constants.REVIEWERS.map(v => ({label: v, value: v}))} />
            <SelectGroup label="Test Suite" name="testSuite" value={formData.testSuite} onChange={handleChange} options={Constants.TEST_SUITES.map(v => ({label: v, value: v}))} />
            <InputGroup label="Release Version" name="releaseVersion" value={formData.releaseVersion} onChange={handleChange} />
        </div>

        {/* SECTION 3: ENVIRONMENT & EXECUTION */}
        <SectionHeader title="Environment & Execution" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <SelectGroup label="Platform" name="platform" value={formData.platform} onChange={handleChange} options={platforms.length ? platforms.map(v => ({label: v, value: v})) : Constants.enumToOptions(Platform)} required error={errors.platform} />
            <SelectGroup label="Environment" name="environment" value={formData.environment} onChange={handleChange} options={environments.length ? environments.map(v => ({label: v, value: v})) : Constants.enumToOptions(Environment)} required error={errors.environment} />
            <SelectGroup label="Browser" name="browser" value={formData.browser} onChange={handleChange} options={Constants.BROWSERS.map(v => ({label: v, value: v}))} />
            <SelectGroup label="Device Type" name="deviceType" value={formData.deviceType} onChange={handleChange} options={Constants.DEVICES.map(v => ({label: v, value: v}))} />
            
            <SelectGroup label="OS" name="operatingSystem" value={formData.operatingSystem} onChange={handleChange} options={Constants.OPERATING_SYSTEMS.map(v => ({label: v, value: v}))} />
            <SelectGroup label="Locale" name="locale" value={formData.locale} onChange={handleChange} options={Constants.LOCALES.map(v => ({label: v, value: v}))} />
            <InputGroup label="Execution Date" name="executionDate" type="date" value={formData.executionDate} onChange={handleChange} required error={errors.executionDate} />
            <InputGroup label="Defect Link (JIRA/Azure)" name="defectLink" value={formData.defectLink} onChange={handleChange} />
        </div>

        {/* SECTION 4: DETAILS & STEPS */}
        <SectionHeader title="Test Steps & Results" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
             <InputGroup label="Preconditions" name="preconditions">
               <textarea 
                 id="preconditions"
                 name="preconditions" 
                 onChange={handleChange} 
                 value={formData.preconditions} 
                 rows={3} 
                 className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500 transition-all" 
                 placeholder="Enter preconditions..." 
               />
             </InputGroup>
             <InputGroup label="Test Steps" name="testSteps" required error={errors.testSteps}>
               <textarea 
                 id="testSteps"
                 name="testSteps" 
                 onChange={handleChange} 
                 value={formData.testSteps} 
                 rows={6} 
                 className={`w-full px-4 py-2 bg-background border rounded-lg text-sm text-heading focus:ring-2 transition-all font-mono ${
                   errors.testSteps 
                     ? 'border-rose-500 focus:ring-rose-500' 
                     : 'border-border focus:ring-primary-500'
                 }`}
                 placeholder="1. Step one..." 
               />
             </InputGroup>
             <InputGroup label="Post Conditions" name="postConditions">
               <textarea 
                 id="postConditions"
                 name="postConditions" 
                 onChange={handleChange} 
                 value={formData.postConditions} 
                 rows={3} 
                 className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500 transition-all" 
                 placeholder="Enter post conditions..." 
               />
             </InputGroup>
          </div>
          <div className="space-y-4">
             <InputGroup label="Expected Output" name="expectedOutput" required error={errors.expectedOutput}>
               <textarea 
                 id="expectedOutput"
                 name="expectedOutput" 
                 onChange={handleChange} 
                 value={formData.expectedOutput} 
                 rows={3} 
                 className={`w-full px-4 py-2 border rounded-lg text-sm text-heading focus:ring-2 transition-all ${
                   errors.expectedOutput
                     ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-500 focus:ring-rose-500'
                     : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500'
                 }`}
                 placeholder="What should happen?" 
               />
             </InputGroup>
             <InputGroup label="Actual Output" name="actualOutput">
               <textarea 
                 id="actualOutput"
                 name="actualOutput" 
                 onChange={handleChange} 
                 value={formData.actualOutput} 
                 rows={3} 
                 className="w-full px-4 py-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-heading focus:ring-2 focus:ring-rose-500 transition-all" 
                 placeholder="What actually happened?" 
               />
             </InputGroup>
             <InputGroup label="Review Remarks / Justification" name="qaReviewRemarks">
               <textarea 
                 id="qaReviewRemarks"
                 name="qaReviewRemarks" 
                 onChange={handleChange} 
                 value={formData.qaReviewRemarks} 
                 rows={3} 
                 className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500 transition-all" 
               />
             </InputGroup>
             <InputGroup label="Proof of Test Case (URL/Path)" name="proofOfTestcase">
                <input 
                  id="proofOfTestcase"
                  type="text" 
                  name="proofOfTestcase" 
                  onChange={handleChange} 
                  value={formData.proofOfTestcase} 
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500 transition-all" 
                  placeholder="https://..." 
                />
             </InputGroup>
          </div>
        </div>

      </div>
    </form>
  );
};