import { useState } from 'react';
import { normalizePhone } from '../utils/validation';

// ============================================
// Google Apps Script Web App URL
// ============================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyDBz8Upz7FaHM_IaqpOBcr_pnsUuHdydlTWHcxtPNa-HbuIeawK3CN4nZ3rsBenkIS/exec';

export const useGoogleSheets = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const checkDuplicate = async (phone) => {
    try {
      const normalized = normalizePhone(phone);
      const response = await fetch(`${SCRIPT_URL}?action=check&phone=${encodeURIComponent(normalized)}`);
      const data = await response.json();
      return data.exists;
    } catch (err) {
      console.error('Duplicate check failed:', err);
      return false;
    }
  };

  const checkDeviceLimit = () => {
    return false;
  };

  const submitRegistration = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const normalized = normalizePhone(formData.phone);
      const name = formData.name.trim();

      // Use GET with URL params - most reliable for Google Apps Script
      const params = new URLSearchParams({
        action: 'register',
        name: name,
        phone: normalized,
      });

      if (formData.nationalId) {
        params.append('nationalId', formData.nationalId.trim());
      }

      const response = await fetch(`${SCRIPT_URL}?${params.toString()}`);
      const result = await response.json();

      if (result.duplicate) {
        return { success: false, duplicate: true };
      }

      if (result.success) {
        return { success: true, duplicate: false };
      }

      // If we got here, something unexpected happened
      return { success: false, duplicate: false, error: result.error || 'Unknown error' };

    } catch (err) {
      console.error('Submission error:', err);
      setError('Something went wrong. Please check your connection and try again.');
      return { success: false, duplicate: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitRegistration,
    checkDeviceLimit,
    isSubmitting,
    error,
    setError,
  };
};
