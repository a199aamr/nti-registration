import { useState, useCallback } from 'react';
import ParticleBackground from './components/ParticleBackground';
import Confetti from './components/Confetti';
import { validateName, validatePhone, validateNationalId, normalizePhone } from './utils/validation';
import { useGoogleSheets } from './hooks/useGoogleSheets';
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

const IdCardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <line x1="15" y1="8" x2="17" y2="8" />
    <line x1="15" y1="12" x2="17" y2="12" />
    <line x1="7" y1="16" x2="17" y2="16" />
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
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    nationalId: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  const { submitRegistration, checkDeviceLimit, isSubmitting } = useGoogleSheets();

  const handleStartRegistration = () => {
    setScreen('form');
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
          newErrors.name = 'الاسم بالكامل مطلوب';
        } else if (formData.name.trim().length > 60) {
          newErrors.name = 'الاسم طويل جداً (الحد الأقصى 60 حرفاً)';
        } else if (!validateName(formData.name)) {
          newErrors.name = 'يرجى إدخال اسم ثنائي على الأقل (بالحروف فقط)';
        } else {
          delete newErrors.name;
        }
        break;
      case 'phone':
        if (!formData.phone.trim()) {
          newErrors.phone = 'رقم الهاتف مطلوب';
        } else if (!validatePhone(formData.phone)) {
          newErrors.phone = 'يرجى إدخال رقم هاتف مصري صحيح (01XXXXXXXXX)';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'nationalId':
        if (!formData.nationalId.trim()) {
          newErrors.nationalId = 'الرقم القومي مطلوب';
        } else if (!validateNationalId(formData.nationalId)) {
          newErrors.nationalId = 'يرجى إدخال رقم قومي صحيح مكون من 14 رقماً';
        } else {
          delete newErrors.nationalId;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep1 = () => {
    const nameValid = validateName(formData.name);
    const phoneValid = validatePhone(formData.phone);
    const nationalIdValid = validateNationalId(formData.nationalId);
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم بالكامل مطلوب';
    } else if (formData.name.trim().length > 60) {
      newErrors.name = 'الاسم طويل جداً (الحد الأقصى 60 حرفاً)';
    } else if (!nameValid) {
      newErrors.name = 'يرجى إدخال اسم ثنائي على الأقل (بالحروف فقط)';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!phoneValid) {
      newErrors.phone = 'يرجى إدخال رقم هاتف مصري صحيح (01XXXXXXXXX)';
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'الرقم القومي مطلوب';
    } else if (!nationalIdValid) {
      newErrors.nationalId = 'يرجى إدخال رقم قومي صحيح مكون من 14 رقماً';
    }

    setErrors(newErrors);
    setTouched({ name: true, phone: true, nationalId: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;

    const result = await submitRegistration(formData);

    if (result.success && !result.duplicate) {
      setShowConfetti(true);
      setScreen('success');
    } else if (result.duplicate) {
      setScreen('duplicate');
    } else {
      setScreen('error');
    }
  };

  const handleNewRegistration = () => {
    setFormData({ name: '', phone: '', nationalId: '' });
    setErrors({});
    setTouched({});
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
              <img src={ntiLogo} alt="NTI Logo" className="welcome-logo" style={{ objectFit: 'contain' }} />
            </div>

            <h1 className="welcome-title">NTI Aswan</h1>
            <p className="welcome-subtitle">
              <span>NTI</span> — Welcome to NTI Aswan
            </p>

            <div className="welcome-date">
              <CalendarIcon />
              موسم 2026 — نرحب بالطلاب الجدد
            </div>

            <button
              className="cta-button"
              onClick={handleStartRegistration}
              id="register-btn"
            >
              سجل الآن
              <span className="cta-button-arrow">
                <ArrowRight />
              </span>
            </button>

            <div className="logo-bar">
              <img src={creativaLogo} alt="Creativa Logo" />
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

            <h2 className="success-title">تم التسجيل بنجاح!</h2>
            <p className="success-message">
              شكراً لتسجيلك، نتطلع لرؤيتك قريباً!
            </p>

            <div className="success-info-card">
              <div className="success-info-row">
                <span className="success-info-label">الاسم بالكامل</span>
                <span className="success-info-value">{formData.name}</span>
              </div>
              <div className="success-info-row">
                <span className="success-info-label">رقم الهاتف</span>
                <span className="success-info-value">{normalizePhone(formData.phone)}</span>
              </div>
              {formData.nationalId && (
                <div className="success-info-row">
                  <span className="success-info-label">الرقم القومي</span>
                  <span className="success-info-value">{formData.nationalId}</span>
                </div>
              )}
            </div>

            <button
              className="btn btn-ghost btn-new-registration"
              onClick={handleNewRegistration}
              id="new-registration-btn"
            >
              <ArrowLeft />
              تسجيل جديد
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
            <h2 className="error-title">تم التسجيل مسبقاً!</h2>
            <p className="error-message">
              تم استخدام رقم الهاتف هذا للتسجيل مسبقاً. يمكن لكل طالب التسجيل مرة واحدة فقط.
            </p>
            <button
              className="btn btn-ghost"
              onClick={handleNewRegistration}
              id="back-home-btn"
            >
              <ArrowLeft />
              العودة للرئيسية
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
              حدث خطأ ما
            </h2>
            <p className="error-message">
              لم نتمكن من إتمام التسجيل. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => setScreen('form')}
                id="retry-btn"
              >
                <span>إعادة المحاولة</span>
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleNewRegistration}
                id="back-home-error-btn"
              >
                العودة للرئيسية
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
              src={ntiLogo}
              alt="NTI"
              style={{
                width: '64px',
                height: '64px',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>

          <div className="form-card">

            <div className="form-header">
              <h2>البيانات الشخصية</h2>
              <p>من فضلك أدخل بياناتك</p>
            </div>

            <div className="input-group">
              <label className={`input-label ${touched.name && !errors.name ? 'focused' : ''}`} htmlFor="name-input">
                الاسم بالكامل
              </label>
              <div className="input-icon-wrapper">
                <span className="input-icon"><UserIcon /></span>
                <input
                  id="name-input"
                  type="text"
                  className={getInputClassName('name')}
                  placeholder="مثال: أحمد محمد"
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
                رقم الهاتف
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
              <div className="input-hint">اكتب رقمك — يبدأ بـ 01 وطوله 11 رقم</div>
            </div>

            <div className="input-group">
              <label className={`input-label ${touched.nationalId && !errors.nationalId ? 'focused' : ''}`} htmlFor="national-id-input">
                الرقم القومي (14 رقم)
              </label>
              <div className="input-icon-wrapper">
                <span className="input-icon"><IdCardIcon /></span>
                <input
                  id="national-id-input"
                  type="tel"
                  className={getInputClassName('nationalId')}
                  placeholder="الرقم القومي (14 رقم)"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange('nationalId', e.target.value.replace(/\D/g, ''))}
                  onBlur={() => handleBlur('nationalId')}
                  maxLength={14}
                />
              </div>
              {touched.nationalId && errors.nationalId && (
                <div className="input-error">
                  <ErrorCircleIcon />
                  {errors.nationalId}
                </div>
              )}
            </div>

            <div className="form-nav" style={{ justifyContent: 'center' }}>
              <button
                className="btn btn-primary btn-submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                id="submit-btn"
                style={{ width: '100%' }}
              >
                <span>
                  {isSubmitting ? (
                    <>
                      <div className="spinner" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      إرسال التسجيل
                      <CheckIcon />
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom logos */}
          <div className="logo-bar" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
            <img src={creativaLogo} alt="Creativa" />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
