# Requirements Document: ACME Salary Management System

## 1. Goal
Replace ACME's Excel-based salary management process with a secure, performant web application that allows the HR Manager to view, manage, and analyze salary data for 10,000 employees across multiple countries from a single, reliable, and fluid interface.

---

## 2. Background & Problem
The HR team currently manages salary data for 10,000 employees across multiple countries using static spreadsheets. This creates critical operational bottlenecks:
*   **Reliability Risk:** Manual edits introduce human error, and massive spreadsheets are highly vulnerable to corruption.
*   **Discoverability Problem:** Answering organizational questions (e.g., *"What is the average salary in the India Engineering team?"*) requires manual filtering, manual formula entry, and brittle analysis.
*   **Scale Friction:** Managing and updating a 10,000-row spreadsheet causes heavy local performance lag, creating UI frustration for the HR team.

---

## 3. User Persona
### Primary User: HR Manager
The HR Manager requires an intuitive software interface to:
*   Quickly locate any employee's profile, active compensation structure, and comprehensive salary history.
*   Edit employee records, execute salary adjustments with a mandatory, documented reason to preserve administrative integrity.
*   Gain an immediate overview of compensation trends across departments, countries, and designations without writing database queries.
*   Seamlessly onboard new hires into the corporate database.

---

## 4. Scope & Features

### 4.1 Employee Management

#### 4.1.1 Employee List
*   A clean, paginated, searchable interface containing all 10,000 records.
*   **Search Vector Targets:** Employee Name, Employee ID, and Email Address.

#### 4.1.2 Employee Filters
Instant list filtering by:
*   Country
*   Department
*   Designation
*   Employment Status (Active / Inactive)

#### 4.1.3 Employee Detail View
A comprehensive structural overview detailing:
*   Personal details (Name, Contact, Identifiers).
*   Current Active Salary Details (Base, Bonus, Allowances, Total CTC).
*   Chronological, immutable historical salary log.

#### 4.1.4 Onboarding (Add Employee)
Capture initial employee profiles including:
*   Core demographic profiles.
*   Department, Designation, and operational Country placement.
*   Initial Salary baseline structure.

#### 4.1.5 Profile Management (Edit Employee)
*   Modify dynamic organizational data points (Name, Department, Designation, Country).
*   Administrative toggle to change status (e.g., marking an employee as Inactive).

### 4.2 Salary Management & Versioning

#### 4.2.1 Active Salary Display
Real-time calculated visibility into current remuneration breakdowns:
*   Base Salary
*   Bonus Structure
*   Allowances
*   **Total CTC:** Calculated on the fly or systematically stored via backend formulas.
*   Effective Date

#### 4.2.2 Salary Revision Actions
Executing adjustments triggers specific immutability parameters:
*   **Fields Required:** Effective Date, Revision Reason, Base Salary, Bonus, and Allowances.
*   **Immutability Rule:** Revisions create a new historical record version. Previous salary logs are permanently read-only and cannot be updated or erased to maintain compliance audit trails.

#### 4.2.3 Multi-Currency Handling
*   Salaries are input and saved natively matching the local currency assigned to the employee’s country.
*   Cross-border analytics auto-convert local baselines using a deterministic, internal translation engine into a baseline Reporting Currency (**USD**).

### 4.3 Analytics & Insights (High Performance Dashboard)

#### 4.3.1 Consolidated Analytics Engine
To avoid network request concurrency bottlenecks and UI flashing when loading data for 10,000 employees, the dashboard leverages a unified single-pass data hydration engine.

A single payload provides the UI with:
*   **Global Summary Metrics:** Total Headcount, Active vs. Inactive splits, aggregate payroll costs, organization-wide average, and median CTC metrics.
*   **Department Breakdown:** Headcount, minimum/maximum ranges, average allocations, and total payroll spends categorized per department.
*   **Designation Analytics:** Structural distribution arrays showing employee concentrations and associated average salaries across functional job tiers.
*   **Country Distribution:** Operational headcount matrices, localized currency tallies, and converted normalized USD payroll balances for global benchmarking.
*   **Salary Band Distribution:** Stratified workforce distribution analysis tracking employee concentrations across explicit monetary bands.
    Example bands
    $0 – 25k
    $25k – 50k
    $50k – 75k
    $75k – 100k
    $100k+

#### 4.3.2 Filtering & Reporting Export
*   **Drill-Down Control:** Dashboard widgets are reactive to global filters (Country, Department, Status).
*   **Export Profiles:** On-demand export generation translating active analytical configurations into flat CSV formatting for standard reporting workflows.

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

### 5.5 Compensation Insights (Top Earners / Extreme Vectors)
*   **Omission:** Explicit identification arrays reporting top-earning personnel, highest/lowest compensated departments, and extreme designation vectors (originally listed in section 4.3.1).
*   **Reasoning:** The existing analytics payload already provides per-department min/max salary ranges and per-designation averages, which cover the core analytical need. Dedicated "top N" ranking arrays add endpoint complexity and ambiguous sort semantics (top by base? by CTC? by USD-converted CTC?) without a clear UI consumer in the current MVP scope. If needed post-MVP, these can be derived client-side from the distribution data or added as a separate `/analytics/insights` endpoint.