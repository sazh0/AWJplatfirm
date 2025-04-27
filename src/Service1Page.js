import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./service1.css";
import BlueBox from "./assets/BlueBox.svg";
import RedBlueBox from "./assets/RedBlueBox.svg";
import AWJLOGO from "./assets/AWJLOGO.svg";
import GoalDecomposeIcon from "./assets/GoalDecomposeIcon.svg";
import { TbLanguage } from "react-icons/tb";
import { IoArrowBack } from 'react-icons/io5';

// Define translations for the service1 page
const service1Translations = {
    ar: {
        idealService: "هذه هي الخدمة المثالية لمرحلتك الحالية",
        accessNote: "ستتمكن من الوصول إلى جميع خدماتنا بعد إنشاء حسابك",
        strategicPlanning: "التخطيط الاستراتيجي",
        serviceDescription: "تقسيم أهدافك الاستراتيجية إلى أهداف قصيرة المدى حتى يسهل تنفيذها، مع جداول زمنية و توقع للمخاطر، أيضًا تعزيز التعاون مع أعضاء فريقك، وعرض تقدمك على لوحة تحكم مخصصة لمتابعة الأداء.",
        createAccount: "انشاء حساب",
        back: "رجوع",
        languageEnglish: "English",
        languageArabic: "العربية"
    },
    en: {
        idealService: "This is the ideal service for your current stage",
        accessNote: "You will be able to access all our services after creating your account",
        strategicPlanning: "Strategic Planning",
        serviceDescription: "Break down your strategic goals into short-term objectives for easier implementation, with timelines and risk anticipation, enhance collaboration with team members, and display your progress on a customized dashboard to monitor performance.",
        createAccount: "Create Account",
        back: "Back",
        languageEnglish: "English",
        languageArabic: "العربية"
    }
};

const Service1Page = () => {
    const navigate = useNavigate();

    // Get saved language from localStorage or default to Arabic
    const [service1Language, setService1Language] = useState(() => {
        return localStorage.getItem('appLanguage') || 'ar';
    });

    // Get translations based on current language
    const t = service1Translations[service1Language];

    // Add entrance animations
    useEffect(() => {
        const elements = document.querySelectorAll('.fade-in');

        elements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 * index);
        });

        // Set document direction based on language
        document.body.dir = service1Language === 'ar' ? 'rtl' : 'ltr';
    }, [service1Language]);

    // Handle language change
    const handleService1LanguageChange = (lang) => {
        setService1Language(lang);
        // Update document direction based on language
        document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
        // Save language preference to localStorage
        localStorage.setItem('appLanguage', lang);
    };

    return (
        <div className="service1-page">
            <img
                className="Logo"
                alt="AWJ Logo"
                src={AWJLOGO}
                title="AWJ"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            />

            <button
                className="back-arrow-nn"
                onClick={() => navigate(-1)}
                aria-label={t.backToHome}
            >
                <IoArrowBack />
            </button>
            {/* Add language toggle button */}
            <button
                className="service1-language-toggle"
                aria-label="Language selector"
            >
                <TbLanguage className="service1-language-icon" />
                <div className="service1-language-selector">
                    <div
                        className={`service1-language-option ${service1Language === "en" ? "active" : ""}`}
                        onClick={() => handleService1LanguageChange("en")}
                    >
                        {t.languageEnglish}
                    </div>
                    <div
                        className={`service1-language-option ${service1Language === "ar" ? "active" : ""}`}
                        onClick={() => handleService1LanguageChange("ar")}
                    >
                        {t.languageArabic}
                    </div>
                </div>
            </button>

            {/* Decorative elements */}
            <img className="BlueBox" alt="" src={BlueBox} aria-hidden="true" />
            <img className="RedBlueBox" alt="" src={RedBlueBox} aria-hidden="true" />

            <div className="text-wrapper-1 fade-in">{t.idealService}</div>
            <div className="services-available-note fade-in">{t.accessNote}</div>

            <div className="service1-rectangle fade-in primary-service">
                <img
                    src={GoalDecomposeIcon}
                    alt="Goal Decomposition Icon"
                    className="service1-icon"
                />
                <h1 className="service1-heading">{t.strategicPlanning}</h1>
                <p className="service1-description">
                    {t.serviceDescription}
                </p>
                <button
                    className="create-account-button1"
                    onClick={() => navigate("/create-account")}
                    aria-label={t.createAccount}
                >
                    {t.createAccount}
                </button>
            </div>

            <button
                className="back-button fade-in"
                onClick={() => navigate(-1)}
                aria-label={t.back}
            >
                {t.back}
            </button>
        </div>
    );
};

export default Service1Page;