# Notification Bell - Employee Notifications

## Overview

The Notification Bell component provides employees with a centralized way to receive and view notifications, particularly for appraisal acknowledgments (REQ-PP-07).

## Where Employees Receive Notifications

### 1. **Notification Bell in Navbar** 🔔
- **Location**: Top-right corner of the navbar, next to user info
- **Visibility**: Only shown for employees (`userType === 'employee'`)
- **Badge Count**: Shows total number of:
  - Pending appraisal acknowledgments
  - Active toast notifications

### 2. **Notification Dropdown** 📋
- **Trigger**: Click the notification bell
- **Content**:
  - **Pending Acknowledgments**: Shows count of published appraisals ready for acknowledgment
  - **Recent Toast Notifications**: Shows last 5 toast notifications
  - **Quick Actions**: "View All Performance Notifications" button

### 3. **Toast Notifications** 💬
- **Location**: Top-right corner of the screen (via `NotificationContainer`)
- **Triggers**:
  - When visiting Performance module and published appraisals are detected
  - After successfully acknowledging an appraisal
  - On errors during acknowledgment

## How It Works

### Automatic Checking
1. **On Login/Page Load**: Checks for pending acknowledgments
2. **Auto-Refresh**: Checks every 30 seconds for new acknowledgments
3. **On Bell Click**: Refreshes pending acknowledgments when opening dropdown

### Notification Sources

#### 1. Pending Appraisal Acknowledgments
- **Source**: Performance API (`getEmployeeAssignments`)
- **Filter**: Assignments with status `PUBLISHED`
- **Display**: Shows in dropdown as "New Appraisal Result Available"
- **Action**: Clicking navigates to Performance module

#### 2. Toast Notifications
- **Source**: Notification system (`useNotification` hook)
- **Types**: Success, Error, Warning, Info
- **Display**: Toast notifications in top-right corner
- **Examples**:
  - "You have X published appraisals ready for acknowledgment"
  - "Appraisal acknowledged successfully"
  - Error messages

## User Flow

### Scenario: Employee Receives New Appraisal

1. **HR publishes appraisal** → Status changes to `PUBLISHED`
2. **Employee logs in or visits Performance module**:
   - Notification bell shows badge count (e.g., "1")
   - Toast notification appears: "You have 1 published appraisal ready for acknowledgment"
3. **Employee clicks notification bell**:
   - Dropdown opens showing "New Appraisal Result Available"
   - Clicking navigates to Performance module
4. **Employee acknowledges**:
   - Success toast: "Appraisal acknowledged successfully"
   - Badge count decreases
   - Assignment status changes to `ACKNOWLEDGED`

## Component Structure

```
NotificationBell/
├── NotificationBell.tsx          # Main bell component
├── NotificationDropdown.tsx      # Dropdown menu
├── NotificationBell.module.css   # Bell styles
├── NotificationDropdown.module.css # Dropdown styles
└── index.ts                      # Exports
```

## Integration Points

### Navbar Integration
```tsx
// In Navbar.tsx
import { NotificationBell } from '../NotificationBell';

<div className={styles.rightSection}>
  <NotificationBell />
  {/* User info, logout button */}
</div>
```

### Performance Module Integration
```tsx
// In EmployeeAssignmentsView.tsx
const { showInfo } = useNotification('performance');

// Show notification when published appraisals detected
if (publishedAssignments.length > 0) {
  showInfo(
    `You have ${publishedAssignments.length} published appraisal(s) ready for acknowledgment`,
    { title: 'New Appraisal Results', duration: 7000 }
  );
}
```

## Features

✅ **Real-time Updates**: Auto-refreshes every 30 seconds  
✅ **Badge Count**: Visual indicator of pending items  
✅ **Click Outside to Close**: Dropdown closes when clicking outside  
✅ **Navigation**: Quick link to Performance module  
✅ **Error Handling**: Gracefully handles API errors  
✅ **Responsive**: Works on mobile and desktop  
✅ **Accessibility**: ARIA labels and keyboard support  

## Customization

### Change Refresh Interval
```tsx
// In NotificationBell.tsx
const interval = setInterval(checkPendingAcknowledgments, 30000); // 30 seconds
```

### Change Badge Position
```css
/* In NotificationBell.module.css */
.badge {
  top: 0;
  right: 0;
  /* Adjust as needed */
}
```

### Change Dropdown Width
```css
/* In NotificationDropdown.module.css */
.dropdown {
  width: 360px; /* Adjust as needed */
}
```

## Future Enhancements

- [ ] Real-time WebSocket notifications
- [ ] Email notifications for critical items
- [ ] Notification history/archive
- [ ] Mark as read functionality
- [ ] Notification preferences/settings
- [ ] Support for other notification types (leaves, payroll, etc.)

