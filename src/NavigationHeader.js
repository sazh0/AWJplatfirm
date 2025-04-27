import React, { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import LeftArrow from "./assets/LeftArrow.svg";
import "./navigation-styles.css";
import { TbLanguage } from "react-icons/tb";

// Define your translations here (this can later be moved to a separate file or localization framework)
const translations = {
    ar: {
        about: "عن أوج",
        partners: "شركاؤنا",
        faq: "الأسئلة الشائعة",
        signOut: "تسجيل الخروج",
        signIn: "تسجيل دخول",
        languageEnglish: "English",
        languageArabic: "العربية"
    },
    en: {
        about: "About AWJ", // Adjust the branding as needed
        partners: "Our Partners",
        faq: "FAQ",
        signOut: "Sign Out",
        signIn: "Sign In",
        languageEnglish: "English",
        languageArabic: "العربية"
    }
};

const NavigationHeader = ({
    isAuthenticated,
    handleSignInClick,
    handleSignOutClick,
    scrollToSection,
    showLanguageToggle = true,
    currentLanguage = "ar",
    onLanguageChange
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setScrolled(offset > 50);

            // Determine active section based on scroll position
            const sections = ['aboutSection', 'partnersSection', 'faqSection'];
            for (const sectionId of sections) {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionTop = section.offsetTop - 100;
                    const sectionBottom = sectionTop + section.offsetHeight;

                    if (offset >= sectionTop && offset < sectionBottom) {
                        setActiveLink(sectionId);
                        break;
                    } else if (offset < document.getElementById('aboutSection').offsetTop - 100) {
                        setActiveLink(null); // At the top, before any section
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (sectionId) => {
        scrollToSection(sectionId);
        setActiveLink(sectionId);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('.mobile-menu-container') &&
                !event.target.closest('.mobile-menu-button')) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isMenuOpen]);

    // Language selection handler
    const handleLanguageSelect = (lang) => {
        if (onLanguageChange && lang !== currentLanguage) {
            onLanguageChange(lang);
        }
    };

    return (
        <>
            <header className={`nav-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header-wrapper">

                    {/* Logo at right */}
                    <div className="right-section">
                        <div className="logo-container">
                            <img className="logo" alt="logo" src={logo} />
                        </div>
                    </div>

                    {/* Center Nav */}
                    <nav className="main-nav">
                        <ul className="nav-links">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeLink === 'aboutSection' ? 'active' : ''}`}
                                    onClick={() => handleNavClick('aboutSection')}
                                >
                                    <span>{translations[currentLanguage].about}</span>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeLink === 'partnersSection' ? 'active' : ''}`}
                                    onClick={() => handleNavClick('partnersSection')}
                                >
                                    <span>{translations[currentLanguage].partners}</span>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeLink === 'faqSection' ? 'active' : ''}`}
                                    onClick={() => handleNavClick('faqSection')}
                                >
                                    <span>{translations[currentLanguage].faq}</span>
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Auth button at left */}
                    <div className="left-section">
                        {/* Language toggle button */}
                        {showLanguageToggle && (
                            <button
                                className="btn-secondary language-toggle"
                                aria-label="Language selector"
                            >
                                <TbLanguage className="language-icon" />
                                <div className="language-selector">
                                    <div
                                        className={`language-option ${currentLanguage === "en" ? "active" : ""}`}
                                        onClick={() => handleLanguageSelect("en")}
                                    >
                                        {translations[currentLanguage].languageEnglish}
                                    </div>
                                    <div
                                        className={`language-option ${currentLanguage === "ar" ? "active" : ""}`}
                                        onClick={() => handleLanguageSelect("ar")}
                                    >
                                        {translations[currentLanguage].languageArabic}
                                    </div>
                                </div>
                            </button>
                        )}

                        <button
                            className="auth-button"
                            onClick={isAuthenticated ? handleSignOutClick : handleSignInClick}
                        >
                            <span>
                                {isAuthenticated
                                    ? translations[currentLanguage].signOut
                                    : translations[currentLanguage].signIn}
                            </span>
                            <div className="auth-button-icon">
                                <img className="arrow-icon" alt="LeftArrow" src={LeftArrow} />
                            </div>
                        </button>

                        {/* Mobile menu button */}
                        <button
                            className={`mobile-menu-button ${isMenuOpen ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="menu-bar"></span>
                            <span className="menu-bar"></span>
                            <span className="menu-bar"></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile menu overlay */}
            <div
                className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            {/* Mobile menu */}
            <div className={`mobile-menu-container ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <img className="mobile-menu-logo" alt="logo" src={logo} />
                    <button
                        className="mobile-menu-close"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <nav className="mobile-menu-nav">
                    <ul className="mobile-menu-links">
                        <li className="mobile-menu-item">
                            <button onClick={() => {
                                handleNavClick('aboutSection');
                                setIsMenuOpen(false);
                            }}>
                                {translations[currentLanguage].about}
                            </button>
                        </li>
                        <li className="mobile-menu-item">
                            <button onClick={() => {
                                handleNavClick('partnersSection');
                                setIsMenuOpen(false);
                            }}>
                                {translations[currentLanguage].partners}
                            </button>
                        </li>
                        <li className="mobile-menu-item">
                            <button onClick={() => {
                                handleNavClick('faqSection');
                                setIsMenuOpen(false);
                            }}>
                                {translations[currentLanguage].faq}
                            </button>
                        </li>
                    </ul>
                </nav>
                <div className="mobile-menu-footer">
                    <button
                        className="mobile-auth-button"
                        onClick={() => {
                            isAuthenticated ? handleSignOutClick() : handleSignInClick();
                            setIsMenuOpen(false);
                        }}
                    >
                        {isAuthenticated
                            ? translations[currentLanguage].signOut
                            : translations[currentLanguage].signIn}
                    </button>
                </div>
            </div>
        </>
    );
};

export default NavigationHeader;