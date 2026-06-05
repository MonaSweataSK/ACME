# Frontend Requirements Specification (PRD)

## 1. Executive Summary
The frontend for the ACME HR Management tool will be a highly interactive, premium Single Page Application (SPA). It must process and display thousands of employee and salary records fluidly, avoiding browser-thread locking. The design must project an elite, "wow-factor" corporate aesthetic, heavily utilizing modern CSS techniques.

## 2. Core Features & User Stories

### 2.1 Global Navigation
- **As an HR Manager**, I want a persistent sidebar or top navigation bar so I can easily switch between the Dashboard overview and the Employee Directory.

### 4.2 Dashboard & Analytics Overview (`/`)
- **As an HR Manager**, I want to see top-level KPI cards (Total Headcount, Total Payroll in USD, Average Salary).
- **As an HR Manager**, I want to view the distribution of employees by Department and Salary Bands.
- **As an HR Manager**, I want an interactive "Export to CSV" button that triggers a direct file download of the flattened analytics matrix.
- *Performance Requirement*: Data must be fetched via the unified `/api/analytics` endpoint and rendered with staggered entrance animations.

### 4.3 Employee Directory (`/employees`)
- **As an HR Manager**, I want to view the entire workforce of 10,000+ employees in a structured data grid.
- **As an HR Manager**, I want to filter the grid by `department` and `status` or search by name/employee code.
- *Performance Requirement*: The table must utilize pagination (or virtualization) hooked into `/api/employees?page=X&limit=Y` to guarantee 60fps scrolling without DOM bloat.

### 4.4 Employee Detail & Salary Management (`/employees/:id`)
- **As an HR Manager**, I want to click into an employee's profile to view their core HR details and active role.
- **As an HR Manager**, I want to see a vertical timeline or stacked list of the employee's historical salary records, clearly distinguishing the currently "Active" record from past "Inactive" records.
- **As an HR Manager**, I want a "New Salary Revision" button that opens a glassmorphic modal. In this modal, I can input a new Base, Bonus, and Allowances. Submitting the modal hits `POST /api/employees/:id/salary` and automatically refreshes the UI to show the new active Total CTC without reloading the page.

## 3. Non-Functional Requirements
- **Error Handling**: Graceful toast notifications or inline error messages if backend validation fails (e.g., Zod 400 Bad Request responses).
- **Loading States**: Skeletons or sleek spinners must immediately render when switching routes or executing network fetches.
- **Accessibility (a11y)**: Semantic HTML tags must be used, ensuring form inputs have linked labels and interactive elements are focusable.
