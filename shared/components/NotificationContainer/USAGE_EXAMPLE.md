# Notification System - Usage Examples

## Basic Usage in Any Module

```tsx
'use client';

import { useNotification } from '@/shared/hooks';

export default function MyComponent() {
  // Option 1: Set module name in hook
  const { showSuccess, showError } = useNotification('performance');

  // Option 2: Set module in each call
  const notifications = useNotification();
  
  const handleSubmit = async () => {
    try {
      await api.submit();
      showSuccess('Submitted successfully!');
    } catch (error) {
      showError('Submission failed');
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

## Performance Module Example

```tsx
'use client';

import { useNotification } from '@/shared/hooks';
import { performanceApi } from '../api/performanceApi';

export default function PerformanceComponent() {
  const { showSuccess, showError, showInfo } = useNotification('performance');

  const handleCreateTemplate = async (data: any) => {
    try {
      showInfo('Creating template...', { duration: 0 });
      await performanceApi.createTemplate(data);
      showSuccess('Template created successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to create template');
    }
  };

  return (
    <button onClick={() => handleCreateTemplate(formData)}>
      Create Template
    </button>
  );
}
```

## With Action Buttons

```tsx
const { showError } = useNotification('performance');

showError('Failed to save changes', {
  action: {
    label: 'Retry',
    onClick: () => handleRetry(),
  },
});
```

## Module-Specific Clearing

```tsx
const { clearModuleNotifications } = useNotification('performance');

// Clear all performance module notifications
clearModuleNotifications('performance');
```

