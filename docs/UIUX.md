# PEC Leave Portal — UI/UX & PWA Specifications

## College Identity
- **Institution**: Prathyusha Engineering College (PEC)
- **Application Name**: Digital Leave Permission Management System (PEC Leave Portal)
- **Primary Color Palette**:
  - Background: Deep Space Dark Mode (`#020617` / `bg-slate-950`)
  - Glass Panels: Soft translucent slate (`rgba(15, 23, 42, 0.75)`)
  - Accent Colors: Royal Blue (`#2563eb`), Emerald Success (`#10b981`), Amber Warnings (`#f59e0b`), Rose Alerts (`#f43f5e`), Cyan HOD Highlights (`#06b6d4`).

## Authentication & Role Isolation Rules
- **Strict Role Isolation**: Upon logging in, a user sees **ONLY** their assigned portal.
- **No In-App Role Switching**: Role-switching buttons are absent inside active portals to prevent role spoofing and maintain clean user experiences.
- **Role Logins**:
  1. Student → Student Portal
  2. Mentor → Mentor Portal
  3. HOD → HOD Portal
  4. Warden → Warden Portal
  5. Gate Security → Security Portal
  6. Principal → Principal Super Admin Dashboard
  7. Admin → System Admin Portal

## Standardized Departments
1. **CSE** — Computer Science and Engineering
2. **CSE-AIML** — Computer Science and Engineering (Artificial Intelligence & Machine Learning)
3. **CSE-CYBER** — Computer Science and Engineering (Cyber Security)
4. **AIDS** — Artificial Intelligence and Data Science
5. **IT** — Information Technology
6. **MECH** — Mechanical Engineering
7. **EEE** — Electrical and Electronics Engineering
8. **ECE** — Electronics and Communication Engineering
9. **CSBS** — Computer Science and Business Systems

## Unique Leave ID Rule
Format: `PEC-{DepartmentCode}-{Random6Digits}`
Examples: `PEC-CSE-482915`, `PEC-CSE-AIML-714286`, `PEC-AIDS-281904`.
