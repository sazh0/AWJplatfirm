import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GoalDecomposing.css";
import SmallSqrs1 from "./assets/SmallSqrs1.svg";
import SmallSqrs2 from "./assets/SmallSqrs2.svg";
import AWJLOGO from "./assets/AWJLOGO.svg";
import GD_LOGO from "./assets/GD_LOGO.svg";
import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { useNotification } from "./NotificationContext";
import { ProcessingStatus } from "./ProcessingStatus";
import Header from "./Header";

// Translations for fixed UI elements
const translationsData = {
  en: {
    pageTitle: "Goal Decomposition",
    pageSubtitle: "Help us know more details by filling out the following:",
    projectNameLabel: "Project Name:",
    projectDescriptionLabel: "Project Description:",
    projectNamePlaceholder: "Enter project name",
    projectDescriptionPlaceholder: "Enter a detailed description of the project",
    requiredField: "Please enter",
    nextButton: "Next",
    backButton: "Back",
    submitButton: "Analyze Project",
    loadingProcessing: "Processing data...",
    submissionSuccess: "Goal decomposition request submitted successfully. You will be notified when the analysis is complete.",
    viewProjectsButton: "View Projects",
    submissionError: "An error occurred while processing your request. Please try again.",
    userIdNotFound: "User ID not found. Please log in again.",
    userDataNotFound: "User data not found. Please log in again.",
    userNotLinkedToCompany: "User is not linked to any company. Please check your account."
  },
  ar: {
    pageTitle: "التخطيط الاستراتيجي",
    pageSubtitle: "ساعدنا بمعرفة تفاصيل أكثر، بتعبئة التالي:",
    projectNameLabel: "اسم المشروع:",
    projectDescriptionLabel: "وصف المشروع:",
    projectNamePlaceholder: "أدخل اسم المشروع",
    projectDescriptionPlaceholder: "أدخل وصفًا مفصلاً للمشروع",
    requiredField: "يرجى إدخال",
    nextButton: "التالي",
    backButton: "العودة",
    submitButton: "تحليل المشروع",
    loadingProcessing: "جاري معالجة البيانات...",
    submissionSuccess: "تم تقديم طلب تقسيم الهدف بنجاح. سيتم إعلامك عند اكتمال التحليل.",
    viewProjectsButton: "عرض المشاريع",
    submissionError: "حدث خطأ أثناء معالجة طلبك. الرجاء المحاولة مرة أخرى.",
    userIdNotFound: "لم يتم العثور على هوية المستخدم. الرجاء تسجيل الدخول مرة أخرى.",
    userDataNotFound: "لم يتم العثور على بيانات المستخدم. الرجاء تسجيل الدخول مرة أخرى.",
    userNotLinkedToCompany: "لم يتم ربط المستخدم بأي شركة. الرجاء التحقق من حسابك."
  }
};

//Updated
const GoalDecompose = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [formData, setFormData] = useState({
    projName: "",
    projDescr: "",
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
  const t = translationsData[language];

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('app-language', language);
  }, [language]);

  // Microsoft Translator API for translation needs
  const subscriptionKey = "A4niYWmg25SB8gDP5PoBLrzuYe78HRLvSLynhkbzd1A5MbBBDRYZJQQJ99BDACFcvJRXJ3w3AAAbACOGvjNV";
  const endpoint = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";
  const region = "qatarcentral";

  const translateText = async (text, targetLanguage) => {
    if (!text) return "";
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

  // Update state when inputs change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (currentQuestion === 1 && !formData.projName.trim()) {
      errors.projName = `${t.requiredField} ${t.projectNameLabel.slice(0, -1)}`; // Remove colon
    }

    if (currentQuestion === 2 && !formData.projDescr.trim()) {
      errors.projDescr = `${t.requiredField} ${t.projectDescriptionLabel.slice(0, -1)}`; // Remove colon
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
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Retrieve the user ID from localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error(t.userIdNotFound);
      }

      // Retrieve the user document from Firestore
      const userDocRef = doc(db, "User", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error(t.userDataNotFound);
      }

      // Retrieve the user data
      const userData = userDocSnap.data();

      // Check if the user is linked to a company
      const companyRef = userData.CompanyID;
      if (!companyRef) {
        throw new Error(t.userNotLinkedToCompany);
      }

      // Generate next available Project ID like p001
      const projectSnapshot = await getDocs(collection(db, "Project"));
      const ids = projectSnapshot.docs.map((doc) => doc.id);
      const existingNumbers = ids
        .map((id) => {
          const match = id.match(/^p(\d{3})$/);
          return match ? parseInt(match[1]) : null;
        })
        .filter((n) => n !== null)
        .sort((a, b) => a - b);

      let nextNumber = 1;
      for (let i = 0; i < existingNumbers.length; i++) {
        if (existingNumbers[i] !== nextNumber) break;
        nextNumber++;
      }
      const nextProjectId = `p${String(nextNumber).padStart(3, "0")}`;
      const originalProjName = formData.projName;

      // Handle form data based on current language
      let englishData = {};

      if (language === 'ar') {
        // User is inputting in Arabic, need to translate to English for server
        englishData = {
          projName: await translateText(formData.projName, "en"),
          projDescr: await translateText(formData.projDescr, "en")
        };
      } else {
        // User is inputting in English - no translation needed
        englishData = {
          projName: formData.projName,
          projDescr: formData.projDescr
        };
      }

      // Save the project to Firestore - store original input without translation
      await setDoc(doc(db, "Project", nextProjectId), {
        ProjectID: nextProjectId,
        ProjectName: formData.projName, // Store original input
        ProjectDetails: formData.projDescr, // Store original input
        CompanyID: companyRef,
        CreatedAt: new Date(),
        Status: "Not Started",
        Pprogress: "0"
      });

      // Create a processing record for tracking
      const processingId = await ProcessingStatus.createProcessingRecord({
        type: 'goal-decomposition',
        userId: userId,
        projectId: nextProjectId,
        projectName: originalProjName, // Use Arabic for processing record
        companyId: typeof companyRef === "string" ? companyRef : companyRef.id
      });

      // Prepare form data to send to Flask server - ALWAYS send English data
      const formDataToSend = new URLSearchParams();
      formDataToSend.append("project_name", originalProjName); // Send English to server
      formDataToSend.append("project_description", englishData.projDescr); // Send English to server
      formDataToSend.append("user_id", userId);
      formDataToSend.append("company_id", typeof companyRef === "string" ? companyRef : companyRef.id);
      formDataToSend.append("project_id", nextProjectId);
      formDataToSend.append("processing_id", processingId);

      console.log("Sending data to server:", Object.fromEntries(formDataToSend));

      // Send to Flask server asynchronously (don't wait for response)
      fetch("http://127.0.0.1:5000/generate-milestones", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formDataToSend.toString(),
      });

      // Show success notification and redirect
      showSuccess(t.submissionSuccess, {
        duration: 8000,
        action: {
          label: t.viewProjectsButton,
          onClick: () => navigate("/dashboard", { state: { selectedSection: "projects" } }),
          dismissOnClick: true
        }
      });

      // Navigate to dashboard instead of waiting for result
      navigate("/dashboard", { state: { selectedSection: "projects" } });

    } catch (error) {
      console.error("Error during form submission:", error);
      showError(error.message || t.submissionError);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  // Add animation class when question changes
  useEffect(() => {
    const question = document.querySelector(".question-box");
    if (question) {
      question.classList.add("animate");
    }
  }, [currentQuestion]);

  return (
    <div className="goal-decomposing-page">
      {/* Header component with language toggle */}
      <Header
        useLogo={false}
        showLanguageToggle={true}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />

      <div className="background-elements">
        <img className="SmallSqrs1" alt={language === 'ar' ? "عنصر خلفية 1" : "Background Element 1"} src={SmallSqrs1} />
        <img className="SmallSqrs2" alt={language === 'ar' ? "عنصر خلفية 2" : "Background Element 2"} src={SmallSqrs2} />
      </div>

      <div className="page-header">
        <img src={GD_LOGO} alt={language === 'ar' ? "شعار تقسيم الأهداف" : "Goal Decomposition Logo"} className="GD-icon" />
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
        </div>

        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p className="loading-text">{t.loadingProcessing}</p>
          </div>
        ) : (
          <>
            <div className={`question-box ${fadeIn ? "fade-in" : "fade-out"}`} style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
              {currentQuestion === 1 && (
                <>
                  <label>
                    <span className="required">*</span> {t.projectNameLabel}
                  </label>
                  <input
                    type="text"
                    name="projName"
                    value={formData.projName}
                    onChange={handleChange}
                    placeholder={t.projectNamePlaceholder}
                    aria-required="true"
                    style={{ textAlign: language === 'en' ? 'left' : 'right' }}
                  />
                  {fieldErrors.projName && (
                    <div className="error-message">{fieldErrors.projName}</div>
                  )}
                </>
              )}

              {currentQuestion === 2 && (
                <>
                  <label>
                    <span className="required">*</span> {t.projectDescriptionLabel}
                  </label>
                  <textarea
                    name="projDescr"
                    value={formData.projDescr}
                    onChange={handleChange}
                    placeholder={t.projectDescriptionPlaceholder}
                    aria-required="true"
                    style={{ textAlign: language === 'en' ? 'left' : 'right' }}
                  />
                  {fieldErrors.projDescr && (
                    <div className="error-message">{fieldErrors.projDescr}</div>
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
                  {t.backButton}
                </button>
              )}

              {currentQuestion < 2 ? (
                <button
                  type="button"
                  className="next-btn"
                  onClick={handleNext}
                  aria-label={language === 'ar' ? "الانتقال للخطوة التالية" : "Go to next step"}
                >
                  {t.nextButton}
                </button>
              ) : (
                <button
                  type="submit"
                  className="submit-btn"
                  aria-label={language === 'ar' ? "إرسال وتحليل المشروع" : "Submit and analyze project"}
                >
                  {t.submitButton}
                </button>
              )}
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default GoalDecompose;