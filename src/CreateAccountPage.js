import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CA.css";
import BlueBox from "./assets/BlueBox.svg";
import RedBlueBox from "./assets/RedBlueBox.svg";
import AWJLOGO from "./assets/AWJLOGO.svg";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { IoArrowBack } from 'react-icons/io5';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding, FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { TbLanguage } from "react-icons/tb";

// Define translations for the create account page
const createAccountTranslations = {
    ar: {
        backToServices: "العودة إلى الخدمات",
        createAccount: "إنشـاء حساب",
        firstName: "الاسم الأول",
        lastName: "الاسم الأخير",
        email: "البريد الإلكتروني",
        confirmEmail: "تأكيد البريد الإلكتروني",
        password: "الرقم السري",
        confirmPassword: "تأكيد الرقم السري",
        phoneNumber: "رقم الجوال",
        phoneNumberPlaceholder: "+966XXXXXXXX أو 05XXXXXXXX",
        companyRegistered: "هل شركتك مسجلة فالمنصة؟",
        yes: "نعم",
        no: "لا",
        next: "التالي",
        processing: "جاري المعالجة...",
        iAgree: "أوافق على",
        termsAndConditions: "الشروط والأحكام",
        haveAccount: "لديك حساب؟",
        signIn: "سجل دخولك",
        companyJoin: "الانضمام لحساب الشركة",
        securityKeyPrompt: "أدخل رمز الأمان المكون من 5 أحرف المقدم من مدير الشركة",
        enterSecurityKey: "أدخل رمز الأمان",
        confirm: "تأكيد",
        close: "إغلاق",
        acceptTerms: "موافق على الشروط",
        // Terms and conditions content
        termsTitle: "الشروط والأحكام",
        termsIntro: "مرحبًا بك في منصة أوج. تحدد هذه الشروط والأحكام قواعد استخدام منصتنا.",
        registration: "التسجيل وأمان الحساب",
        registrationDesc: "عند إنشاء حساب، أنت مسؤول عن:",
        registrationItem1: "تقديم معلومات دقيقة وكاملة",
        registrationItem2: "الحفاظ على سرية معلومات حسابك",
        registrationItem3: "إخطارنا بأي خرق أمني أو استخدام غير مصرح به لحسابك",
        privacy: "خصوصية البيانات",
        privacyDesc: "نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية وفقًا لقوانين حماية البيانات المعمول بها.",
        restrictions: "قيود الاستخدام",
        restrictionsDesc: "يحظر استخدام منصتنا في:",
        restrictionsItem1: "أي نشاط غير قانوني",
        restrictionsItem2: "الإضرار بتجربة المستخدمين الآخرين",
        restrictionsItem3: "محاولة الوصول غير المصرح به إلى أنظمتنا",
        termination: "إنهاء الخدمة",
        terminationDesc: "نحتفظ بالحق في تعليق أو إنهاء وصولك إلى منصتنا في حالة انتهاك هذه الشروط.",
        changes: "التغييرات في الشروط",
        changesDesc: "قد نقوم بتحديث هذه الشروط من وقت لآخر. ستكون مسؤولاً عن مراجعة أي تغييرات.",
        liability: "المسؤولية",
        liabilityDesc: "لن نكون مسؤولين عن أي خسائر تنتج عن استخدامك لمنصتنا، ما لم تكن ناتجة عن إهمال من جانبنا.",
        // Password instructions
        passwordRequirements: "متطلبات كلمة المرور (يجب أن تكون متوسطة القوة على الأقل):",
        minChars: "على الأقل 6 أحرف",
        uppercase: "حرف كبير واحد على الأقل",
        number: "رقم واحد على الأقل",
        specialChar: "رمز خاص واحد على الأقل",
        // Password strength
        veryWeak: "ضعيف جداً",
        weak: "ضعيف",
        medium: "متوسط",
        good: "جيد",
        strong: "قوي",
        excellent: "ممتاز",
        // Error messages
        requiredField: "هذا الحقل مطلوب",
        shortName: "يجب أن يتكون الاسم من حرفين على الأقل",
        invalidEmail: "البريد الإلكتروني غير صالح",
        emailMismatch: "البريد الإلكتروني غير متطابق",
        weakPassword: "يجب أن تكون كلمة المرور متوسطة القوة على الأقل",
        passwordMismatch: "كلمة المرور غير متطابقة",
        invalidPhone: "يرجى إدخال رقم هاتف سعودي صالح",
        selectCompanyStatus: "يرجى تحديد ما إذا كانت شركتك مسجلة",
        enterSecurityKeyError: "يرجى إدخال رمز الأمان",
        acceptTermsError: "يجب الموافقة على الشروط والأحكام",
        fillRequiredFields: "يرجى ملء جميع الحقول المطلوبة",
        invalidSecurityKey: "رمز الأمان غير صحيح",
        errorSaving: "حدث خطأ أثناء حفظ الحساب. حاول مرة أخرى.",
        invalidKeyLength: "يرجى إدخال مفتاح مكون من 5 أرقام",
        languageEnglish: "English",
        languageArabic: "العربية"
    },
    en: {
        backToServices: "Back to Services",
        createAccount: "Create Account",
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        confirmEmail: "Confirm Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        phoneNumber: "Phone Number",
        phoneNumberPlaceholder: "+966XXXXXXXX or 05XXXXXXXX",
        companyRegistered: "Is your company registered on the platform?",
        yes: "Yes",
        no: "No",
        next: "Next",
        processing: "Processing...",
        iAgree: "I agree to the",
        termsAndConditions: "Terms and Conditions",
        haveAccount: "Already have an account?",
        signIn: "Sign In",
        companyJoin: "Join Company Account",
        securityKeyPrompt: "Enter the 5-character security key provided by your company manager",
        enterSecurityKey: "Enter security key",
        confirm: "Confirm",
        close: "Close",
        acceptTerms: "Accept Terms",
        // Terms and conditions content
        termsTitle: "Terms and Conditions",
        termsIntro: "Welcome to AWJ platform. These terms and conditions outline the rules for using our platform.",
        registration: "Registration and Account Security",
        registrationDesc: "When creating an account, you are responsible for:",
        registrationItem1: "Providing accurate and complete information",
        registrationItem2: "Maintaining the confidentiality of your account information",
        registrationItem3: "Notifying us of any security breach or unauthorized use of your account",
        privacy: "Data Privacy",
        privacyDesc: "We respect your privacy and are committed to protecting your personal data in accordance with applicable data protection laws.",
        restrictions: "Usage Restrictions",
        restrictionsDesc: "Use of our platform is prohibited for:",
        restrictionsItem1: "Any illegal activity",
        restrictionsItem2: "Harming the experience of other users",
        restrictionsItem3: "Attempting unauthorized access to our systems",
        termination: "Service Termination",
        terminationDesc: "We reserve the right to suspend or terminate your access to our platform in case of violation of these terms.",
        changes: "Changes to Terms",
        changesDesc: "We may update these terms from time to time. You will be responsible for reviewing any changes.",
        liability: "Liability",
        liabilityDesc: "We will not be liable for any losses resulting from your use of our platform, unless they are due to negligence on our part.",
        // Password instructions
        passwordRequirements: "Password requirements (must be at least medium strength):",
        minChars: "At least 6 characters",
        uppercase: "At least one uppercase letter",
        number: "At least one number",
        specialChar: "At least one special character",
        // Password strength
        veryWeak: "Very Weak",
        weak: "Weak",
        medium: "Medium",
        good: "Good",
        strong: "Strong",
        excellent: "Excellent",
        // Error messages
        requiredField: "This field is required",
        shortName: "Name must be at least 2 characters",
        invalidEmail: "Invalid email address",
        emailMismatch: "Email addresses do not match",
        weakPassword: "Password must be at least medium strength",
        passwordMismatch: "Passwords do not match",
        invalidPhone: "Please enter a valid Saudi phone number",
        selectCompanyStatus: "Please select whether your company is registered",
        enterSecurityKeyError: "Please enter the security key",
        acceptTermsError: "You must accept the terms and conditions",
        fillRequiredFields: "Please fill in all required fields",
        invalidSecurityKey: "Invalid security key",
        errorSaving: "Error saving account. Please try again.",
        invalidKeyLength: "Please enter a 5-digit key",
        languageEnglish: "English",
        languageArabic: "العربية"
    }
};

// Terms And Conditions Modal Component
// Terms And Conditions Modal Component with language direction support
// Terms And Conditions Modal Component with direct language prop
const TermsModal = ({ onClose, onAccept, t, language }) => {
    const isEnglish = language === "en";
    const direction = isEnglish ? "ltr" : "rtl";
    const textAlign = isEnglish ? "left" : "right";

    return (
        <div className="modal terms-modal" onClick={onClose}>
            <div
                className="modal-content-terms scale-in"
                onClick={(e) => e.stopPropagation()}
                dir={direction}
                style={{ textAlign: textAlign }}
            >
                <h3>{t.termsTitle}</h3>
                <div className="terms-content" style={{ textAlign: textAlign }}>
                    <p>{t.termsIntro}</p>

                    <h4>1. {t.registration}</h4>
                    <p>{t.registrationDesc}</p>
                    <ul style={{ paddingRight: isEnglish ? '0' : '20px', paddingLeft: isEnglish ? '20px' : '0' }}>
                        <li>{t.registrationItem1}</li>
                        <li>{t.registrationItem2}</li>
                        <li>{t.registrationItem3}</li>
                    </ul>

                    <h4>2. {t.privacy}</h4>
                    <p>{t.privacyDesc}</p>

                    <h4>3. {t.restrictions}</h4>
                    <p>{t.restrictionsDesc}</p>
                    <ul style={{ paddingRight: isEnglish ? '0' : '20px', paddingLeft: isEnglish ? '20px' : '0' }}>
                        <li>{t.restrictionsItem1}</li>
                        <li>{t.restrictionsItem2}</li>
                        <li>{t.restrictionsItem3}</li>
                    </ul>

                    <h4>4. {t.termination}</h4>
                    <p>{t.terminationDesc}</p>

                    <h4>5. {t.changes}</h4>
                    <p>{t.changesDesc}</p>

                    <h4>6. {t.liability}</h4>
                    <p>{t.liabilityDesc}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={onAccept} className="accept-terms-btn">
                        {t.acceptTerms}
                    </button>
                    <button onClick={onClose}>
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Enhanced Error Message Component
const ErrorMessage = ({ message }) => {
    return (
        <div className="error-message-enhanced">
            <div className="error-icon">
                <FaExclamationTriangle />
            </div>
            <div className="error-text">{message}</div>
        </div>
    );
};

// Password Instructions Component
const PasswordInstructions = ({ password, t }) => {
    const calculateStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength += 1;
        if (password.length >= 10) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };

    const strength = calculateStrength(password);
    const isLengthValid = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    return (
        <div className="password-instructions">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaInfoCircle style={{ marginLeft: '5px', color: '#1d3557' }} />
                <span>{t.passwordRequirements}</span>
            </div>
            <ul>
                <li className={isLengthValid ? 'satisfied' : ''}>
                    {isLengthValid ? <FaCheck style={{ marginLeft: '5px', color: '#4caf50' }} /> : <FaTimes style={{ marginLeft: '5px', color: '#e63a46' }} />}
                    {t.minChars}
                </li>
                <li className={hasUpperCase ? 'satisfied' : ''}>
                    {hasUpperCase ? <FaCheck style={{ marginLeft: '5px', color: '#4caf50' }} /> : <FaTimes style={{ marginLeft: '5px', color: '#e63a46' }} />}
                    {t.uppercase}
                </li>
                <li className={hasNumber ? 'satisfied' : ''}>
                    {hasNumber ? <FaCheck style={{ marginLeft: '5px', color: '#4caf50' }} /> : <FaTimes style={{ marginLeft: '5px', color: '#e63a46' }} />}
                    {t.number}
                </li>
                <li className={hasSpecial ? 'satisfied' : ''}>
                    {hasSpecial ? <FaCheck style={{ marginLeft: '5px', color: '#4caf50' }} /> : <FaTimes style={{ marginLeft: '5px', color: '#e63a46' }} />}
                    {t.specialChar}
                </li>
            </ul>
        </div>
    );
};

// Form validation helper
const validateField = (field, value, t) => {
    // Skip validation for empty fields (except where explicitly required)
    if (value === null || value === undefined || value.trim() === '') {
        return null;
    }

    switch (field) {
        case 'firstName':
        case 'lastName':
            return value.trim().length > 1 ? null : t.shortName;

        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : t.invalidEmail;

        case 'confirmEmail':
            return formData => formData.email === value ? null : t.emailMismatch;

        case 'password':
            // Calculate password strength
            let strength = 0;
            if (value.length >= 6) strength += 1;
            if (value.length >= 10) strength += 1;
            if (/[A-Z]/.test(value)) strength += 1;
            if (/[0-9]/.test(value)) strength += 1;
            if (/[^A-Za-z0-9]/.test(value)) strength += 1;

            // Only accept medium strength or higher (strength >= 2)
            return strength >= 2 ? null : t.weakPassword;

        case 'confirmPassword':
            return formData => formData.password === value ? null : t.passwordMismatch;

        case 'phoneNumber':
            // Saudi phone validation (either +966 format or 05xxxxxxxx format)
            return /^(\+966|05)\d{8,9}$/.test(value) ? null : t.invalidPhone;

        default:
            return null;
    }
};

// Notification Component
const Notification = ({ message, type, onClose }) => {
    return (
        <div className={`notification ${type} notification-animate`}>
            <div className="notification-content">
                {type === 'error' && <FaExclamationTriangle />}
                {type === 'success' && <FaCheck />}
                {type === 'info' && <FaInfoCircle />}
                <p>{message}</p>
            </div>
            <button onClick={onClose} className="close-notification">×</button>
        </div>
    );
};

// Password Strength Component
const PasswordStrengthMeter = ({ password, t }) => {
    const calculateStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength += 1;
        if (password.length >= 10) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };

    const strength = calculateStrength(password);

    return (
        <div className="password-strength">
            <div className="strength-meter">
                <div
                    className={`strength-fill strength-${strength}`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                ></div>
            </div>
            <div className="strength-label">
                {strength === 0 && password && t.veryWeak}
                {strength === 1 && t.weak}
                {strength === 2 && t.medium}
                {strength === 3 && t.good}
                {strength === 4 && t.strong}
                {strength === 5 && t.excellent}
            </div>
        </div>
    );
};

// Input Field Component
const FormField = ({
    name,
    label,
    type = 'text',
    icon,
    value,
    onChange,
    onFocus,
    onBlur,
    placeholder,
    error,
    language,
    required = false,
    readOnly = false,
    showCheckmark = false
}) => {
    return (
        <div className={`form-group ${error ? 'has-error' : ''}`}>
            <label>
                {icon}
                {label}
                {required && <span className="required">*</span>}
            </label>
            <div className="input-container">
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder || label}
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    required={required}
                    readOnly={readOnly}
                    className={readOnly ? 'readonly' : ''}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
                {showCheckmark && !error && <FaCheck className="check-icon" />}
                {error && <ErrorMessage message={error} />}
            </div>
        </div>
    );
};

const CreateAccountPage = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        companyRegistered: null,
        termsAccepted: false,
        securityKey: "",
    });

    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [loading, setIsLoading] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [notification, setNotification] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [showPasswordInstructions, setShowPasswordInstructions] = useState(false);

    // Get saved language from localStorage or default to Arabic
    const [createAccountLanguage, setCreateAccountLanguage] = useState(() => {
        return localStorage.getItem('appLanguage') || 'ar';
    });

    // Get translations based on current language
    const t = createAccountTranslations[createAccountLanguage];

    const firstErrorRef = useRef(null);
    const navigate = useNavigate();

    // Handle language change
    const handleCreateAccountLanguageChange = (lang) => {
        setCreateAccountLanguage(lang);
        // Update document direction based on language
        // document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
        // Save language preference to localStorage
        localStorage.setItem('appLanguage', lang);
    };

    useEffect(() => {
        document.title = "أوج | إنشاء حساب";

        // Validate form on data change if user has attempted submission
        if (formSubmitted) {
            validateForm();
        }

        // Set document direction based on language
        // document.body.dir = createAccountLanguage === 'ar' ? 'rtl' : 'ltr';
    }, [formData, formSubmitted, createAccountLanguage]);

    // Scroll to first error after validation
    useEffect(() => {
        if (Object.keys(errors).length > 0 && firstErrorRef.current) {
            firstErrorRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [errors]);

    const validateForm = () => {
        const newErrors = {};

        // Validate each field
        Object.keys(formData).forEach(field => {
            const validation = validateField(field, formData[field], t);

            if (typeof validation === 'function') {
                const error = validation(formData);
                if (error) newErrors[field] = error;
            } else if (validation) {
                newErrors[field] = validation;
            }
        });

        // Additional validations
        if (formData.companyRegistered === null) {
            newErrors.companyRegistered = t.selectCompanyStatus;
        }

        if (formData.companyRegistered === true && !formData.securityKey) {
            newErrors.securityKey = t.enterSecurityKeyError;
        }

        // Terms validation
        if (!formData.termsAccepted) {
            newErrors.termsAccepted = t.acceptTermsError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Visual feedback for input
        if (e.target && e.target.parentNode) {
            e.target.parentNode.classList.add('input-active');
            setTimeout(() => {
                e.target.parentNode.classList.remove('input-active');
            }, 300);
        }
    };

    const handleFocus = (fieldName) => {
        setActiveField(fieldName);

        // Show password instructions when password field is focused
        if (fieldName === 'password') {
            setShowPasswordInstructions(true);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setActiveField(null);

        // Always hide password instructions when the password field loses focus
        if (name === 'password') {
            setShowPasswordInstructions(false);
        }

        // Validate field on blur
        const validation = validateField(name, value, t);
        if (typeof validation === 'function') {
            const error = validation(formData);
            if (error) setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        } else if (validation) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: validation }));
        }
    };

    const handleCompanyRegistered = (status) => {
        setFormData(prevState => ({
            ...prevState,
            companyRegistered: status
        }));

        if (status === true) {
            setShowModal(true);
        } else {
            setShowModal(false);
        }

        // Clear company registration error
        if (errors.companyRegistered) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors.companyRegistered;
                return newErrors;
            });
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    const handleTermsClick = (e) => {
        e.preventDefault();
        setShowTermsModal(true);
    };

    const handleAcceptTerms = () => {
        // Use functional state update to ensure we're working with the latest state
        setFormData(prevState => ({
            ...prevState,
            termsAccepted: true
        }));

        // Clear terms error if it exists
        if (errors.termsAccepted) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors.termsAccepted;
                return newErrors;
            });
        }

        setShowTermsModal(false);
    };

    const handleSubmit = async () => {
        if (formData.termsAccepted) {
            // Check for missing required fields
            if (
                !formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                !formData.confirmEmail ||
                !formData.password ||
                !formData.confirmPassword ||
                !formData.phoneNumber ||
                formData.companyRegistered === null
            ) {
                alert(t.fillRequiredFields);
            } else {
                // Check if passwords and emails match
                if (formData.password !== formData.confirmPassword) {
                    alert(t.passwordMismatch);
                } else if (formData.email !== formData.confirmEmail) {
                    alert(t.emailMismatch);
                } else {
                    try {
                        // Get all existing user IDs
                        const usersSnapshot = await getDocs(collection(db, "User"));
                        const ids = usersSnapshot.docs.map(doc => doc.id);

                        const existingNumbers = ids
                            .map(id => {
                                const match = id.match(/^u(\d{3})$/);
                                return match ? parseInt(match[1]) : null;
                            })
                            .filter(n => n !== null)
                            .sort((a, b) => a - b);

                        let nextNumber = 1;
                        for (let i = 0; i < existingNumbers.length; i++) {
                            if (existingNumbers[i] !== nextNumber) break;
                            nextNumber++;
                        }

                        const nextId = `u${String(nextNumber).padStart(3, "0")}`;
                        localStorage.setItem("userId", nextId);

                        // If the user stores his phone number in +966 format it will be stored in 0.. format in the database (needed for sign in)
                        const normalizedPhone = formData.phoneNumber.startsWith("+966")
                            ? "0" + formData.phoneNumber.slice(4)
                            : formData.phoneNumber;

                        const userType = formData.companyRegistered ? "User" : "Manager";

                        // find the company document based on the entered SecurityKey
                        let companyRef = null;

                        if (formData.companyRegistered && formData.securityKey) {
                            const companiesSnapshot = await getDocs(collection(db, "Company"));
                            const matchedDoc = companiesSnapshot.docs.find(doc =>
                                doc.data().SecurityKey === formData.securityKey
                            );

                            if (matchedDoc) {
                                companyRef = doc(db, "Company", matchedDoc.id); // reference to the company doc
                            } else {
                                alert(t.invalidSecurityKey);
                                return;
                            }
                        }

                        // Save user in Firestore
                        const docRef = doc(db, "User", nextId);
                        await setDoc(docRef, {
                            FirstName: formData.firstName,
                            LastName: formData.lastName,
                            Email: formData.email,
                            Password: formData.password,
                            PhoneNumber: normalizedPhone,
                            CompanyID: companyRef,
                            UserType: userType,
                            CreatedAt: new Date(), // Add creation timestamp
                        });

                        console.log("User saved successfully");

                        // Redirect based on company registration status
                        if (formData.companyRegistered === true) {
                            console.log("Navigating to dashboard");
                            navigate("/dashboard");
                        } else {
                            console.log("Navigating to create-company-account");
                            navigate("/create-company-account");
                        }
                    } catch (error) {
                        console.error("Error saving user:", error);
                        alert(t.errorSaving);
                    }
                }
            }
        } else {
            alert(t.acceptTermsError);
        }
    };

    const handleSecurityKeySubmit = () => {
        if (formData.securityKey.length === 5) {
            setShowModal(false);
        } else {
            showNotification(t.invalidKeyLength, "error");
        }
    };

    return (
        <div className="create-account-page" style={{ minHeight: '105vh', height: 'auto' }}>
            <button
                className="back-arrow-nn"
                onClick={() => navigate('/')}
                aria-label={t.backToHome}
            >
                <IoArrowBack />
            </button>

            {/* Add language toggle button using proper CSS classes */}
            <button
                className="create-account-language-toggle"
                aria-label="Language selector"
            >
                <TbLanguage className="create-account-language-icon" />
                <div className="create-account-language-selector">
                    <div
                        className={`create-account-language-option ${createAccountLanguage === "en" ? "active" : ""}`}
                        onClick={() => handleCreateAccountLanguageChange("en")}
                    >
                        {t.languageEnglish}
                    </div>
                    <div
                        className={`create-account-language-option ${createAccountLanguage === "ar" ? "active" : ""}`}
                        onClick={() => handleCreateAccountLanguageChange("ar")}
                    >
                        {t.languageArabic}
                    </div>
                </div>
            </button>

            {/* Logo positioned at top right corner */}
            <div className="logo-container">
                <img
                    className="Logo"
                    alt="Logo"
                    src={AWJLOGO}
                />
            </div>

            {/* Title positioned above the form */}
            <div className="text-wrapper slide-down">
                {t.createAccount}
            </div>

            <img
                className="BlueBox slide-in-left"
                alt="Blue geometric shape"
                src={BlueBox}
            />

            <img
                className="RedBlueBox slide-in-right"
                alt="Red and blue geometric shape"
                src={RedBlueBox}
            />

            {/* Form Container - With improved layout and widths */}
            <form className="create-account-form slide-up" style={{ padding: '30px' }}>
                {/* Personal information section */}
                <FormField
                    name="firstName"
                    label={t.firstName}
                    icon={<FaUser style={{ marginLeft: '5px' }} />}
                    value={formData.firstName}
                    onChange={handleChange}
                    onFocus={() => handleFocus('firstName')}
                    onBlur={handleBlur}
                    error={errors.firstName}
                    required={true}
                    language={createAccountLanguage} // Add this prop
                />

                <FormField
                    name="lastName"
                    label={t.lastName}
                    icon={<FaUser style={{ marginLeft: '5px' }} />}
                    value={formData.lastName}
                    onChange={handleChange}
                    onFocus={() => handleFocus('lastName')}
                    onBlur={handleBlur}
                    error={errors.lastName}
                    required={true}
                    language={createAccountLanguage} // Add this prop
                />

                <FormField
                    name="email"
                    label={t.email}
                    type="email"
                    icon={<FaEnvelope style={{ marginLeft: '5px' }} />}
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    error={errors.email}
                    required={true}
                    language={createAccountLanguage} // Add this prop
                />

                <FormField
                    name="confirmEmail"
                    label={t.confirmEmail}
                    type="email"
                    icon={<FaEnvelope style={{ marginLeft: '5px' }} />}
                    value={formData.confirmEmail}
                    onChange={handleChange}
                    onFocus={() => handleFocus('confirmEmail')}
                    onBlur={handleBlur}
                    error={errors.confirmEmail}
                    required={true}
                    showCheckmark={formData.email && formData.confirmEmail && formData.email === formData.confirmEmail}
                    language={createAccountLanguage} // Add this prop
                />

                {/* Password section with improved visibility of instructions */}
                <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                    <label>
                        <FaLock style={{ marginLeft: '5px' }} />
                        {t.password}
                        <span className="required">*</span>
                    </label>
                    <div className="input-container" style={{ width: '100%' }}>
                        <input
                            type="password"
                            name="password"
                            placeholder={t.password}
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => handleFocus('password')}
                            onBlur={handleBlur}
                            required
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            dir={createAccountLanguage === 'ar' ? 'rtl' : 'ltr'}
                        />
                        {errors.password && <ErrorMessage message={errors.password} />}
                    </div>
                    {formData.password && <PasswordStrengthMeter password={formData.password} t={t} />}
                    {/* Always show password instructions when there's content */}
                    {showPasswordInstructions && <PasswordInstructions password={formData.password} t={t} />}
                </div>

                <FormField
                    name="confirmPassword"
                    label={t.confirmPassword}
                    type="password"
                    icon={<FaLock style={{ marginLeft: '5px' }} />}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus('confirmPassword')}
                    onBlur={handleBlur}
                    error={errors.confirmPassword}
                    required={true}
                    showCheckmark={formData.password && formData.confirmPassword && formData.password === formData.confirmPassword}
                    language={createAccountLanguage} // Add this prop
                />

                {/* Phone number field - positioned next to company question */}
                <FormField
                    name="phoneNumber"
                    label={t.phoneNumber}
                    icon={<FaPhone style={{ marginLeft: '5px' }} />}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onFocus={() => handleFocus('phoneNumber')}
                    onBlur={handleBlur}
                    error={errors.phoneNumber}
                    required={true}
                    placeholder={t.phoneNumberPlaceholder}
                    language={createAccountLanguage} // Add this prop
                />
                {/* Rearranged section - company and phone fields side by side */}
                <div>
                    {/* Company question */}
                    <div className={`company-question ${errors.companyRegistered ? 'has-error' : ''}`}>
                        <label>
                            <FaBuilding style={{ marginLeft: '5px' }} />
                            {t.companyRegistered}
                            <span className="required">*</span>
                        </label>
                        <div className="company-buttons">
                            <button
                                type="button"
                                className={formData.companyRegistered === true ? "selected" : ""}
                                onClick={() => handleCompanyRegistered(true)}
                            >
                                {t.yes}
                            </button>
                            <button
                                type="button"
                                className={formData.companyRegistered === false ? "selected" : ""}
                                onClick={() => handleCompanyRegistered(false)}
                            >
                                {t.no}
                            </button>
                        </div>
                        {errors.companyRegistered && <ErrorMessage message={errors.companyRegistered} />}
                    </div>
                </div>
            </form>

            {/* Terms and Login in the same row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '90%',
                maxWidth: '834px',
                margin: '20px auto 30px',
                position: 'relative'
            }}>
                {/* Terms Checkbox - Left side */}
                <div className={`terms ${errors.termsAccepted ? 'has-error' : ''}`}
                    style={{
                        animationFillMode: 'forwards',
                        margin: '0',
                        position: 'relative',
                        flex: '1',
                        minWidth: '300px'
                    }}
                >
                    <label htmlFor="terms-checkbox" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            name="termsAccepted"
                            id="terms-checkbox"
                            checked={formData.termsAccepted}
                            onChange={handleChange}
                            required
                            style={{ marginLeft: '10px', cursor: 'pointer', zIndex: 5 }}
                        />
                        <div className="terms-container">
                            <p>{t.iAgree} </p>
                            <a
                                href="#"
                                className="terms-link"
                                onClick={handleTermsClick}
                            >
                                {t.termsAndConditions}
                            </a>
                            <span className="required">*</span>
                        </div>
                    </label>
                    {errors.termsAccepted && <ErrorMessage message={errors.termsAccepted} />}
                </div>

                {/* Login link - Right side */}
                <div className="login-link2" style={{
                    animationFillMode: 'forwards',
                    margin: '0',
                    position: 'relative',
                    bottom: 'auto',
                    minWidth: '200px'
                }}>
                    <a href="/signin">{t.signIn}</a> {t.haveAccount}
                </div>
            </div>

            {/* Enhanced Next button with better sizing */}
            <button
                type="button"
                className="submit-btn slide-up"
                onClick={handleSubmit}
                disabled={loading}
                style={{ width: 'auto', minWidth: '100px', padding: '15px 30px' }}
            >
                {loading ? (
                    <span className="loading-spinner">{t.processing}</span>
                ) : (
                    <span>{t.next}</span>
                )}
            </button>

            {/* Modal for security key */}
            {
                showModal && (
                    <div className="modal fade-in" onClick={() => setShowModal(false)} style={{ animationFillMode: 'forwards' }}>
                        <div className="modal-content scale-in" onClick={(e) => e.stopPropagation()} style={{ animationFillMode: 'forwards' }}>
                            <h3>{t.companyJoin}</h3>
                            <p>{t.securityKeyPrompt}</p>
                            <input
                                type="text"
                                name="securityKey"
                                maxLength="5"
                                placeholder={t.enterSecurityKey}
                                value={formData.securityKey}
                                onChange={handleChange}
                                className={errors.securityKey ? 'input-error' : ''}
                                autoFocus
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                            {errors.securityKey && <ErrorMessage message={errors.securityKey} />}
                            <button onClick={handleSecurityKeySubmit}>
                                {t.confirm}
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Terms and Conditions Modal */}
            {
                showTermsModal && (
                    <TermsModal
                        onClose={() => setShowTermsModal(false)}
                        onAccept={handleAcceptTerms}
                        t={t}
                        language={createAccountLanguage} // Pass the language directly
                    />
                )
            }

            {/* Notification system */}
            {
                notification && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )
            }
        </div >
    );
};

export default CreateAccountPage;