import { runGoogleScript } from './googleScript';
import * as Constants from '../constants';
import { Environment, Platform } from '../types';

// Default to LOCAL for preview environment stability
const DATA_SOURCE: string = 'LOCAL'; 
const STORAGE_KEY_USERS = 'bankai_qa_user_db';
const STORAGE_KEY_CONFIG = 'bankai_qa_config_db';

export interface DropdownOption {
  category: string;
  value: string;
}

export const configurationService = {

  // ==========================================================================
  // USER MANAGEMENT
  // ==========================================================================

  getAllUsers: async () => {
    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        const users = await runGoogleScript('apiGetUsers');
        return users || [];
      } catch (e) {
        // Silent fallback to local if GAS fails
      }
    }

    // Local Fallback
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    if (stored) return JSON.parse(stored);
    
    // Default Mock Users
    return [
      { USERID: 'Admin', NAME: 'System Admin', ACTIVE_FLAG: 'Y' },
      { USERID: 'Tester', NAME: 'QA Engineer', ACTIVE_FLAG: 'Y' }
    ];
  },

  createUser: async (user: any) => {
    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        await runGoogleScript('apiCreateUser', user);
        return;
      } catch (e) {}
    }

    // Local Fallback
    const users = await configurationService.getAllUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  },

  toggleUserStatus: async (userId: string) => {
    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        await runGoogleScript('apiToggleUser', userId);
        return;
      } catch (e) {}
    }

    // Local Fallback
    const users = await configurationService.getAllUsers();
    const updated = users.map((u: any) => 
      u.USERID === userId ? { ...u, ACTIVE_FLAG: u.ACTIVE_FLAG === 'Y' ? 'N' : 'Y' } : u
    );
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
  },

  // ==========================================================================
  // MASTER DATA (DROPDOWNS)
  // ==========================================================================

  // Categories: 'PRODUCTS', 'QA_NAMES', 'ENVIRONMENTS', 'PLATFORMS'
  getDropdownOptions: async (category: string): Promise<string[]> => {
    let options: string[] = [];

    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        // Fetch all config rows
        const allConfig: DropdownOption[] = await runGoogleScript('apiGetConfiguration');
        if (allConfig && Array.isArray(allConfig)) {
          options = allConfig
            .filter(item => item.category === category)
            .map(item => item.value);
        }
      } catch (e) {
        // console.warn("GAS Config fetch failed, using constants");
      }
    } else {
      // Local Storage
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        const allConfig: DropdownOption[] = JSON.parse(stored);
        options = allConfig.filter(c => c.category === category).map(c => c.value);
      }
    }

    // If no dynamic options found, fallback to CONSTANTS
    if (options.length === 0) {
      switch (category) {
        case 'PRODUCTS': return Constants.PRODUCTS;
        case 'QA_NAMES': return Constants.QA_NAMES;
        case 'ENVIRONMENTS': return Object.values(Environment);
        case 'PLATFORMS': return Object.values(Platform);
        default: return [];
      }
    }

    return options;
  },

  addDropdownOption: async (category: string, value: string) => {
    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        await runGoogleScript('apiAddConfiguration', { category, value });
        return;
      } catch (e) {}
    }

    const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
    const allConfig: DropdownOption[] = stored ? JSON.parse(stored) : [];
    allConfig.push({ category, value });
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(allConfig));
  },

  deleteDropdownOption: async (category: string, value: string) => {
    if (DATA_SOURCE === 'GAS_HOSTED') {
      try {
        await runGoogleScript('apiDeleteConfiguration', { category, value });
        return;
      } catch (e) {}
    }

    const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!stored) return;
    const allConfig: DropdownOption[] = JSON.parse(stored);
    const filtered = allConfig.filter(c => !(c.category === category && c.value === value));
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(filtered));
  },

  // ==========================================================================
  // SYSTEM HEALTH
  // ==========================================================================
  checkHealth: async () => {
    const start = Date.now();
    try {
      if (DATA_SOURCE === 'GAS_HOSTED') {
        await runGoogleScript('apiPing');
      } else {
        await new Promise(r => setTimeout(r, 200)); // Simulate latency
      }
      return { status: 'ONLINE', latency: Date.now() - start };
    } catch (e) {
      // If GAS fails, we might still be online locally, but "offline" relative to backend
      return { status: 'LOCAL MODE', latency: 0 };
    }
  }
};