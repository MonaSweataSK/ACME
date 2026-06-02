# Salary Management System

## 1. Goal

Replace ACME's Excel-based salary management process with a web application that allows the HR Manager to view, manage, and analyze salary data for 10,000 employees across multiple countries from a single, reliable interface.

---

## 2. Background & Problem

The HR team currently manages salary data for 10,000 employees across multiple countries using spreadsheets. This creates several challenges:

- **Reliability Risk** – Manual edits can introduce errors, and spreadsheets are easy to corrupt.
- **Discoverability Problem** – Answering questions such as "What is the average salary in the India Engineering team?" requires manual filtering and analysis.
- **No Audit Trail** – There is no record of who changed a salary, when it was changed, or why.
- **Scale Friction** – Managing and analyzing a 10,000-row spreadsheet is slow and cumbersome.

---

## 3. User Persona

### Primary User: HR Manager

The HR Manager needs to:

- Look up any employee's current compensation and salary history.
- Make salary revisions with a documented reason.
- Understand compensation patterns across departments, countries, and designations.
- Onboard new employees into the system.
- Generate reports and compensation insights.

---

## 4. Scope & Features

### 4.1 Employee Management

#### 4.1.1 Employee List

- Paginated, searchable table of all employees.
- Search by:
  - Employee Name
  - Employee ID
  - Email Address

#### 4.1.2 Employee Filters

Filter employees by:

- Country
- Department
- Designation
- Status (Active / Inactive)

#### 4.1.3 Employee Detail

View a complete employee profile, including:

- Personal Information
- Current Salary Information
- Complete Salary Revision History

#### 4.1.4 Add Employee

Onboard a new employee by capturing:

- Employee Information
- Department
- Designation
- Country
- Initial Salary Structure

#### 4.1.5 Edit Employee

Update employee information, including:

- Name
- Department
- Designation
- Country

Additional actions:

- Mark employee as inactive

---

### 4.2 Salary Management

#### 4.2.1 View Current Salary

Display the employee's current salary structure, including:

- Base Salary
- Bonus
- Allowances
- Total CTC
- Effective Date

#### 4.2.2 Salary Revision

Create a new salary revision containing:

- Effective Date
- Revision Reason
- Base Salary
- Bonus
- Allowances
- Total CTC

Rules:

- Each revision creates a new salary version.
- Previous salary records remain unchanged.
- Existing salary revisions cannot be edited or overwritten.

#### 4.2.3 Salary History

View a complete chronological history of salary revisions, including:

- Effective Date
- Previous Salary Structure
- Revised Salary Structure
- Revision Reason
- Timestamp of Change

#### 4.2.4 Multi-Currency Support

- Salaries are stored in the employee's local currency.
- Currency is determined by the employee's country.

---

### 4.3 Analytics & Insights

The HR Manager must be able to answer organization-level compensation and workforce questions without writing queries.

#### 4.3.1 Dashboard Summary

Display:

- Total Employee Count
- Active Employee Count
- Inactive Employee Count
- Total Salary Spend
- Average Salary Across the Organization

#### 4.3.2 Department Salary Analysis

Provide salary analytics grouped by department, including:

- Headcount
- Average Salary
- Minimum Salary
- Maximum Salary
- Total Salary Spend
- Department Salary Spend Ranking

#### 4.3.3 Designation Salary Analysis

Provide salary analytics grouped by designation, including:

- Headcount
- Average Salary
- Minimum Salary
- Maximum Salary
- Total Salary Spend

#### 4.3.4 Country Salary Analysis

Provide salary analytics grouped by country, including:

- Headcount
- Average Salary
- Minimum Salary
- Maximum Salary
- Total Salary Spend
- Salaries Displayed in Local Currencies

For cross-country comparisons, support conversion to a configurable reporting currency.
Here, we have configured with USD

#### 4.3.5 Salary Band Distribution

Display:

- Employee Count Within Each Salary Band
- Percentage of Employees Within Each Salary Band

Example salary bands:

- Junior
- Mid-Level
- Senior
- Lead
- Manager
- Director

#### 4.3.6 Department vs Designation Comparison

Support compensation comparisons across:

- Departments
- Designations
- Department-Designation Combinations

Highlight compensation differences between similar roles across departments.

#### 4.3.7 Compensation Insights

Provide:

- Highest-Paid Department
- Lowest-Paid Department
- Highest-Paid Designation
- Lowest-Paid Designation
- Employees with the Highest Salaries
- Employees with the Lowest Salaries

#### 4.3.8 Filtering & Drill-Down

Support filtering analytics by:

- Country
- Department
- Designation
- Employee Status (Active / Inactive)

Allow users to drill down from summary metrics to underlying employee and salary records.

#### 4.3.9 Salary Revision Analytics

Provide:

- Number of Salary Revisions During a Selected Period
- Average Salary Increase Percentage
- Salary Growth Trends by Department
- Salary Growth Trends by Designation
- Salary Growth Trends by Country

#### 4.3.10 Export & Reporting

Support exporting analytics and reports in:

- CSV Format
- Excel Format

---

### 4.4 Dashboard

Provide a landing page that gives the HR Manager immediate visibility into organizational compensation metrics, including:

- Total Headcount (Active Employees)
- Organization-Wide Average CTC
- Highest-Paying Departments
- Lowest-Paying Departments
- Country-Wise Employee Distribution
- Compensation Summary Widgets
