import { Status, Priority, Severity, Environment, Platform, TestType } from './types';

export const QA_NAMES = [
  'Krushnraj', 
  'Prince', 
  'Dinesh', 
  'Pratik', 
  'Rutvik', 
  'Srushti', 
  'Nishita', 
  'Vishvesh'
];

export const REVIEWERS = [
  'Krushnraj', 
  'Prince', 
  'Dinesh', 
  'Pratik', 
  'Rutvik', 
  'Srushti', 
  'Nishita', 
  'Vishvesh'
];

export const PRODUCTS = [
  'EasyBankCore', 
  'Payroll', 
  'Ratnafin', 
  'Enfinity'
];

export const DEFECT_TYPES = [
  'UI Defect',
  'Functional Defect',
  'Backend Defect',
  'API Defect',
  'Data Defect',
  'Performance Defect',
  'Security Defect',
  'Compatibility Defect',
  'Accessibility Defect',
  'Usability Defect',
  'Regression Defect',
  'Environment/Configuration Issue',
  'Requirement Gap',
  'Integration Defect',
  'Crash/Freeze Defect',
  'Intermittent/Flaky Issue',
  'Documentation Defect'
];

export const TEST_CATEGORIES = [
  'Sanity Suite',
  'Smoke Suite',
  'Critical Pack',
  'Module Suite',
  'Regression Pack'
];

export const BROWSERS = [
  'Chrome', 
  'Firefox', 
  'Edge', 
  'Brave', 
  'Safari'
];

export const DEVICES = [
  'Desktop', 
  'Laptop', 
  'Tablet', 
  'Mobile'
];

export const OPERATING_SYSTEMS = [
  'Windows', 
  'macOS', 
  'iOS', 
  'Android', 
  'Linux'
];

export const LOCALES = [
  'en-US', 
  'en-IN', 
  'fr-FR', 
  'es-ES', 
  'de-DE'
];

export const RELEASES = [
  'v1.0', 
  'v1.1', 
  'v2.0', 
  'v2.1', 
  'v3.0'
];

export const TEST_SUITES = [
  'Sanity Pack',
  'Regression Pack',
  'Full Suite',
  'Module Suite',
  'Critical Pack',
  'Full Regression Suite',
  'End-to-End Suite',
  'Performance Suite'
];

// Helper to convert Enums to options
export const enumToOptions = (enumObj: any) => Object.values(enumObj).map(v => ({ label: v as string, value: v as string }));