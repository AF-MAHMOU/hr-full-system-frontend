# REQ-OSM-11: Change Notification - Detailed Explanation

## 📋 **What the Requirement Means**

**REQ-OSM-11: Change Notification**
> "System notifies managers/stakeholders when structural changes occur"

This means: **Whenever something changes in the organization structure, relevant people should be automatically notified.**

---

## 🎯 **What Events Should Trigger Notifications?**

### 1. **Department Changes**

#### When a Department is Created:
- **Who to notify:**
  - System Admin (always)
  - HR Admin (always)
  - Department Head (if assigned)
  - HR Manager (always)
  
- **Notification message example:**
  ```
  "New department created: [Department Name] ([Code])
  Created by: [User Name]
  Head Position: [Position Title] (if assigned)"
  ```

#### When a Department is Updated:
- **Who to notify:**
  - System Admin
  - HR Admin
  - Department Head (if changed)
  - Previous Department Head (if changed)
  
- **Notification message example:**
  ```
  "Department updated: [Department Name] ([Code])
  Changes: [What changed - name, description, head position]
  Updated by: [User Name]"
  ```

#### When a Department is Deleted/Deactivated:
- **Who to notify:**
  - System Admin
  - HR Admin
  - Department Head (if exists)
  - All employees in that department (if you have employee data)
  
- **Notification message example:**
  ```
  "Department deactivated: [Department Name] ([Code])
  All positions in this department have been deactivated.
  Deactivated by: [User Name]"
  ```

---

### 2. **Position Changes**

#### When a Position is Created:
- **Who to notify:**
  - System Admin
  - HR Admin
  - Department Head (of the department)
  - Reporting Manager (if position reports to someone)
  
- **Notification message example:**
  ```
  "New position created: [Position Title] ([Code])
  Department: [Department Name]
  Reports to: [Manager Position] (if assigned)
  Created by: [User Name]"
  ```

#### When a Position is Updated:
- **Who to notify:**
  - System Admin
  - HR Admin
  - Department Head
  - Reporting Manager (if changed)
  - Previous Reporting Manager (if changed)
  
- **Notification message example:**
  ```
  "Position updated: [Position Title] ([Code])
  Changes: [What changed - title, description, reporting relationship]
  Updated by: [User Name]"
  ```

#### When a Position is Deleted/Deactivated:
- **Who to notify:**
  - System Admin
  - HR Admin
  - Department Head
  - Reporting Manager
  - Positions that reported to this position (their managers)
  
- **Notification message example:**
  ```
  "Position deactivated: [Position Title] ([Code])
  Note: Positions reporting to this position may need reassignment.
  Deactivated by: [User Name]"
  ```

#### When a Position's Reporting Relationship Changes:
- **Who to notify:**
  - Old Reporting Manager
  - New Reporting Manager
  - Department Head
  
- **Notification message example:**
  ```
  "Reporting relationship changed: [Position Title] now reports to [New Manager]
  Previous manager: [Old Manager]
  Changed by: [User Name]"
  ```

---

### 3. **Change Request Status Changes**

#### When a Change Request is Submitted:
- **Who to notify:**
  - HR Admin (to review)
  - HR Manager (to review)
  - System Admin (to review)
  
- **Notification message example:**
  ```
  "Change request submitted: [Request Number]
  Type: [NEW_DEPARTMENT/UPDATE_DEPARTMENT/etc.]
  Requested by: [Employee Name]
  Please review and approve/reject."
  ```

#### When a Change Request is Approved:
- **Who to notify:**
  - Requester (person who created it)
  - HR Admin
  - System Admin
  - Relevant Department Head (if applicable)
  
- **Notification message example:**
  ```
  "Change request approved: [Request Number]
  Type: [Request Type]
  Approved by: [Approver Name]
  The change will be implemented shortly."
  ```

#### When a Change Request is Rejected:
- **Who to notify:**
  - Requester (person who created it)
  - HR Admin
  - System Admin
  
- **Notification message example:**
  ```
  "Change request rejected: [Request Number]
  Type: [Request Type]
  Rejected by: [Reviewer Name]
  Reason: [Rejection reason]"
  ```

#### When a Change Request is Implemented:
- **Who to notify:**
  - Requester
  - All affected stakeholders
  - Department Head (if department changed)
  - Reporting Managers (if positions changed)
  
- **Notification message example:**
  ```
  "Change request implemented: [Request Number]
  The requested changes have been applied to the organization structure."
  ```

---

## 🏗️ **How to Implement This**

### **Option 1: Simple Frontend Notifications (Easiest - Recommended for MVP)**

**Approach:** Show toast notifications in the frontend when actions complete.

**Pros:**
- ✅ Quick to implement (1-2 days)
- ✅ No backend changes needed
- ✅ Immediate feedback to user
- ✅ Good enough for course evaluation

**Cons:**
- ❌ Only notifies the person performing the action
- ❌ Doesn't notify other stakeholders automatically
- ❌ Notifications disappear when page refreshes

**Implementation:**
```typescript
// In frontend, after successful API call:
import { toast } from 'react-toastify'; // or your notification library

// After creating department:
toast.success(`Department "${department.name}" created successfully! 
  Notifications sent to: HR Admin, System Admin`);

// After approving change request:
toast.success(`Change request ${requestNumber} approved! 
  Requester has been notified.`);
```

---

### **Option 2: Backend Notification Service (More Complete)**

**Approach:** Create notifications in the backend, store them in database, display in frontend.

**Pros:**
- ✅ Notifies all relevant stakeholders
- ✅ Notifications persist (can be viewed later)
- ✅ More professional
- ✅ Better matches the requirement

**Cons:**
- ❌ More complex (3-4 days)
- ❌ Requires backend changes
- ❌ Need to determine who to notify

**Implementation Steps:**

1. **Backend:**
   - Use existing `NotificationLog` schema (already exists!)
   - Add notification creation in service methods
   - Create notification helper function
   - Determine recipients based on roles/relationships

2. **Frontend:**
   - Create notification bell/icon in header
   - Create notification list component
   - Fetch notifications from API
   - Mark as read functionality

---

### **Option 3: Hybrid Approach (Best for Your Course)**

**Approach:** 
- Backend: Create notification records in database
- Frontend: Show toast notifications immediately + notification center

**Pros:**
- ✅ Immediate feedback (toast)
- ✅ Persistent notifications (database)
- ✅ Can view notification history
- ✅ Meets requirement fully

**Cons:**
- ❌ Most work (4-5 days)
- ❌ But gives you best grade!

---

## 🎯 **My Recommendation for Your Course**

### **Start with Option 2 (Backend Notification Service)**

**Why?**
1. ✅ You already have `NotificationLog` schema in the codebase
2. ✅ It fully satisfies the requirement
3. ✅ Shows you understand backend-frontend integration
4. ✅ Professional implementation
5. ✅ Can be extended later (email notifications, etc.)

---

## 📝 **What We Need to Build**

### **Backend (2-3 days):**

1. **Notification Helper Service**
   ```typescript
   // src/organization-structure/services/notification.service.ts
   - createNotification(to: userId, type: string, message: string)
   - notifyDepartmentCreated(department, createdBy)
   - notifyDepartmentUpdated(department, changes, updatedBy)
   - notifyDepartmentDeleted(department, deletedBy)
   - notifyPositionCreated(position, createdBy)
   - notifyPositionUpdated(position, changes, updatedBy)
   - notifyPositionDeleted(position, deletedBy)
   - notifyChangeRequestSubmitted(changeRequest, submittedBy)
   - notifyChangeRequestApproved(changeRequest, approvedBy)
   - notifyChangeRequestRejected(changeRequest, rejectedBy, reason)
   ```

2. **Integration Points**
   - Add notification calls in `createDepartment()` method
   - Add notification calls in `updateDepartment()` method
   - Add notification calls in `removeDepartment()` method
   - Add notification calls in `createPosition()` method
   - Add notification calls in `updatePosition()` method
   - Add notification calls in `removePosition()` method
   - Add notification calls in `submitChangeRequestForReview()` method
   - Add notification calls in `approveChangeRequest()` method
   - Add notification calls in `rejectChangeRequest()` method

3. **API Endpoint**
   ```typescript
   GET /notifications - Get user's notifications
   PUT /notifications/:id/read - Mark notification as read
   ```

### **Frontend (1-2 days):**

1. **Notification Bell Component**
   - Icon in header showing unread count
   - Click to open notification panel

2. **Notification List Component**
   - Show all notifications
   - Group by date
   - Mark as read on click
   - Filter by type

3. **Toast Notifications (Bonus)**
   - Immediate feedback when actions complete
   - "Notification sent to stakeholders" message

---

## 🔍 **Who Should Be Notified? (Logic)**

### **For Department Changes:**

```typescript
async notifyDepartmentCreated(department, createdBy) {
  // 1. Get all HR Admins
  const hrAdmins = await getEmployeesWithRole('HR_ADMIN');
  
  // 2. Get all System Admins
  const systemAdmins = await getEmployeesWithRole('SYSTEM_ADMIN');
  
  // 3. Get HR Managers
  const hrManagers = await getEmployeesWithRole('HR_MANAGER');
  
  // 4. Get Department Head (if assigned)
  let departmentHead = null;
  if (department.headPositionId) {
    departmentHead = await getEmployeeInPosition(department.headPositionId);
  }
  
  // 5. Create notifications for all
  const recipients = [
    ...hrAdmins,
    ...systemAdmins,
    ...hrManagers,
    ...(departmentHead ? [departmentHead] : [])
  ];
  
  // Remove duplicates and the person who created it
  const uniqueRecipients = recipients.filter(
    emp => emp._id.toString() !== createdBy
  );
  
  // Create notification for each
  for (const recipient of uniqueRecipients) {
    await createNotification({
      to: recipient._id,
      type: 'department_created',
      message: `New department created: ${department.name} (${department.code})`
    });
  }
}
```

---

## 📊 **Notification Types**

```typescript
enum NotificationType {
  DEPARTMENT_CREATED = 'department_created',
  DEPARTMENT_UPDATED = 'department_updated',
  DEPARTMENT_DELETED = 'department_deleted',
  POSITION_CREATED = 'position_created',
  POSITION_UPDATED = 'position_updated',
  POSITION_DELETED = 'position_deleted',
  POSITION_REPORTING_CHANGED = 'position_reporting_changed',
  CHANGE_REQUEST_SUBMITTED = 'change_request_submitted',
  CHANGE_REQUEST_APPROVED = 'change_request_approved',
  CHANGE_REQUEST_REJECTED = 'change_request_rejected',
  CHANGE_REQUEST_IMPLEMENTED = 'change_request_implemented',
}
```

---

## ✅ **Acceptance Criteria**

To satisfy REQ-OSM-11, you need:

1. ✅ Notifications created when departments are created/updated/deleted
2. ✅ Notifications created when positions are created/updated/deleted
3. ✅ Notifications created when change requests are submitted/approved/rejected
4. ✅ Notifications sent to relevant stakeholders (not just the person doing the action)
5. ✅ Notifications visible in the UI (notification center/bell)
6. ✅ Users can see their notifications
7. ✅ Users can mark notifications as read

---

## 🎯 **Next Steps**

1. **Understand the requirement** ✅ (You're doing this now!)
2. **Decide on implementation approach** (I recommend Option 2)
3. **Build backend notification service**
4. **Integrate notifications into organization structure service**
5. **Build frontend notification UI**
6. **Test with different user roles**

---

## 💡 **Quick Win: Start Simple**

If you want to start simple and get it working quickly:

1. **Phase 1 (1 day):** Add toast notifications in frontend
   - Show success message after each action
   - Mention that stakeholders will be notified
   - This shows you understand the requirement

2. **Phase 2 (2-3 days):** Add backend notification service
   - Create notifications in database
   - Determine recipients
   - Store notifications

3. **Phase 3 (1 day):** Add frontend notification center
   - Show notification bell
   - Display notification list
   - Mark as read

**Total: 4-5 days for complete implementation**

---

Ready to start? Let me know which approach you want to take!

