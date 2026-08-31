# Digital Leave Permission Management System (DLPMS) — API Documentation

## Authentication Endpoints

### 1. User Login
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Request Body**:
```json
{
  "email": "rahul.cse@pec.edu",
  "password": "password123"
}
```
- **Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "STU-001",
    "name": "Rahul Sharma",
    "role": "STUDENT",
    "department": "CSE"
  }
}
```

---

## Leave Permission Endpoints

### 2. Submit Leave Permission Request
- **Method**: `POST`
- **Endpoint**: `/leave/create`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "leaveType": "Medical Leave",
  "subject": "Permission for Medical Checkup & Rest",
  "reason": "Severe fever and Doctor's consultation prescribed for 2 days rest at home.",
  "fromDate": "2026-08-15",
  "toDate": "2026-08-17",
  "outTime": "09:00 AM",
  "returnTime": "06:00 PM",
  "parentPhone": "+91 98765 43210",
  "parentConsent": true,
  "mentorName": "Dr. K. Arunkumar"
}
```
- **Response**:
```json
{
  "message": "Leave permission request created successfully.",
  "leaveId": "PEC-CSE-2026-000123",
  "status": "Pending Mentor"
}
```

### 3. Get Student's Own Leaves
- **Method**: `GET`
- **Endpoint**: `/leave/my`
- **Headers**: `Authorization: Bearer <token>`

---

## Mentor & HOD Endpoints

### 4. Mentor Approve Request
- **Method**: `POST`
- **Endpoint**: `/mentor/approve`
- **Request Body**:
```json
{
  "leaveId": "PEC-CSE-2026-000123",
  "comment": "Verified doctor letter & parent phone confirmation. Approved."
}
```

### 5. HOD Approve Request (or Bulk)
- **Method**: `POST`
- **Endpoint**: `/hod/approve`
- **Request Body**:
```json
{
  "leaveIds": ["PEC-CSE-2026-000123"],
  "comment": "Approved by HOD office."
}
```

---

## Warden & Security Endpoints

### 6. Warden Approval & Pass Issuance
- **Method**: `POST`
- **Endpoint**: `/warden/approve`
- **Request Body**:
```json
{
  "leaveId": "PEC-CSE-2026-000123",
  "comment": "Hostel room key handed over. Digital pass activated."
}
```

### 7. Main Gate Security Mark Exit
- **Method**: `POST`
- **Endpoint**: `/security/exit`
- **Request Body**:
```json
{
  "leaveId": "PEC-CSE-2026-000123"
}
```

### 8. Main Gate Security Mark Entry
- **Method**: `POST`
- **Endpoint**: `/security/entry`
- **Request Body**:
```json
{
  "leaveId": "PEC-CSE-2026-000123"
}
```

---

## Principal Super Admin Dashboard API

### 9. Principal Overview & Metrics
- **Method**: `GET`
- **Endpoint**: `/principal/dashboard`
- **Response**:
```json
{
  "todaysLeaves": 18,
  "studentsOutside": 12,
  "pendingRequests": 7,
  "approvalRate": 94
}
```
