# Organization Structure - Critical Backend API Flow

## 🎯 Overview

This document outlines the **most critical backend API flows** for the organization structure module, covering two main scenarios:
1. **Flow A**: Candidate Registration → Employee Conversion → Organization Assignment
2. **Flow B**: HR Side - Department & Position Setup → Employee Assignment

---

## 📋 Flow A: Candidate Registration to Organization Assignment

### Phase 1: Candidate Self-Registration

#### Step 1.1: Register as Candidate
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "candidate@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "nationalId": "12345678901234",
  "userType": "candidate",
  "gender": "MALE",
  "dateOfBirth": "1990-01-15",
  "mobilePhone": "+201234567890"
}
```

**Backend Flow:**
```
1. AuthService.register()
   ↓
2. Validate email uniqueness (checks EmployeeProfile + Candidate)
   ↓
3. Validate nationalId uniqueness
   ↓
4. Hash password (bcrypt)
   ↓
5. Generate candidateNumber (auto-generated)
   ↓
6. Create Candidate document:
   - candidateNumber: "CAND-2024-0001"
   - status: "APPLIED"
   - applicationDate: new Date()
   ↓
7. Save to Candidate collection
   ↓
8. Return success
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "candidate registered successfully",
  "userType": "candidate"
}
```

**Database State:**
- ✅ Candidate document created in `candidates` collection
- ✅ User can now login

---

#### Step 1.2: Candidate Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "candidate@example.com",
  "password": "securePassword123"
}
```

**Backend Flow:**
```
1. AuthService.signIn()
   ↓
2. Find user by email (searches Candidate + EmployeeProfile)
   ↓
3. Verify password (bcrypt.compare)
   ↓
4. Check candidate status (must be APPLIED, SHORTLISTED, or OFFERED)
   ↓
5. Generate JWT token with payload:
   {
     userid: candidate._id,
     email: candidate.personalEmail,
     userType: "candidate",
     candidateNumber: "CAND-2024-0001",
     roles: ["JOB_CANDIDATE"]
   }
   ↓
6. Set httpOnly cookie with JWT token
   ↓
7. Return user data
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "user": {
    "userid": "507f1f77bcf86cd799439011",
    "email": "candidate@example.com",
    "userType": "candidate",
    "candidateNumber": "CAND-2024-0001",
    "roles": ["JOB_CANDIDATE"]
  }
}
```

**Cookie Set:**
- `token`: JWT token (httpOnly, secure in production)

---

### Phase 2: HR Reviews and Hires Candidate

#### Step 2.1: HR Views Candidate Profile
**Endpoint:** `GET /employee-profile/:id`

**Authorization:** HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN

**Backend Flow:**
```
1. JwtAuthGuard validates token
   ↓
2. RolesGuard checks HR role
   ↓
3. EmployeeProfileService.getProfileById()
   ↓
4. Find candidate by ID
   ↓
5. Return candidate profile
```

**Response:**
```json
{
  "success": true,
  "message": "Employee profile retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "candidateNumber": "CAND-2024-0001",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "nationalId": "12345678901234",
    "status": "APPLIED",
    "personalEmail": "candidate@example.com",
    "mobilePhone": "+201234567890"
  }
}
```

---

#### Step 2.2: HR Creates Department (if needed)
**Endpoint:** `POST /organization-structure/departments`

**Authorization:** HR_ADMIN, SYSTEM_ADMIN

**Request Body:**
```json
{
  "code": "IT",
  "name": "Information Technology",
  "description": "IT Department",
  "headPositionId": null
}
```

**Backend Flow:**
```
1. JwtAuthGuard validates token
   ↓
2. RolesGuard checks HR_ADMIN or SYSTEM_ADMIN
   ↓
3. OrganizationStructureService.createDepartment()
   ↓
4. Validate department code uniqueness
   ↓
5. Validate headPositionId exists (if provided)
   ↓
6. Create Department document:
   {
     code: "IT",
     name: "Information Technology",
     description: "IT Department",
     isActive: true
   }
   ↓
7. Save to departments collection
   ↓
8. Return created department
```

**Response:**
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "code": "IT",
    "name": "Information Technology",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Database State:**
- ✅ Department created in `departments` collection

---

#### Step 2.3: HR Creates Position
**Endpoint:** `POST /organization-structure/positions`

**Authorization:** HR_ADMIN, SYSTEM_ADMIN

**Request Body:**
```json
{
  "code": "IT-DEV-001",
  "title": "Senior Software Developer",
  "description": "Senior developer position",
  "departmentId": "507f1f77bcf86cd799439012",
  "reportsToPositionId": null
}
```

**Backend Flow:**
```
1. JwtAuthGuard validates token
   ↓
2. RolesGuard checks HR_ADMIN or SYSTEM_ADMIN
   ↓
3. OrganizationStructureService.createPosition()
   ↓
4. Validate position code uniqueness
   ↓
5. Validate department exists (validateDepartmentExists)
   ↓
6. Validate reporting position exists (if provided)
   ↓
7. Create Position document
   ↓
8. Pre-save hook: Auto-assigns reporting position if department has head
   ↓
9. Save to positions collection
   ↓
10. Return created position
```

**Response:**
```json
{
  "success": true,
  "message": "Position created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "code": "IT-DEV-001",
    "title": "Senior Software Developer",
    "departmentId": "507f1f77bcf86cd799439012",
    "isActive": true,
    "createdAt": "2024-01-15T10:05:00Z"
  }
}
```

**Database State:**
- ✅ Position created in `positions` collection
- ✅ Position linked to Department

---

#### Step 2.4: HR Converts Candidate to Employee
**Endpoint:** `PATCH /employee-profile/:id/hr`

**Authorization:** HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN

**Request Body:**
```json
{
  "employeeNumber": "EMP-2024-0001",
  "dateOfHire": "2024-01-20",
  "workEmail": "john.doe@company.com",
  "status": "ACTIVE",
  "contractType": "FULL_TIME",
  "workType": "ON_SITE",
  "primaryPositionId": "507f1f77bcf86cd799439013",
  "primaryDepartmentId": "507f1f77bcf86cd799439012",
  "supervisorPositionId": null
}
```

**Backend Flow:**
```
1. JwtAuthGuard validates token
   ↓
2. RolesGuard checks HR role
   ↓
3. EmployeeProfileService.updateEmployeeProfileAsHr()
   ↓
4. Validate employee profile ID
   ↓
5. Build update object:
   - Convert date strings to Date objects
   - Convert ObjectId strings to Types.ObjectId
   - Handle nested address fields
   ↓
6. Update EmployeeProfile document:
   {
     employeeNumber: "EMP-2024-0001",
     dateOfHire: new Date("2024-01-20"),
     workEmail: "john.doe@company.com",
     status: "ACTIVE",
     primaryPositionId: ObjectId("507f1f77bcf86cd799439013"),
     primaryDepartmentId: ObjectId("507f1f77bcf86cd799439012")
   }
   ↓
7. Save to employee_profiles collection
   ↓
8. Return updated profile
```

**Response:**
```json
{
  "success": true,
  "message": "Employee profile updated successfully by HR",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "employeeNumber": "EMP-2024-0001",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "dateOfHire": "2024-01-20T00:00:00Z",
    "workEmail": "john.doe@company.com",
    "status": "ACTIVE",
    "primaryPositionId": "507f1f77bcf86cd799439013",
    "primaryDepartmentId": "507f1f77bcf86cd799439012",
    "primaryPosition": {
      "code": "IT-DEV-001",
      "title": "Senior Software Developer"
    },
    "primaryDepartment": {
      "code": "IT",
      "name": "Information Technology"
    }
  }
}
```

**Database State:**
- ✅ EmployeeProfile updated with organization structure links
- ✅ Employee now linked to Position and Department
- ✅ Employee can view org chart and reporting structure

---

### Phase 3: View Organization Structure

#### Step 3.1: Employee Views Own Profile with Org Structure
**Endpoint:** `GET /employee-profile/me`

**Authorization:** Any authenticated user

**Backend Flow:**
```
1. JwtAuthGuard validates token
   ↓
2. Extract user from JWT (userid, userType)
   ↓
3. EmployeeProfileService.getMyProfile()
   ↓
4. If userType === "candidate":
     - Find in candidates collection
   Else:
     - Find in employee_profiles collection
     - Populate primaryPositionId, primaryDepartmentId
   ↓
5. Return profile with org structure
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "employeeNumber": "EMP-2024-0001",
    "fullName": "John Doe",
    "primaryPosition": {
      "_id": "507f1f77bcf86cd799439013",
      "code": "IT-DEV-001",
      "title": "Senior Software Developer"
    },
    "primaryDepartment": {
      "_id": "507f1f77bcf86cd799439012",
      "code": "IT",
      "name": "Information Technology"
    },
    "supervisorPosition": null
  }
}
```

---

#### Step 3.2: View Department Organization Chart
**Endpoint:** `GET /organization-structure/org-chart/department/:departmentId`

**Authorization:** Any authenticated user

**Backend Flow:**
```
1. JwtAuthGuard validates token
   ↓
2. OrganizationStructureService.getDepartmentOrgChart()
   ↓
3. Find department by ID
   ↓
4. Find all active positions in department
   ↓
5. Build position tree (buildPositionTree):
   - Root positions (no reportsToPositionId)
   - Recursively build children
   ↓
6. Calculate statistics:
   - totalPositions
   - filledPositions (from PositionAssignment)
   - vacantPositions
   ↓
7. Return org chart structure
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generatedAt": "2024-01-15T10:30:00Z",
    "departments": [
      {
        "department": {
          "id": "507f1f77bcf86cd799439012",
          "code": "IT",
          "name": "Information Technology"
        },
        "positions": [
          {
            "id": "507f1f77bcf86cd799439013",
            "code": "IT-DEV-001",
            "title": "Senior Software Developer",
            "children": []
          }
        ],
        "statistics": {
          "totalPositions": 1,
          "filledPositions": 1,
          "vacantPositions": 0
        }
      }
    ]
  }
}
```

---

## 📋 Flow B: HR Side - Complete Setup Flow

### Phase 1: Setup Organization Structure

#### Step 1.1: Create Department
**Endpoint:** `POST /organization-structure/departments`

**Same as Flow A, Step 2.2**

---

#### Step 1.2: Create Position with Reporting Structure
**Endpoint:** `POST /organization-structure/positions`

**Request Body:**
```json
{
  "code": "IT-MGR-001",
  "title": "IT Manager",
  "description": "IT Department Manager",
  "departmentId": "507f1f77bcf86cd799439012",
  "reportsToPositionId": null
}
```

**Then create subordinate position:**
```json
{
  "code": "IT-DEV-002",
  "title": "Junior Software Developer",
  "departmentId": "507f1f77bcf86cd799439012",
  "reportsToPositionId": "507f1f77bcf86cd799439014"  // IT Manager position ID
}
```

**Backend Flow:**
```
1. Validate position code uniqueness
   ↓
2. Validate department exists
   ↓
3. Validate reportsToPositionId exists
   ↓
4. Validate no circular reporting:
   - Traverse up reporting chain
   - Check if current position appears in chain
   - Throw error if circular reference detected
   ↓
5. Create position
   ↓
6. Save to database
```

---

#### Step 1.3: Assign Department Head
**Endpoint:** `PUT /organization-structure/departments/:id/head`

**Request Body:**
```json
{
  "headPositionId": "507f1f77bcf86cd799439014"
}
```

**Backend Flow:**
```
1. Find department by ID
   ↓
2. Validate position exists
   ↓
3. Update department.headPositionId
   ↓
4. Save department
   ↓
5. Return updated department
```

**Result:**
- Department now has a head position
- All positions in department can reference this head

---

### Phase 2: Assign Employee to Organization

#### Step 2.1: Search for Employee
**Endpoint:** `GET /employee-profile/search?fullName=John&status=ACTIVE`

**Backend Flow:**
```
1. EmployeeProfileService.searchProfiles()
   ↓
2. Build search filters:
   - Name search (regex)
   - National ID
   - Status, contract type, work type
   - Department ID
   - Position ID
   ↓
3. Execute search query
   ↓
4. Return matching profiles
```

---

#### Step 2.2: Assign Employee to Position
**Endpoint:** `PATCH /employee-profile/:id/hr`

**Request Body:**
```json
{
  "primaryPositionId": "507f1f77bcf86cd799439013",
  "primaryDepartmentId": "507f1f77bcf86cd799439012",
  "supervisorPositionId": "507f1f77bcf86cd799439014"
}
```

**Backend Flow:**
```
1. Validate employee profile ID
   ↓
2. Validate position exists (implicit via ObjectId)
   ↓
3. Validate department exists (implicit via ObjectId)
   ↓
4. Update EmployeeProfile:
   {
     primaryPositionId: ObjectId("507f1f77bcf86cd799439013"),
     primaryDepartmentId: ObjectId("507f1f77bcf86cd799439012"),
     supervisorPositionId: ObjectId("507f1f77bcf86cd799439014")
   }
   ↓
5. Save to database
   ↓
6. Return updated profile
```

**Database State:**
- ✅ Employee linked to position
- ✅ Employee linked to department
- ✅ Employee has supervisor position
- ✅ Employee appears in org chart

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FLOW A: CANDIDATE PATH                    │
└─────────────────────────────────────────────────────────────┘

1. POST /auth/register (Candidate)
   └─> Creates Candidate document
       └─> Status: APPLIED

2. POST /auth/login (Candidate)
   └─> Returns JWT token
       └─> Cookie set: token

3. [HR Actions]
   ├─> GET /employee-profile/:id (View candidate)
   ├─> POST /organization-structure/departments (Create dept)
   ├─> POST /organization-structure/positions (Create position)
   └─> PATCH /employee-profile/:id/hr (Convert to employee)
       └─> Sets primaryPositionId, primaryDepartmentId
           └─> Employee now in org structure

4. GET /employee-profile/me (Employee views profile)
   └─> Returns profile with org structure

5. GET /organization-structure/org-chart/department/:id
   └─> Shows employee in org chart


┌─────────────────────────────────────────────────────────────┐
│                    FLOW B: HR SETUP PATH                     │
└─────────────────────────────────────────────────────────────┘

1. POST /organization-structure/departments
   └─> Create department

2. POST /organization-structure/positions
   └─> Create positions (with reporting structure)

3. PUT /organization-structure/departments/:id/head
   └─> Assign department head

4. GET /employee-profile/search
   └─> Find employee

5. PATCH /employee-profile/:id/hr
   └─> Assign to position/department
       └─> Employee in org structure

6. GET /organization-structure/org-chart
   └─> View complete org structure
```

---

## 🔐 Critical Security Points

### Authentication Flow
1. **Registration**: Public endpoint, creates candidate/employee
2. **Login**: Public endpoint, sets httpOnly cookie
3. **All other endpoints**: Require JWT token in cookie

### Authorization Levels
- **Public**: Registration, Login
- **Authenticated**: View own profile, view org chart
- **HR_MANAGER/HR_ADMIN**: View all profiles, update profiles, create departments/positions
- **SYSTEM_ADMIN**: Full access, can delete departments

### Data Validation
1. **Department Code**: Must be unique
2. **Position Code**: Must be unique
3. **Circular Reporting**: Prevented by validation
4. **ObjectId Validation**: All IDs validated before use

---

## 📊 Database Collections Involved

1. **candidates** - Candidate profiles
2. **employee_profiles** - Employee profiles (with org structure links)
3. **departments** - Department definitions
4. **positions** - Position definitions
5. **position_assignments** - Historical position assignments (optional)
6. **structure_change_requests** - Change requests for org structure

---

## 🎯 Key Integration Points

### Employee Profile ↔ Organization Structure
- `EmployeeProfile.primaryPositionId` → `Position._id`
- `EmployeeProfile.primaryDepartmentId` → `Department._id`
- `EmployeeProfile.supervisorPositionId` → `Position._id`

### Position ↔ Department
- `Position.departmentId` → `Department._id`
- `Position.reportsToPositionId` → `Position._id` (self-reference)
- `Department.headPositionId` → `Position._id`

### Change Requests
- `StructureChangeRequest.targetDepartmentId` → `Department._id`
- `StructureChangeRequest.targetPositionId` → `Position._id`
- `StructureChangeRequest.requestedByEmployeeId` → `EmployeeProfile._id`

---

## 🚨 Critical Error Scenarios

1. **Circular Reporting**: Position A reports to B, B reports to A
   - **Prevention**: `validateNoCircularReporting()` method

2. **Deleting Position with Reports**: Position has subordinates
   - **Prevention**: Check `reportsToPositionId` count before deactivation

3. **Invalid Department/Position IDs**: Non-existent ObjectIds
   - **Prevention**: `validateDepartmentExists()`, `validatePositionExists()`

4. **Duplicate Codes**: Department or position code already exists
   - **Prevention**: Unique index on `code` field

---

## 📝 Summary

**Critical Path for Candidate:**
1. Register → Login → HR Hires → Assign to Position → View Org Structure

**Critical Path for HR:**
1. Create Department → Create Position → Assign Employee → View Org Chart

**Key Endpoints:**
- `POST /auth/register` - Start of journey
- `PATCH /employee-profile/:id/hr` - **Critical**: Links employee to org structure
- `GET /organization-structure/org-chart` - View complete structure

**Most Critical Endpoint:**
`PATCH /employee-profile/:id/hr` - This is where employees get assigned to positions and departments, making them part of the organization structure.

