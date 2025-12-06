import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Save, RefreshCw, AlertCircle, Sparkles, Undo2, Redo2, GripVertical, Plus, Trash2, Split, Copy, FileInput, X } from 'lucide-react';
import { TestCaseFormData, Status, Priority, Severity, Environment, Platform, TestType } from '../types';
import * as Constants from '../constants';
import { testCaseService } from '../services/testCaseService';
import { configurationService } from '../services/configurationService';
import { aiService } from '../services/aiService';
import { useToast } from '../components/Toast';

interface CreateTestCaseProps {
  onSuccess: () => void;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const SectionHeader = React.memo(({ title, rightElement }: { title: string, rightElement?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4 mt-8 pb-2 border-b border-border">
    <div className="flex items-center gap-2">
      <div className="w-1 h-5 bg-primary-600 rounded-full"></div>
      <h3 className="text-base md:text-lg font-bold text-heading uppercase tracking-wide">{title}</h3>
    </div>
    {rightElement}
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
  placeholder?: string;
}

const InputGroup = React.memo(({ label, name, type = 'text', required = false, value, onChange, children, error, placeholder }: InputGroupProps) => (
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
        placeholder={placeholder}
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
  options: { label: string; value: string }[] | string[];
}

const SelectGroup = React.memo(({ label, name, options, required = false, value, onChange, error }: SelectGroupProps) => {
  const hasError = !!error;
  
  // Normalize options to object format
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

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
          {normalizedOptions.map((opt: any) => (
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
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Feature States
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [copySourceId, setCopySourceId] = useState('');
  
  // Dynamic Options States
  const [products, setProducts] = useState<string[]>([]);
  const [qaNames, setQaNames] = useState<string[]>([]);
  const [environments, setEnvironments] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);

  // History State for Undo/Redo
  const [history, setHistory] = useState<TestCaseFormData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Test Steps Drag & Drop State
  const [isStepListMode, setIsStepListMode] = useState(true);
  const [stepList, setStepList] = useState<string[]>(['']);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const initialFormState: TestCaseFormData = {
    subject: '',
    status: Status.NotExecuted, 
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
    actualOutput: '',
    proofOfTestcase: '',
    qaReviewRemarks: '',
    justificationRemarks: '',
    defectLink: '',
    defectType: '',
    severity: '',
    testCategory: '',
    browser: '',
    deviceType: '',
    operatingSystem: '',
    locale: 'en-US',
    releaseVersion: '',
    testSuite: ''
  };

  const [formData, setFormData] = useState<TestCaseFormData>(initialFormState);

  // --- DRAFT LOGIC ---
  useEffect(() => {
    // Check for existing draft on mount
    const savedDraft = localStorage.getItem('bankai_qa_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Only prompt if draft has meaningful data
        if (parsed.subject || parsed.moduleCode) {
          setShowDraftPrompt(true);
        }
      } catch(e) {}
    }
  }, []);

  const loadDraft = () => {
    const savedDraft = localStorage.getItem('bankai_qa_draft');
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      setFormData(parsed);
      if (parsed.testSteps) setStepList(parsed.testSteps.split('\n'));
      showToast('Draft restored successfully.', 'success');
    }
    setShowDraftPrompt(false);
  };

  const discardDraft = () => {
    localStorage.removeItem('bankai_qa_draft');
    setShowDraftPrompt(false);
    showToast('Draft discarded.', 'info');
  };

  // Auto-Save Draft on Change
  useEffect(() => {
    if (isUndoRedoAction.current) return;
    
    const timer = setTimeout(() => {
      // Save to localStorage if dirty
      if (JSON.stringify(formData) !== JSON.stringify(initialFormState)) {
        localStorage.setItem('bankai_qa_draft', JSON.stringify(formData));
      }
    }, 1000); // Debounce 1s

    return () => clearTimeout(timer);
  }, [formData]);

  // --- HISTORY LOGIC ---
  useEffect(() => {
    if (history.length === 0) {
      setHistory([initialFormState]);
      setHistoryIndex(0);
    }
  }, []);

  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    
    const timer = setTimeout(() => {
       if (JSON.stringify(history[historyIndex]) !== JSON.stringify(formData)) {
         const newHistory = history.slice(0, historyIndex + 1);
         newHistory.push(formData);
         if (newHistory.length > 20) newHistory.shift();
         setHistory(newHistory);
         setHistoryIndex(newHistory.length - 1);
       }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  // --- SYNC STEPS ---
  useEffect(() => {
    if (isStepListMode && formData.testSteps) {
      const steps = formData.testSteps.split('\n').filter(s => s.trim() !== '');
      if (steps.length > 0 && JSON.stringify(steps) !== JSON.stringify(stepList.filter(s => s.trim() !== ''))) {
        setStepList(steps.length > 0 ? steps : ['']);
      }
    }
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      const p = await configurationService.getDropdownOptions('PRODUCTS');
      const q = await configurationService.getDropdownOptions('QA_NAMES');
      const e = await configurationService.getDropdownOptions('ENVIRONMENTS');
      const pl = await configurationService.getDropdownOptions('PLATFORMS');
      setProducts(p.length > 0 ? p : Constants.PRODUCTS);
      setQaNames(q.length > 0 ? q : Constants.QA_NAMES);
      setEnvironments(e.length > 0 ? e : Object.values(Environment));
      setPlatforms(pl.length > 0 ? pl : Object.values(Platform));
    };
    fetchOptions();
  }, []);

  // --- ACTION HANDLERS ---
  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prev = history[historyIndex - 1];
      setFormData(prev);
      setHistoryIndex(historyIndex - 1);
      if (prev.testSteps) setStepList(prev.testSteps.split('\n'));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const next = history[historyIndex + 1];
      setFormData(next);
      setHistoryIndex(historyIndex + 1);
      if (next.testSteps) setStepList(next.testSteps.split('\n'));
    }
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'testSteps' && !isStepListMode) {
       setStepList(value.split('\n'));
    }

    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, [isStepListMode]);

  // --- COPY FROM EXISTING ---
  const handleCopyFromExisting = async () => {
    if (!copySourceId.trim()) return;
    setLoading(true);
    try {
      const existing = await testCaseService.getById(copySourceId.trim());
      if (existing) {
        const { id, lastModified, lastModifiedBy, ...data } = existing;
        setFormData({ ...data, subject: `${data.subject} (Copy)` });
        if (data.testSteps) setStepList(data.testSteps.split('\n'));
        showToast('Data copied from ' + existing.id, 'success');
      } else {
        showToast('Test Case ID not found.', 'error');
      }
    } catch (e) {
      showToast('Error fetching test case.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const _stepList = [...stepList];
    const draggedItemContent = _stepList[dragItem.current];
    
    _stepList.splice(dragItem.current, 1);
    _stepList.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = dragOverItem.current;
    dragOverItem.current = null;
    
    setStepList(_stepList);
    updateTestStepsString(_stepList);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...stepList];
    newSteps[index] = value;
    setStepList(newSteps);
    updateTestStepsString(newSteps);
  };

  const addStep = () => {
    const newSteps = [...stepList, ''];
    setStepList(newSteps);
    updateTestStepsString(newSteps);
  };

  const removeStep = (index: number) => {
    const newSteps = stepList.filter((_, i) => i !== index);
    setStepList(newSteps.length ? newSteps : ['']);
    updateTestStepsString(newSteps);
  };

  const updateTestStepsString = (steps: string[]) => {
    const joined = steps.join('\n');
    setFormData(prev => ({ ...prev, testSteps: joined }));
  };

  // --- AI GENERATE ---
  const handleAiGenerate = async () => {
    if (!formData.subject) {
      showToast('Please enter a Subject first to use AI generation.', 'error');
      return;
    }
    
    setAiLoading(true);
    try {
      const generated = await aiService.generateTestDetails(formData.subject);
      setFormData(prev => ({
        ...prev,
        testSteps: generated.testSteps,
        expectedOutput: generated.expectedOutput,
        preconditions: generated.preconditions
      }));
      setStepList(generated.testSteps.split('\n'));
      showToast('AI successfully generated test details!', 'success');
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.testSteps;
        delete newErrors.expectedOutput;
        return newErrors;
      });

    } catch (e) {
      showToast('AI Generation failed. Try again.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.moduleCode.trim()) newErrors.moduleCode = 'Module Code is required';
    if (!formData.testSteps.trim()) newErrors.testSteps = 'Test Steps are required';
    if (!formData.expectedOutput.trim()) newErrors.expectedOutput = 'Expected Output is required';
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

  const handleSubmit = async (e: React.FormEvent, shouldDuplicate = false) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the validation errors.', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      await testCaseService.create(formData);
      localStorage.removeItem('bankai_qa_draft'); // Clear draft on success
      
      if (shouldDuplicate) {
        showToast('Case Saved! Ready to create duplicate.', 'success');
        // Prepare for duplicate: Append "Copy" to subject, keep rest same
        setFormData(prev => ({
          ...prev,
          subject: `${prev.subject} (Copy)`
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast('Test Case Created Successfully!', 'success');
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to create test case.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Draft Alert Banner */}
      {showDraftPrompt && (
        <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Unsaved draft found</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">You have unsaved changes from a previous session.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={discardDraft} className="px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200 rounded-lg transition-colors">Discard</button>
            <button onClick={loadDraft} className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors">Resume Draft</button>
          </div>
        </div>
      )}

      {/* Copy From Toolbar */}
      <div className="bg-surface rounded-xl p-3 border border-border flex flex-col md:flex-row gap-3 items-center justify-between">
         <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="bg-primary-50 p-2 rounded-lg text-primary-600"><Copy size={16}/></div>
            <span className="text-sm font-bold text-muted uppercase">Copy From Existing:</span>
         </div>
         <div className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="Enter Test Case ID (e.g. TC-1005)..." 
              value={copySourceId}
              onChange={e => setCopySourceId(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500"
            />
            <button 
              onClick={handleCopyFromExisting}
              disabled={loading}
              className="px-4 py-1.5 bg-surface border border-border hover:bg-surface-hover rounded-lg text-sm font-medium transition-colors"
            >
              Load
            </button>
         </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="bg-surface rounded-2xl shadow-xl border border-border overflow-hidden mb-12">
        
        {/* Header Info Banner */}
        <div className="bg-slate-900 p-4 md:p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-xl md:text-2xl font-bold">Create New Test Case</h2>
             <p className="text-slate-400 text-xs md:text-sm mt-1">Fill in the details below. All fields marked with * are mandatory.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto items-center flex-wrap md:flex-nowrap">
            
            {/* Undo/Redo Controls */}
            <div className="flex bg-slate-800 rounded-lg p-1 mr-2 border border-slate-700">
              <button 
                type="button" 
                onClick={handleUndo} 
                disabled={historyIndex <= 0}
                className="p-2 hover:bg-slate-700 rounded-md text-slate-300 disabled:opacity-30 transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={18} />
              </button>
              <button 
                type="button" 
                onClick={handleRedo} 
                disabled={historyIndex >= history.length - 1}
                className="p-2 hover:bg-slate-700 rounded-md text-slate-300 disabled:opacity-30 transition-colors"
                title="Redo"
              >
                <Redo2 size={18} />
              </button>
            </div>

            <button 
              type="button" 
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Copy size={16} /> Save & Copy
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

        <div className="p-4 md:p-8 space-y-8">

          {/* --- CORE DETAILS --- */}
          <div>
            <SectionHeader 
              title="Core Details" 
              rightElement={
                <button 
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full transition-colors border border-primary-200 dark:border-primary-800"
                >
                  {aiLoading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  {aiLoading ? 'Thinking...' : 'AI Auto-Fill'}
                </button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="col-span-1 md:col-span-2">
                <InputGroup label="Subject" name="subject" required value={formData.subject} onChange={handleChange} error={errors.subject} placeholder="e.g. Verify Login with valid credentials" />
              </div>
              <SelectGroup label="Product" name="product" required options={products} value={formData.product} onChange={handleChange} error={errors.product} />
              <SelectGroup label="QA Name" name="qaName" required options={qaNames} value={formData.qaName} onChange={handleChange} error={errors.qaName} />
              
              <InputGroup label="Module Code" name="moduleCode" required value={formData.moduleCode} onChange={handleChange} error={errors.moduleCode} />
              <InputGroup label="Screen Code" name="screenCode" value={formData.screenCode} onChange={handleChange} />
              <InputGroup label="Field Name" name="fieldName" value={formData.fieldName} onChange={handleChange} />
              <InputGroup label="CR Number" name="crNumber" value={formData.crNumber} onChange={handleChange} />
            </div>
          </div>

          {/* --- EXECUTION STATUS --- */}
          <div>
            <SectionHeader title="Execution & Status" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
               <SelectGroup label="Status" name="status" required options={Object.values(Status)} value={formData.status} onChange={handleChange} error={errors.status} />
               <SelectGroup label="Priority" name="priority" required options={Object.values(Priority)} value={formData.priority} onChange={handleChange} error={errors.priority} />
               <InputGroup label="Execution Date" name="executionDate" type="date" required value={formData.executionDate} onChange={handleChange} error={errors.executionDate} />
               <SelectGroup label="Reviewer" name="reviewer" options={Constants.REVIEWERS} value={formData.reviewer} onChange={handleChange} />
            </div>
          </div>

          {/* --- ENVIRONMENT & DETAILS --- */}
          <div>
            <SectionHeader title="Environment & Config" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <SelectGroup label="Platform" name="platform" required options={platforms} value={formData.platform} onChange={handleChange} error={errors.platform} />
              <SelectGroup label="Environment" name="environment" required options={environments} value={formData.environment} onChange={handleChange} error={errors.environment} />
              <SelectGroup label="Test Type" name="testType" required options={Object.values(TestType)} value={formData.testType} onChange={handleChange} error={errors.testType} />
              <SelectGroup label="Test Suite" name="testSuite" options={Constants.TEST_SUITES} value={formData.testSuite} onChange={handleChange} />
              
              <SelectGroup label="Browser" name="browser" options={Constants.BROWSERS} value={formData.browser} onChange={handleChange} />
              <SelectGroup label="Device" name="deviceType" options={Constants.DEVICES} value={formData.deviceType} onChange={handleChange} />
              <SelectGroup label="OS" name="operatingSystem" options={Constants.OPERATING_SYSTEMS} value={formData.operatingSystem} onChange={handleChange} />
              <SelectGroup label="Locale" name="locale" options={Constants.LOCALES} value={formData.locale} onChange={handleChange} />
              <SelectGroup label="Release Ver" name="releaseVersion" options={Constants.RELEASES} value={formData.releaseVersion} onChange={handleChange} />
            </div>
          </div>

          {/* --- STEPS & RESULTS --- */}
          <div>
            <SectionHeader title="Steps & Expected Results" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Preconditions" name="preconditions" value={formData.preconditions} onChange={handleChange}>
                <textarea name="preconditions" rows={3} value={formData.preconditions} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="Prerequisites..." />
              </InputGroup>
              <InputGroup label="Post Conditions" name="postConditions" value={formData.postConditions} onChange={handleChange}>
                <textarea name="postConditions" rows={3} value={formData.postConditions} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="Cleanup or state after test..." />
              </InputGroup>
              
              {/* Draggable Test Steps */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                   <label className={`block text-xs font-semibold uppercase tracking-wider ${errors.testSteps ? 'text-rose-500' : 'text-muted'}`}>Test Steps {errors.testSteps && '*'}</label>
                   <button 
                     type="button" 
                     onClick={() => setIsStepListMode(!isStepListMode)}
                     className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-500 transition-colors"
                   >
                     <Split size={14} /> {isStepListMode ? 'Switch to Text Mode' : 'Switch to List Mode'}
                   </button>
                </div>
                
                {isStepListMode ? (
                  <div className="space-y-2 border border-border rounded-lg p-3 bg-surface-hover/30">
                    {stepList.map((step, index) => (
                      <div 
                        key={index}
                        draggable 
                        onDragStart={() => dragItem.current = index}
                        onDragEnter={() => dragOverItem.current = index}
                        onDragEnd={handleSort}
                        onDragOver={(e) => e.preventDefault()}
                        className="flex items-start gap-2 group"
                      >
                        <button type="button" className="mt-2 text-muted cursor-move hover:text-heading active:cursor-grabbing">
                          <GripVertical size={16} />
                        </button>
                        <span className="mt-2 text-xs font-mono text-muted w-4">{index + 1}.</span>
                        <div className="flex-1 relative">
                          <textarea 
                            rows={1} 
                            value={step}
                            onChange={(e) => handleStepChange(index, e.target.value)}
                            className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm text-heading focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none overflow-hidden"
                            style={{ minHeight: '36px', height: 'auto' }}
                            onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }}
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeStep(index)}
                          className="mt-2 text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addStep} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-500 font-medium mt-2 px-2">
                      <Plus size={16} /> Add Step
                    </button>
                  </div>
                ) : (
                  <InputGroup label="" name="testSteps" required error={errors.testSteps}>
                     <textarea name="testSteps" rows={8} value={formData.testSteps} onChange={handleChange} className={`w-full px-4 py-2 bg-background border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 font-mono ${errors.testSteps ? 'border-rose-500 focus:ring-rose-500' : 'border-border focus:ring-primary-500'}`} placeholder="1. Step one..." />
                  </InputGroup>
                )}
              </div>

              <div className="md:col-span-2">
                <InputGroup label="Expected Output" name="expectedOutput" required error={errors.expectedOutput}>
                   <textarea name="expectedOutput" rows={3} value={formData.expectedOutput} onChange={handleChange} className={`w-full px-4 py-2 bg-background border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 ${errors.expectedOutput ? 'border-rose-500 focus:ring-rose-500' : 'border-border focus:ring-primary-500'}`} placeholder="What should happen?" />
                </InputGroup>
              </div>
            </div>
          </div>

          {/* --- ACTUAL RESULTS (If Executed) --- */}
          <div>
             <SectionHeader title="Actual Result & Defect Info" />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="md:col-span-3">
                 <InputGroup label="Actual Output" name="actualOutput" value={formData.actualOutput} onChange={handleChange}>
                   <textarea name="actualOutput" rows={3} value={formData.actualOutput} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="What actually happened?" />
                 </InputGroup>
               </div>
               
               <InputGroup label="Proof of Testcase (URL)" name="proofOfTestcase" value={formData.proofOfTestcase} onChange={handleChange} placeholder="https://screenshot-link..." />
               <InputGroup label="Defect Link (Jira/Bugzilla)" name="defectLink" value={formData.defectLink} onChange={handleChange} />
               
               <SelectGroup label="Defect Type" name="defectType" options={Constants.DEFECT_TYPES} value={formData.defectType} onChange={handleChange} />
               <SelectGroup label="Severity" name="severity" options={Object.values(Severity)} value={formData.severity} onChange={handleChange} />
               <SelectGroup label="Test Category" name="testCategory" options={Constants.TEST_CATEGORIES} value={formData.testCategory} onChange={handleChange} />

               <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <InputGroup label="QA Review Remarks" name="qaReviewRemarks" value={formData.qaReviewRemarks} onChange={handleChange}>
                   <textarea name="qaReviewRemarks" rows={2} value={formData.qaReviewRemarks} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                 </InputGroup>
                 <InputGroup label="Justification Remarks" name="justificationRemarks" value={formData.justificationRemarks} onChange={handleChange}>
                   <textarea name="justificationRemarks" rows={2} value={formData.justificationRemarks} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                 </InputGroup>
               </div>
             </div>
          </div>

        </div>
      </form>
    </div>
  );
};