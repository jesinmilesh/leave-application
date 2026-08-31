# DLPMS Database Specification

## Database Architecture
- **DBMS**: PostgreSQL
- **ORM**: Prisma ORM

## Database Schema Diagram & ERD Summary
```
+----------------+       1:1       +-----------------+
|     User       |--------------->|     Student     |
+----------------+                 +-----------------+
        |                                   |
        | 1:N                               | 1:N
        v                                   v
+----------------+ 1:N             +-----------------+
|ApprovalHistory |<----------------|  LeaveRequest   |
+----------------+                 +-----------------+
                                            |
                                            | 1:1
                                            v
                                   +-----------------+
                                   |    GateLogs     |
                                   +-----------------+
```

## Tables & Schema Specifications

### `User` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique user identifier |
| `name` | String | Required | Full Name |
| `email` | String | Unique | Official institution email |
| `password` | String | Required | Hashed password bcrypt |
| `role` | Enum | Required | STUDENT, MENTOR, HOD, WARDEN, SECURITY, PRINCIPAL, ADMIN |
| `department` | String | Required | Department affiliation (CSE, ECE, etc.) |

### `LeaveRequest` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `leaveId` | String | Primary Key | Format: `PEC-CSE-2026-000123` |
| `studentId` | Foreign Key | References `Student(userId)` | FK to student |
| `subject` | String | Required | Leave subject title |
| `reason` | Text | Required | Detailed reason |
| `fromDate` | DateTime | Required | Outgoing date |
| `toDate` | DateTime | Required | Expected return date |
| `outTime` | String | Required | Out time |
| `returnTime` | String | Required | Return time |
| `status` | Enum | Default `PENDING_MENTOR` | Yellow, Blue, Purple, Green, Orange, Emerald, Red |
| `parentPhone` | String | Required | Phone number for verification |
