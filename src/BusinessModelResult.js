// BusinessModelResult.js
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc, setDoc, collection } from "firebase/firestore";
import { db } from "./firebase";
import "./BusinessModelResult.css";
import SmallSqrs1 from "./assets/SmallSqrs1.svg";
import SmallSqrs2 from "./assets/SmallSqrs2.svg";
import Header from "./Header";

// Translations for fixed UI elements
const translations = {
  en: {
    pageTitle: "Business Model Canvas",
    loading: "Loading...",
    lastUpdated: "Last updated:",
    keyPartners: "Key Partners",
    keyActivities: "Key Activities",
    valueProposition: "Value Proposition",
    customerRelationships: "Customer Relationships",
    customerSegments: "Customer Segments",
    keyResources: "Key Resources",
    channels: "Channels",
    costStructure: "Cost Structure",
    revenueStreams: "Revenue Streams",
    editContent: "Edit Content",
    exportPDF: "Export PDF",
    saveChanges: "Save Changes",
    saving: "Saving...",
    cancel: "Cancel",
    success: "Changes saved successfully",
    errorFetchModel: "Business model ID not found.",
    errorFetchDoc: "Business model document not found.",
    errorFetchDetails: "Error fetching business model details.",
    errorSaving: "Error saving modifications.",
    errorFetchOriginal: "Error fetching original data.",
    copyright: "All Rights Reserved ©",
    // Placeholders for textarea
    partnersPlaceholder: "Who are your key partners?",
    activitiesPlaceholder: "What key activities does your business require?",
    valuePlaceholder: "What value do you provide to your customers?",
    relationshipsPlaceholder: "How do you interact with your customers?",
    segmentsPlaceholder: "Who are your main customers?",
    resourcesPlaceholder: "What key resources does your business need?",
    channelsPlaceholder: "How do you reach your customers?",
    costPlaceholder: "What are the main costs in your business model?",
    revenuePlaceholder: "How do customers pay? What are the revenue sources?"
  },
  ar: {
    pageTitle: "نموذج العمل التجاري",
    loading: "جارٍ التحميل",
    lastUpdated: "آخر تحديث:",
    keyPartners: "الشراكات الرئيسية",
    keyActivities: "الأنشطة الرئيسية",
    valueProposition: "القيمة المقترحة",
    customerRelationships: "علاقات العملاء",
    customerSegments: "شرائح العملاء",
    keyResources: "الموارد الرئيسية",
    channels: "قنوات التوزيع",
    costStructure: "هيكل التكاليف",
    revenueStreams: "مصادر الإيرادات",
    editContent: "تعديل المحتوى",
    exportPDF: "تصدير PDF",
    saveChanges: "حفظ التعديلات",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    success: "تم حفظ التغييرات بنجاح",
    errorFetchModel: "لم يتم العثور على معرف النموذج.",
    errorFetchDoc: "لم يتم العثور على وثيقة نموذج العمل.",
    errorFetchDetails: "حدث خطأ أثناء جلب تفاصيل نموذج العمل.",
    errorSaving: "حدث خطأ أثناء حفظ التعديلات.",
    errorFetchOriginal: "حدث خطأ أثناء جلب البيانات الأصلية.",
    copyright: "جميع الحقوق محفوظة ©",
    // Placeholders for textarea
    partnersPlaceholder: "من هم شركاؤك الرئيسيون؟",
    activitiesPlaceholder: "ما هي الأنشطة الرئيسية التي يتطلبها عملك؟",
    valuePlaceholder: "ما هي القيمة التي تقدمها لعملائك؟",
    relationshipsPlaceholder: "كيف تتفاعل مع عملائك؟",
    segmentsPlaceholder: "من هم عملاؤك الرئيسيون؟",
    resourcesPlaceholder: "ما هي الموارد الرئيسية التي يحتاجها عملك؟",
    channelsPlaceholder: "كيف تصل إلى عملائك؟",
    costPlaceholder: "ما هي التكاليف الرئيسية في نموذج عملك؟",
    revenuePlaceholder: "كيف يدفع عملاؤك؟ ما هي مصادر الإيرادات؟"
  }
};

const BusinessModelResult = () => {
  const location = useLocation();
  const { model_id } = location.state || {};
  const navigate = useNavigate();

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'en'; // Default to English
  });

  const [bmcData, setBmcData] = useState({
    Key_Partners: "",
    Key_Activities: "",
    Key_Resources: "",
    Value_Proposition: "",
    Customer_Relationships: "",
    Channels: "",
    Customer_Segments: "",
    Cost_Structure: "",
    Revenue_Streams: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Translations object for current language
  const t = translations[language];

  // Microsoft Translator API implementation
  const subscriptionKey = "6sI4sDyz7hl0lTJ8LKFISSftatGeBshi2FKqiRKWua0YMft2B4ZKJQQJ99BDACFcvJRXJ3w3AAAbACOGlUjA";
  const endpoint = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";
  const region = "qatarcentral";

  const translateText = async (text, targetLanguage) => {
    if (!text) return targetLanguage === 'ar' ? "لا يوجد" : "N/A";

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
        return targetLanguage === 'ar' ? "لا يوجد" : "N/A";
      }

      const data = await response.json();
      return data[0].translations[0].text || (targetLanguage === 'ar' ? "لا يوجد" : "N/A");
    } catch (error) {
      console.error("Error during translation:", error);
      return targetLanguage === 'ar' ? "لا يوجد" : "N/A";
    }
  };

  // Apply these styles in your component
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('app-language', language);

    // Force the direction on individual blocks for extra certainty
    const blocks = document.querySelectorAll('.bmc-block');
    blocks.forEach(block => {
      block.style.direction = language === 'en' ? 'ltr' : 'rtl';
      block.style.textAlign = language === 'en' ? 'left' : 'right';
    });

    // Refetch data when language changes
    if (model_id) {
      fetchBMC();
    }
  }, [language]);

  // Function to fetch business model data based on current language
  const fetchBMC = async () => {
    if (!model_id) {
      setError({ message: t.errorFetchModel });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      // First check if the document exists in the primary "BusinessModel" collection
      const englishModelRef = doc(db, "BusinessModel", model_id);
      const englishModelDoc = await getDoc(englishModelRef);

      if (!englishModelDoc.exists()) {
        setError({ message: t.errorFetchDoc });
        setLoading(false);
        return;
      }

      const englishData = englishModelDoc.data();

      if (language === 'en') {
        // User wants English content - load from main BusinessModel collection
        setBmcData({
          Key_Partners: englishData.Key_Participation || "",
          Key_Activities: englishData.Key_Activities || "",
          Key_Resources: englishData.Key_Resources || "",
          Value_Proposition: englishData.Value_Proposition || "",
          Customer_Relationships: englishData.Customer_Relationships || "",
          Channels: englishData.Channels || "",
          Customer_Segments: englishData.Customer_Segments || "",
          Cost_Structure: (englishData.Cost_Type || "") + " " + (englishData.Approximation_Cost || ""),
          Revenue_Streams: (englishData.Revenue_Type || "") + " " + (englishData.Approximation_Revenue || ""),
        });

        if (englishData.lastUpdated) {
          setLastUpdated(new Date(englishData.lastUpdated.toDate()));
        }
      } else {
        // User wants Arabic content - check if Arabic translation exists
        const arabicModelRef = doc(db, "BusinessModel_arabic", model_id);
        const arabicModelDoc = await getDoc(arabicModelRef);

        if (arabicModelDoc.exists()) {
          // Arabic translation exists, use it
          const arabicData = arabicModelDoc.data();
          setBmcData({
            Key_Partners: arabicData.Key_Partners || "",
            Key_Activities: arabicData.Key_Activities || "",
            Key_Resources: arabicData.Key_Resources || "",
            Value_Proposition: arabicData.Value_Proposition || "",
            Customer_Relationships: arabicData.Customer_Relationships || "",
            Channels: arabicData.Channels || "",
            Customer_Segments: arabicData.Customer_Segments || "",
            Cost_Structure: arabicData.Cost_Structure || "",
            Revenue_Streams: arabicData.Revenue_Streams || "",
          });

          if (arabicData.lastUpdated) {
            setLastUpdated(new Date(arabicData.lastUpdated.toDate()));
          }
        } else {
          // Arabic translation doesn't exist yet, create it from English data
          console.log("Creating Arabic translation from English data...");

          try {
            // Translate each field from English to Arabic
            const arabicData = {
              Key_Partners: await translateText(englishData.Key_Participation || "", "ar"),
              Key_Activities: await translateText(englishData.Key_Activities || "", "ar"),
              Key_Resources: await translateText(englishData.Key_Resources || "", "ar"),
              Value_Proposition: await translateText(englishData.Value_Proposition || "", "ar"),
              Customer_Relationships: await translateText(englishData.Customer_Relationships || "", "ar"),
              Channels: await translateText(englishData.Channels || "", "ar"),
              Customer_Segments: await translateText(englishData.Customer_Segments || "", "ar"),
              Cost_Structure: await translateText((englishData.Cost_Type || "") + " " + (englishData.Approximation_Cost || ""), "ar"),
              Revenue_Streams: await translateText((englishData.Revenue_Type || "") + " " + (englishData.Approximation_Revenue || ""), "ar"),
              lastUpdated: englishData.lastUpdated || new Date()
            };

            // Set the data in state
            setBmcData(arabicData);

            if (englishData.lastUpdated) {
              setLastUpdated(new Date(englishData.lastUpdated.toDate()));
            }

            // Create the Arabic document with the same ID
            await setDoc(arabicModelRef, arabicData);
            console.log("Arabic translation created successfully");
          } catch (translationError) {
            console.error("Error during translation process:", translationError);
            setError({ message: "Error creating Arabic translation: " + translationError.message });
          }
        }
      }
    } catch (err) {
      console.error("Error fetching BMC details:", err);
      setError({ message: t.errorFetchDetails + " " + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (model_id) {
      fetchBMC();
    }
  }, [model_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBmcData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!model_id) return;
    setIsSaving(true);
    setError(null);

    try {
      const now = new Date();

      if (language === 'ar') {
        // Save the Arabic data
        const arabicModelRef = doc(db, "BusinessModel_arabic", model_id);

        // Update Arabic document
        await updateDoc(arabicModelRef, {
          Key_Partners: bmcData.Key_Partners,
          Key_Activities: bmcData.Key_Activities,
          Key_Resources: bmcData.Key_Resources,
          Value_Proposition: bmcData.Value_Proposition,
          Customer_Relationships: bmcData.Customer_Relationships,
          Channels: bmcData.Channels,
          Customer_Segments: bmcData.Customer_Segments,
          Cost_Structure: bmcData.Cost_Structure,
          Revenue_Streams: bmcData.Revenue_Streams,
          lastUpdated: now
        });

        // Translate back to English and update the main collection
        const englishModelRef = doc(db, "BusinessModel", model_id);

        // Translate Arabic content to English
        const englishData = {
          Key_Participation: await translateText(bmcData.Key_Partners, "en"),
          Key_Activities: await translateText(bmcData.Key_Activities, "en"),
          Key_Resources: await translateText(bmcData.Key_Resources, "en"),
          Value_Proposition: await translateText(bmcData.Value_Proposition, "en"),
          Customer_Relationships: await translateText(bmcData.Customer_Relationships, "en"),
          Channels: await translateText(bmcData.Channels, "en"),
          Customer_Segments: await translateText(bmcData.Customer_Segments, "en"),
          // For cost and revenue, we need to handle the splitting
          Cost_Type: (await translateText(bmcData.Cost_Structure, "en")).split(" ")[0] || "",
          Approximation_Cost: (await translateText(bmcData.Cost_Structure, "en")).split(" ")[1] || "",
          Revenue_Type: (await translateText(bmcData.Revenue_Streams, "en")).split(" ")[0] || "",
          Approximation_Revenue: (await translateText(bmcData.Revenue_Streams, "en")).split(" ")[1] || "",
          lastUpdated: now
        };

        await updateDoc(englishModelRef, englishData);
      } else {
        // We're in English mode
        const englishModelRef = doc(db, "BusinessModel", model_id);

        // Update English document
        const dataToUpdate = {
          Key_Participation: bmcData.Key_Partners,
          Key_Activities: bmcData.Key_Activities,
          Key_Resources: bmcData.Key_Resources,
          Value_Proposition: bmcData.Value_Proposition,
          Customer_Relationships: bmcData.Customer_Relationships,
          Channels: bmcData.Channels,
          Customer_Segments: bmcData.Customer_Segments,
          Cost_Type: bmcData.Cost_Structure.split(" ")[0] || "",
          Approximation_Cost: bmcData.Cost_Structure.split(" ")[1] || "",
          Revenue_Type: bmcData.Revenue_Streams.split(" ")[0] || "",
          Approximation_Revenue: bmcData.Revenue_Streams.split(" ")[1] || "",
          lastUpdated: now
        };

        await updateDoc(englishModelRef, dataToUpdate);

        // Update or create the Arabic translation
        const arabicModelRef = doc(db, "BusinessModel_arabic", model_id);

        // Translate English content to Arabic
        const arabicData = {
          Key_Partners: await translateText(bmcData.Key_Partners, "ar"),
          Key_Activities: await translateText(bmcData.Key_Activities, "ar"),
          Key_Resources: await translateText(bmcData.Key_Resources, "ar"),
          Value_Proposition: await translateText(bmcData.Value_Proposition, "ar"),
          Customer_Relationships: await translateText(bmcData.Customer_Relationships, "ar"),
          Channels: await translateText(bmcData.Channels, "ar"),
          Customer_Segments: await translateText(bmcData.Customer_Segments, "ar"),
          Cost_Structure: await translateText(bmcData.Cost_Structure, "ar"),
          Revenue_Streams: await translateText(bmcData.Revenue_Streams, "ar"),
          lastUpdated: now
        };

        // Try to get the Arabic document first
        const arabicDoc = await getDoc(arabicModelRef);

        if (arabicDoc.exists()) {
          // Update existing Arabic document
          await updateDoc(arabicModelRef, arabicData);
        } else {
          // Create new Arabic document
          await setDoc(arabicModelRef, arabicData);
        }
      }

      setLastUpdated(now);
      setIsEditing(false);

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'success-msg';
      successMsg.innerHTML = t.success;
      const bmcCanvas = document.querySelector('.bmc-canvas');
      if (bmcCanvas) {
        bmcCanvas.prepend(successMsg);
        setTimeout(() => {
          if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
          }
        }, 3000);
      }
    } catch (err) {
      console.error("Error saving adjustments:", err);
      setError({ message: t.errorSaving + " " + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    fetchBMC(); // This will reload the data from the correct language collection
    setIsEditing(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    window.print();
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="bm-result-page">
      <Header
        showNotifications={true}
        showUserIcon={true}
        showMobileMenu={false}
        showLanguageToggle={true}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />

      <img className="SmallSqrs1" alt={language === 'ar' ? "زخرفة" : "Decoration"} src={SmallSqrs1} />
      <img className="SmallSqrs2" alt={language === 'ar' ? "زخرفة" : "Decoration"} src={SmallSqrs2} />

      <h1>{t.pageTitle}</h1>

      {loading ? (
        <div className="loading">{t.loading}</div>
      ) : (
        <div className="bmc-canvas" dir={language === 'en' ? 'ltr' : 'rtl'} style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
          {error && <div className="error-msg">{error.message}</div>}
          {lastUpdated && !isEditing && (
            <div className="last-updated">
              {t.lastUpdated} {formatDate(lastUpdated)}
            </div>
          )}

          {/* Top Section */}
          <div className="bmc-top" dir={language === 'en' ? 'ltr' : 'rtl'} style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
            <div className="bmc-block key-partnerships" style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
              <h3 style={{ textAlign: 'center' }}>{t.keyPartners}</h3>
              {isEditing ? (
                <textarea
                  name="Key_Partners"
                  value={bmcData.Key_Partners}
                  onChange={handleChange}
                  placeholder={t.partnersPlaceholder}
                />
              ) : (
                <p>{bmcData.Key_Partners}</p>
              )}
            </div>

            <div className="bmc-block key-activities" style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
              <h3 style={{ textAlign: 'center' }}>{t.keyActivities}</h3>
              {isEditing ? (
                <textarea
                  name="Key_Activities"
                  value={bmcData.Key_Activities}
                  onChange={handleChange}
                  placeholder={t.activitiesPlaceholder}
                />
              ) : (
                <p>{bmcData.Key_Activities}</p>
              )}
            </div>

            <div className="bmc-block value-propositions" style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
              <h3 style={{ textAlign: 'center' }}>{t.valueProposition}</h3>
              {isEditing ? (
                <textarea
                  name="Value_Proposition"
                  value={bmcData.Value_Proposition}
                  onChange={handleChange}
                  placeholder={t.valuePlaceholder}
                />
              ) : (
                <p>{bmcData.Value_Proposition}</p>
              )}
            </div>

            <div className="bmc-block customer-relationships" style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
              <h3 style={{ textAlign: 'center' }}>{t.customerRelationships}</h3>
              {isEditing ? (
                <textarea
                  name="Customer_Relationships"
                  value={bmcData.Customer_Relationships}
                  onChange={handleChange}
                  placeholder={t.relationshipsPlaceholder}
                />
              ) : (
                <p>{bmcData.Customer_Relationships}</p>
              )}
            </div>

            <div className="bmc-block customer-segments" style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
              <h3 style={{ textAlign: 'center' }}>{t.customerSegments}</h3>
              {isEditing ? (
                <textarea
                  name="Customer_Segments"
                  value={bmcData.Customer_Segments}
                  onChange={handleChange}
                  placeholder={t.segmentsPlaceholder}
                />
              ) : (
                <p>{bmcData.Customer_Segments}</p>
              )}
            </div>

            <div className="bmc-block key-resources" style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
              <h3 style={{ textAlign: 'center' }}>{t.keyResources}</h3>
              {isEditing ? (
                <textarea
                  name="Key_Resources"
                  value={bmcData.Key_Resources}
                  onChange={handleChange}
                  placeholder={t.resourcesPlaceholder}
                />
              ) : (
                <p>{bmcData.Key_Resources}</p>
              )}
            </div>

            <div className="bmc-block channels" style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
              <h3 style={{ textAlign: 'center' }}>{t.channels}</h3>
              {isEditing ? (
                <textarea
                  name="Channels"
                  value={bmcData.Channels}
                  onChange={handleChange}
                  placeholder={t.channelsPlaceholder}
                />
              ) : (
                <p>{bmcData.Channels}</p>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bmc-bottom" dir={language === 'en' ? 'ltr' : 'rtl'} style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
            <div className="bmc-block cost-structure" style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
              <h3 style={{ textAlign: 'center' }}>{t.costStructure}</h3>
              {isEditing ? (
                <textarea
                  name="Cost_Structure"
                  value={bmcData.Cost_Structure}
                  onChange={handleChange}
                  placeholder={t.costPlaceholder}
                />
              ) : (
                <p>{bmcData.Cost_Structure}</p>
              )}
            </div>

            <div className="bmc-block revenue-streams" style={{ direction: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' }}>
              <h3 style={{ textAlign: 'center' }}>{t.revenueStreams}</h3>
              {isEditing ? (
                <textarea
                  name="Revenue_Streams"
                  value={bmcData.Revenue_Streams}
                  onChange={handleChange}
                  placeholder={t.revenuePlaceholder}
                />
              ) : (
                <p>{bmcData.Revenue_Streams}</p>
              )}
            </div>
          </div>

          {/* Edit Mode Controls */}
          <div className="edit-btn-container" dir={language === 'en' ? 'ltr' : 'rtl'}>
            {isEditing ? (
              <>
                <button
                  className="edit-btn save-btn"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="saving-indicator"></span>
                      {t.saving}
                    </>
                  ) : (
                    t.saveChanges
                  )}
                </button>
                <button
                  className="edit-btn cancel-btn"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  {t.cancel}
                </button>
              </>
            ) : (
              <>
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  {t.editContent}
                </button>
                <button className="edit-btn export-btn" onClick={handleExport}>
                  {t.exportPDF}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <footer className="bmc-footer">
        <div className="footer-text">
          {t.copyright} {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default BusinessModelResult;