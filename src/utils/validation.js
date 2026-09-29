/**
 * Validates an Egyptian phone number
 * Accepts: 01XXXXXXXXX (11 digits starting with 01)
 * Strips spaces, dashes, and converts +20 prefix
 */
export const normalizePhone = (phone) => {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Convert +20 to 0
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.slice(3);
  }
  
  // Convert 20 prefix to 0
  if (cleaned.startsWith('20') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  }
  
  // If Google Sheets dropped the leading 0 (10 digits), add it back
  if (/^\d{10}$/.test(cleaned) && !cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }
  
  return cleaned;
};

export const validatePhone = (phone) => {
  const normalized = normalizePhone(phone);
  // Must be exactly 11 digits, starting with 01 followed by 0,1,2,5
  const regex = /^01[0125][0-9]{8}$/;
  return regex.test(normalized);
};

export const validateName = (name) => {
  const trimmed = name.trim();
  
  // Min 3, Max 60 characters
  if (trimmed.length < 3 || trimmed.length > 60) return false;
  
  // Must contain at least 2 words (first and last name)
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 2) return false;
  
  // Allow Arabic, English letters, spaces, and common name characters
  const regex = /^[\u0600-\u06FFa-zA-Z\s\-'.]+$/;
  return regex.test(trimmed);
};

export const validateFaculty = (faculty) => {
  return faculty === 'Business' || faculty === 'IT';
};

// ==========================================
// Device Registration Limit
// ==========================================
const DEVICE_LIMIT_KEY = 'eelu_device_reg_count';
const DEVICE_LIMIT = 5;

export const getDeviceRegistrationCount = () => {
  try {
    return parseInt(localStorage.getItem(DEVICE_LIMIT_KEY) || '0', 10);
  } catch {
    return 0;
  }
};

export const incrementDeviceRegistrationCount = () => {
  try {
    const count = getDeviceRegistrationCount() + 1;
    localStorage.setItem(DEVICE_LIMIT_KEY, count.toString());
    return count;
  } catch {
    return 0;
  }
};

export const isDeviceLimitReached = () => {
  return getDeviceRegistrationCount() >= DEVICE_LIMIT;
};

export const resetDeviceRegistrationCount = () => {
  try {
    localStorage.removeItem(DEVICE_LIMIT_KEY);
  } catch {
    // ignore
  }
};
