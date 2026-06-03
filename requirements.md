# Requirements Document: ACME Salary Management System

## 1. Goal
Replace ACME's Excel-based salary management process with a secure, performant web application that allows the HR Manager to view, manage, and analyze salary data for 10,000 employees across multiple countries from a single, reliable, and fluid interface[cite: 1, 2].

---

## 2. Background & Problem
The HR team currently manages salary data for 10,000 employees across multiple countries using static spreadsheets[cite: 1, 2]. This creates critical operational bottlenecks:
*   **Reliability Risk:** Manual edits introduce human error, and massive spreadsheets are highly vulnerable to corruption.
*   **Discoverability Problem:** Answering organizational questions (e.g., *"What is the average salary in the India Engineering team?"*) requires manual filtering, manual formula entry, and brittle analysis[cite: 2].
*   **No Audit Trail:** There is zero historical logging showing who modified a salary, when the modification happened, or the business context behind it[cite: 2].
*   **Scale Friction:** Managing and updating a 10,000-row spreadsheet causes heavy local performance lag, creating UI frustration for the HR team[cite: 1, 2].

---

## 3. User Persona
### Primary User: HR Manager
The HR Manager requires an intuitive software interface to:
*   Quickly locate any employee's profile, active compensation structure, and comprehensive salary history[cite: 2].
*   Execute salary adjustments with a mandatory, documented reason to preserve administrative integrity[cite: 2].
*   Gain an immediate overview of compensation trends across departments, countries, and designations without writing database queries[cite: 2, 3].
*   Seamlessly onboard new hires into the corporate database[cite: 2].

---

## 4. Scope & Features

### 4.1 Employee Management

#### 4.1.1 Employee List
*   A clean, paginated, searchable interface containing all 10,000 records[cite: 1, 2].
*   **Search Vector Targets:** Employee Name, Employee ID, and Email Address[cite: 2].

#### 4.1.2 Employee Filters
Instant list filtering by:
*   Country
*   Department
*   Designation
*   Employment Status (Active / Inactive)[cite: 2]

#### 4.1.3 Employee Detail View
A comprehensive structural overview detailing:
*   Personal details (Name, Contact, Identifiers)[cite: 2].
*   Current Active Salary Details (Base, Bonus, Allowances, Total CTC)[cite: 2].
*   Chronological, immutable historical salary log[cite: 2].

#### 4.1.4 Onboarding (Add Employee)
Capture initial employee profiles including:
*   Core demographic profiles[cite: 2].
*   Department, Designation, and operational Country placement[cite: 2].
*   Initial Salary baseline structure[cite: 2].

#### 4.1.5 Profile Management (Edit Employee)
*   Modify dynamic organizational data points (Name, Department, Designation, Country)[cite: 2].
*   Administrative toggle to change status (e.g., marking an employee as Inactive)[cite: 2].

### 4.2 Salary Management & Versioning

#### 4.2.1 Active Salary Display
Real-time calculated visibility into current remuneration breakdowns:
*   Base Salary
*   Bonus Structure
*   Allowances
*   **Total CTC:** Calculated on the fly or systematically stored via backend formulas[cite: 2].
*   Effective Date[cite: 2]

#### 4.2.2 Salary Revision Actions
Executing adjustments triggers specific immutability parameters:
*   **Fields Required:** Effective Date, Revision Reason, Base Salary, Bonus, and Allowances[cite: 2].
*   **Immutability Rule:** Revisions create a new historical record version. Previous salary logs are permanently read-only and cannot be updated or erased to maintain compliance audit trails[cite: 2].

#### 4.2.3 Multi-Currency Handling
*   Salaries are input and saved natively matching the local currency assigned to the employee’s country[cite: 2].
*   Cross-border analytics auto-convert local baselines using a deterministic, internal translation engine into a baseline Reporting Currency (**USD**)[cite: 2].

### 4.3 Analytics & Insights (High Performance Dashboard)

#### 4.3.1 Consolidated Analytics Engine
To avoid network request concurrency bottlenecks and UI flashing when loading data for 10,000 employees, individual micro-endpoints are completely bypassed[cite: 1]. The dashboard leverages a unified single-pass data hydration engine[cite: 3].

A single payload provides the UI with:
*   **Global Summary Metrics:** Total Headcount, Active vs. Inactive splits, aggregate payroll costs, organization-wide average, and median CTC metrics[cite: 2, 3].
*   **Department Breakdown:** Headcount, minimum/maximum ranges, average allocations, and total payroll spends categorized per department[cite: 2, 3].
*   **Designation Analytics:** Structural distribution arrays showing employee concentrations and associated average salaries across functional job tiers[cite: 2, 3].
*   **Country Distribution:** Operational headcount matrices, localized currency tallies, and converted normalized USD payroll balances for global benchmarking[cite: 2, 3].
*   **Salary Band Distribution:** Stratified workforce distribution analysis tracking employee concentrations across explicit monetary bands (e.g., $0\text{--}25\text{k}$, $25\text{k}\text{--}50\text{k}$, $50\text{k}\text{--}75\text{k}$, $75\text{k}\text{--}100\text{k}$, $100\text{k}+$)[cite: 2, 3].
*   **Compensation Insights:** Explicit identification arrays reporting top-earning personnel, highest/lowest compensated departments, and extreme designation vectors[cite: 2, 3].

#### 4.3.2 Filtering & Reporting Export
*   **Drill-Down Control:** Dashboard widgets are reactive to global filters (Country, Department, Status)[cite: 2, 3].
*   **Export Profiles:** On-demand export generation translating active analytical configurations into flat CSV formatting for standard reporting workflows[cite: 2].

---

## 5. Deliberately Out of Scope & Trade-offs
To deliver a bulletproof, production-grade MVP within the assessment window, specific technical boundary lines have been established to prevent scope creep while keeping code quality and test focus high[cite: 1].

### 5.1 Authentication & Role-Based Access Control (RBAC)
*   **Omission:** Login gates, active multi-tenant segregation, JWT refresh handshakes, or permission matrices (e.g., HR Director vs. HR Assistant roles)[cite: 3].
*   **Reasoning:** The assignment explicitly targets a single internal persona: the organization's HR Manager[cite: 1, 2]. Introducing auth layers introduces heavy boilerplate logic without augmenting the core data structures, performance capabilities, or algorithmic implementations under evaluation[cite: 1].

### 5.2 Real-Time Live Forex API Integrations
*   **Omission:** Dynamic outgoing network hooks to real-time market currency conversion feeds[cite: 3].
*   **Reasoning:** External network dependencies introduce runtime fragility, external latency spikes, and rate-limiting failure risks during grading cycles[cite: 1]. For payroll analytics and fiscal stability, organizations use fixed budgeting exchange rates[cite: 2]. A deterministic, seeded translation matrix is utilized on the server side to protect performance and guarantee reproducibility[cite: 1].

### 5.3 Multi-Tier Approval Workflows
*   **Omission:** Pending states, draft salary versions, or multi-person sign-off flows (e.g., requiring secondary manager authorization)[cite: 3].
*   **Reasoning:** To avoid over-engineering the application into an asynchronous workflow approval engine, salary revisions committed by the HR Manager instantly transition into the active historical record log upon validation[cite: 2, 3].

### 5.4 Bulk Document Ingestion (Excel Ingest Pipelines)
*   **Omission:** The capability to drop standard external spreadsheet files directly into the UI to mutate employee states at scale[cite: 3].
*   **Reasoning:** Bulletproof multi-file bulk ingest engines require massive file parsing packages, asynchronous worker queues (e.g., BullMQ/Redis), and row-by-row transactional error-rollback mechanics to guarantee safety. The system mitigates Excel risks by shifting all data manipulation to structured UI form inputs while providing robust CSV reporting outputs[cite: 2, 3].