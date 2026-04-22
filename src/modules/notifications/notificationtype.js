export const typeStyles = {
  job_applied: {
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M3 7h18v13H3z"/>
        <path d="M16 7V5a4 4 0 00-8 0v2"/>
      </svg>
    `,
    wrapper: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
    label: 'Job Applied',
  },

  status_changed: {
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M4 4v6h6"/>
        <path d="M20 20v-6h-6"/>
        <path d="M5 19a9 9 0 0014-3"/>
        <path d="M19 5a9 9 0 00-14 3"/>
      </svg>
    `,
    wrapper: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
    label: 'Status Updated',
  },

  payment_success: {
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <path d="M2 10h20"/>
      </svg>
    `,
    wrapper: 'bg-green-50 text-green-600 ring-1 ring-green-100',
    label: 'Payment Success',
  },

  job_reported: {
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M12 3l9 16H3L12 3z"/>
        <path d="M12 9v4"/>
        <circle cx="12" cy="17" r="1"/>
      </svg>
    `,
    wrapper: 'bg-red-50 text-red-600 ring-1 ring-red-100',
    label: 'Job Reported',
    important: true,
  },

  job_removed: {
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M3 6h18"/>
        <path d="M8 6v14h8V6"/>
        <path d="M10 10v6M14 10v6"/>
      </svg>
    `,
    wrapper: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
    label: 'Job Removed',
    important: true,
  },
}