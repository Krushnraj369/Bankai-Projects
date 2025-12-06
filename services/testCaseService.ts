import { TestCase, TestCaseFormData, Status, Priority, Environment, Platform, TestType } from '../types';
import { runGoogleScript } from './googleScript';
import * as Constants from '../constants';

// ============================================================================
// CONFIGURATION CENTER
// ============================================================================

// Options: 'LOCAL' | 'GSHEET' | 'ORACLE_DIRECT' | 'NODE_API' | 'GAS_HOSTED'
// Defaulting to 'LOCAL' for stable preview environment
const DATA_SOURCE: string = 'LOCAL'; 

// CONFIGURATION DETAILS
const API_CONFIG = {
  nodeServerUrl: 'http://localhost:5000/api/testcases',
  googleSheetUrl: '', 
  oracleOrdsUrl: ''
};

const STORAGE_KEY = 'bankai_qa_test_cases';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================
const generateMockData = (): TestCase[] => {
  const cases: TestCase[] = [];
  const statuses = Object.values(Status);
  const priorities = Object.values(Priority);
  const qaNames = Constants.QA_NAMES;
  const products = Constants.PRODUCTS;
  
  for (let i = 1; i <= 20; i++) {
    cases.push({
      id: `TC-${1000 + i}`,
      subject: `Validate login functionality scenario ${i} (Local Mock)`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      qaName: qaNames[Math.floor(Math.random() * qaNames.length)],
      product: products[Math.floor(Math.random() * products.length)],
      crNumber: `CR-${202400 + i}`,
      moduleCode: 'AUTH_MOD',
      screenCode: 'LGN_SCR_01',
      fieldName: 'Username',
      executionDate: new Date().toISOString().split('T')[0],
      platform: Platform.Web,
      environment: Environment.QA,
      testType: TestType.Functional,
      reviewer: 'Krushnraj',
      expectedOutput: 'User should be logged in successfully',
      testSteps: '1. Open URL\n2. Enter User\n3. Click Login',
      preconditions: 'User exists in DB',
      postConditions: 'Session token generated',
      lastModified: new Date().toISOString(),
      lastModifiedBy: 'System Admin',
      testSuite: 'Sanity Pack',
      releaseVersion: 'v1.0'
    });
  }
  return cases;
};

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export const testCaseService = {
  
  // --- GET ALL TEST CASES ---
  getAll: async (): Promise<TestCase[]> => {
    // 1. Try GAS if configured
    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        const data = await runGoogleScript('apiGetTestCases');
        return data || [];
      } catch (e) {
        // Silent fallback to local if GAS fails (e.g. running locally)
        // console.warn("GAS execution failed. Switching to Mock Data.");
      }
    }

    // 2. Try Node API if configured
    if (DATA_SOURCE === 'NODE_API') {
      try {
        const response = await fetch(API_CONFIG.nodeServerUrl);
        if (!response.ok) throw new Error('Failed to fetch from Backend');
        return await response.json(); 
      } catch (error) {
        console.warn("Backend Unreachable: Switching to Offline/Local Mode.");
      }
    }

    // 3. Local Storage / Mock Data Fallback
    await delay(300);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const mocks = generateMockData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mocks));
      return mocks;
    }
    return JSON.parse(stored);
  },

  // --- GET SINGLE BY ID ---
  getById: async (id: string): Promise<TestCase | null> => {
    const all = await testCaseService.getAll();
    return all.find(c => c.id === id) || null;
  },

  // --- CREATE TEST CASE ---
  create: async (data: TestCaseFormData): Promise<TestCase> => {
    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        const payload = {
          ...data,
          id: `TC-${Date.now()}`,
          lastModified: new Date().toISOString(),
          lastModifiedBy: 'GoogleUser'
        };
        await runGoogleScript('apiCreateTestCase', payload);
        return payload as TestCase;
      } catch (e) {}
    }

    await delay(500);
    const stored = localStorage.getItem(STORAGE_KEY);
    const cases: TestCase[] = stored ? JSON.parse(stored) : [];
    
    const newCase: TestCase = {
      ...data,
      id: `TC-${1000 + cases.length + 1}`,
      lastModified: new Date().toISOString(),
      lastModifiedBy: 'Current User'
    };
    
    cases.unshift(newCase);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    return newCase;
  },

  // --- IMPORT BULK TEST CASES ---
  import: async (dataArray: Partial<TestCase>[]): Promise<void> => {
    // Sanitize Data
    const cleanData = dataArray.map((item, index) => ({
      ...item,
      id: item.id || `TC-${Date.now()}-${index}`, // Ensure ID exists
      status: item.status || Status.NotExecuted,
      priority: item.priority || Priority.Medium,
      executionDate: item.executionDate || new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString()
    }));

    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        await runGoogleScript('apiImportTestCases', cleanData);
        return;
      } catch (e) {
        // Fallback to local import if GAS fails
      }
    }

    // Local Bulk Import
    await delay(1000);
    const stored = localStorage.getItem(STORAGE_KEY);
    const cases: TestCase[] = stored ? JSON.parse(stored) : [];
    
    // Merge new cases
    const updatedCases = [...(cleanData as TestCase[]), ...cases];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCases));
  },

  // --- UPDATE TEST CASE ---
  update: async (id: string, updates: Partial<TestCase>): Promise<void> => {
    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        await runGoogleScript('apiUpdateTestCase', { id, ...updates });
        return;
      } catch (e) {}
    }

    await delay(300);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const cases: TestCase[] = JSON.parse(stored);
    const index = cases.findIndex(c => c.id === id);
    if (index !== -1) {
      cases[index] = { ...cases[index], ...updates, lastModified: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    }
  },

  // --- BULK UPDATE TEST CASES ---
  bulkUpdate: async (ids: string[], updates: Partial<TestCase>): Promise<void> => {
    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        await runGoogleScript('apiBulkUpdateTestCases', { ids, updates });
        return;
      } catch (e) {
         // Fallback to local
      }
    }

    await delay(500);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    let cases: TestCase[] = JSON.parse(stored);
    cases = cases.map(c => ids.includes(c.id) ? { ...c, ...updates, lastModified: new Date().toISOString() } : c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  },

  // --- DELETE TEST CASE ---
  delete: async (ids: string[]): Promise<void> => {
    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        await runGoogleScript('apiDeleteTestCases', ids);
        return;
      } catch (e) {}
    }

    await delay(400);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    let cases: TestCase[] = JSON.parse(stored);
    cases = cases.filter(c => !ids.includes(c.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  }
};