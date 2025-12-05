
export enum Status {
  Draft = 'Draft',
  InReview = 'In Review',
  Approved = 'Approved',
  Blocked = 'Blocked',
  Retest = 'Retest',
  Pass = 'Pass',
  Fail = 'Fail',
  Deprecated = 'Deprecated'
}

export enum Priority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum Severity {
  Critical = 'Critical',
  Major = 'Major',
  Minor = 'Minor',
  Cosmetic = 'Cosmetic'
}

export enum Environment {
  DEV = 'DEV',
  QA = 'QA',
  UAT = 'UAT',
  PROD = 'PROD',
  STAGING = 'STAGING'
}

export enum Platform {
  Web = 'Web',
  MobileAndroid = 'Mobile (Android)',
  MobileiOS = 'Mobile (iOS)',
  Desktop = 'Desktop',
  API = 'API'
}

export enum TestType {
  Functional = 'Functional',
  Regression = 'Regression',
  Smoke = 'Smoke',
  Sanity = 'Sanity',
  Integration = 'Integration',
  Security = 'Security',
  Performance = 'Performance'
}

export interface TestCase {
  id: string; // Test Case ID
  subject: string;
  status: Status;
  priority: Priority;
  qaName: string;
  product: string;
  crNumber: string;
  moduleCode: string;
  screenCode: string;
  fieldName: string;
  executionDate: string;
  platform: Platform;
  environment: Environment;
  testType: TestType;
  defectLink?: string;
  reviewer: string;
  qaReviewRemarks?: string;
  justificationRemarks?: string;
  proofOfTestcase?: string; // URL or text reference
  expectedOutput: string;
  actualOutput?: string;
  testSteps: string;
  preconditions: string;
  postConditions: string;
  lastModified: string;
  lastModifiedBy: string;
  
  // Additional dropdown fields requested
  defectType?: string;
  severity?: Severity;
  testCategory?: string;
  browser?: string;
  deviceType?: string;
  operatingSystem?: string;
  locale?: string;
  releaseVersion?: string;
  testSuite?: string;
}

export type TestCaseFormData = Omit<TestCase, 'id' | 'lastModified' | 'lastModifiedBy'>;

// Filter State Interface
export interface FilterState {
  status: string[];
  priority: string[];
  product: string[];
  qaName: string[];
  executionDateRange: { start: string; end: string };
}

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
