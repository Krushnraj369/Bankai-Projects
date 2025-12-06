export enum Status {
  Passed = 'Passed',
  Failed = 'Failed',
  Blocked = 'Blocked',
  InProgress = 'In Progress',
  NotExecuted = 'Not Executed',
  Rejected = 'Rejected'
}

export enum Priority {
  Immediate = 'Immediate',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  VeryLow = 'Very Low'
}

export enum Severity {
  Critical = 'Critical',
  Major = 'Major', 
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum Environment {
  DEV = 'DEV',
  QA = 'QA',
  UAT = 'UAT',
  PROD = 'PROD',
  SIT = 'SIT'
}

export enum Platform {
  Web = 'Web',
  Mobile = 'Mobile',
  API = 'API',
  Desktop = 'Desktop'
}

export enum TestType {
  Unit = 'Unit Testing',
  Integration = 'Integration Testing',
  System = 'System Testing',
  E2E = 'End-to-End Testing (E2E)',
  Functional = 'Functional Testing',
  UI = 'UI Testing',
  Regression = 'Regression Testing',
  Retesting = 'Retesting',
  Smoke = 'Smoke Testing',
  Sanity = 'Sanity Testing',
  UAT = 'User Acceptance Testing (UAT)',
  Alpha = 'Alpha Testing',
  Beta = 'Beta Testing',
  Exploratory = 'Exploratory Testing',
  Adhoc = 'Adhoc Testing',
  Usability = 'Usability Testing',
  Accessibility = 'Accessibility Testing',
  Compatibility = 'Compatibility Testing',
  CrossBrowser = 'Cross-Browser Testing',
  CrossPlatform = 'Cross-Platform Testing',
  Localization = 'Localization Testing',
  Internationalization = 'Internationalization Testing',
  Installation = 'Installation Testing',
  Configuration = 'Configuration Testing',
  Database = 'Database Testing',
  API = 'API Testing',
  Security = 'Security Testing',
  Penetration = 'Penetration Testing',
  Vulnerability = 'Vulnerability Assessment',
  Performance = 'Performance Testing',
  Load = 'Load Testing',
  Stress = 'Stress Testing',
  Spike = 'Spike Testing',
  Soak = 'Soak Testing',
  Scalability = 'Scalability Testing',
  Volume = 'Volume Testing',
  Reliability = 'Reliability Testing',
  Recovery = 'Recovery Testing',
  Failover = 'Failover Testing',
  Compliance = 'Compliance Testing',
  Conformance = 'Conformance Testing',
  Portability = 'Portability Testing',
  RiskBased = 'Risk-Based Testing',
  Monkey = 'Monkey Testing',
  Gorilla = 'Gorilla Testing',
  Boundary = 'Boundary Value Testing',
  Equivalence = 'Equivalence Partitioning',
  Pairwise = 'Pairwise Testing',
  AB = 'A/B Testing',
  Chaos = 'Chaos Testing',
  Mutation = 'Mutation Testing',
  WhiteBox = 'White Box Testing',
  BlackBox = 'Black Box Testing',
  GreyBox = 'Grey Box Testing',
  Static = 'Static Testing',
  Dynamic = 'Dynamic Testing'
}

export interface TestCase {
  id: string; // Test Case ID
  subject: string;
  status: string; // Using string to allow flexible imports, but usually Enum
  priority: string;
  qaName: string;
  product: string;
  crNumber: string;
  moduleCode: string;
  screenCode: string;
  fieldName: string;
  executionDate: string;
  platform: string;
  environment: string;
  testType: string;
  defectLink?: string;
  reviewer: string;
  qaReviewRemarks?: string;
  justificationRemarks?: string;
  proofOfTestcase?: string;
  expectedOutput: string;
  actualOutput?: string;
  testSteps: string;
  preconditions: string;
  postConditions: string;
  lastModified: string;
  lastModifiedBy: string;
  
  // Additional dropdown fields
  defectType?: string;
  severity?: string;
  testCategory?: string;
  browser?: string;
  deviceType?: string;
  operatingSystem?: string;
  locale?: string;
  releaseVersion?: string;
  testSuite?: string;
}

export type TestCaseFormData = Omit<TestCase, 'id' | 'lastModified' | 'lastModifiedBy'>;

// Auth Types
export interface User {
  USERID: string;
  NAME: string;
  ACTIVE_FLAG: 'Y' | 'N';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  category: 'Execution' | 'Quality' | 'Collaboration' | 'Efficiency';
  earnedDate?: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
}

export interface UserStats {
  rank: number;
  score: number;
  level: number;
  badges: Badge[];
  streak: number;
}

// Activity Feed Type
export interface ActivityLog {
  id: string;
  user: string;
  action: 'created' | 'updated' | 'executed' | 'deleted' | 'commented';
  entityName: string;
  timestamp: string; // ISO or relative
  link?: string;
  status?: string;
}

// Filter State Type
export interface FilterState {
  status: string[];
  priority: string[];
  qaName: string[];
  search: string;
}

// View Types
export type ViewMode = 'list' | 'board' | 'timeline';