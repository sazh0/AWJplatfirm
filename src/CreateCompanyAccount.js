import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CA.css";
import BlueBox from "./assets/BlueBox.svg";
import RedBlueBox from "./assets/RedBlueBox.svg";
import AWJLOGO from "./assets/AWJLOGO.svg";
import { collection, getDocs, doc, setDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { IoArrowBack } from 'react-icons/io5';
import { FaBuilding, FaFileAlt, FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes, FaUsers, FaKeycdn, FaList, FaLightbulb } from 'react-icons/fa';
import { TbLanguage } from "react-icons/tb";

// Terms And Conditions Modal Component
// Terms And Conditions Modal Component
const TermsModal = ({ onClose, onAccept, t }) => {
    // Get saved language from localStorage or default to Arabic
    const currentLanguage = localStorage.getItem('appLanguage') || 'ar';
    const isRTL = currentLanguage === 'ar';

    return (
        <div className="modal terms-modal" onClick={onClose}>
            <div
                className="modal-content-terms scale-in"
                onClick={(e) => e.stopPropagation()}
                style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}
            >
                <h3>{t?.termsTitle || "شروط وأحكام تسجيل منشأة"}</h3>
                <div className="terms-content">
                    <p>1. {t?.terms1 || "يجب أن تكون المنشأة مسجلة رسمياً ولديها سجل تجاري ساري المفعول."}</p>
                    <p>2. {t?.terms2 || "يتعهد مدير الحساب بصحة جميع البيانات المقدمة للتسجيل."}</p>
                    <p>3. {t?.terms3 || "يتحمل مدير الحساب مسؤولية إدارة حسابات منسوبي الشركة والإشراف عليها."}</p>
                    <p>4. {t?.terms4 || "يمكن للمنصة التحقق من صحة البيانات المقدمة في أي وقت."}</p>
                    <p>5. {t?.terms5 || "تلتزم المنشأة بالاستخدام القانوني للمنصة وفقاً للأنظمة واللوائح المحلية."}</p>
                    <p>6. {t?.terms6 || "يحق للمنصة إيقاف أو إلغاء حساب المنشأة في حال مخالفة الشروط والأحكام."}</p>
                    <p>7. {t?.terms7 || "يتعهد مدير الحساب بالحفاظ على سرية رمز الأمان وعدم مشاركته إلا مع منسوبي الشركة المصرح لهم."}</p>
                    <p>8. {t?.terms8 || "تلتزم المنشأة بدفع الرسوم المستحقة (إن وجدت) وفقاً للباقة المختارة."}</p>
                    <p>9. {t?.terms9 || "يتم تخزين بيانات المنشأة وفقاً لسياسة الخصوصية الخاصة بالمنصة."}</p>
                    <p>10. {t?.terms10 || "يحق للمنصة تعديل هذه الشروط والأحكام مع إشعار المنشآت المسجلة بالتغييرات."}</p>
                </div>
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    flexDirection: isRTL ? 'row' : 'row-reverse'
                }}>
                    <button onClick={onClose}>
                        {t?.close || "إغلاق"}
                    </button>
                    <button onClick={onAccept} className="accept-terms-btn">
                        {t?.acceptTerms || "موافق على الشروط"}
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
    required = false,
    readOnly = false,
    showCheckmark = false,
    options = null, // For select elements
    minHeight = null, // For textarea
    description = null, // Optional description text
    examples = null, // Optional examples
    dir = 'rtl'  // Direction control
}) => {
    // If options are provided, render a select element
    if (options) {
        return (
            <div className={`form-group ${error ? 'has-error' : ''}`}>
                <label>
                    {icon}
                    {label}
                    {required && <span className="required">*</span>}
                </label>
                <div className="input-container">
                    <select
                        name={name}
                        value={value}
                        onChange={onChange}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        required={required}
                        className="styled-select"
                        dir={dir}
                    >
                        {options.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {error && <ErrorMessage message={error} />}
                </div>
                {description && <p className="field-description">{description}</p>}
                <style jsx>{`
                    .styled-select {
                        font-family: "Tajawal", sans-serif;
                        padding: 12px 15px;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                        color: #333;
                        background-color: #f9f9f9;
                        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
                        width: 100%;
                        box-sizing: border-box;
                        appearance: none;
                        -webkit-appearance: none;
                        -moz-appearance: none;
                        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                        background-repeat: no-repeat;
                        background-position: ${dir === 'rtl' ? 'left 1rem center' : 'right 1rem center'};
                        background-size: 1em;
                        text-align: ${dir === 'rtl' ? 'right' : 'left'};
                        direction: ${dir};
                    }
                    
                    .styled-select:focus {
                        outline: none;
                        border-color: #234069;
                        box-shadow: 0 0 0 3px rgba(35, 64, 105, 0.2);
                        background-color: #fff;
                        transition: all 0.2s ease-in-out;
                    }
                    
                    .styled-select:hover:not(:focus) {
                        border-color: #234069;
                        transition: all 0.2s ease;
                    }
                `}</style>
            </div>
        );
    }

    // If minHeight is provided, render a textarea
    if (minHeight) {
        return (
            <div className={`form-group ${error ? 'has-error' : ''}`}>
                <label>
                    {icon}
                    {label}
                    {required && <span className="required">*</span>}
                </label>
                <div className="input-container">
                    <textarea
                        name={name}
                        placeholder={placeholder || label}
                        value={value}
                        onChange={onChange}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        required={required}
                        className="styled-textarea"
                        style={{ minHeight: minHeight }}
                        dir={dir}
                    />
                    {showCheckmark && !error && <FaCheck className="check-icon" />}
                    {error && <ErrorMessage message={error} />}
                </div>
                {description && <p className="field-description">{description}</p>}
                {examples && (
                    <div className="field-examples">
                        <div className="examples-content">{examples}</div>
                    </div>
                )}
                <style jsx>{`
                    .styled-textarea {
                        font-family: "Tajawal", sans-serif;
                        padding: 12px 15px;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                        color: #333;
                        background-color: #f9f9f9;
                        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
                        width: 100%;
                        resize: vertical;
                        box-sizing: border-box;
                        transition: all 0.2s ease;
                        direction: ${dir};
                        text-align: ${dir === 'rtl' ? 'right' : 'left'};
                    }
                    
                    .styled-textarea:focus {
                        outline: none;
                        border-color: #234069;
                        box-shadow: 0 0 0 3px rgba(35, 64, 105, 0.2);
                        background-color: #fff;
                    }
                    
                    .styled-textarea:hover:not(:focus) {
                        border-color: #234069;
                    }
                    
                    .field-description {
                        font-size: 12px;
                        color: #666;
                        margin-top: 8px;
                        line-height: 1.5;
                        text-align: ${dir === 'rtl' ? 'right' : 'left'};
                    }
                    
                    .field-examples {
                        background-color:rgba(244, 244, 244, 0.54);
                        border-radius: 6px;
                        padding: 10px 15px;
                        margin-top: 10px;
                    }
                    
                    .examples-title {
                        font-weight: 600;
                        color: #1d3557;
                        margin: 0 0 8px 0;
                        font-size: 13px;
                    }
                    
                    .examples-content {
                        font-size: 12px;
                        color: #555;
                        line-height: 1.6;
                    }
                `}</style>
            </div>
        );
    }

    // Default: render a regular input field
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
                    dir={dir}
                />
                {showCheckmark && !error && <FaCheck className="check-icon" />}
                {error && <ErrorMessage message={error} />}
            </div>
            {description && <p className="field-description">{description}</p>}
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
        case 'companyName':
            return value.trim().length > 2 ? null : t?.companyNameShort || 'يجب أن يتكون اسم الشركة من ثلاثة أحرف على الأقل';

        case 'commercialRegistration':
            return value.trim() === '' || value.trim().length >= 10 ? null : t?.invalidCommercialReg || 'يجب أن يتكون السجل التجاري من 10 أرقام على الأقل';

        case 'Industry':
            return value ? null : t?.selectIndustry || 'يرجى اختيار نشاط الشركة';

        case 'employeeCount':
            return parseInt(value) > 0 ? null : t?.invalidEmployeeCount || 'يجب أن يكون عدد الموظفين أكبر من صفر';

        default:
            return null;
    }
};

const CreateCompanyAccount = () => {
    // State for examples and security info visibility
    const [showExamples, setShowExamples] = useState(false);
    const [showSecurityInfo, setShowSecurityInfo] = useState(false);

    // Translations
    const translations = {
        ar: {
            title: "إنشـاء حساب الشركة",
            backToSignIn: "العودة إلى تسجيل الدخول",
            companyName: "اسم الشركة",
            commercialReg: "السجل التجاري",
            commercialRegPlaceholder: "أدخل رقم السجل التجاري",
            industryLabel: "نشاط الشركة",
            selectOption: "اختر النشاط",
            employeeCountLabel: "عدد الموظفين",
            employeeCountPlaceholder: "أدخل عدد الموظفين",
            descriptionLabel: "وصف الشركة",
            descriptionPlaceholder: "وصف مختصر لنشاط الشركة والخدمات التي تقدمها وأهدافها المستقبلية",
            industryOptions: {
                CyberSecurity: "الأمن السيبراني",
                Fintech: "التقنية المالية",
                games: "الألعاب",
                WebDevelopment: "تطوير الويب",
                AI: "الذكاء الاصطناعي",
                Telecommunications: "الاتصالات",
                CloudComputing: "الحوسبة السحابية",
                DataAnalytics: "تحليل البيانات",
                MobileApps: "تطبيقات الجوال",
                Ecommerce: "التجارة الإلكترونية",
                Blockchain: "بلوكتشين",
                IoT: "إنترنت الأشياء",
                VR_AR: "الواقع الافتراضي والمعزز",
                SoftwareDevelopment: "تطوير البرمجيات",
                Hardware: "الأجهزة",
                Biotech: "التقنية الحيوية",
                Robotics: "الروبوتات",
                EdTech: "تقنية التعليم",
                HealthTech: "التقنية الصحية"
            },
            securityKeyTitle: "رمز الأمان لمنسوبي الشركة",
            securityKeyQuestion: "ما هو رمز الأمان وكيف يتم استخدامه؟",
            showInfo: "عرض المعلومات",
            hideInfo: "إخفاء المعلومات",
            securityKeyInfo1: "سيتم إنشاء رمز أمان فريد مكون من 5 أحرف/أرقام عند إنشاء حساب شركتك",
            securityKeyInfo2: "يستخدم منسوبو الشركة هذا الرمز للانضمام إلى حساب شركتك عند تسجيلهم",
            securityKeyInfo3: "مهم: سيظهر الرمز الخاص بك بعد إنشاء الحساب",
            termsAgree: "أوافق على",
            termsLink: "شروط وأحكام تسجيل منشأة",
            requiredField: "حقل مطلوب",
            processing: "جاري المعالجة...",
            create: "إنشاء",
            termsTitle: "شروط وأحكام تسجيل منشأة",
            terms1: "يجب أن تكون المنشأة مسجلة رسمياً ولديها سجل تجاري ساري المفعول.",
            terms2: "يتعهد مدير الحساب بصحة جميع البيانات المقدمة للتسجيل.",
            terms3: "يتحمل مدير الحساب مسؤولية إدارة حسابات منسوبي الشركة والإشراف عليها.",
            terms4: "يمكن للمنصة التحقق من صحة البيانات المقدمة في أي وقت.",
            terms5: "تلتزم المنشأة بالاستخدام القانوني للمنصة وفقاً للأنظمة واللوائح المحلية.",
            terms6: "يحق للمنصة إيقاف أو إلغاء حساب المنشأة في حال مخالفة الشروط والأحكام.",
            terms7: "يتعهد مدير الحساب بالحفاظ على سرية رمز الأمان وعدم مشاركته إلا مع منسوبي الشركة المصرح لهم.",
            terms8: "تلتزم المنشأة بدفع الرسوم المستحقة (إن وجدت) وفقاً للباقة المختارة.",
            terms9: "يتم تخزين بيانات المنشأة وفقاً لسياسة الخصوصية الخاصة بالمنصة.",
            terms10: "يحق للمنصة تعديل هذه الشروط والأحكام مع إشعار المنشآت المسجلة بالتغييرات.",
            acceptTerms: "موافق على الشروط",
            close: "إغلاق",
            goodExample: "مثال جيد",
            goodExampleText: "شركة رائدة في مجال تطوير تطبيقات الهواتف الذكية، متخصصة في حلول التجارة الإلكترونية للشركات الصغيرة والمتوسطة. نهدف إلى تبسيط عمليات التسوق الإلكتروني.",
            basicComponents: "المكونات الأساسية",
            componentsText: "مجال العمل، التخصص، الفئة المستهدفة، القيمة المضافة، الأهداف المستقبلية",
            showExamples: "عرض الأمثلة",
            hideExamples: "إخفاء الأمثلة",
            fillAllFields: "يرجى ملء جميع الحقول المطلوبة بشكل صحيح",
            companyCreated: "تم إنشاء حساب الشركة بنجاح!",
            errorSaving: "حدث خطأ أثناء حفظ حساب الشركة. حاول مرة أخرى.",
            companyNameShort: "يجب أن يتكون اسم الشركة من ثلاثة أحرف على الأقل",
            invalidCommercialReg: "يجب أن يتكون السجل التجاري من 10 أرقام على الأقل",
            selectIndustry: "يرجى اختيار نشاط الشركة",
            invalidEmployeeCount: "يجب أن يكون عدد الموظفين أكبر من صفر",
            acceptTermsError: "يجب الموافقة على الشروط والأحكام",
            languageEnglish: "English",
            languageArabic: "العربية"
        },
        en: {
            title: "Create Company Account",
            backToSignIn: "Back to Sign In",
            companyName: "Company Name",
            commercialReg: "Commercial Registration",
            commercialRegPlaceholder: "Enter commercial registration number",
            industryLabel: "Company Activity",
            selectOption: "Select Activity",
            employeeCountLabel: "Number of Employees",
            employeeCountPlaceholder: "Enter number of employees",
            descriptionLabel: "Company Description",
            descriptionPlaceholder: "Brief description of company activities, services provided, and future goals",
            industryOptions: {
                CyberSecurity: "Cyber Security",
                Fintech: "Financial Technology",
                games: "Games",
                WebDevelopment: "Web Development",
                AI: "Artificial Intelligence",
                Telecommunications: "Telecommunications",
                CloudComputing: "Cloud Computing",
                DataAnalytics: "Data Analytics",
                MobileApps: "Mobile Applications",
                Ecommerce: "E-commerce",
                Blockchain: "Blockchain",
                IoT: "Internet of Things",
                VR_AR: "Virtual/Augmented Reality",
                SoftwareDevelopment: "Software Development",
                Hardware: "Hardware",
                Biotech: "Biotechnology",
                Robotics: "Robotics",
                EdTech: "Educational Technology",
                HealthTech: "Health Technology"
            },
            securityKeyTitle: "Security Key for Company Members",
            securityKeyQuestion: "What is the security key and how is it used?",
            showInfo: "Show Information",
            hideInfo: "Hide Information",
            securityKeyInfo1: "A unique 5-character security key will be generated when creating your company account",
            securityKeyInfo2: "Company members use this key to join your company account when registering",
            securityKeyInfo3: "Important: Your key will be displayed after account creation",
            termsAgree: "I agree to the",
            termsLink: "Company Registration Terms and Conditions",
            requiredField: "This field is required",
            processing: "Processing...",
            create: "Create",
            termsTitle: "Company Registration Terms and Conditions",
            terms1: "The company must be officially registered with a valid commercial registration.",
            terms2: "The account manager commits to the accuracy of all information provided for registration.",
            terms3: "The account manager is responsible for managing and supervising company member accounts.",
            terms4: "The platform may verify the accuracy of the provided information at any time.",
            terms5: "The company commits to using the platform legally according to local regulations.",
            terms6: "The platform has the right to suspend or cancel a company account in case of violating terms and conditions.",
            terms7: "The account manager commits to maintaining the confidentiality of the security key and sharing it only with authorized company members.",
            terms8: "The company commits to paying applicable fees (if any) according to the chosen package.",
            terms9: "Company data is stored according to the platform's privacy policy.",
            terms10: "The platform has the right to modify these terms and conditions with notification to registered companies.",
            acceptTerms: "Accept Terms",
            close: "Close",
            goodExample: "Good Example",
            goodExampleText: "A leading company in mobile application development, specializing in e-commerce solutions for small and medium enterprises. We aim to simplify e-shopping processes.",
            basicComponents: "Basic Components",
            componentsText: "Field of work, specialization, target audience, added value, future goals",
            showExamples: "Show Examples",
            hideExamples: "Hide Examples",
            fillAllFields: "Please fill all required fields correctly",
            companyCreated: "Company account created successfully!",
            errorSaving: "Error saving company account. Please try again.",
            companyNameShort: "Company name must be at least three characters",
            invalidCommercialReg: "Commercial registration must be at least 10 digits",
            selectIndustry: "Please select a company activity",
            invalidEmployeeCount: "Number of employees must be greater than zero",
            acceptTermsError: "You must accept the terms and conditions",
            languageEnglish: "English",
            languageArabic: "العربية"
        }
    };

    // Get saved language from localStorage or default to Arabic
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('appLanguage') || 'ar';
    });

    const t = translations[language];

    const [formData, setFormData] = useState({
        companyName: "",
        commercialRegistration: "",
        companyDescription: "",
        Industry: "",
        employeeCount: "",
        termsAccepted: false,
    });

    const [securityKey, setSecurityKey] = useState("");
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [notification, setNotification] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const firstErrorRef = useRef(null);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    // Handle language change
    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        // Update document direction based on language
        // document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
        // Save language preference to localStorage
        localStorage.setItem('appLanguage', lang);
    };

    // Generate a unique security key that doesn't exist in any company record
    const generateUniqueSecurityKey = async () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        while (true) {
            let key = "";
            for (let i = 0; i < 5; i++) {
                key += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            // Check Firestore to ensure key is unique
            const q = query(collection(db, "Company"), where("SecurityKey", "==", key));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return key; // ✅ Unique key found
            }
            // If not unique, generate a new one
        }
    };

    // Generate a random 5-digit security key when component mounts
    useEffect(() => {
        document.title = "أوج | إنشاء حساب الشركة";

        const generateKey = async () => {
            try {
                const uniqueKey = await generateUniqueSecurityKey();
                setSecurityKey(uniqueKey);
            } catch (error) {
                console.error("Error generating unique security key:", error);
                // Fallback to simple random key if firestore query fails
                const fallbackKey = Math.floor(10000 + Math.random() * 90000).toString();
                setSecurityKey(fallbackKey);
            }
        };

        generateKey();

        // Validate form on data change if user has attempted submission
        if (formSubmitted) {
            validateForm();
        }

        // Set document direction based on language
        // document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [formData, formSubmitted, language]);

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

        // Required fields validation
        if (!formData.companyName) newErrors.companyName = t.requiredField;
        if (!formData.Industry) newErrors.Industry = t.requiredField;
        if (!formData.employeeCount) newErrors.employeeCount = t.requiredField;

        // Validate each field with detailed validation
        Object.keys(formData).forEach(field => {
            const value = formData[field];
            if (value && typeof value === 'string') {
                const validation = validateField(field, value, t);
                if (validation) newErrors[field] = validation;
            }
        });

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
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setActiveField(null);

        // Validate field on blur if it has a value
        if (value) {
            const validation = validateField(name, value, t);
            if (validation) {
                setErrors(prevErrors => ({ ...prevErrors, [name]: validation }));
            }
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

    const toggleSecurityInfo = () => {
        setShowSecurityInfo(!showSecurityInfo);
    };

    const handleSubmit = async () => {
        setFormSubmitted(true);

        if (!validateForm()) {
            showNotification(t.fillAllFields, "error");
            return;
        }

        setLoading(true);

        try {
            // Get all existing company IDs
            const companiesSnapshot = await getDocs(collection(db, "Company"));
            const ids = companiesSnapshot.docs.map(doc => doc.id);

            const existingNumbers = ids
                .map(id => {
                    const match = id.match(/^c(\d{3})$/);
                    return match ? parseInt(match[1]) : null;
                })
                .filter(n => n !== null)
                .sort((a, b) => a - b);

            let nextNumber = 1;
            for (let i = 0; i < existingNumbers.length; i++) {
                if (existingNumbers[i] !== nextNumber) break;
                nextNumber++;
            }

            const nextId = `c${String(nextNumber).padStart(3, "0")}`;

            // Save company in Firestore
            const companyRef = doc(db, "Company", nextId);
            await setDoc(companyRef, {
                CompanyName: formData.companyName,
                CommercialRecord: formData.commercialRegistration,
                CompDescription: formData.companyDescription,
                Industry: formData.Industry,
                CompanySize: parseInt(formData.employeeCount),
                SecurityKey: securityKey,
                ManagerID: doc(db, "User", userId),
                SecurityKeyCreatedAt: new Date()
            });

            // Update user record to include company reference
            const userRef = doc(db, "User", userId);
            await setDoc(userRef, {
                CompanyID: companyRef,
                UserType: "Manager"
            }, { merge: true });

            showNotification(t.companyCreated, "success");

            // Navigate to dashboard after successful company creation
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);

        } catch (error) {
            console.error("Error saving company:", error);
            showNotification(t.errorSaving, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-account-page" style={{ minHeight: '105vh', height: 'auto' }}>
            <button
                className="back-arrow-nn"
                onClick={() => navigate(-1)}
                aria-label={t.backToHome}
            >
                <IoArrowBack />
            </button>

            {/* Add language toggle button */}
            <button
                className="create-account-language-toggle"
                aria-label="Language selector"
            >
                <TbLanguage className="create-account-language-icon" />
                <div className="create-account-language-selector">
                    <div
                        className={`create-account-language-option ${language === "en" ? "active" : ""}`}
                        onClick={() => handleLanguageChange("en")}
                    >
                        {t.languageEnglish}
                    </div>
                    <div
                        className={`create-account-language-option ${language === "ar" ? "active" : ""}`}
                        onClick={() => handleLanguageChange("ar")}
                    >
                        {t.languageArabic}
                    </div>
                </div>
            </button>

            <div className="logo-container">
                <img
                    className="Logo"
                    alt="Logo"
                    src={AWJLOGO}
                />
            </div>

            <div className="text-wrapper slide-down">{t.title}</div>

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

            {/* Form Container with animation */}
            <form className="create-account-form slide-up" style={{ padding: '30px' }}>
                {/* Company information section */}
                <FormField
                    name="companyName"
                    label={t.companyName}
                    icon={<FaBuilding style={{ marginLeft: '5px' }} />}
                    value={formData.companyName}
                    onChange={handleChange}
                    onFocus={() => handleFocus('companyName')}
                    onBlur={handleBlur}
                    error={errors.companyName}
                    required={true}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                />

                <FormField
                    name="commercialRegistration"
                    label={t.commercialReg}
                    icon={<FaFileAlt style={{ marginLeft: '5px' }} />}
                    value={formData.commercialRegistration}
                    onChange={handleChange}
                    onFocus={() => handleFocus('commercialRegistration')}
                    onBlur={handleBlur}
                    error={errors.commercialRegistration}
                    required={false}
                    placeholder={t.commercialRegPlaceholder}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                />

                <FormField
                    name="Industry"
                    label={t.industryLabel}
                    icon={<FaList style={{ marginLeft: '5px' }} />}
                    value={formData.Industry}
                    onChange={handleChange}
                    onFocus={() => handleFocus('Industry')}
                    onBlur={handleBlur}
                    error={errors.Industry}
                    required={true}
                    options={[
                        { value: "", label: t.selectOption },
                        { value: "CyberSecurity", label: t.industryOptions.CyberSecurity },
                        { value: "Fintech", label: t.industryOptions.Fintech },
                        { value: "games", label: t.industryOptions.games },
                        { value: "WebDevelopment", label: t.industryOptions.WebDevelopment },
                        { value: "AI", label: t.industryOptions.AI },
                        { value: "Telecommunications", label: t.industryOptions.Telecommunications },
                        { value: "CloudComputing", label: t.industryOptions.CloudComputing },
                        { value: "DataAnalytics", label: t.industryOptions.DataAnalytics },
                        { value: "MobileApps", label: t.industryOptions.MobileApps },
                        { value: "Ecommerce", label: t.industryOptions.Ecommerce },
                        { value: "Blockchain", label: t.industryOptions.Blockchain },
                        { value: "IoT", label: t.industryOptions.IoT },
                        { value: "VR_AR", label: t.industryOptions.VR_AR },
                        { value: "SoftwareDevelopment", label: t.industryOptions.SoftwareDevelopment },
                        { value: "Hardware", label: t.industryOptions.Hardware },
                        { value: "Biotech", label: t.industryOptions.Biotech },
                        { value: "Robotics", label: t.industryOptions.Robotics },
                        { value: "EdTech", label: t.industryOptions.EdTech },
                        { value: "HealthTech", label: t.industryOptions.HealthTech }
                    ]}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                />

                <FormField
                    name="employeeCount"
                    label={t.employeeCountLabel}
                    type="number"
                    icon={<FaUsers style={{ marginLeft: '5px' }} />}
                    value={formData.employeeCount}
                    onChange={handleChange}
                    onFocus={() => handleFocus('employeeCount')}
                    onBlur={handleBlur}
                    error={errors.employeeCount}
                    required={true}
                    placeholder={t.employeeCountPlaceholder}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                />

                {/* Custom Company Description Field with togglable examples */}
                <div className="form-group">
                    <label>
                        <FaInfoCircle style={{ marginLeft: '5px' }} />
                        {t.descriptionLabel}
                        <span className="required">*</span>
                        {showExamples ? (
                            <FaLightbulb
                                style={{
                                    marginRight: '8px',
                                    cursor: 'pointer',
                                    color: '#f0a500',
                                    fontSize: '16px',
                                    filter: 'drop-shadow(0 0 2px rgba(240, 165, 0, 0.5))',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => setShowExamples(!showExamples)}
                                title={t.hideExamples}
                            />
                        ) : (
                            <FaLightbulb
                                style={{
                                    marginRight: '8px',
                                    cursor: 'pointer',
                                    color: '#a0a0a0',
                                    fontSize: '16px',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => setShowExamples(!showExamples)}
                                title={t.showExamples}
                            />
                        )}
                    </label>
                    <div className="input-container">
                        <textarea
                            name="companyDescription"
                            placeholder={t.descriptionPlaceholder}
                            value={formData.companyDescription}
                            onChange={handleChange}
                            onFocus={() => handleFocus('companyDescription')}
                            onBlur={handleBlur}
                            required={true}
                            className="styled-textarea"
                            style={{ minHeight: "120px" }}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        {errors.companyDescription && <ErrorMessage message={errors.companyDescription} />}
                    </div>

                    {showExamples && (
                        <div className="field-examples" style={{ animation: 'fadeIn 0.3s ease' }}>
                            <div className="examples-content" style={{ direction: language === 'ar' ? 'rtl' : 'ltr', textAlign: language === 'ar' ? 'right' : 'left' }}>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong>{t.goodExample}:</strong> {t.goodExampleText}
                                </p>
                                <p>
                                    <strong>{t.basicComponents}:</strong> {t.componentsText}
                                </p>
                            </div>
                        </div>
                    )}

                    <style jsx>{`
                        .styled-textarea {
                            font-family: "Tajawal", sans-serif;
                            padding: 12px 15px;
                            border: 1px solid #e0e0e0;
                            border-radius: 8px;
                            font-size: 14px;
                            color: #333;
                            background-color: #f9f9f9;
                            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
                            width: 100%;
                            resize: vertical;
                            box-sizing: border-box;
                            transition: all 0.2s ease;
                        }
                        
                        .styled-textarea:focus {
                            outline: none;
                            border-color: #234069;
                            box-shadow: 0 0 0 3px rgba(35, 64, 105, 0.2);
                            background-color: #fff;
                        }
                        
                        .styled-textarea:hover:not(:focus) {
                            border-color: #234069;
                        }
                        
                        .field-examples {
                            background-color:rgba(244, 244, 244, 0.54);
                            border-radius: 6px;
                            padding: 10px 15px;
                            margin-top: 10px;
                        }
                        
                        .examples-content {
                            font-size: 12px;
                            color: #555;
                            line-height: 1.6;
                        }
                        
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(-10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>

                {/* Custom Security Key section with togglable info */}
                <div className="form-group security-key-group">
                    <label>
                        <FaKeycdn style={{ marginLeft: '5px' }} />
                        {t.securityKeyTitle}
                    </label>

                    <div className="security-key-preview">
                        <p style={{
                            fontSize: '13px',
                            color: '#1d3557',
                            fontWeight: 'bold',
                            marginTop: '5px',
                            textAlign: language === 'ar' ? 'right' : 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: language === 'ar' ? 'right' : 'left'
                        }}>
                            {t.securityKeyQuestion}
                            {showSecurityInfo ? (
                                <FaLightbulb
                                    style={{
                                        marginRight: language === 'ar' ? '8px' : '0',
                                        marginLeft: language === 'ar' ? '0' : '8px',
                                        cursor: 'pointer',
                                        color: '#f0a500',
                                        fontSize: '16px',
                                        filter: 'drop-shadow(0 0 2px rgba(240, 165, 0, 0.5))',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={toggleSecurityInfo}
                                    title={t.hideInfo}
                                />
                            ) : (
                                <FaLightbulb
                                    style={{
                                        marginRight: language === 'ar' ? '8px' : '0',
                                        marginLeft: language === 'ar' ? '0' : '8px',
                                        cursor: 'pointer',
                                        color: '#a0a0a0',
                                        fontSize: '16px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={toggleSecurityInfo}
                                    title={t.showInfo}
                                />
                            )}
                        </p>

                        {showSecurityInfo && (
                            <ul style={{
                                paddingRight: language === 'ar' ? '10px' : '0',
                                paddingLeft: language === 'ar' ? '12px' : '10px',
                                marginTop: '8px',
                                color: '#444',
                                fontSize: '12px',
                                lineHeight: '1.6',
                                textAlign: language === 'ar' ? 'right' : 'left',
                                listStyleType: 'none',
                                animation: 'fadeIn 0.3s ease',
                                direction: language === 'ar' ? 'rtl' : 'ltr'
                            }}>
                                <li style={{
                                    position: 'relative',
                                    marginBottom: '8px',
                                    paddingRight: language === 'ar' ? '20px' : '0',
                                    paddingLeft: language === 'ar' ? '0' : '20px'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        right: language === 'ar' ? '0' : 'auto',
                                        left: language === 'ar' ? 'auto' : '0',
                                        top: '2px',
                                        color: '#e63a46'
                                    }}>•</span>
                                    {t.securityKeyInfo1}
                                </li>
                                <li style={{
                                    position: 'relative',
                                    marginBottom: '8px',
                                    paddingRight: language === 'ar' ? '20px' : '0',
                                    paddingLeft: language === 'ar' ? '0' : '20px'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        right: language === 'ar' ? '0' : 'auto',
                                        left: language === 'ar' ? 'auto' : '0',
                                        top: '2px',
                                        color: '#e63a46'
                                    }}>•</span>
                                    {t.securityKeyInfo2}
                                </li>
                                <li style={{
                                    position: 'relative',
                                    marginBottom: '0px',
                                    paddingRight: language === 'ar' ? '20px' : '0',
                                    paddingLeft: language === 'ar' ? '0' : '20px'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        right: language === 'ar' ? '0' : 'auto',
                                        left: language === 'ar' ? 'auto' : '0',
                                        top: '2px',
                                        color: '#e63a46'
                                    }}>•</span>
                                    <strong>{language === 'ar' ? 'مهم' : 'Important'}:</strong> {t.securityKeyInfo3}
                                </li>
                            </ul>
                        )}
                    </div>

                    <style jsx>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(-10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>
            </form>

            {/* Terms Checkbox */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '90%',
                maxWidth: '834px',
                margin: '20px auto 30px',
                position: 'relative'
            }}>
                <div className={`terms ${errors.termsAccepted ? 'has-error' : ''}`}
                    style={{
                        animationFillMode: 'forwards',
                        margin: '0',
                        position: 'relative',
                        flex: '1',
                        minWidth: '300px',
                        direction: language === 'ar' ? 'rtl' : 'ltr',
                        textAlign: language === 'ar' ? 'right' : 'left'
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
                            style={{
                                marginLeft: language === 'ar' ? '10px' : '0',
                                marginRight: language === 'ar' ? '0' : '10px',
                                cursor: 'pointer',
                                zIndex: 5
                            }}
                        />
                        <div className="terms-container" >
                            <p>{t.termsAgree} </p>
                            <a
                                href="#"
                                className="terms-link"
                                onClick={handleTermsClick}
                            >
                                {t.termsLink}
                            </a>
                            <span className="required">*</span>
                        </div>
                    </label>
                    {errors.termsAccepted && <ErrorMessage message={errors.termsAccepted} />}
                </div>
            </div>

            {/* Enhanced Create button with better sizing */}
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
                    <span>{t.create}</span>
                )}
            </button>

            {/* Terms and Conditions Modal */}
            {showTermsModal && (
                <TermsModal
                    onClose={() => setShowTermsModal(false)}
                    onAccept={handleAcceptTerms}
                    t={t}
                />
            )}

            {/* Notification system */}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default CreateCompanyAccount;