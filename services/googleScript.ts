
// Helper to communicate with Google Apps Script (Server-side)

declare var google: any; // Global definition

export const runGoogleScript = (functionName: string, ...args: any[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if running inside Google Apps Script iframe
    if (typeof google === 'undefined' || !google.script) {
      // If we are on Localhost, we cannot call google.script.run
      // We reject nicely so the service can fallback to Mock Data
      reject(new Error("Running locally (Outside GAS). Fallback needed."));
      return;
    }

    google.script.run
      .withSuccessHandler((response: any) => {
        try {
          // Google script usually returns stringified JSON
          const parsed = typeof response === 'string' ? JSON.parse(response) : response;
          
          if (parsed && parsed.status === 'error') {
            reject(new Error(parsed.message || 'Unknown GAS Error'));
          } else {
            // Return the 'data' part if it exists, otherwise the whole response
            resolve(parsed.data !== undefined ? parsed.data : parsed);
          }
        } catch (e) {
          // If parsing fails, just return raw response
          resolve(response);
        }
      })
      .withFailureHandler((error: any) => {
        reject(error);
      })
      [functionName](...args);
  });
};