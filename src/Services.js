import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./services.css";
import BlueBox from "./assets/BlueBox.svg";
import RedBlueBox from "./assets/RedBlueBox.svg";
import AWJLOGO from "./assets/AWJLOGO.svg";
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';
import { RiBuilding4Line, RiLightbulbLine } from 'react-icons/ri';
import { TbLanguage } from "react-icons/tb";

// Define translations for the services page
const servicesTranslations = {
    ar: {
        backToHome: "العودة إلى الصفحة الرئيسية",
        homePage: "الرئيسية",
        welcome: "مرحبـــًا بـــك!",
        chooseOption: "هل لديك شركة قائمة أم أنك رائد أعمال ترغب في بدء فكرة جديدة؟",
        accessNote: "ستتمكن من الوصول إلى جميع خدماتنا بعد إنشاء حسابك",
        existingCompany: "لدي شركة ناشئة قائمة",
        existingDescription: "تحسين استراتيجيتك واستمرارية نمو شركتك من خلال أداة التخطيط الاستراتيجي",
        newIdea: "أرغب ببدء فكرة جديدة",
        newDescription: "تحويل فكرتك إلى خطة عمل مفصلة وخارطة موضحة لبدء مشروعك الناشئ بثقة",
        languageEnglish: "English",
        languageArabic: "العربية"
    },
    en: {
        backToHome: "Back to Home",
        homePage: "Home",
        welcome: "Welcome!",
        chooseOption: "Do you have an existing company or are you looking to start a new venture?",
        accessNote: "You will be able to access all our services after creating your account",
        existingCompany: "I have an existing startup",
        existingDescription: "Enhance your strategy and sustain your company's growth through our strategic planning tool",
        newIdea: "I want to start a new idea",
        newDescription: "Transform your idea into a detailed business plan and clear roadmap to start your startup with confidence",
        languageEnglish: "English",
        languageArabic: "العربية"
    }
};

const Services = () => {
    const navigate = useNavigate();
    const [hoveredOption, setHoveredOption] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Get saved language from localStorage or default to Arabic
    const [servicesLanguage, setServicesLanguage] = useState(() => {
        return localStorage.getItem('appLanguage') || 'ar';
    });

    // Get translations based on current language
    const t = servicesTranslations[servicesLanguage];

    // Initialize animations
    useEffect(() => {
        const contentElements = document.querySelectorAll('.fade-in');

        contentElements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 * index);
        });

        // Show the subtext with slight delay
        setTimeout(() => {
            const subtext = document.querySelector('.text-wrapper-subtext');
            if (subtext) {
                subtext.style.opacity = '1';
                subtext.style.transform = 'translateY(0)';
            }
        }, 800);

        // Set document direction based on language
        document.body.dir = servicesLanguage === 'ar' ? 'rtl' : 'ltr';
    }, []);

    // Handle language change
    const handleServicesLanguageChange = (lang) => {
        setServicesLanguage(lang);
        // Update document direction based on language
        document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
        // Save language preference to localStorage
        localStorage.setItem('appLanguage', lang);
    };

    const handleService1Click = () => {
        if (isAnimating) return;

        setIsAnimating(true);
        setSelectedOption('existing');

        // Add a slight delay for the animation before navigation
        setTimeout(() => {
            navigate("/service-1");
            setIsAnimating(false);
        }, 600);
    };

    const handleService2Click = () => {
        if (isAnimating) return;

        setIsAnimating(true);
        setSelectedOption('new');

        // Add a slight delay for the animation before navigation
        setTimeout(() => {
            navigate("/service-2");
            setIsAnimating(false);
        }, 600);
    };

    return (
        <div className="services-page">
            <button
                className="back-arrow-nn"
                onClick={() => navigate('/')}
                aria-label={t.backToHome}
            >
                <IoArrowBack />
            </button>

            <img
                className="Logo fade-in"
                alt="AWJ Logo"
                src={AWJLOGO}
                title="AWJ"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            />

            {/* Add language toggle button */}
            <button
                className="services-language-toggle"
                aria-label="Language selector"
            >
                <TbLanguage className="services-language-icon" />
                <div className="services-language-selector">
                    <div
                        className={`services-language-option ${servicesLanguage === "en" ? "active" : ""}`}
                        onClick={() => handleServicesLanguageChange("en")}
                    >
                        {t.languageEnglish}
                    </div>
                    <div
                        className={`services-language-option ${servicesLanguage === "ar" ? "active" : ""}`}
                        onClick={() => handleServicesLanguageChange("ar")}
                    >
                        {t.languageArabic}
                    </div>
                </div>
            </button>

            {/* Decorative elements */}
            <img className="BlueBox" alt="" src={BlueBox} aria-hidden="true" />
            <img className="RedBlueBox" alt="" src={RedBlueBox} aria-hidden="true" />

            <div className="text-wrapper fade-in">{t.welcome}</div>
            <div className="text-wrapper-1 fade-in">{t.chooseOption}</div>
            <div className="text-wrapper-subtext fade-in">{t.accessNote}</div>
            <div className="content-container">
                <div className="services-options-container">
                    <div className="services-cards-container">
                        <div
                            className={`service-card fade-in ${hoveredOption === 'existing' ? 'service-card-hovered' : ''} ${selectedOption === 'existing' ? 'service-card-selected' : ''}`}
                            onMouseEnter={() => setHoveredOption('existing')}
                            onMouseLeave={() => setHoveredOption(null)}
                            onClick={handleService1Click}
                        >
                            <div className="service-card-icon">
                                <RiBuilding4Line className="icon" />
                            </div>
                            <h3 className="service-card-title">{t.existingCompany}</h3>
                            <p className="service-card-description">
                                {t.existingDescription}
                            </p>
                            {selectedOption === 'existing' && (
                                <div className="selected-indicator">
                                    <IoCheckmarkCircle style={{ color: 'white', fontSize: '20px' }} />
                                </div>
                            )}
                        </div>

                        <div
                            className={`service-card fade-in ${hoveredOption === 'new' ? 'service-card-hovered' : ''} ${selectedOption === 'new' ? 'service-card-selected' : ''}`}
                            onMouseEnter={() => setHoveredOption('new')}
                            onMouseLeave={() => setHoveredOption(null)}
                            onClick={handleService2Click}
                        >
                            <div className="service-card-icon">
                                <RiLightbulbLine className="icon" />
                            </div>
                            <h3 className="service-card-title">{t.newIdea}</h3>
                            <p className="service-card-description">
                                {t.newDescription}
                            </p>
                            {selectedOption === 'new' && (
                                <div className="selected-indicator">
                                    <IoCheckmarkCircle style={{ color: 'white', fontSize: '20px' }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;