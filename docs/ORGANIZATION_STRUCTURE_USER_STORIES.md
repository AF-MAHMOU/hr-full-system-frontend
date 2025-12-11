# Organization Structure Module - User Stories & API Flow

## 📋 User Stories Extracted from Implementation

### 1. Department Management

#### US-1.1: Create Department
**As an** HR Admin or System Admin  
**I want to** create a new department  
**So that** I can organize the company structure

**Acceptance Criteria:**
- Department must have unique code
- Department can optionally have a head position
- Department is created as active by default

**API Endpoint:** `POST /organization-structure/departments`

---

#### US-1.2: View All Departments
**As a** user  
**I want to** view all departments with pagination and filtering  
**So that** I can browse the organization structure

**Acceptance Criteria:**
- Support pagination (page, limit)
- Support search by code, name, or description
- Filter by active/inactive status
- Filter by head position
- Sort by any field

**API Endpoint:** `GET /organization-structure/departments`

---

#### US-1.3: View Department Details
**As a** user  
**I want to** view a specific department by ID or code  
**So that** I can see detailed information

**API Endpoints:**
- `GET /organization-structure/departments/:id`
- `GET /organization-structure/departments/code/:code`

---

#### US-1.4: View Department Hierarchy
**As a** user  
**I want to** view the department hierarchy  
**So that** I can understand the organizational structure

**API Endpoint:** `GET /organization-structure/departments/hierarchy`

---

#### US-1.5: View Department Statistics
**As a** user  
**I want to** view statistics for a department  
**So that** I can understand department metrics

**API Endpoint:** `GET /organization-structure/departments/:id/stats`

---

#### US-1.6: Update Department
**As an** HR Admin or System Admin  
**I want to** update department information  
**So that** I can keep the structure current

**API Endpoints:**
- `PUT /organization-structure/departments/:id`
- `PUT /organization-structure/departments/code/:code`

---

#### US-1.7: Assign Department Head
**As an** HR Admin or System Admin  
**I want to** assign or remove a head position for a department  
**So that** I can establish reporting structure

**API Endpoints:**
- `PUT /organization-structure/departments/:id/head`
- `PUT /organization-structure/departments/code/:code/head`

---

#### US-1.8: Deactivate Department
**As a** System Admin  
**I want to** deactivate a department  
**So that** I can remove it from active use without deleting data

**API Endpoints:**
- `DELETE /organization-structure/departments/:id`
- `DELETE /organization-structure/departments/code/:code`

---

### 2. Position Management

#### US-2.1: Create Position
**As an** HR Admin or System Admin  
**I want to** create a new position  
**So that** I can define roles in the organization

**Acceptance Criteria:**
- Position must have unique code
- Position must belong to a department
- Position can optionally report to another position
- Position is created as active by default

**API Endpoint:** `POST /organization-structure/positions`

---

#### US-2.2: View All Positions
**As a** user  
**I want to** view all positions with pagination and filtering  
**So that** I can browse available positions

**Acceptance Criteria:**
- Support pagination
- Filter by department, reporting position, active status
- Search by code, title, or description
- Sort by any field

**API Endpoint:** `GET /organization-structure/positions`

---

#### US-2.3: View Position Details
**As a** user  
**I want to** view a specific position by ID or code  
**So that** I can see detailed information

**API Endpoints:**
- `GET /organization-structure/positions/:id`
- `GET /organization-structure/positions/code/:code`

---

#### US-2.4: View Positions by Department
**As a** user  
**I want to** view all positions in a specific department  
**So that** I can see department structure

**API Endpoint:** `GET /organization-structure/positions/department/:departmentId`

---

#### US-2.5: View Position Hierarchy
**As a** user  
**I want to** view the position reporting hierarchy  
**So that** I can understand reporting relationships

**API Endpoint:** `GET /organization-structure/positions/hierarchy`

---

#### US-2.6: View Reporting Positions
**As a** user  
**I want to** view all positions that report to a specific position  
**So that** I can see direct reports

**API Endpoints:**
- `GET /organization-structure/positions/:id/reporting-positions`
- `GET /organization-structure/positions/code/:code/reporting-positions`

---

#### US-2.7: View Reporting Chain
**As a** user  
**I want to** view the complete reporting chain upward from a position  
**So that** I can see the management hierarchy

**API Endpoints:**
- `GET /organization-structure/positions/:id/reporting-chain`
- `GET /organization-structure/positions/code/:code/reporting-chain`

---

#### US-2.8: Update Position
**As an** HR Admin or System Admin  
**I want to** update position information  
**So that** I can keep position details current

**API Endpoints:**
- `PUT /organization-structure/positions/:id`
- `PUT /organization-structure/positions/code/:code`

---

#### US-2.9: Assign Reporting Position
**As an** HR Admin or System Admin  
**I want to** assign or remove a reporting relationship for a position  
**So that** I can establish management structure

**Acceptance Criteria:**
- Cannot create circular reporting relationships
- Position cannot report to itself

**API Endpoints:**
- `PUT /organization-structure/positions/:id/reporting-position`
- `PUT /organization-structure/positions/code/:code/reporting-position`

---

#### US-2.10: Reassign Position to Department
**As an** HR Admin or System Admin  
**I want to** move a position to a different department  
**So that** I can reorganize the structure

**API Endpoints:**
- `PUT /organization-structure/positions/:id/department`
- `PUT /organization-structure/positions/code/:code/department`

---

#### US-2.11: Deactivate Position
**As an** HR Admin or System Admin  
**I want to** deactivate a position  
**So that** I can remove it from active use

**Acceptance Criteria:**
- Cannot deactivate if other positions report to it
- Must reassign reporting positions first

**API Endpoints:**
- `DELETE /organization-structure/positions/:id`
- `DELETE /organization-structure/positions/code/:code`

---

### 3. Change Request Management

#### US-3.1: Create Change Request
**As an** HR Admin, System Admin, or Department Head  
**I want to** create a change request for organizational changes  
**So that** I can propose structure modifications

**Acceptance Criteria:**
- Request types: NEW_DEPARTMENT, UPDATE_DEPARTMENT, NEW_POSITION, UPDATE_POSITION, CLOSE_POSITION
- Request starts in DRAFT status
- Auto-generates unique request number (ORG-YYYY-####)

**API Endpoint:** `POST /organization-structure/change-requests`

---

#### US-3.2: View All Change Requests
**As a** user  
**I want to** view all change requests with filtering  
**So that** I can track organizational changes

**Acceptance Criteria:**
- Support pagination
- Filter by request number, type, status
- Sort by any field

**API Endpoint:** `GET /organization-structure/change-requests`

---

#### US-3.3: View Change Request Details
**As a** user  
**I want to** view a specific change request  
**So that** I can see request details

**API Endpoints:**
- `GET /organization-structure/change-requests/:id`
- `GET /organization-structure/change-requests/number/:requestNumber`

---

#### US-3.4: Update Change Request (Draft)
**As an** HR Admin, System Admin, or Department Head  
**I want to** update a draft change request  
**So that** I can modify it before submission

**Acceptance Criteria:**
- Only DRAFT requests can be updated

**API Endpoint:** `PUT /organization-structure/change-requests/:id`

---

#### US-3.5: Submit Change Request for Review
**As an** HR Admin, System Admin, or Department Head  
**I want to** submit a change request for review  
**So that** it can be reviewed by HR

**Acceptance Criteria:**
- Only DRAFT requests can be submitted
- Status changes to SUBMITTED

**API Endpoint:** `POST /organization-structure/change-requests/:id/submit`

---

#### US-3.6: Review Change Request
**As an** HR Admin, HR Manager, or System Admin  
**I want to** review a submitted change request  
**So that** I can approve or reject it

**Acceptance Criteria:**
- Only SUBMITTED requests can be reviewed
- Can approve or reject with comments
- Creates approval record

**API Endpoint:** `POST /organization-structure/change-requests/:id/review`

---

#### US-3.7: Approve Change Request
**As a** System Admin  
**I want to** approve a change request  
**So that** it can be implemented

**Acceptance Criteria:**
- Only SUBMITTED requests can be approved
- Status changes to APPROVED
- Creates approval record

**API Endpoint:** `POST /organization-structure/change-requests/:id/approve`

---

#### US-3.8: Reject Change Request
**As an** HR Admin, HR Manager, or System Admin  
**I want to** reject a change request  
**So that** I can decline inappropriate changes

**Acceptance Criteria:**
- Only SUBMITTED requests can be rejected
- Must provide rejection reason
- Status changes to REJECTED

**API Endpoint:** `POST /organization-structure/change-requests/:id/reject`

---

#### US-3.9: Cancel Change Request
**As an** HR Admin, System Admin, or Department Head  
**I want to** cancel a change request  
**So that** I can withdraw it

**Acceptance Criteria:**
- Only DRAFT or SUBMITTED requests can be cancelled
- Status changes to CANCELED

**API Endpoint:** `DELETE /organization-structure/change-requests/:id`

---

### 4. Organization Chart

#### US-4.1: Generate Full Organization Chart
**As a** user  
**I want to** view the complete organization chart  
**So that** I can see the entire company structure

**API Endpoint:** `GET /organization-structure/org-chart`

---

#### US-4.2: Generate Department Organization Chart
**As a** user  
**I want to** view the organization chart for a specific department  
**So that** I can see department structure

**API Endpoint:** `GET /organization-structure/org-chart/department/:departmentId`

---

#### US-4.3: Generate Simplified Organization Chart
**As a** user  
**I want to** view a simplified organization chart  
**So that** I can see a high-level view

**API Endpoint:** `GET /organization-structure/org-chart/simplified`

---

#### US-4.4: Export Organization Chart as JSON
**As a** user  
**I want to** export the organization chart as JSON  
**So that** I can use it in other systems

**API Endpoint:** `GET /organization-structure/org-chart/export/json`

---

#### US-4.5: Export Organization Chart as CSV
**As a** user  
**I want to** export the organization chart as CSV  
**So that** I can analyze it in Excel

**API Endpoint:** `GET /organization-structure/org-chart/export/csv`

---

## 🔗 Required Services & Dependencies

### 1. **Employee Profile Service** (Required)
**Purpose:** Manage employee data and assignments

**Integration Points:**
- `StructureChangeRequest.requestedByEmployeeId` → EmployeeProfile
- `StructureChangeRequest.submittedByEmployeeId` → EmployeeProfile
- `StructureApproval.approverEmployeeId` → EmployeeProfile
- `PositionAssignment.employeeProfileId` → EmployeeProfile
- `StructureChangeLog.changedByEmployeeId` → EmployeeProfile

**Required Methods:**
- Get employee by ID
- Validate employee exists
- Get employee roles/permissions

**Module:** `src/employee-profile/`

---

### 2. **Authentication Service** (Required)
**Purpose:** Handle user authentication and authorization

**Integration Points:**
- JWT token validation
- Role-based access control (RBAC)
- User context (CurrentUser decorator)

**Required Roles:**
- `SystemRole.HR_ADMIN` - Can manage departments, positions, review change requests
- `SystemRole.SYSTEM_ADMIN` - Full access, can approve change requests
- `SystemRole.DEPARTMENT_HEAD` - Can create change requests
- `SystemRole.HR_MANAGER` - Can review change requests

**Module:** `src/auth/`

---

### 3. **Notification Service** (Recommended)
**Purpose:** Send notifications for change request status updates

**Integration Points:**
- Notify when change request is submitted
- Notify when change request is approved/rejected
- Notify when change request is implemented

**Recommended Features:**
- Email notifications
- In-app notifications
- Notification preferences

---

### 4. **Audit/Logging Service** (Recommended)
**Purpose:** Track all changes to organization structure

**Integration Points:**
- Log department creation/updates/deletions
- Log position creation/updates/deletions
- Log change request status changes
- Log approval decisions

**Current Implementation:**
- `StructureChangeLog` model exists but not fully integrated

---

### 5. **Reporting Service** (Optional)
**Purpose:** Generate reports on organization structure

**Integration Points:**
- Department statistics
- Position statistics
- Change request reports
- Organization chart analytics

---

## 🔄 Backend API Flow

### Flow 1: Create and Manage Department

```
1. Client Request
   ↓
2. Authentication Middleware (JwtAuthGuard)
   - Validates JWT token
   - Extracts user information
   ↓
3. Authorization Check (RolesGuard)
   - Checks if user has HR_ADMIN or SYSTEM_ADMIN role
   ↓
4. Controller (OrganizationStructureController)
   - Validates request body (CreateDepartmentDto)
   - Extracts current user
   ↓
5. Service (OrganizationStructureService)
   - Validates department code uniqueness
   - Validates head position exists (if provided)
   - Creates department document
   - Saves to MongoDB
   ↓
6. Response
   - Returns created department with success message
```

### Flow 2: Create Position with Validation

```
1. Client Request (POST /positions)
   ↓
2. Authentication & Authorization
   - JwtAuthGuard validates token
   - RolesGuard checks HR_ADMIN or SYSTEM_ADMIN
   ↓
3. Controller
   - Validates CreatePositionDto
   ↓
4. Service (createPosition)
   - Validates position code uniqueness
   - Validates department exists (validateDepartmentExists)
   - Validates reporting position exists (if provided)
   - Creates position document
   - Pre-save hook: Auto-assigns reporting position if department head exists
   - Saves to MongoDB
   ↓
5. Response
   - Returns created position
```

### Flow 3: Change Request Workflow

```
1. Create Change Request (DRAFT)
   POST /change-requests
   ↓
   - User: HR_ADMIN, SYSTEM_ADMIN, or DEPARTMENT_HEAD
   - Status: DRAFT
   - Auto-generates request number (ORG-YYYY-####)
   
2. Update Change Request (if needed)
   PUT /change-requests/:id
   ↓
   - Only if status is DRAFT
   
3. Submit for Review
   POST /change-requests/:id/submit
   ↓
   - Status changes to SUBMITTED
   - Records submittedByEmployeeId and submittedAt
   
4. Review Change Request
   POST /change-requests/:id/review
   ↓
   - User: HR_ADMIN, HR_MANAGER, or SYSTEM_ADMIN
   - Creates StructureApproval record
   - Status changes to APPROVED or REJECTED
   
5. Approve Change Request (System Admin only)
   POST /change-requests/:id/approve
   ↓
   - User: SYSTEM_ADMIN only
   - Creates StructureApproval record
   - Status changes to APPROVED
   - (Implementation step would happen here - not yet implemented)
   
6. Reject Change Request
   POST /change-requests/:id/reject
   ↓
   - User: HR_ADMIN, HR_MANAGER, or SYSTEM_ADMIN
   - Creates StructureApproval record with rejection reason
   - Status changes to REJECTED
```

### Flow 4: Organization Chart Generation

```
1. Request Org Chart
   GET /org-chart
   ↓
2. Service (generateOrgChart)
   - Fetches all active departments
   - For each department:
     a. Fetches all active positions
     b. Builds position tree (buildPositionTree)
     c. Calculates statistics
   ↓
3. Response
   - Returns hierarchical structure with:
     - Department information
     - Position tree with reporting relationships
     - Statistics (total positions, filled, vacant)
```

### Flow 5: Position Reporting Chain Validation

```
1. Assign Reporting Position
   PUT /positions/:id/reporting-position
   ↓
2. Service (assignReportingPosition)
   - Validates position exists
   - Validates reporting position exists
   - Validates no self-reference
   - Validates no circular reporting (validateNoCircularReporting)
     ↓
     - Traverses up the reporting chain
     - Checks if current position appears in chain
     - Throws error if circular reference detected
   ↓
3. Updates position
   - Sets reportsToPositionId
   - Saves to MongoDB
   ↓
4. Response
   - Returns updated position
```

## 📊 Data Models & Relationships

### Department
- `code` (unique)
- `name`
- `description`
- `headPositionId` → Position (optional)
- `isActive`

### Position
- `code` (unique)
- `title`
- `description`
- `departmentId` → Department (required)
- `reportsToPositionId` → Position (optional, self-reference)
- `isActive`

### StructureChangeRequest
- `requestNumber` (unique, auto-generated)
- `requestedByEmployeeId` → EmployeeProfile
- `requestType` (enum)
- `targetDepartmentId` → Department (optional)
- `targetPositionId` → Position (optional)
- `details`
- `reason`
- `status` (enum: DRAFT, SUBMITTED, APPROVED, REJECTED, etc.)
- `submittedByEmployeeId` → EmployeeProfile (optional)
- `submittedAt` (optional)

### StructureApproval
- `changeRequestId` → StructureChangeRequest
- `approverEmployeeId` → EmployeeProfile
- `decision` (enum: APPROVED, REJECTED)
- `decidedAt`
- `comments`

### PositionAssignment
- `employeeProfileId` → EmployeeProfile
- `positionId` → Position
- `departmentId` → Department (snapshot)
- `startDate`
- `endDate` (optional)
- `changeRequestId` → StructureChangeRequest (optional)
- `reason`
- `notes`

## 🔐 Security & Authorization

### Role-Based Access Control

| Action | HR_ADMIN | SYSTEM_ADMIN | DEPARTMENT_HEAD | HR_MANAGER | Regular User |
|--------|----------|--------------|-----------------|------------|--------------|
| View Departments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Department | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Department | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Department | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Positions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Position | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Position | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Position | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Change Request | ✅ | ✅ | ✅ | ❌ | ❌ |
| Review Change Request | ✅ | ✅ | ❌ | ✅ | ❌ |
| Approve Change Request | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Org Chart | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🚀 API Endpoints Summary

### Departments (11 endpoints)
- `POST /organization-structure/departments` - Create
- `GET /organization-structure/departments` - List (with pagination)
- `GET /organization-structure/departments/hierarchy` - Hierarchy
- `GET /organization-structure/departments/code/:code` - Get by code
- `GET /organization-structure/departments/:id` - Get by ID
- `GET /organization-structure/departments/:id/stats` - Statistics
- `PUT /organization-structure/departments/:id` - Update
- `PUT /organization-structure/departments/code/:code` - Update by code
- `PUT /organization-structure/departments/:id/head` - Assign head
- `DELETE /organization-structure/departments/:id` - Deactivate
- `DELETE /organization-structure/departments/code/:code` - Deactivate by code

### Positions (15 endpoints)
- `POST /organization-structure/positions` - Create
- `GET /organization-structure/positions` - List (with pagination)
- `GET /organization-structure/positions/hierarchy` - Hierarchy
- `GET /organization-structure/positions/department/:departmentId` - By department
- `GET /organization-structure/positions/:id` - Get by ID
- `GET /organization-structure/positions/code/:code` - Get by code
- `GET /organization-structure/positions/:id/reporting-positions` - Direct reports
- `GET /organization-structure/positions/:id/reporting-chain` - Reporting chain
- `PUT /organization-structure/positions/:id` - Update
- `PUT /organization-structure/positions/code/:code` - Update by code
- `PUT /organization-structure/positions/:id/reporting-position` - Assign reporting
- `PUT /organization-structure/positions/:id/department` - Reassign department
- `DELETE /organization-structure/positions/:id` - Deactivate
- `DELETE /organization-structure/positions/code/:code` - Deactivate by code
- Plus code-based variants for reporting endpoints

### Change Requests (9 endpoints)
- `POST /organization-structure/change-requests` - Create
- `GET /organization-structure/change-requests` - List (with pagination)
- `GET /organization-structure/change-requests/:id` - Get by ID
- `GET /organization-structure/change-requests/number/:requestNumber` - Get by number
- `PUT /organization-structure/change-requests/:id` - Update (draft only)
- `POST /organization-structure/change-requests/:id/submit` - Submit for review
- `POST /organization-structure/change-requests/:id/review` - Review
- `POST /organization-structure/change-requests/:id/approve` - Approve
- `POST /organization-structure/change-requests/:id/reject` - Reject
- `DELETE /organization-structure/change-requests/:id` - Cancel

### Organization Chart (5 endpoints)
- `GET /organization-structure/org-chart` - Full chart
- `GET /organization-structure/org-chart/department/:departmentId` - Department chart
- `GET /organization-structure/org-chart/simplified` - Simplified chart
- `GET /organization-structure/org-chart/export/json` - Export JSON
- `GET /organization-structure/org-chart/export/csv` - Export CSV

**Total: 40 API endpoints**

## 📝 Notes

1. **Circular Reference Prevention:** The system prevents positions from reporting to themselves and detects circular reporting chains.

2. **Soft Delete:** Departments and positions are deactivated (isActive = false) rather than deleted to maintain data integrity.

3. **Change Request Workflow:** Implements a proper approval workflow with status tracking and audit trail.

4. **Position Auto-Assignment:** When a position is created/updated, if the department has a head position, it's automatically assigned as the reporting position (via pre-save hook).

5. **Request Number Generation:** Change requests get auto-generated numbers in format `ORG-YYYY-####` (e.g., ORG-2024-0001).

6. **Missing Implementation:** The actual implementation of approved change requests (updating departments/positions) is not yet implemented in the service layer.

