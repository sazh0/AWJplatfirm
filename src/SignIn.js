import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './signin.css';
import AWJLOGO from "./assets/AWJLOGO.svg";
import SideSqrs from "./assets/SideSqrs.svg";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { IoArrowBack } from 'react-icons/io5';
import { FiPhone, FiLock, FiCheckCircle } from 'react-icons/fi';
import { TbLanguage } from "react-icons/tb";

// Define translations for the sign-in page
const signinTranslations = {
    ar: {
        backToHome: "العودة إلى الصفحة الرئيسية",
        signInTitle: "تسجيل الدخول",
        phoneNumber: "رقم الجوال",
        sendOtp: "إرسال رمز التحقق",
        sending: "جاري الإرسال...",
        verificationCode: "رمز التحقق",
        confirmLogin: "تأكيد الدخول",
        verifying: "جاري التحقق...",
        loginSuccess: "تم تسجيل الدخول بنجاح",
        goToDashboard: "الإنتقال إلى لوحة التحكم",
        didntReceiveCode: "لم تستلم الرمز؟",
        resend: "إعادة إرسال",
        noAccount: "ليس لديك حساب؟",
        registerNow: "سجل الآن",
        languageEnglish: "English",
        languageArabic: "العربية"
    },
    en: {
        backToHome: "Back to Home",
        signInTitle: "Sign In",
        phoneNumber: "Phone Number",
        sendOtp: "Send Verification Code",
        sending: "Sending...",
        verificationCode: "Verification Code",
        confirmLogin: "Confirm Login",
        verifying: "Verifying...",
        loginSuccess: "Login Successful",
        goToDashboard: "Go to Dashboard",
        didntReceiveCode: "Didn't receive the code?",
        resend: "Resend",
        noAccount: "Don't have an account?",
        registerNow: "Register Now",
        languageEnglish: "English",
        languageArabic: "العربية"
    }
};

const SignIn = ({ setIsAuthenticated }) => {
    const [phoneNumber, setPhoneNumber] = useState('+966');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Get saved language from localStorage or default to Arabic
    const [signInLanguage, setSignInLanguage] = useState(() => {
        return localStorage.getItem('appLanguage') || 'ar';
    });

    const navigate = useNavigate();

    // Get translations based on current language
    const t = signinTranslations[signInLanguage];

    const handleNavigationDash = () => {
        navigate('/dashboard', { replace: true });
    };

    const handlePhoneInput = (e) => {
        const value = e.target.value;
        // Only allow numbers after +966
        if (value === '+966' || (value.startsWith('+966') && value.length <= 13)) {
            setPhoneNumber(value);
        }
    };

    const handleOtpInput = (e) => {
        const value = e.target.value;
        // Only allow numbers and limit to 6 characters
        if (/^\d*$/.test(value) && value.length <= 6) {
            setOtp(value);
        }
    };

    // Handle language change
    const handleSignInLanguageChange = (lang) => {
        setSignInLanguage(lang);
        // Update document direction based on language
        document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
        // Save language preference to localStorage for app-wide use
        localStorage.setItem('appLanguage', lang);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setIsVerified(false);

        if (!/^\+9665\d{8}$/.test(phoneNumber)) {
            setError(signInLanguage === 'ar'
                ? "يرجى إدخال الرقم بصيغة +9665XXXXXXXX"
                : "Please enter the number in the format +9665XXXXXXXX");
            setIsLoading(false);
            return;
        }

        try {
            const localPhone = "0" + phoneNumber.slice(4);
            const q = query(collection(db, "User"), where("PhoneNumber", "==", localPhone));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError(signInLanguage === 'ar'
                    ? "لم يتم العثور على المستخدم. يُرجى التحقق من رقم هاتفك أو إنشاء حساب."
                    : "User not found. Please check your phone number or create an account.");
                setIsLoading(false);
                return;
            }

            const userDoc = querySnapshot.docs[0];
            localStorage.setItem("userId", userDoc.id);

            const response = await axios.post(
                "https://api.authentica.sa/api/v1/send-otp",
                { phone: phoneNumber, method: "whatsapp" },
                {
                    headers: {
                        "X-Authorization": "$2y$10$fsNNFy7nluAD0ODvdp2t/u91Z6kypZ8PT6mKQO3Pi5/Dl/W9Ek/Me",
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.data?.success) {
                // Use a non-blocking notification instead of alert
                setIsOtpSent(true);
                // Display notification through state
                setShowSuccessMessage(false);
                setError(signInLanguage === 'ar'
                    ? `تم إرسال رمز التحقق إلى ${phoneNumber}`
                    : `Verification code sent to ${phoneNumber}`);
                // Clear error after 3 seconds
                setTimeout(() => setError(''), 3000);
            } else {
                setError(response.data?.message || (signInLanguage === 'ar'
                    ? "فشل إرسال رمز التحقق. حاول مرة أخرى."
                    : "Failed to send verification code. Please try again."));
            }
        } catch (err) {
            console.error("OTP Send Error:", err);
            setError(signInLanguage === 'ar'
                ? `حدث خطأ: ${err.response?.data?.message || "تحقق من صيغة الرقم أو مفتاح API"}`
                : `Error: ${err.response?.data?.message || "Check number format or API key"}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(
                'https://api.authentica.sa/api/v1/verify-otp',
                { phone: phoneNumber, otp: otp },
                {
                    headers: {
                        'X-Authorization': '$2y$10$fsNNFy7nluAD0ODvdp2t/u91Z6kypZ8PT6mKQO3Pi5/Dl/W9Ek/Me',
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Axios response:", response);

            // FORCE showSuccessMessage to true for testing
            setShowSuccessMessage(true);

            if (response.data?.success) {
                console.log("response.data.success is true");
                console.log("response.data:", response.data);
                console.log("isVerified before:", isVerified);
                console.log("showSuccessMessage before:", showSuccessMessage);
                localStorage.setItem('authToken', response.data.token || 'verified');
                setIsAuthenticated(true);
                setIsVerified(true);
                console.log("isVerified after:", isVerified);
                console.log("showSuccessMessage after:", showSuccessMessage);
                setError('');
                console.log("SignIn.js: setIsAuthenticated called");

                // Add automatic navigation with a delay
                console.log("Setting up automatic navigation to dashboard...");
                setTimeout(() => {
                    console.log("Navigating to dashboard now...");
                    navigate('/dashboard', { replace: true });
                }, 1500); // 1.5 seconds delay
            } else {
                setError(response.data?.message || (signInLanguage === 'ar'
                    ? 'رمز التحقق غير صحيح. حاول مرة أخرى.'
                    : 'Invalid verification code. Please try again.'));
            }
        } catch (error) {
            console.error('Verification Error:', error);
            setError(signInLanguage === 'ar'
                ? 'حدث خطأ أثناء التحقق من الرمز. تأكد من صحة الرمز أو حاول لاحقاً.'
                : 'Error verifying code. Check the code or try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    // Set initial direction on mount
    useEffect(() => {
        document.body.dir = signInLanguage === 'ar' ? 'rtl' : 'ltr';
    }, [signInLanguage]);

    return (
        <div className="sign-in-page">
            <button
                className="back-arrow-nn"
                onClick={() => navigate('/')}
                aria-label={t.backToHome}
            >
                <IoArrowBack />
            </button>

            {/* Add language toggle button */}
            <button
                className="signin-language-toggle"
                aria-label="Language selector"
            >
                <TbLanguage className="signin-language-icon" />
                <div className="signin-language-selector">
                    <div
                        className={`signin-language-option ${signInLanguage === "en" ? "active" : ""}`}
                        onClick={() => handleSignInLanguageChange("en")}
                    >
                        {t.languageEnglish}
                    </div>
                    <div
                        className={`signin-language-option ${signInLanguage === "ar" ? "active" : ""}`}
                        onClick={() => handleSignInLanguageChange("ar")}
                    >
                        {t.languageArabic}
                    </div>
                </div>
            </button>

            <img className="logo-image" alt="AWJ Logo" src={AWJLOGO} />
            <img className="side-squares" alt="Background Design" src={SideSqrs} />

            <div className="sign-in-container">
                <div className="sign-in-box">
                    <h1 className="sign-in-title">{t.signInTitle}</h1>

                    {error && !error.includes('OTP verified successfully') && (
                        <div className={`notification ${error.includes('تم إرسال رمز التحقق') || error.includes('Verification code sent') ? 'success' : 'error'}`}>
                            {error}
                        </div>
                    )}

                    {!isOtpSent ? (
                        <form onSubmit={handleSendOtp} className="sign-in-form">
                            <div className="form-group">
                                <label htmlFor="phoneNumber">{t.phoneNumber}</label>
                                <div className="input-with-icon">
                                    <FiPhone className="input-icon" />
                                    <input
                                        id="phoneNumber"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={handlePhoneInput}
                                        placeholder="+9665XXXXXXXX"
                                        required
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className={`submit-button ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? t.sending : t.sendOtp}
                            </button>
                        </form>
                    ) : (
                        <div className="otp-section">
                            {!showSuccessMessage ? (
                                <form onSubmit={handleVerifyOtp} className="sign-in-form">
                                    <div className="form-group">
                                        <label htmlFor="otpInput">{t.verificationCode}</label>
                                        <div className="input-with-icon">
                                            <FiLock className="input-icon" />
                                            <input
                                                id="otpInput"
                                                type="text"
                                                value={otp}
                                                onChange={handleOtpInput}
                                                placeholder={signInLanguage === 'ar' ? "أدخل رمز التحقق" : "Enter verification code"}
                                                required
                                                dir="ltr"
                                                disabled={isVerified}
                                                maxLength={6}
                                            />
                                        </div>
                                    </div>

                                    {!isVerified && (
                                        <button
                                            type="submit"
                                            className={`submit-button ${isLoading ? 'loading' : ''}`}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? t.verifying : t.confirmLogin}
                                        </button>
                                    )}
                                </form>
                            ) : (
                                <div className="success-container">
                                    <div className="success-icon">
                                        <FiCheckCircle />
                                        <p className="success-message">{t.loginSuccess}</p>
                                    </div>
                                    <button
                                        onClick={handleNavigationDash}
                                        className="dashboard-btn"
                                    >
                                        {t.goToDashboard}
                                    </button>
                                </div>
                            )}

                            {!isVerified && !showSuccessMessage && (
                                <div className="resend-otp">
                                    <p>{t.didntReceiveCode}</p>
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={isLoading}
                                        className="resend-link"
                                    >
                                        {t.resend}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!showSuccessMessage && (
                    <div className="login-link">
                        <p>{t.noAccount} <a href="/create-account">{t.registerNow}</a></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignIn;