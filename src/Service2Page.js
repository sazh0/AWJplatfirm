import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./service1.css";
import BlueBox from "./assets/BlueBox.svg";
import RedBlueBox from "./assets/RedBlueBox.svg";
import AWJLOGO from "./assets/AWJLOGO.svg";
import BMICON from "./assets/BMICON.svg";
import { TbLanguage } from "react-icons/tb";
import { IoArrowBack } from 'react-icons/io5';

// Define translations for the service2 page
const service2Translations = {
    ar: {
        idealService: "هذه هي الخدمة المثالية لمرحلتك الحالية",
        accessNote: "ستتمكن من الوصول إلى جميع خدماتنا بعد إنشاء حسابك",
        businessModel: "بنــاء نــموذج عمــل",
        serviceDescription: "بناء نموذج عمل مخصص يتناسب مع شركتك وميزانيتك، مما يسهم في تأسيس بنية أعمال متكاملة وقابلة للتنفيذ. أيضًا التعاون مع أعضاء فريقك، وعرض تقدمك على لوحة تحكم مخصصة لمتابعة الأداء.",
        createAccount: "انشاء حساب",
        back: "رجوع",
        languageEnglish: "English",
        languageArabic: "العربية"
    },
    en: {
        idealService: "This is the ideal service for your current stage",
        accessNote: "You will be able to access all our services after creating your account",
        businessModel: "Build a Business Model",
        serviceDescription: "Create a customized business model that suits your company and budget, contributing to the establishment of an integrated and executable business structure. Also collaborate with your team members, and view your progress on a custom dashboard to monitor performance.",
        createAccount: "Create Account",
        back: "Back",
        languageEnglish: "English",
        languageArabic: "العربية"
    }
};

const Service2Page = () => {
    const navigate = useNavigate();

    // Get saved language from localStorage or default to Arabic
    const [service2Language, setService2Language] = useState(() => {
        return localStorage.getItem('appLanguage') || 'ar';
    });

    // Get translations based on current language
    const t = service2Translations[service2Language];

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
        document.body.dir = service2Language === 'ar' ? 'rtl' : 'ltr';
    }, [service2Language]);

    // Handle language change
    const handleService2LanguageChange = (lang) => {
        setService2Language(lang);
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
                className="service2-language-toggle"
                aria-label="Language selector"
            >
                <TbLanguage className="service2-language-icon" />
                <div className="service2-language-selector">
                    <div
                        className={`service2-language-option ${service2Language === "en" ? "active" : ""}`}
                        onClick={() => handleService2LanguageChange("en")}
                    >
                        {t.languageEnglish}
                    </div>
                    <div
                        className={`service2-language-option ${service2Language === "ar" ? "active" : ""}`}
                        onClick={() => handleService2LanguageChange("ar")}
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

            <div className="service2-rectangle fade-in primary-service">
                <img
                    src={BMICON}
                    alt="Business Model Icon"
                    className="service2-icon"
                />
                <h1 className="service2-heading">{t.businessModel}</h1>
                <p className="service2-description">
                    {t.serviceDescription}
                </p>
                <button
                    className="create-account-button2"
                    onClick={() => navigate("/create-account")}
                    aria-label={t.createAccount}
                >
                    {t.createAccount}
                </button>
            </div>

        </div>
    );
};

export default Service2Page;