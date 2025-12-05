
import { Status, Priority, Severity, Environment, Platform, TestType } from './types';

export const QA_NAMES = ['Amit Sharma', 'Priya Patel', 'Rahul Verma', 'Sneha Gupta', 'John Doe'];
export const PRODUCTS = ['Bankai ERP', 'Bankai CRM', 'FinTech Core', 'HealthPlus App'];
export const REVIEWERS = ['Senior QA Lead', 'Manager XYZ', 'Architect ABC'];
export const DEFECT_TYPES = ['Functional', 'UI/UX', 'Performance', 'Security', 'Data'];
export const TEST_CATEGORIES = ['Frontend', 'Backend', 'Database', 'API', 'Middleware'];
export const BROWSERS = ['Chrome', 'Firefox', 'Edge', 'Safari', 'Opera'];
export const DEVICES = ['Desktop', 'iPhone 14', 'Samsung S23', 'iPad Pro'];
export const OPERATING_SYSTEMS = ['Windows 11', 'MacOS', 'Linux', 'Android 13', 'iOS 16'];
export const LOCALES = ['en-US', 'hi-IN', 'en-GB', 'fr-FR', 'de-DE'];
export const RELEASES = ['v1.0.0', 'v1.1.0', 'v2.0.0 Beta', 'v2.5.0'];
export const TEST_SUITES = ['Smoke Suite', 'Regression Nightly', 'Sanity Check', 'E2E Critical'];

// Helper to convert Enums to options
export const enumToOptions = (enumObj: any) => Object.values(enumObj).map(v => ({ label: v as string, value: v as string }));
