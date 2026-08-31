# DLPMS Complete Approval Workflow

## Multi-Level Approval Pipeline

```
[Student Submits Leave Form]
            │
            ▼
[Status: Pending Mentor (Yellow)] ──► (Mentor Reviews & Approves)
            │
            ▼
[Status: Pending HOD (Blue)]     ──► (HOD Reviews & Approves)
            │
            ▼
[Status: Pending Warden (Purple)]  ──► (Warden Reviews & Approves)
            │
            ▼
[Status: Ready at Gate (Green)]    ──► (Digital QR Pass Auto-Generated)
            │
            ▼
[Status: Student Out (Orange)]     ──► (Main Gate Security Scans QR & Marks Exit)
            │
            ▼
[Status: Student Returned (Emerald)] ──► (Main Gate Security Marks Campus Return)
```

## Approval Rules
1. **Rejection at any stage**: Immediately sets status to `Rejected` (Red) and notifies the student.
2. **QR Pass Generation**: Triggered automatically as soon as Warden approves the request.
3. **Audit Trail**: Every action logs timestamp, actor role, actor name, and approval comment.
