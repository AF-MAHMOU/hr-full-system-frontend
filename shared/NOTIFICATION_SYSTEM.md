# Notification System Documentation

## Overview

A comprehensive, reusable notification system for the HR Management System frontend. The system provides toast notifications that can be used across all modules with module-specific customization.

## Architecture

```
shared/
├── types/
│   └── notification.ts          # Type definitions
├── contexts/
│   └── NotificationContext.tsx  # Context and Provider
├── hooks/
│   └── useNotification.ts      # Main hook for components
├── components/
│   ├── Toast/                   # Individual toast component
│   └── NotificationContainer/   # Container for toasts
└── utils/
    └── notifications.ts         # Helper utilities
```

## Features

✅ **Multiple Types**: Success, Error, Warning, Info  
✅ **Auto-dismiss**: Configurable duration (0 = persistent)  
✅ **Module Tagging**: Track notifications by module  
✅ **Action Buttons**: Add interactive buttons to notifications  
✅ **Multiple Positions**: 6 position options  
✅ **Smooth Animations**: Slide-in/out animations  
✅ **Responsive**: Works on mobile and desktop  
✅ **TypeScript**: Full type safety  

## Setup

### Already Configured

The notification system is already set up in `app/layout.tsx`:

```tsx
<NotificationProvider defaultDuration={5000} maxNotifications={5}>
  {/* App content */}
  <NotificationContainer position={NotificationPosition.TOP_RIGHT} />
</NotificationProvider>
```

## Usage

### Basic Usage

```tsx
import { useNotification } from '@/shared/hooks';

function MyComponent() {
  const { showSuccess, showError } = useNotification();
  
  showSuccess('Operation completed!');
  showError('Something went wrong');
}
```

### Module-Specific Usage

```tsx
import { useNotification } from '@/shared/hooks';

function PerformanceComponent() {
  // All notifications will be tagged with 'performance'
  const { showSuccess, showError } = useNotification('performance');
  
  showSuccess('Appraisal submitted');
}
```

### Advanced Usage

```tsx
const { showError } = useNotification('performance');

showError('Failed to save', {
  title: 'Error',
  duration: 7000,
  action: {
    label: 'Retry',
    onClick: () => handleRetry(),
  },
  onClose: () => console.log('Notification closed'),
});
```

## API Reference

### useNotification Hook

```tsx
const {
  showNotification,      // Generic: (message, options?) => id
  showSuccess,           // Success: (message, options?) => id
  showError,             // Error: (message, options?) => id
  showWarning,           // Warning: (message, options?) => id
  showInfo,              // Info: (message, options?) => id
  removeNotification,    // Remove: (id) => void
  clearNotifications,    // Clear all: () => void
  clearModuleNotifications, // Clear module: (module) => void
  notifications,         // All notifications: Notification[]
} = useNotification(moduleName?);
```

### NotificationOptions

```tsx
interface NotificationOptions {
  type?: NotificationType;        // 'success' | 'error' | 'warning' | 'info'
  title?: string;                  // Optional title
  duration?: number;              // Auto-dismiss (ms), 0 = persistent
  module?: string;                 // Module name
  action?: {                       // Optional action button
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;            // Callback on close
}
```

## Examples by Module

### Performance Module

```tsx
// In performance module component
const { showSuccess, showError, showInfo } = useNotification('performance');

// After creating template
showSuccess('Template created successfully');

// After failed operation
showError('Failed to create template', {
  title: 'Error',
});

// During async operation
const infoId = showInfo('Processing...', { duration: 0 });
// ... do work ...
removeNotification(infoId);
showSuccess('Completed');
```

### Leaves Module

```tsx
const { showSuccess, showError } = useNotification('leaves');

showSuccess('Leave request submitted');
showError('Failed to submit leave request');
```

### Employee Profile Module

```tsx
const { showSuccess } = useNotification('employee-profile');

showSuccess('Profile updated successfully', {
  title: 'Success',
  duration: 3000,
});
```

## Best Practices

1. **Always specify module** when using in module-specific components
2. **Use appropriate types**: Success for success, Error for errors, etc.
3. **Keep messages concise**: Users should understand quickly
4. **Set appropriate durations**:
   - Success: 3-5 seconds
   - Error: 5-7 seconds (users need time to read)
   - Warning: 5 seconds
   - Info: 3-5 seconds
5. **Use persistent notifications** (duration: 0) only for critical info
6. **Use titles** for important notifications
7. **Use action buttons** for recoverable errors

## Integration with API Calls

```tsx
const { showSuccess, showError, formatErrorMessage } = useNotification('performance');
import { formatErrorMessage } from '@/shared/utils';

try {
  await api.call();
  showSuccess('Operation successful');
} catch (error) {
  showError(formatErrorMessage(error));
}
```

## Customization

### Change Position

Edit `app/layout.tsx`:

```tsx
<NotificationContainer 
  position={NotificationPosition.BOTTOM_RIGHT} 
/>
```

### Change Default Duration

Edit `app/layout.tsx`:

```tsx
<NotificationProvider defaultDuration={3000}>
```

### Change Max Notifications

Edit `app/layout.tsx`:

```tsx
<NotificationProvider maxNotifications={10}>
<NotificationContainer maxNotifications={10} />
```

## File Structure

- **Types**: `shared/types/notification.ts`
- **Context**: `shared/contexts/NotificationContext.tsx`
- **Hook**: `shared/hooks/useNotification.ts`
- **Components**: `shared/components/Toast/` and `NotificationContainer/`
- **Utils**: `shared/utils/notifications.ts`

## Exports

All notification functionality is exported from:
- `@/shared/hooks` - `useNotification`
- `@/shared/components` - `Toast`, `NotificationContainer`
- `@/shared/types` - `NotificationType`, `NotificationPosition`, etc.
- `@/shared/utils` - `formatErrorMessage`, `formatSuccessMessage`

