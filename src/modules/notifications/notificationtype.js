import {
  BriefcaseIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/vue/24/solid'

export const typeStyles = {
  job_applied: {
    icon: BriefcaseIcon,
    wrapper: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
    label: 'Job Applied',
  },

  status_changed: {
    icon: ArrowPathIcon,
    wrapper: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
    label: 'Status Updated',
  },

  payment_success: {
    icon: CreditCardIcon,
    wrapper: 'bg-green-50 text-green-600 ring-1 ring-green-100',
    label: 'Payment Success',
  },

  job_reported: {
    icon: ExclamationTriangleIcon,
    wrapper: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    label: 'Job Reported',
    important: true, 
  },

  job_removed: {
    icon: TrashIcon,
    wrapper: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
    label: 'Job Removed',
    important: true,
  },
}