# Notification System

A comprehensive, reusable notification system for the HR Management System frontend.

## Features

- ✅ Toast notifications (success, error, warning, info)
- ✅ Auto-dismiss with customizable duration
- ✅ Persistent notifications (duration: 0)
- ✅ Module-based notifications
- ✅ Action buttons in notifications
- ✅ Multiple positions (top/bottom, left/right/center)
- ✅ Smooth animations
- ✅ Responsive design
- ✅ TypeScript support

## Quick Start

### 1. Provider Setup (Already done in layout.tsx)

The `NotificationProvider` is already set up in the root layout. You can customize it:

```tsx
<NotificationProvider defaultDuration={5000} maxNotifications={5}>
  {/* Your app */}
</NotificationProvider>
```

### 2. Container Setup (Already done in layout.tsx)

The `NotificationContainer` is already added to display notifications:

```tsx
<NotificationContainer 
  position={NotificationPosition.TOP_RIGHT} 
  maxNotifications={5} 
/>
```

### 3. Using Notifications in Components

```tsx
'use client';

import { useNotification } from '@/shared/hooks';

export default function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useNotification('performance');

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Data saved successfully!');
    } catch (error) {
      showError('Failed to save data');
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

## API Reference

### useNotification Hook

```tsx
const {
  showNotification,      // Generic notification
  showSuccess,           // Success notification
  showError,             // Error notification
  showWarning,           // Warning notification
  showInfo,              // Info notification
  removeNotification,    // Remove by ID
  clearNotifications,    // Clear all
  clearModuleNotifications, // Clear by module
  notifications,         // All notifications
} = useNotification(moduleName?);
```

### Notification Options

```tsx
interface NotificationOptions {
  type?: NotificationType;        // 'success' | 'error' | 'warning' | 'info'
  title?: string;                  // Optional title
  duration?: number;               // Auto-dismiss time (ms), 0 = persistent
  module?: string;                 // Module name for filtering
  action?: {                       // Optional action button
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;            // Callback when closed
}
```

## Examples

### Basic Usage

```tsx
const { showSuccess, showError } = useNotification();

// Simple success
showSuccess('Operation completed successfully');

// Simple error
showError('Something went wrong');
```

### With Title

```tsx
showSuccess('Profile updated', {
  title: 'Success',
});
```

### Persistent Notification

```tsx
showWarning('Please review your settings', {
  duration: 0, // Never auto-dismiss
});
```

### With Action Button

```tsx
showError('Failed to upload file', {
  action: {
    label: 'Retry',
    onClick: () => handleRetry(),
  },
});
```

### Module-Specific

```tsx
// In performance module
const { showSuccess } = useNotification('performance');

showSuccess('Appraisal submitted', {
  module: 'performance', // Optional, already set by hook
});
```

### Custom Duration

```tsx
showInfo('Processing your request...', {
  duration: 10000, // 10 seconds
});
```

### With Callback

```tsx
showSuccess('Data saved', {
  onClose: () => {
    console.log('Notification closed');
  },
});
```

## Module-Specific Usage

Each module can use notifications with its own context:

```tsx
// In performance module
import { useNotification } from '@/shared/hooks';

function PerformanceComponent() {
  const { showSuccess, showError } = useNotification('performance');
  
  // All notifications will be tagged with 'performance' module
  showSuccess('Appraisal completed');
}
```

## Clearing Notifications

```tsx
const { clearNotifications, clearModuleNotifications } = useNotification();

// Clear all notifications
clearNotifications();

// Clear only performance module notifications
clearModuleNotifications('performance');
```

## Notification Types

- **SUCCESS**: Green, checkmark icon - for successful operations
- **ERROR**: Red, X icon - for errors and failures
- **WARNING**: Orange, warning icon - for warnings
- **INFO**: Blue, info icon - for informational messages

## Positions

- `TOP_LEFT`
- `TOP_RIGHT` (default)
- `TOP_CENTER`
- `BOTTOM_LEFT`
- `BOTTOM_RIGHT`
- `BOTTOM_CENTER`

## Best Practices

1. **Use appropriate types**: Use success for successful operations, error for failures, etc.
2. **Keep messages concise**: Notifications should be brief and clear
3. **Use titles for important notifications**: Titles help users quickly understand the context
4. **Set appropriate durations**: 
   - Success: 3-5 seconds
   - Error: 5-7 seconds (users need time to read)
   - Warning: 5 seconds
   - Info: 3-5 seconds
5. **Use persistent notifications sparingly**: Only for critical information
6. **Module tagging**: Always specify the module when using in module-specific components

## Integration Examples

### With API Calls

```tsx
const { showSuccess, showError } = useNotification('performance');

const handleSubmit = async () => {
  try {
    await api.submitData();
    showSuccess('Data submitted successfully');
  } catch (error: any) {
    showError(error.response?.data?.message || 'Failed to submit data');
  }
};
```

### With Form Validation

```tsx
const { showError } = useNotification('performance');

const validateForm = () => {
  if (!formData.name) {
    showError('Name is required', { title: 'Validation Error' });
    return false;
  }
  return true;
};
```

### With Async Operations

```tsx
const { showInfo, showSuccess, showError } = useNotification('performance');

const handleLongOperation = async () => {
  const infoId = showInfo('Processing...', { duration: 0 });
  
  try {
    await longOperation();
    removeNotification(infoId);
    showSuccess('Operation completed');
  } catch (error) {
    removeNotification(infoId);
    showError('Operation failed');
  }
};
```

