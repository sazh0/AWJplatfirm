// BusinessModelPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessModelPage.css";
import SmallSqrs1 from "./assets/SmallSqrs1.svg";
import SmallSqrs2 from "./assets/SmallSqrs2.svg";
import BMLOGO from "./assets/BMLOGO.svg";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNotification } from "./NotificationContext";
import { ProcessingStatus } from "./ProcessingStatus";
import Header from "./Header";

// Translations for UI elements
const translations = {
  en: {
    pageTitle: "Building a Business Model",
    pageSubtitle: "Help us understand more details by filling out the following:",
    industryLabel: "Company Technical Field:",
    sizeLabel: "Number of Company Employees:",
    revenueLabel: "Revenue Sources:",
    selectOption: "Choose an option",
    employeeCount: "Choose employee count",
    revenuePlaceholder: "Enter revenue sources",
    back: "Back",
    next: "Next",
    analyze: "Analyze Model",
    loadingText: "Processing data...",
    requiredField: "*",
    industryError: "Please select the company field",
    sizeError: "Please select the number of employees",
    revenueError: "Please enter revenue sources",
    successMessage: "Business model request submitted successfully. You will be notified when the model is complete.",
    dashboardAction: "Go to Dashboard",
    // Industry options
    industryOptions: {
      CyberSecurity: "Cyber Security",
      Fintech: "Fintech",
      games: "Games",
      WebDevelopment: "Web Development",
      AI: "Artificial Intelligence",
      Telecommunications: "Telecommunications",
      CloudComputing: "Cloud Computing",
      DataAnalytics: "Data Analytics",
      MobileApps: "Mobile Apps",
      Ecommerce: "E-commerce",
      Blockchain: "Blockchain",
      IoT: "Internet of Things",
      VR_AR: "Virtual & Augmented Reality",
      SoftwareDevelopment: "Software Development",
      Hardware: "Hardware",
      Biotech: "Biotechnology",
      Robotics: "Robotics",
      EdTech: "Educational Technology",
      HealthTech: "Health Technology"
    },
    // Company size options
    sizeOptions: {
      "1-10": "1-10",
      "11-20": "11-20",
      "21-30": "21-30",
      "30+": "30+"
    }
  },
  ar: {
    pageTitle: "بنــاء نــموذج عمــل",
    pageSubtitle: "ساعدنا لمعرفة تفاصيل أكثر، بتعبئة التالي:",
    industryLabel: "مجال الشركة التقني:",
    sizeLabel: "أعداد موظفين الشركة:",
    revenueLabel: "مصادر الإيرادات:",
    selectOption: "اختر المجال",
    employeeCount: "اختر عدد الموظفين",
    revenuePlaceholder: "أدخل مصادر الإيرادات",
    back: "العودة",
    next: "التالي",
    analyze: "تحليل النموذج",
    loadingText: "جاري معالجة البيانات...",
    requiredField: "*",
    industryError: "يرجى اختيار مجال الشركة",
    sizeError: "يرجى اختيار عدد الموظفين",
    revenueError: "يرجى إدخال مصادر الإيرادات",
    successMessage: "تم تقديم طلب نموذج العمل بنجاح. سيتم إعلامك عند اكتمال النموذج.",
    dashboardAction: "الذهاب للوحة القيادة",
    // Industry options - Arabic translations
    industryOptions: {
      CyberSecurity: "أمن سبراني",
      Fintech: "فنتك",
      games: "الألعاب",
      WebDevelopment: "تطوير الويب",
      AI: "الذكاء الاصطناعي",
      Telecommunications: "الاتصالات",
      CloudComputing: "الحوسبة السحابية",
      DataAnalytics: "تحليلات البيانات",
      MobileApps: "تطبيقات الجوال",
      Ecommerce: "التجارة الإلكترونية",
      Blockchain: "بلوك تشين",
      IoT: "إنترنت الأشياء",
      VR_AR: "الواقع الافتراضي والمعزز",
      SoftwareDevelopment: "تطوير البرمجيات",
      Hardware: "الأجهزة",
      Biotech: "التكنولوجيا الحيوية",
      Robotics: "الروبوتات",
      EdTech: "تكنولوجيا التعليم",
      HealthTech: "تكنولوجيا الصحة"
    },
    // Company size options - same in both languages
    sizeOptions: {
      "1-10": "1-10",
      "11-20": "11-20",
      "21-30": "21-30",
      "30+": "30+"
    }
  }
};

const BusinessModelPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [formData, setFormData] = useState({
    Industry: "",
    CompanySize: "",
    RevenueSources: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [fadeIn, setFadeIn] = useState(true);
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();

  // Add language state
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'en'; // Default to English
  });

  // Get translations for current language
  const t = translations[language];

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('app-language', language);
  }, [language]);

  // Microsoft Translator API 
  const subscriptionKey = "A4niYWmg25SB8gDP5PoBLrzuYe78HRLvSLynhkbzd1A5MbBBDRYZJQQJ99BDACFcvJRXJ3w3AAAbACOGvjNV";
  const endpoint = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";
  const region = "qatarcentral";

  const translateText = async (text, targetLanguage) => {
    try {
      const response = await fetch(endpoint + `&to=${targetLanguage}`, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ text }]),
      });

      if (!response.ok) {
        console.error(`Translation API error: ${response.status} - ${await response.text()}`);
        return text;
      }

      const data = await response.json();
      return data[0].translations[0].text;
    } catch (error) {
      console.error("Error during translation:", error);
      return text;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (currentQuestion === 1 && !formData.Industry) {
      errors.Industry = t.industryError;
    }

    if (currentQuestion === 2 && !formData.CompanySize) {
      errors.CompanySize = t.sizeError;
    }

    if (currentQuestion === 3 && !formData.RevenueSources.trim()) {
      errors.RevenueSources = t.revenueError;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) return;

    setFadeIn(false);
    setTimeout(() => {
      setCurrentQuestion(currentQuestion + 1);
      setFadeIn(true);
    }, 300);
  };

  const handleBack = () => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentQuestion(currentQuestion - 1);
      setFadeIn(true);
    }, 300);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error(language === 'ar' ? "لم يتم العثور على بيانات المستخدم." : "User data not found.");
      }

      const userDocRef = doc(db, "User", userId);
      const userSnapshot = await getDoc(userDocRef);
      if (!userSnapshot.exists()) {
        throw new Error(language === 'ar' ? "لم يتم العثور على المستخدم." : "User not found.");
      }
      const userData = userSnapshot.data();
      const companyRef = userData.CompanyID;
      if (!companyRef) {
        throw new Error(language === 'ar' ? "لم يتم ربط المستخدم بأي شركة." : "User is not linked to any company.");
      }

      const bmSnapshot = await getDocs(collection(db, "BusinessModel"));
      const bmIds = bmSnapshot.docs.map((doc) => doc.id);
      const existingBmNumbers = bmIds
        .map((id) => {
          const match = id.match(/^bm(\d{3})$/);
          return match ? parseInt(match[1]) : null;
        })
        .filter((n) => n !== null)
        .sort((a, b) => a - b);
      let nextBmNumber = 1;
      for (let i = 0; i < existingBmNumbers.length; i++) {
        if (existingBmNumbers[i] !== nextBmNumber) break;
        nextBmNumber++;
      }
      const nextBmId = `bm${String(nextBmNumber).padStart(3, "0")}`;

      const modelRef = doc(db, "BusinessModel", nextBmId);
      await setDoc(modelRef, {
        CompanyID: companyRef,
        Status: "pending",
        CreatedAt: new Date()
      });

      const inputSnapshot = await getDocs(collection(db, "BusinessModel_UserInput"));
      const ids = inputSnapshot.docs.map((doc) => doc.id);
      const existingInputNumbers = ids
        .map((id) => {
          const match = id.match(/^Input(\d{3})$/);
          return match ? parseInt(match[1]) : null;
        })
        .filter((n) => n !== null)
        .sort((a, b) => a - b);
      let nextInputNumber = 1;
      for (let i = 0; i < existingInputNumbers.length; i++) {
        if (existingInputNumbers[i] !== nextInputNumber) break;
        nextInputNumber++;
      }
      const nextInputId = `Input${String(nextInputNumber).padStart(3, "0")}`;

      // Handle translations based on interface language
      let englishData = {};

      if (language === 'ar') {
        // User is inputting in Arabic, need to translate to English for both server and Firebase
        englishData = {
          Industry: await translateText(formData.Industry, "en"),
          CompanySize: await translateText(formData.CompanySize, "en"),
          RevenueSources: await translateText(formData.RevenueSources, "en")
        };

        // Store the translated English data in BusinessModel_UserInput
        await setDoc(doc(db, "BusinessModel_UserInput", nextInputId), {
          Industry: englishData.Industry, // Translated to English for storage
          CompanySize: englishData.CompanySize, // Translated to English for storage
          RevenueSources: englishData.RevenueSources, // Translated to English for storage
          CompanyID: companyRef,
          ModelID: modelRef,
          createdAt: new Date(),
        });
      } else {
        // User is inputting in English - no translation needed
        englishData = {
          Industry: formData.Industry,
          CompanySize: formData.CompanySize,
          RevenueSources: formData.RevenueSources
        };

        // Store the English input directly in BusinessModel_UserInput
        await setDoc(doc(db, "BusinessModel_UserInput", nextInputId), {
          Industry: formData.Industry, // Original English input
          CompanySize: formData.CompanySize, // Original English input
          RevenueSources: formData.RevenueSources, // Original English input
          CompanyID: companyRef,
          ModelID: modelRef,
          createdAt: new Date(),
        });
      }

      const processingId = await ProcessingStatus.createProcessingRecord({
        type: 'business-model',
        userId: userId,
        modelId: nextBmId,
        inputId: nextInputId,
        companyId: typeof companyRef === "string" ? companyRef : companyRef.id
      });

      // IMPORTANT: Always send English data to server for AI processing
      const formDataToSend = new URLSearchParams();
      formDataToSend.append("user_id", userId);
      formDataToSend.append("input_id", nextInputId);
      formDataToSend.append("model_id", nextBmId);
      formDataToSend.append("Industry", englishData.Industry); // Always send English
      formDataToSend.append("CompanySize", englishData.CompanySize); // Always send English
      formDataToSend.append("RevenueSources", englishData.RevenueSources); // Always send English
      formDataToSend.append("processing_id", processingId);

      console.log("Sending data to server:", Object.fromEntries(formDataToSend));

      fetch("http://127.0.0.1:5000/generate-bm", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formDataToSend.toString(),
      });

      showSuccess(t.successMessage, {
        duration: 8000,
        action: {
          label: t.dashboardAction,
          onClick: () => navigate("/dashboard"),
          dismissOnClick: true
        }
      });

      navigate("/dashboard");

    } catch (error) {
      console.error("Error saving business model input:", error);
      showError(error.message || (language === 'ar' ? "حدث خطأ أثناء الحفظ. حاول مرة أخرى." : "An error occurred during saving. Try again."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const question = document.querySelector(".question-box");
    if (question) {
      question.classList.add("animate");
    }
  }, [currentQuestion]);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="business-model-page">
      {/* Use Header with language toggle */}
      <Header
        showNotifications={true}
        showUserIcon={true}
        showMobileMenu={false}
        showLanguageToggle={true}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />

      <div className="background-elements">
        <img className="SmallSqrs1" alt={language === 'ar' ? "زخرفة" : "Decoration"} src={SmallSqrs1} />
        <img className="SmallSqrs2" alt={language === 'ar' ? "زخرفة" : "Decoration"} src={SmallSqrs2} />
      </div>

      <div className="page-header">
        <img src={BMLOGO} alt={language === 'ar' ? "شعار نموذج العمل" : "Business Model Logo"} className="BM-icon" />
        <h1 className="page-title">{t.pageTitle}</h1>
        <p className="page-subtitle">{t.pageSubtitle}</p>
      </div>

      <form className="form-container" onSubmit={handleSubmit} dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="timeline">
          <div
            className={`circle ${currentQuestion >= 1 ? "active" : ""}`}
            data-step="1"
          />
          <div className={`line ${currentQuestion >= 2 ? "active" : ""}`} />
          <div
            className={`circle ${currentQuestion >= 2 ? "active" : ""}`}
            data-step="2"
          />
          <div className={`line ${currentQuestion >= 3 ? "active" : ""}`} />
          <div
            className={`circle ${currentQuestion >= 3 ? "active" : ""}`}
            data-step="3"
          />
        </div>

        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p className="loading-text">{t.loadingText}</p>
          </div>
        ) : (
          <>
            <div className={`question-box ${fadeIn ? "fade-in" : "fade-out"}`} style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
              {currentQuestion === 1 && (
                <>
                  <label>
                    <span className="required">{t.requiredField}</span> {t.industryLabel}
                  </label>
                  <select
                    name="Industry"
                    value={formData.Industry}
                    onChange={handleChange}
                    aria-required="true"
                    style={{ textAlign: language === 'en' ? 'left' : 'right' }}
                  >
                    <option value="">{t.selectOption}</option>
                    <option value="CyberSecurity">{t.industryOptions.CyberSecurity}</option>
                    <option value="Fintech">{t.industryOptions.Fintech}</option>
                    <option value="games">{t.industryOptions.games}</option>
                    <option value="WebDevelopment">{t.industryOptions.WebDevelopment}</option>
                    <option value="AI">{t.industryOptions.AI}</option>
                    <option value="Telecommunications">{t.industryOptions.Telecommunications}</option>
                    <option value="CloudComputing">{t.industryOptions.CloudComputing}</option>
                    <option value="DataAnalytics">{t.industryOptions.DataAnalytics}</option>
                    <option value="MobileApps">{t.industryOptions.MobileApps}</option>
                    <option value="Ecommerce">{t.industryOptions.Ecommerce}</option>
                    <option value="Blockchain">{t.industryOptions.Blockchain}</option>
                    <option value="IoT">{t.industryOptions.IoT}</option>
                    <option value="VR_AR">{t.industryOptions.VR_AR}</option>
                    <option value="SoftwareDevelopment">{t.industryOptions.SoftwareDevelopment}</option>
                    <option value="Hardware">{t.industryOptions.Hardware}</option>
                    <option value="Biotech">{t.industryOptions.Biotech}</option>
                    <option value="Robotics">{t.industryOptions.Robotics}</option>
                    <option value="EdTech">{t.industryOptions.EdTech}</option>
                    <option value="HealthTech">{t.industryOptions.HealthTech}</option>
                  </select>
                  {fieldErrors.Industry && (
                    <div className="error-message">{fieldErrors.Industry}</div>
                  )}
                </>
              )}

              {currentQuestion === 2 && (
                <>
                  <label>
                    <span className="required">{t.requiredField}</span> {t.sizeLabel}
                  </label>
                  <select
                    name="CompanySize"
                    value={formData.CompanySize}
                    onChange={handleChange}
                    aria-required="true"
                    style={{ textAlign: language === 'en' ? 'left' : 'right' }}
                  >
                    <option value="">{t.employeeCount}</option>
                    <option value="1-10">{t.sizeOptions['1-10']}</option>
                    <option value="11-20">{t.sizeOptions['11-20']}</option>
                    <option value="21-30">{t.sizeOptions['21-30']}</option>
                    <option value="30+">{t.sizeOptions['30+']}</option>
                  </select>
                  {fieldErrors.CompanySize && (
                    <div className="error-message">{fieldErrors.CompanySize}</div>
                  )}
                </>
              )}

              {currentQuestion === 3 && (
                <>
                  <label>
                    <span className="required">{t.requiredField}</span> {t.revenueLabel}
                  </label>
                  <input
                    type="text"
                    name="RevenueSources"
                    value={formData.RevenueSources}
                    onChange={handleChange}
                    placeholder={t.revenuePlaceholder}
                    aria-required="true"
                    style={{ textAlign: language === 'en' ? 'left' : 'right' }}
                  />
                  {fieldErrors.RevenueSources && (
                    <div className="error-message">{fieldErrors.RevenueSources}</div>
                  )}
                </>
              )}
            </div>

            <div className="navigation-buttons" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
              {currentQuestion > 1 && (
                <button
                  type="button"
                  className="back-btn"
                  onClick={handleBack}
                  aria-label={language === 'ar' ? "العودة للخطوة السابقة" : "Go back to previous step"}
                >
                  {t.back}
                </button>
              )}

              {currentQuestion < 3 ? (
                <button
                  type="button"
                  className="next-btn"
                  onClick={handleNext}
                  aria-label={language === 'ar' ? "الانتقال للخطوة التالية" : "Go to next step"}
                >
                  {t.next}
                </button>
              ) : (
                <button
                  type="submit"
                  className="submit-btn"
                  aria-label={language === 'ar' ? "إرسال وتحليل النموذج" : "Submit and analyze model"}
                >
                  {t.analyze}
                </button>
              )}
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default BusinessModelPage;