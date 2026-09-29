import { useState, useCallback } from 'react';
import ParticleBackground from './components/ParticleBackground';
import Confetti from './components/Confetti';
import { validateName, validatePhone, validateFaculty, normalizePhone, isDeviceLimitReached } from './utils/validation';
import { useGoogleSheets } from './hooks/useGoogleSheets';
import eeluLogo from './assets/eelu-logo.jpg';
import creativaLogo from './assets/creativa-logo.png';
import ntiLogo from './assets/nti-logo.png';

// SVG Icons as components
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const BigCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ErrorCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
    <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill="currentColor"/>
  </svg>
);

// Business Icon
const BusinessIcon = () => (
  <svg className="faculty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <line x1="6" y1="11" x2="6" y2="11.01" />
    <line x1="18" y1="11" x2="18" y2="11.01" />
    <line x1="12" y1="11" x2="12" y2="11.01" />
  </svg>
);

// IT Icon
const ITIcon = () => (
  <svg className="faculty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="7 8 10 11 7 14" />
    <line x1="13" y1="14" x2="17" y2="14" />
  </svg>
);


function App() {
  // Screens: 'welcome', 'form', 'success', 'duplicate', 'error'
  const [screen, setScreen] = useState('welcome');
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('right');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    faculty: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  const { submitRegistration, checkDeviceLimit, isSubmitting } = useGoogleSheets();

  const handleStartRegistration = () => {
    // Check device limit before showing form
    if (isDeviceLimitReached()) {
      setScreen('deviceLimit');
      return;
    }
    setScreen('form');
    setStep(1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required';
        } else if (formData.name.trim().length > 60) {
          newErrors.name = 'Name is too long (max 60 characters)';
        } else if (!validateName(formData.name)) {
          newErrors.name = 'Enter your full name (first & last name, letters only)';
        } else {
          delete newErrors.name;
        }
        break;
      case 'phone':
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
          newErrors.phone = 'Enter a valid Egyptian phone number (01XXXXXXXXX)';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'faculty':
        if (!validateFaculty(formData.faculty)) {
          newErrors.faculty = 'Please select your faculty';
        } else {
          delete newErrors.faculty;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep1 = () => {
    const nameValid = validateName(formData.name);
    const phoneValid = validatePhone(formData.phone);
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length > 60) {
      newErrors.name = 'Name is too long (max 60 characters)';
    } else if (!nameValid) {
      newErrors.name = 'Enter your full name (first & last name, letters only)';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneValid) {
      newErrors.phone = 'Enter a valid Egyptian phone number (01XXXXXXXXX)';
    }

    setErrors(newErrors);
    setTouched({ name: true, phone: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setDirection('right');
      setStep(2);
    }
  };

  const handleBack = () => {
    setDirection('left');
    setStep(1);
  };

  const handleFacultySelect = (faculty) => {
    setFormData(prev => ({ ...prev, faculty }));
    if (errors.faculty) {
      setErrors(prev => ({ ...prev, faculty: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateFaculty(formData.faculty)) {
      setErrors(prev => ({ ...prev, faculty: 'Please select your faculty' }));
      return;
    }

    const result = await submitRegistration(formData);
    
    if (result.success && !result.duplicate) {
      setShowConfetti(true);
      setScreen('success');
    } else if (result.duplicate) {
      setScreen('duplicate');
    } else if (result.deviceLimit) {
      setScreen('deviceLimit');
    } else {
      setScreen('error');
    }
  };

  const handleNewRegistration = () => {
    setFormData({ name: '', phone: '', faculty: '' });
    setErrors({});
    setTouched({});
    setStep(1);
    setShowConfetti(false);
    setScreen('welcome');
  };

  const getInputClassName = (field) => {
    let className = 'form-input';
    if (touched[field] && errors[field]) className += ' error';
    else if (touched[field] && !errors[field] && formData[field]) className += ' valid';
    return className;
  };

  // ==================== RENDER ====================

  // Welcome Screen
  if (screen === 'welcome') {
    return (
      <>
        <ParticleBackground />
        <div className="app-container">
          <div className="welcome-screen">
            <div className="welcome-logo-container">
              <div className="welcome-logo-glow" />
              <img src={eeluLogo} alt="EELU Logo" className="welcome-logo" />
            </div>

            <h1 className="welcome-title">Orientation Day</h1>
            <p className="welcome-subtitle">
              Welcome to <span>EELU</span> — The Egyptian E-Learning University
            </p>

            <div className="welcome-date">
              <CalendarIcon />
              Season 2026 — New Students Welcome
            </div>

            <button
              className="cta-button"
              onClick={handleStartRegistration}
              id="register-btn"
            >
              Register Now
              <span className="cta-button-arrow">
                <ArrowRight />
              </span>
            </button>

            <div className="logo-bar">
              <img src={creativaLogo} alt="Creativa Logo" />
              <div className="logo-bar-divider" />
              <img src={ntiLogo} alt="NTI Logo" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Success Screen
  if (screen === 'success') {
    return (
      <>
        <ParticleBackground />
        {showConfetti && <Confetti />}
        <div className="app-container">
          <div className="success-screen">
            <div className="success-icon-container">
              <div className="success-ring" />
              <div className="success-ring-outer" />
              <div className="success-check">
                <BigCheckIcon />
              </div>
            </div>

            <h2 className="success-title">You're Registered!</h2>
            <p className="success-message">
              Welcome aboard! We're excited to see you at the Orientation Day. Get ready for an amazing experience!
            </p>

            <div className="success-info-card">
              <div className="success-info-row">
                <span className="success-info-label">Name</span>
                <span className="success-info-value">{formData.name}</span>
              </div>
              <div className="success-info-row">
                <span className="success-info-label">Phone</span>
                <span className="success-info-value">{normalizePhone(formData.phone)}</span>
              </div>
              <div className="success-info-row">
                <span className="success-info-label">Faculty</span>
                <span className="success-info-value">Faculty of {formData.faculty}</span>
              </div>
            </div>

            <button
              className="btn btn-ghost btn-new-registration"
              onClick={handleNewRegistration}
              id="new-registration-btn"
            >
              <ArrowLeft />
              New Registration
            </button>
          </div>
        </div>
      </>
    );
  }

  // Duplicate Screen
  if (screen === 'duplicate') {
    return (
      <>
        <ParticleBackground />
        <div className="app-container">
          <div className="error-screen">
            <AlertIcon />
            <h2 className="error-title">Already Registered!</h2>
            <p className="error-message">
              This phone number has already been used to register. Each student can only register once.
            </p>
            <button
              className="btn btn-ghost"
              onClick={handleNewRegistration}
              id="back-home-btn"
            >
              <ArrowLeft />
              Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  // Device Limit Screen
  if (screen === 'deviceLimit') {
    return (
      <>
        <ParticleBackground />
        <div className="app-container">
          <div className="error-screen">
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <h2 className="error-title">Device Limit Reached</h2>
            <p className="error-message">
              You've registered 5 people from this device. To register more students, please use a different device or browser.
            </p>
            <button
              className="btn btn-ghost"
              onClick={handleNewRegistration}
              id="back-home-limit-btn"
            >
              <ArrowLeft />
              Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  // Error Screen
  if (screen === 'error') {
    return (
      <>
        <ParticleBackground />
        <div className="app-container">
          <div className="error-screen">
            <AlertIcon />
            <h2 className="error-title" style={{ color: 'var(--color-error)' }}>
              Something Went Wrong
            </h2>
            <p className="error-message">
              We couldn't process your registration. Please check your internet connection and try again.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => { setScreen('form'); setStep(2); }}
                id="retry-btn"
              >
                <span>Try Again</span>
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleNewRegistration}
                id="back-home-error-btn"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Form Screen
  return (
    <>
      <ParticleBackground />
      <div className="app-container">
        <div className="form-wrapper">
          {/* Top logo small */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <img
              src={eeluLogo}
              alt="EELU"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '2px solid var(--border-color)',
                objectFit: 'cover',
              }}
            />
          </div>

          <div className="form-card">
            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-steps">
                <div className="progress-step">
                  <div className={`progress-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    {step > 1 ? <CheckIcon /> : '1'}
                  </div>
                </div>
                <div className={`progress-line ${step > 1 ? 'active' : ''}`} />
                <div className="progress-step">
                  <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}>
                    2
                  </div>
                </div>
              </div>
              <div className="progress-labels">
                <span className={`progress-label ${step === 1 ? 'active' : ''}`}>Personal Info</span>
                <span className={`progress-label ${step === 2 ? 'active' : ''}`}>Faculty</span>
              </div>
            </div>

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className={direction === 'right' ? 'step-enter-right' : 'step-enter-left'} key="step1">
                <div className="form-header">
                  <h2>Personal Information</h2>
                  <p>Tell us about yourself</p>
                </div>

                <div className="input-group">
                  <label className={`input-label ${touched.name && !errors.name ? 'focused' : ''}`} htmlFor="name-input">
                    Full Name
                  </label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon"><UserIcon /></span>
                    <input
                      id="name-input"
                      type="text"
                      className={getInputClassName('name')}
                      placeholder="e.g. Ahmed Mohamed"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      autoComplete="name"
                      maxLength={60}
                    />
                  </div>
                  {touched.name && errors.name && (
                    <div className="input-error">
                      <ErrorCircleIcon />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className={`input-label ${touched.phone && !errors.phone ? 'focused' : ''}`} htmlFor="phone-input">
                    Phone Number
                  </label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon"><PhoneIcon /></span>
                    <input
                      id="phone-input"
                      type="tel"
                      className={getInputClassName('phone')}
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      autoComplete="tel"
                      maxLength={11}
                    />
                  </div>
                  {touched.phone && errors.phone && (
                    <div className="input-error">
                      <ErrorCircleIcon />
                      {errors.phone}
                    </div>
                  )}
                  <div className="input-hint">Egyptian phone number format</div>
                </div>

                <div className="form-nav" style={{ justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleNext}
                    id="next-btn"
                  >
                    <span>
                      Next
                      <ArrowRight />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Faculty Selection */}
            {step === 2 && (
              <div className={direction === 'right' ? 'step-enter-right' : 'step-enter-left'} key="step2">
                <div className="form-header">
                  <h2>Select Your Faculty</h2>
                  <p>Choose the faculty you're enrolling in</p>
                </div>

                <div className="faculty-grid">
                  <div
                    className={`faculty-card ${formData.faculty === 'Business' ? 'selected' : ''}`}
                    onClick={() => handleFacultySelect('Business')}
                    id="faculty-business"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleFacultySelect('Business')}
                  >
                    <div className="faculty-check">
                      <CheckIcon />
                    </div>
                    <BusinessIcon />
                    <div>
                      <div className="faculty-name">Business</div>
                      <div className="faculty-desc">Faculty of Business</div>
                    </div>
                  </div>

                  <div
                    className={`faculty-card ${formData.faculty === 'IT' ? 'selected' : ''}`}
                    onClick={() => handleFacultySelect('IT')}
                    id="faculty-it"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleFacultySelect('IT')}
                  >
                    <div className="faculty-check">
                      <CheckIcon />
                    </div>
                    <ITIcon />
                    <div>
                      <div className="faculty-name">IT</div>
                      <div className="faculty-desc">Information Technology</div>
                    </div>
                  </div>
                </div>

                {errors.faculty && (
                  <div className="input-error" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                    <ErrorCircleIcon />
                    {errors.faculty}
                  </div>
                )}

                <div className="form-nav">
                  <button
                    className="btn btn-ghost"
                    onClick={handleBack}
                    id="back-btn"
                  >
                    <ArrowLeft />
                    Back
                  </button>
                  <button
                    className="btn btn-primary btn-submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.faculty}
                    id="submit-btn"
                    style={{ flex: 1 }}
                  >
                    <span>
                      {isSubmitting ? (
                        <>
                          <div className="spinner" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Registration
                          <CheckIcon />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom logos */}
          <div className="logo-bar" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
            <img src={creativaLogo} alt="Creativa" />
            <div className="logo-bar-divider" />
            <img src={ntiLogo} alt="NTI" />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
