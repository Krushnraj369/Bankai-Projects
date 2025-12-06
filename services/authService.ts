import { User } from '../types';
import { runGoogleScript } from './googleScript';

// Updated Mock Users for Local Fallback (Admin / 1)
const MOCK_DB_USERS = [
  { USERID: 'Admin', PASSWORD: '1', ACTIVE_FLAG: 'Y', NAME: 'System Admin' },
  { USERID: 'Tester', PASSWORD: '1', ACTIVE_FLAG: 'Y', NAME: 'QA Engineer' }
];

const STORAGE_KEY_USER = 'bankai_qa_user';

export const authService = {
  
  login: async (userId: string, password: string): Promise<User> => {
    
    // 1. Try Google Apps Script Backend (Users Sheet)
    try {
      // This will call the 'apiLogin' function in Code.gs
      const result = await runGoogleScript('apiLogin', { userId, password });
      
      if (result && result.USERID) {
        const user: User = {
          USERID: result.USERID,
          NAME: result.NAME,
          ACTIVE_FLAG: result.ACTIVE_FLAG
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        return user;
      }
    } catch (error: any) {
      // If the error is simply that we are running locally, suppress it and use fallback
      if (error.message !== 'Running locally (Outside GAS). Fallback needed.') {
        // console.warn("GAS Login failed:", error);
      }
      
      // If error is strictly "Invalid Credentials" from the backend, throw it.
      if (error.message === 'Invalid Credentials' || error.message === 'User is inactive') {
        throw error;
      }
    }

    // 2. Fallback: Local Mock Check (For Localhost development or if Sheet is empty)
    const dbUser = MOCK_DB_USERS.find(u => u.USERID.toLowerCase() === userId.toLowerCase());

    if (!dbUser) {
      throw new Error('User ID not found.');
    }
    if (dbUser.PASSWORD !== password) {
      throw new Error('Invalid Password.');
    }

    const user: User = {
      USERID: dbUser.USERID,
      NAME: dbUser.NAME,
      ACTIVE_FLAG: dbUser.ACTIVE_FLAG as 'Y' | 'N'
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    return stored ? JSON.parse(stored) : null;
  }
};