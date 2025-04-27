import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationHeader from "./NavigationHeader";
import FAQ from "./faq";
import x57 from "./assets/2030.svg";
import x58 from "./assets/sqrs.svg";
import x59 from "./assets/Rectangle102.svg";
import x60 from "./assets/Rectangle103.svg";
import logo from "./assets/logo.png";
import intersect from "./assets/Intersect.png";
import MONSHAAT from "./assets/MONSHAAT.png";
import AWS from "./assets/Aws.png";
import LeftArrow from "./assets/LeftArrow.svg";
import "./style.css";
import "./navigation-styles.css";
import {
    Expand,
    LayoutDashboard,
    TrendingUp
} from "lucide-react";

const FlexibilityIcon = () => <Expand size={60} color="#fff" strokeWidth={1.5} />;
const EaseOfUseIcon = () => <LayoutDashboard size={60} color="#fff" strokeWidth={1.5} />;
const ImprovementIcon = () => <TrendingUp size={60} color="#fff" strokeWidth={1.5} />;

// Define translations for the entire page
const translations = {
    en: {
        // Navigation items
        nav: {
            about: "About AWJ",
            partners: "Our Partners",
            faq: "FAQ",
            signIn: "Sign In",
            signOut: "Sign Out",
        },
        // Hero section
        hero: {
            title: "Smart Plans, Clear Goals, Sustainable Success",
            description: "We design innovative AI-powered solutions to help startups achieve their strategic goals, through a creative and passionate team that keeps up with the latest technological developments.",
            cta: "Start Your Journey with AWJ"
        },
        // Features section
        features: {
            title: "Our Features",
            flexibility: {
                title: "Diversity & Flexibility",
                description: "Multiple services provided to meet your diverse needs",
                learnMore: "Read More",
                modal: {
                    description: "AWJ allows you to easily design business models or set short-term goals, making it ideal for meeting your diverse needs.",
                    items: ["Customizable Business Models", "Diverse Tools", "Custom Solutions"]
                }
            },
            ease: {
                title: "Ease of Use",
                description: "Simple interface that facilitates user interaction without technical expertise",
                learnMore: "Read More",
                modal: {
                    description: "AWJ's interface is designed to be simple and smooth, making it easy for users to interact without needing advanced technical expertise, with the use of the power of AI.",
                    items: ["Intuitive Interface", "Responsive Design", "Simplified Steps", "Excellent Technical Support"]
                }
            },
            improve: {
                title: "Continuous Improvement",
                description: "Make decisions that reduce risks and enhance success to develop your business",
                learnMore: "Read More",
                modal: {
                    description: "AWJ helps you leverage AI to make well-considered strategic decisions that enhance your chances of success, continuously improve your company's performance, and avoid potential risks before they occur.",
                    items: ["Advanced Analytics", "Smart Recommendations", "Identifying Strengths", "Performance Indicators"]
                }
            }
        },
        // Vision section
        vision: {
            title: "Our Vision 2030",
            description: "We support Vision 2030 by empowering startups through AI solutions that support growth and economic diversification"
        },
        // Partners section
        partners: {
            title: "Our Partners",
            monshaat: {
                name: "Monshaat",
                description: "The General Authority for Small and Medium Enterprises, supporting and developing the enterprise sector"
            },
            aws: {
                name: "AWS Advanced Business Services",
                description: "A company specialized in strategic plans for companies and entrepreneurs, supporting project market entry and sustainability"
            },
            cta: {
                question: "Would you like to become one of our partners?",
                button: "Contact Us"
            }
        },
        // FAQ section
        faq: {
            title: "Frequently Asked Questions",
            items: [
                {
                    f_id: 1,
                    f_question: "What is AWJ?",
                    f_answer: "AWJ is an innovative platform powered by artificial intelligence that helps startups and organizations with strategic planning and making informed decisions to achieve sustainable growth."
                },
                {
                    f_id: 2,
                    f_question: "What benefits does AWJ provide?",
                    f_answer: "AWJ is an AI platform that supports startups with building custom business models, goal segmentation, performance tracking, and collaboration enhancement, helping them reduce risks and achieve sustainable growth."
                },
                {
                    f_id: 3,
                    f_question: "Is AWJ only suitable for small startups?",
                    f_answer: "No, AWJ serves micro and small startups, as well as entrepreneurs who have not yet begun implementing their ideas, making it the ideal solution for supporting innovation and growth at all stages."
                },
                {
                    f_id: 4,
                    f_question: "Is my data safe with AWJ?",
                    f_answer: "Yes, we give top priority to your data security. Information is stored securely with a guarantee that it will not be shared with any third parties."
                },
                {
                    f_id: 5,
                    f_question: "Can I work with my team members on AWJ?",
                    f_answer: "Absolutely! AWJ allows you to invite your team members to collaborate on the same company page."
                }
            ]
        },
        // Footer
        footer: {
            copyright: "AWJ 2025 © All Rights Reserved"
        }
    },
    ar: {
        // Navigation items
        nav: {
            about: "عن أوج",
            partners: "شركاؤنا",
            faq: "الأسئلة الشائعة",
            signIn: "تسجيل دخول",
            signOut: "تسجيل الخروج",
        },
        // Hero section
        hero: {
            title: "خطط ذكية، أهداف واضحة، نجاح مستدام",
            description: "نصمم حلولاً مبتكرة مدعومة بالذكاء الاصطناعي لمساعدة الشركات الناشئة على تحقيق أهدافها الاستراتيجية، من خلال فريق مبدع وشغوف يواكب أحدث التطورات التقنية.",
            cta: "ابدأ رحلتك مع أوج"
        },
        // Features section
        features: {
            title: "مميزاتنا",
            flexibility: {
                title: "تنـوع و مرونـة",
                description: "عدة خدمات مقدمة لتلبية احتياجاتك المتنوعة",
                learnMore: "اقرأ المزيد",
                modal: {
                    description: "يتيح لك أوج إمكانية تصميم نماذج عمل أو التخطيط الاستراتيجي بسهولة، مما يجعله مثالياً لتلبية احتياجاتك المتنوعة.",
                    items: ["نماذج عمل قابلة للتخصيص", "أدوات متنوعة", "حلول مخصصة"]
                }
            },
            ease: {
                title: "سهولة الاستخدام",
                description: "واجهة بسيطة تسهل تفاعل المستخدمين دون خبرة تقنية",
                learnMore: "اقرأ المزيد",
                modal: {
                    description: "واجهة أوج مصممة بشكل بسيط وسلس، مما يسهل على المستخدمين التفاعل مع المنصة دون الحاجة لخبرات تقنية متقدمة، مع الاستفادة من قوة الذكاء الاصطناعي لتطوير الأعمال.",
                    items: ["واجهة بديهية", "تصميم متجاوب", "خطوات مبسطة", "دعم فني متميز"]
                }
            },
            improve: {
                title: "تحسـين مستمـر",
                description: "اتخاذ قرارات تقلل المخاطر وتعزز النجاح لتطوير أعمالك",
                learnMore: "اقرأ المزيد",
                modal: {
                    description: "يساعدك أوج من خلال الذكاء الاصطناعي في اتخاذ قرارات استراتيجية مدروسة تعزز فرص النجاح، لتحسين أداء شركتك بشكل مستمر، وتجنب المخاطر المحتملة قبل وقوعها.",
                    items: ["تحليلات متقدمة", "توصيات ذكية", "تحديد نقاط القوة", "مؤشرات أداء"]
                }
            }
        },
        // Vision section
        vision: {
            title: "رؤيتنا 2030",
            description: "نواكب رؤية 2030 بتمكين الشركات الناشئة عبر حلول ذكاء اصطناعي تدعم النمو وتنوع الاقتصاد"
        },
        // Partners section
        partners: {
            title: "شركاؤنا",
            monshaat: {
                name: "منشآت",
                description: "الهيئة العامة للمنشآت الصغيرة والمتوسطة، تدعم وتنمي وتحفز قطاع المنشآت"
            },
            aws: {
                name: "أوس المتطورة لخدمات الأعمال",
                description: "شركة مختصة في الخطط الاستراتيجية للشركات و رواد الأعمال، تدعم دخول المشاريع للسوق و إستدامتها"
            },
            cta: {
                question: "هل ترغب في أن تصبح أحد شركائنا؟",
                button: "تواصل معنا"
            }
        },
        // FAQ section
        faq: {
            title: "الأسئلة الشائعة",
            items: [
                {
                    f_id: 1,
                    f_question: "ما هو أوج؟",
                    f_answer: "أوج هو منصة مبتكرة مدعومة بالذكاء الاصطناعي تساعد الشركات الناشئة والمؤسسات على التخطيط الاستراتيجي واتخاذ قرارات مدروسة لتحقيق النمو المستدام."
                },
                {
                    f_id: 2,
                    f_question: "ما هي المزايا التي يوفرها أوج؟",
                    f_answer: "أوج منصة ذكاء اصطناعي تدعم الشركات الناشئة ببناء نماذج أعمال مخصصة، تقسيم الأهداف، تتبع الأداء، وتعزيز التعاون، مما يساعدها على تقليل المخاطر وتحقيق النمو المستدام."
                },
                {
                    f_id: 3,
                    f_question: "هل أوج مناسب فقط للشركات الناشئة الصغيرة؟",
                    f_answer: "لا، أوج يخدم الشركات الناشئة المتناهية الصغر والصغيرة، بالإضافة إلى رواد الأعمال الذين لم يبدأوا بتنفيذ أفكارهم بعد، مما يجعله الحل المثالي لدعم الابتكار والنمو في جميع المراحل."
                },
                {
                    f_id: 4,
                    f_question: "هل بياناتي آمنة في أوج؟",
                    f_answer: "نعم، نولي أولوية قصوى لأمان بياناتك. يتم تخزين المعلومات بأمان مع ضمان عدم مشاركتها لأي أطراف خارجية."
                },
                {
                    f_id: 5,
                    f_question: "هل يمكنني العمل مع أعضاء فريقي على أوج؟",
                    f_answer: "بالتأكيد! يتيح لك أوج دعوة أعضاء فريقك للتعاون على نفس صفحة الشركة."
                }
            ]
        },
        // Footer
        footer: {
            copyright: "أوج ٢٠٢٥ © جميع الحقوق محفوظة"
        }
    }
};

// Add CSS for language direction support
const directionStyles = `
/* Add specific direction styles */
.ltr-content {
  direction: ltr;
  text-align: left;
}

.rtl-content {
  direction: rtl;
  text-align: right;
}

/* Adjust flexbox direction for language */
.ltr-layout .header-wrapper,
.ltr-layout .feature-modal-title-wrapper,
.ltr-layout .partner-card-inner {
  flex-direction: row;
}

.rtl-layout .header-wrapper,
.rtl-layout .feature-modal-title-wrapper,
.rtl-layout .partner-card-inner {
  flex-direction: row-reverse;
}

/* Adjust icons and buttons for language */
.ltr-layout .auth-button-icon {
  transform: scaleX(1);
}

.rtl-layout .auth-button-icon {
  transform: scaleX(-1);
}

/* Adjust margins for language */
.ltr-layout .feature-modal-icon {
  margin-right: 1.5rem;
  margin-left: 0;
}

.rtl-layout .feature-modal-icon {
  margin-left: 1.5rem;
  margin-right: 0;
}
`;

const HomePage = ({ isAuthenticated, setIsAuthenticated }) => {
    const [activeFeature, setActiveFeature] = useState(null);
    const [featureModalOpen, setFeatureModalOpen] = useState(false);

    // Read language from localStorage instead of defaulting to Arabic
    const [currentLanguage, setCurrentLanguage] = useState(() => {
        return localStorage.getItem('appLanguage') || 'ar';
    });

    const navigate = useNavigate();

    // Set the document's direction based on language
    useEffect(() => {
        document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    }, [currentLanguage]);

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (featureModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [featureModalOpen]);

    // Function to handle language change - Updated to save to localStorage
    const handleLanguageChange = (language) => {
        setCurrentLanguage(language);
        // Save language preference to localStorage for app-wide use
        localStorage.setItem('appLanguage', language);
    };

    // Get translation based on current language
    const t = translations[currentLanguage];

    // Translation function for FAQ
    const getTranslatedFAQ = () => {
        return t.faq.items;
    };

    const handleSignInClick = () => {
        navigate("/signin");
    };

    const handleSignOutClick = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        setIsAuthenticated(false);
        navigate("/");
    };

    const handleServicesClick = () => {
        navigate("/services");
    };

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleFeatureClick = (feature) => {
        setActiveFeature(feature);
        setFeatureModalOpen(true);
    };

    const closeFeatureModal = () => {
        setFeatureModalOpen(false);
        setTimeout(() => setActiveFeature(null), 300); // Clear after animation
    };

    // Enhanced email handling function
    const handleContactClick = (e) => {
        e.preventDefault();

        // Get the translated subject line based on current language
        const emailSubject = currentLanguage === 'ar'
            ? 'طلب شراكة مع أوج'
            : 'Partnership Request with AWJ';

        // Create an enhanced mailto link with subject and pre-filled body
        const emailBody = currentLanguage === 'ar'
            ? 'مرحباً،\n\nأنا مهتم بالتعرف على فرص الشراكة المتاحة مع منصة أوج.\n\nالرجاء التواصل معي لمناقشة التفاصيل.\n\nمع أطيب التحيات،'
            : 'Hello,\n\nI am interested in learning more about partnership opportunities with AWJ platform.\n\nPlease contact me to discuss details.\n\nBest regards,';

        // Create the mailto URL with encoded parameters
        const mailtoUrl = `mailto:awjplatform@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        // Try to open the email client
        window.location.href = mailtoUrl;
    };

    return (
        <>
            {/* Inject direction-specific styles */}
            <style>{directionStyles}</style>
            {/* Enhanced Navigation Header with language toggle */}
            <NavigationHeader
                isAuthenticated={isAuthenticated}
                handleSignInClick={handleSignInClick}
                handleSignOutClick={handleSignOutClick}
                scrollToSection={scrollToSection}
                showLanguageToggle={true}
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
            />
            <div className={`home-page ${currentLanguage === "ar" ? "rtl-content" : "ltr-content"}`}>

                {/* Hero Section */}
                <section className="hero-section" id="aboutSection">
                    <div className="hero-content">
                        <h1 className="hero-title">{t.hero.title}</h1>
                        <p className="hero-description">
                            {t.hero.description}
                        </p>

                        <button className="cta-button" onClick={handleServicesClick}>
                            <span>{t.hero.cta}</span>
                        </button>
                    </div>
                    <img className="hero-background" alt="Intersect" src={intersect} />
                </section>

                {/* Features Section */}
                <section className="features-section" >
                    <div className="container mx-auto px-4">
                        <h2 className="section-title">{t.features.title}</h2>

                        <div className="features-grid">
                            <div
                                className="feature-card"
                                onClick={() => handleFeatureClick('flexibility')}
                            >
                                <div className="feature-icon-wrapper">
                                    <div className="feature-icon">
                                        <i className="feature-icon-flexibility"></i>
                                    </div>
                                </div>
                                <h3 className="feature-title">{t.features.flexibility.title}</h3>
                                <p className="feature-description">
                                    {t.features.flexibility.description}
                                </p>
                                <div className="feature-cta">
                                    <span className="feature-learn-more">{t.features.flexibility.learnMore}</span>
                                </div>
                            </div>

                            <div
                                className="feature-card"
                                onClick={() => handleFeatureClick('ease')}
                            >
                                <div className="feature-icon-wrapper">
                                    <div className="feature-icon">
                                        <i className="feature-icon-ease"></i>
                                    </div>
                                </div>
                                <h3 className="feature-title">{t.features.ease.title}</h3>
                                <p className="feature-description">
                                    {t.features.ease.description}
                                </p>
                                <div className="feature-cta">
                                    <span className="feature-learn-more">{t.features.ease.learnMore}</span>
                                </div>
                            </div>

                            <div
                                className="feature-card"
                                onClick={() => handleFeatureClick('improve')}
                            >
                                <div className="feature-icon-wrapper">
                                    <div className="feature-icon">
                                        <i className="feature-icon-improve"></i>
                                    </div>
                                </div>
                                <h3 className="feature-title">{t.features.improve.title}</h3>
                                <p className="feature-description">
                                    {t.features.improve.description}
                                </p>
                                <div className="feature-cta">
                                    <span className="feature-learn-more">{t.features.improve.learnMore}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision 2030 Section */}
                <section className="vision-section">
                    <div className="vision-content">
                        <h2 className="vision-title">{t.vision.title}</h2>
                        <p className="vision-description">
                            {t.vision.description}
                        </p>
                    </div>
                    <div className="vision-background">
                        <img className="vision-bg-image" alt="2030" src={x57} />
                        <img className="vision-gradient" alt="recGradient" src={x59} />
                    </div>
                </section>

                {/* Partners Section */}
                <section className="partners-section" id="partnersSection">
                    <div className="container mx-auto px-4 py-16 relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="section-title text-3xl font-bold mb-4">{t.partners.title}</h2>
                            <div className="section-divider mx-auto"></div>
                        </div>

                        <div className="partners-slider">
                            <div className="partners-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 justify-items-center">
                                <div className="partner-card">
                                    <div className="partner-card-inner">
                                        <div className="partner-logo-container">
                                            <img className="partner-logo" alt="Monshaat logo" src={MONSHAAT} />
                                        </div>
                                        <div className="partner-info">
                                            <h3 className="partner-name">{t.partners.monshaat.name}</h3>
                                            <p className="partner-description">{t.partners.monshaat.description}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="partner-card">
                                    <div className="partner-card-inner">
                                        <div className="partner-logo-container">
                                            <img className="partner-logo" alt="AWS logo" src={AWS} />
                                        </div>
                                        <div className="partner-info">
                                            <h3 className="partner-name">{t.partners.aws.name}</h3>
                                            <p className="partner-description">{t.partners.aws.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="partner-cta text-center mt-16">
                            <p className="mb-4 text-lg">{t.partners.cta.question}</p>
                            <button className="partner-cta-button" onClick={handleContactClick}>
                                {t.partners.cta.button}
                            </button>
                        </div>
                    </div>

                    {/* Background elements */}
                    <img className="partners-bg absolute top-0 left-0 w-full h-full object-cover opacity-10 z-0" alt="Background" src={x60} />
                    <div className="partners-bg-gradient absolute top-0 left-0 w-full h-full z-1"></div>
                </section>

                {/* FAQ Section */}
                <section className="faq-section" id="faqSection">
                    <div className="container mx-auto px-4">
                        <h2 className="section-title">{t.faq.title}</h2>
                        <div className="section-divider mx-auto"></div>
                        <div className="faq-wrapper">
                            <FAQ faq={getTranslatedFAQ()} language={currentLanguage} />
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="footer">
                    <div className="container mx-auto px-4">
                        <p className="copyright">{t.footer.copyright}</p>
                    </div>
                </footer>

                {/* Feature Modal */}
                <div className={`feature-modal ${featureModalOpen ? 'open' : ''}`}>
                    <div className="feature-modal-content">
                        <button
                            className="feature-modal-close"
                            onClick={closeFeatureModal}
                            aria-label="Close modal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        {activeFeature === 'flexibility' && (
                            <>
                                <div className="feature-modal-title-wrapper">
                                    <div className="feature-icon">
                                        <i className="feature-icon-flexibility"></i>
                                    </div>
                                    <h3 className="feature-modal-title">{t.features.flexibility.title}</h3>
                                </div>
                                <div className="feature-modal-body">
                                    <p>{t.features.flexibility.modal.description}</p>

                                    <div className="feature-icons-row">
                                        <div className="feature-item-icon">
                                            <div className="icon-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                                                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                                                    <path d="M12 17v-6"></path>
                                                    <path d="M9 14l3 3 3-3"></path>
                                                </svg>
                                            </div>
                                            <div className="icon-text">{t.features.flexibility.modal.items[0]}</div>
                                        </div>

                                        <div className="feature-item-icon">
                                            <div className="icon-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                                    <path d="M2 17l10 5 10-5"></path>
                                                    <path d="M2 12l10 5 10-5"></path>
                                                </svg>
                                            </div>
                                            <div className="icon-text">{t.features.flexibility.modal.items[1]}</div>
                                        </div>

                                        <div className="feature-item-icon">
                                            <div className="icon-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 2v4"></path>
                                                    <path d="M12 18v4"></path>
                                                    <path d="M4.93 4.93l2.83 2.83"></path>
                                                    <path d="M16.24 16.24l2.83 2.83"></path>
                                                    <path d="M2 12h4"></path>
                                                    <path d="M18 12h4"></path>
                                                    <path d="M4.93 19.07l2.83-2.83"></path>
                                                    <path d="M16.24 7.76l2.83-2.83"></path>
                                                </svg>
                                            </div>
                                            <div className="icon-text">{t.features.flexibility.modal.items[2]}</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeFeature === 'ease' && (
                            <>
                                <div className="feature-modal-title-wrapper">
                                    <div className="feature-icon">
                                        <i className="feature-icon-ease"></i>
                                    </div>
                                    <h3 className="feature-modal-title">{t.features.ease.title}</h3>
                                </div>
                                <div className="feature-modal-body">
                                    <p>{t.features.ease.modal.description}</p>

                                    <div className="feature-icons-row">
                                        <div className="feature-item-icon">
                                            <div className="icon-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <path d="M9 12l2 2 4-4"></path>
                                                </svg>
                                            </div>
                                            <div className="icon-text">{t.features.ease.modal.items[0]}</div>
                                        </div>

                                        <div className="feature-item-icon">
                                            <div className="icon-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                                    <line x1="8" y1="21" x2="16" y2="21"></line>
                                                    <line x1="12" y1="17" x2="12" y2="21"></line>
                                                </svg>
                                            </div>
                                            <div className="icon-text">{t.features.ease.modal.items[1]}</div>
                                        </div>

                                        <div className="feature-item-icon">
                                            <div className="icon-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                </svg>
                                            </div>
                                            <div className="icon-text">{t.features.ease.modal.items[2]}</div>
                                        </div>

                                        <div className="feature-item-icon">
                                            <div className="icon-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="4"></circle>
                                                    <path d="M12 2v2"></path>
                                                    <path d="M12 20v2"></path>
                                                    <path d="M4.93 4.93l1.41 1.41"></path>
                                                    <path d="M17.66 17.66l1.41 1.41"></path>
                                                    <path d="M2 12h2"></path>
                                                    <path d="M20 12h2"></path>
                                                    <path d="M6.34 17.66l-1.41 1.41"></path>
                                                    <path d="M19.07 4.93l-1.41 1.41"></path>
                                                </svg>
                                            </div>
                                            <div className="icon-text">{t.features.ease.modal.items[3]}</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeFeature === 'improve' && (
                            <>
                                <div className="feature-modal-title-wrapper">
                                    <div className="feature-icon">
                                        <i className="feature-icon-improve"></i>
                                    </div>
                                    <h3 className="feature-modal-title">{t.features.improve.title}</h3>
                                </div>
                                <div className="feature-modal-body">
                                    <p>{t.features.improve.modal.description}</p>

                                    <div className="feature-icons-row">
                                        <div className="feature-item-icon">
                                            <div className="icon-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 3v18h18"></path>
                                                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                                                </svg>
                                            </div>
                                            <div className="icon-text">{t.features.improve.modal.items[0]}</div>
                                        </div>

                                        <div className="feature-item-icon">
                                            <div className="icon-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                                </svg>
                                            </div>
                                            <div className="icon-text">{t.features.improve.modal.items[1]}</div>
                                        </div>

                                        <div className="feature-item-icon">
                                            <div className="icon-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                </svg>
                                            </div>
                                            <div className="icon-text">{t.features.improve.modal.items[2]}</div>
                                        </div>

                                        <div className="feature-item-icon">
                                            <div className="icon-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                                </svg>
                                            </div>
                                            <div className="icon-text">{t.features.improve.modal.items[3]}</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div >
        </>
    );
};

export default HomePage;