// Mock AI Service to simulate GenAI capabilities locally
// In a real scenario, this would call the Gemini API
import { FilterState, Status, Priority } from '../types';

export const aiService = {
  generateTestDetails: async (subject: string) => {
    // Simulate API Latency
    await new Promise(r => setTimeout(r, 1500));

    const sub = subject.toLowerCase();
    
    let steps = "";
    let expected = "";
    let pre = "";

    if (sub.includes("login") || sub.includes("signin") || sub.includes("auth")) {
      pre = "1. User must be registered in the database.\n2. Application URL is accessible.";
      steps = "1. Navigate to the Login Page.\n2. Enter valid Username in the email field.\n3. Enter valid Password.\n4. Click on the 'Login' button.";
      expected = "User should be redirected to the Dashboard successfully. 'Welcome' message should be displayed.";
    } 
    else if (sub.includes("api") || sub.includes("endpoint")) {
      pre = "1. Bearer Token is available.\n2. API Endpoint is reachable.";
      steps = "1. Set up the request headers (Authorization, Content-Type).\n2. Construct the JSON payload with valid data.\n3. Send a POST request to the endpoint.\n4. Analyze the response status code and body.";
      expected = "Status Code should be 200 OK. Response body should contain the created resource ID.";
    }
    else if (sub.includes("payment") || sub.includes("checkout")) {
      pre = "1. User has items in the cart.\n2. Payment Gateway is sandbox mode.";
      steps = "1. Proceed to Checkout page.\n2. Select Credit Card as payment method.\n3. Enter valid Card Number, Expiry, and CVV.\n4. Click 'Pay Now'.";
      expected = "Transaction should be successful. Order Confirmation ID should be generated.";
    }
    else if (sub.includes("search") || sub.includes("filter")) {
      pre = "1. Records exist in the system.";
      steps = "1. Navigate to the Search bar.\n2. Enter a keyword that exists (e.g., 'Bankai').\n3. Press Enter or click Search icon.";
      expected = "Search results matching the keyword should be displayed in the grid.";
    }
    else {
      // Generic AI response
      pre = "1. Application is launched and stable.\n2. User is logged in with appropriate permissions.";
      steps = `1. Navigate to the ${subject.split(' ')[0] || 'relevant'} module.\n2. Perform the action described in the subject.\n3. Verify the system state changes.\n4. Check for any console errors.`;
      expected = "The system should perform the action without errors and update the UI accordingly.";
    }

    return { testSteps: steps, expectedOutput: expected, preconditions: pre };
  },

  // --- Chat Assistant Capabilities ---
  
  processNaturalQuery: async (query: string, contextData: any[]) => {
    await new Promise(r => setTimeout(r, 800)); // Faster response for search
    const q = query.toLowerCase();

    // 1. Check for Filtering Intent (Returning a FilterState object)
    if (q.includes('show') || q.includes('list') || q.includes('find')) {
       const filter: Partial<FilterState> = {};
       
       // Status Parsing
       if (q.includes('fail')) filter.status = [Status.Failed];
       else if (q.includes('pass')) filter.status = [Status.Passed];
       else if (q.includes('progress')) filter.status = [Status.InProgress];
       else if (q.includes('pending')) filter.status = [Status.NotExecuted, Status.InProgress];
       
       // Priority Parsing
       if (q.includes('high')) filter.priority = [Priority.High, Priority.Immediate];
       else if (q.includes('critical')) filter.priority = [Priority.Immediate];
       else if (q.includes('medium')) filter.priority = [Priority.Medium];
       else if (q.includes('low')) filter.priority = [Priority.Low, Priority.VeryLow];

       // Person Parsing (Simple Mock)
       if (q.includes('krushnraj')) filter.qaName = ['Krushnraj'];
       if (q.includes('prince')) filter.qaName = ['Prince'];

       // If valid filters found, return them
       if (Object.keys(filter).length > 0) {
         return {
           text: `Filtering view based on your request: "${query}"`,
           action: 'APPLY_FILTER',
           filterData: filter
         };
       }
    }

    // 2. Existing AI Chat Logic
    if (q.includes('fail') || q.includes('failed')) {
      const failedCount = contextData.filter((c: any) => c.status === 'Failed').length;
      return { 
        text: `I found ${failedCount} failed test cases in the current scope. Would you like me to prioritize them for re-execution?`,
        action: 'FILTER_FAILED'
      };
    }
    
    if (q.includes('pass') || q.includes('rate')) {
      const total = contextData.length;
      const passed = contextData.filter((c: any) => c.status === 'Passed').length;
      const rate = total > 0 ? Math.round((passed / total) * 100) : 0;
      return {
        text: `The current pass rate is ${rate}%. We are trending ${rate > 80 ? 'positively' : 'below target'} this week.`,
        action: 'SHOW_STATS'
      };
    }

    if (q.includes('create') || q.includes('new')) {
      return {
        text: "Navigating to the creation wizard now. I can help auto-fill the details if you provide a subject.",
        action: 'NAVIGATE_CREATE'
      };
    }

    return {
      text: "I'm analyzing that request. Could you specify if you want to look at Execution, Defects, or Planning?",
      action: 'NONE'
    };
  }
};