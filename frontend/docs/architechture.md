# Frontend Architecture

## Technology Stack
- **Core Engine**: React 18, Vite (for blazing fast HMR and optimized builds)
- **Language**: TypeScript (Strict mode)
- **Styling Strategy**: Tailwind CSS (Utility-first styling approach).
- **Data Fetching/Caching**: `@tanstack/react-query` (handles loading states, re-fetching, and caching seamlessly).
- **Routing**: `react-router-dom` (v6+).
- **Iconography**: `lucide-react`.

## Design System & Aesthetics
- **Theme**: A sleek, deep dark-mode base (e.g., `#09090b` or `#0f172a`).
- **Glassmorphism**: Modals, dropdowns, and cards will use semi-transparent backgrounds with `backdrop-filter: blur(12px)` and delicate 1px borders.
- **Micro-animations**: Interactive elements (buttons, table rows, nav links) will feature smooth `<0.2s` transform/opacity transitions on hover or active states.
- **Typography**: Clean, geometric sans-serif fonts (e.g., `Inter`, `Outfit`, or `Plus Jakarta Sans`) to enforce high legibility across dense data tables.

## Design System Architecture
To maintain strict consistency throughout the app, all interactive UI will leverage a custom Design System built with Tailwind CSS, restricted to the following variations:
- **Button**: `primary`, `secondary`, and `danger`.
- **Input**: Standard inputs and `password` type (with built-in visibility toggle).
- **Dropdown**: Searchable options, supporting icons embedded in both the search field and the individual options.
- **Toast**: Variations: `success`, `error`, and `info`. Positions: `top-center`, `top-right`, and `bottom-right`.
- **Loading**: A spinner icon supporting `small`, `medium`, and `large` sizes.

## Application Architecture

### 1. Global Setup & Routing
- **Library**: `react-router-dom` (v6+ Browser Router)
- **Global Layout (`src/components/layout/AppLayout.tsx`)**:
  - A persistent left-hand Sidebar Navigation featuring links to the Dashboard and Employee Directory.
  - A main content area for rendering child routes.
  - Integration of the global `Toaster` component for system-wide alerts.

### 2. API Integration Layer (`src/lib/api.ts`)
We will create a centralized Axios (or native fetch wrapper) client to communicate with the Express backend at `http://localhost:3000/api`.
- Setup request interceptors for standardized error mapping.
- Wrap API calls in `@tanstack/react-query` custom hooks (e.g., `useEmployees()`, `useAnalytics()`) to automatically handle loading states, background refetching, and cache invalidation.

### 3. Core Pages Implementation Logic

#### Dashboard Overview (`src/pages/Dashboard.tsx`)
- **Route**: `/`
- **Data Source**: `GET /api/analytics`
- **Components**:
  - `StatCard`: Renders Total Headcount, Total Payroll, and Average Salary with sleek typography.
  - `DistributionLists`: Renders the Department and Designation breakdowns using flex layouts.
  - `ExportButton`: A primary action button hitting `GET /api/analytics/export` to trigger a native browser CSV download.

#### Employee Directory (`src/pages/Employees.tsx`)
- **Route**: `/employees`
- **Data Source**: `GET /api/employees?page=X&search=Y&department=Z`
- **Components**:
  - `FilterBar`: Contains the searchable `Dropdown` (for department filtering) and an `Input` (for searching names/codes).
  - `DataTable`: A styled CSS Grid/Table rendering the employee profiles.
  - `Pagination`: Previous/Next `Button` components mapped to React Query state variables.

#### Employee Details & Salary Management (`src/pages/EmployeeDetail.tsx`)
- **Route**: `/employees/:id`
- **Data Source**: `GET /api/employees/:id`
- **Components**:
  - `ProfileHeader`: Displays the employee's name, email, department, and active status.
  - `SalaryTimeline`: A vertical list rendering the employee's salary history. Actively maps the `is_active` boolean to highlight the current CTC vs historical logs.
  - `SalaryRevisionModal`: A glassmorphic overlay containing a form (Base Salary, Bonus, Allowances `Input` fields).
  - **Mutation Action**: Submitting the modal fires `POST /api/employees/:id/salary`, triggers a success `Toast`, and automatically invalidates the React Query cache to re-render the timeline with the new active record.
