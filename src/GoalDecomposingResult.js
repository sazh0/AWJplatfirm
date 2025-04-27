import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./GoalDecomposeResult.css";
import SmallSqrs1 from "./assets/SmallSqrs1.svg";
import SmallSqrs2 from "./assets/SmallSqrs2.svg";
import LeftArrow from "./assets/LeftArrow.svg";
import Header from "./Header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faHourglassHalf, faClock, faTasks, faCalendarAlt, faChartLine, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// Translation data object
const translationsData = {
  en: {
    unknownProject: "Unknown Project",
    noProjectId: "No project ID was provided.",
    errorFetchingProject: "Error fetching project details.",
    projectNotFound: "Project not found.",
    totalMilestones: "Total Milestones",
    tasksLabel: "Tasks",
    timeEstimate: "Time Estimate",
    completionRate: "Completion Rate",
    projectStatusLabel: "Project Status:",
    timelineTab: "Timeline",
    risksTab: "Risks",
    loadingProjectData: "Loading project data...",
    backToProjects: "Back to Projects",
    progressLabel: "Progress",
    daysLabel: "days",
    kpiLabel: "KPI",
    riskIndicatorLabel: "Risk Indicator",
    riskFactorsLabel: "Risk Factors",
    notStartedStatus: "Not Started",
    inProgressStatus: "In Progress",
    completedStatus: "Completed",
    riskHigh: "High",
    riskMedium: "Medium",
    riskLow: "Low",
    riskUnknown: "Unknown",
    statusNotStarted: "Not Started",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    tasksHeading: "Tasks",
    progress: "Progress"
  },
  ar: {
    unknownProject: "مشروع غير معروف",
    noProjectId: "لم يتم توفير معرف المشروع.",
    errorFetchingProject: "خطأ في جلب تفاصيل المشروع.",
    projectNotFound: "لم يتم العثور على المشروع.",
    totalMilestones: "إجمالي المراحل",
    tasksLabel: "المهام",
    timeEstimate: "الوقت المتوقع",
    completionRate: "نسبة الإنجاز",
    projectStatusLabel: "حالة المشروع:",
    timelineTab: "الجدول الزمني",
    risksTab: "المخاطر",
    loadingProjectData: "جاري تحميل بيانات المشروع...",
    backToProjects: "المشاريع القائمة",
    progressLabel: "التقدم",
    daysLabel: "يوم",
    kpiLabel: "مؤشر الأداء الرئيسي",
    riskIndicatorLabel: "مؤشر الخطر",
    riskFactorsLabel: "عوامل الخطر",
    notStartedStatus: "لم يبدأ",
    inProgressStatus: "قيد التنفيذ",
    completedStatus: "مكتمل",
    riskHigh: "عالي",
    riskMedium: "متوسط",
    riskLow: "منخفض",
    riskUnknown: "غير معروف",
    statusNotStarted: "لم يبدأ",
    statusInProgress: "قيد التنفيذ",
    statusCompleted: "مكتمل",
    tasksHeading: "المهام",
    progress: "التقدم"
  }
};

// Loading spinner component
const LoadingSpinner = ({ translations }) => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>{translations.loadingProjectData}</p>
  </div>
);

// Error message component
const ErrorMessage = ({ message }) => (
  <div className="error-message">
    <FontAwesomeIcon icon={faExclamationTriangle} />
    <p>{message}</p>
  </div>
);

const GoalDecomposeResult = () => {
  // Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { project_id } = location.state || {};

  // Component state
  const [projectData, setProjectData] = useState({
    project_name: "Unknown Project",
    project_id: "",
    milestones: []
  });
  const [projectStatus, setProjectStatus] = useState("Not Started");
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("timeline");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateTrigger, setUpdateTrigger] = useState(0); // Add this to force re-renders

  // Add language state
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'en'; // Default to English
  });

  // Get translations for current language
  const t = translationsData[language];

  // Apply language change effects
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('app-language', language);
  }, [language]);

  // Microsoft Translator API implementation
  const subscriptionKey = "6sI4sDyz7hl0lTJ8LKFISSftatGeBshi2FKqiRKWua0YMft2B4ZKJQQJ99BDACFcvJRXJ3w3AAAbACOGlUjA";
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

  useEffect(() => {
    if (!project_id) {
      setError(t.noProjectId);
      setLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      try {
        await fetchProjectDetails();
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError(t.errorFetchingProject);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [project_id, language]); // Re-fetch when language changes

  // Debug logging for tasks and progress changes
  useEffect(() => {
    if (tasks.length > 0) {
      console.log("Tasks updated:", tasks);

      // Log milestone progress for debugging
      projectData.milestones.forEach(milestone => {
        const progress = getMilestoneProgress(milestone.id);
        console.log(`Milestone ${milestone.Milestone} progress: ${progress}%`);
      });

      // Update project status based on progress
      const progress = getProjectProgress();
      let status;
      if (progress === 100) {
        status = t.completedStatus;
      } else if (progress === 0) {
        status = t.notStartedStatus;
      } else {
        status = t.inProgressStatus;
      }
      setProjectStatus(status);

      // Update project status in Firestore
      updateProjectStatus(status);
    }
  }, [tasks, updateTrigger, projectData.milestones, t]);

  // Update the fetchProjectDetails function to translate milestone names
  const fetchProjectDetails = async () => {
    // 1. Fetch the project document
    const projectRef = doc(db, "Project", project_id);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      setError(t.projectNotFound);
      return;
    }

    const projectInfo = projectSnap.data();

    // 2. Fetch milestones for this project
    const milestonesQuery = query(
      collection(db, "Milestones"),
      where("ProjectID", "==", project_id)
    );
    const milestonesSnapshot = await getDocs(milestonesQuery);

    // Get raw milestones data
    const rawMilestones = milestonesSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));

    // Translate milestone names and risk factors if needed
    let displayMilestones;
    if (language === 'ar') {
      // Translate to Arabic
      displayMilestones = await Promise.all(
        rawMilestones.map(async (milestone) => ({
          ...milestone,
          Milestone: await translateText(milestone.Milestone || "", "ar"),
          KPI: await translateText(milestone.KPI || "", "ar"),
          RiskFactors: await translateText(milestone.RiskFactors || "", "ar"),
          RiskIndicator: await translateText(milestone.RiskIndicator || "", "ar")
        }))
      );
    } else {
      // Use English data as is
      displayMilestones = rawMilestones;
    }

    // Get project name in selected language
    const displayProjectName = language === 'ar'
      ? await translateText(projectInfo.ProjectName || t.unknownProject, "ar")
      : projectInfo.ProjectName || t.unknownProject;

    // Update project data state
    setProjectData({
      project_name: displayProjectName,
      project_id,
      milestones: displayMilestones
    });

    // 3. Fetch all tasks for each milestone
    await fetchTasksForMilestones(displayMilestones);
  };

  // Update the fetchTasksForMilestones function to translate task descriptions
  const fetchTasksForMilestones = async (milestones) => {
    const allTasks = [];

    for (const milestone of milestones) {
      const tasksQuery = query(
        collection(db, "Task"),
        where("MilestoneID", "==", milestone.id)
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const milestoneTasks = tasksSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        milestoneId: milestone.id
      }));

      // Translate each task description if needed
      for (const task of milestoneTasks) {
        if (language === 'ar') {
          task.Task = await translateText(task.Task || "", "ar");
        }
        allTasks.push(task);
      }
    }

    setTasks(allTasks);
  };

  // Update project status in Firestore
  const updateProjectStatus = async (status) => {
    try {
      // Get current project progress
      const progress = getProjectProgress();

      // Update in Firestore with both status and progress
      const projectRef = doc(db, "Project", project_id);
      await updateDoc(projectRef, {
        Status: status,
      });

      console.log(`Project status updated to: ${status}`);
    } catch (error) {
      console.error("Error updating project status and progress:", error);
    }
  };

  // Update task status in Firestore and local state
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Update in Firestore
      const taskRef = doc(db, "Task", taskId);
      await updateDoc(taskRef, { status: newStatus });

      // Update in local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Force component to re-render
      setUpdateTrigger(prev => prev + 1);

      console.log(`Task ${taskId} updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  // Modified getRiskClass function to handle translated risk indicators
  const getRiskClass = (riskIndicator) => {
    if (!riskIndicator) return "risk-unknown";

    const risk = riskIndicator.toLowerCase();

    // Check for English risk words
    if (risk.includes("high") || risk.includes("عالي")) return "risk-high";
    if (risk.includes("medium") || risk.includes("متوسط")) return "risk-medium";
    if (risk.includes("low") || risk.includes("منخفض")) return "risk-low";

    return "risk-unknown";
  };

  // Calculate total days for the project
  const getTotalDays = () => {
    return projectData.milestones.reduce((total, milestone) => {
      return total + (parseInt(milestone.TimeEstimate) || 0);
    }, 0);
  };

  // Calculate overall project progress
  const getProjectProgress = () => {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(task => task.status === "Completed").length;
    const inProgressTasks = tasks.filter(task => task.status === "In Progress").length;

    // Weight completed tasks as 100% and in-progress tasks as 50%
    const progress = ((completedTasks * 100) + (inProgressTasks * 50)) / tasks.length;
    const roundedProgress = Math.round(progress);

    // NEW CODE: Here we need to update the project progress in Firestore directly
    // This ensures the function is called whenever progress is calculated
    if (project_id) {
      const projectRef = doc(db, "Project", project_id);
      updateDoc(projectRef, { Pprogress: roundedProgress })
        .then(() => console.log(`Project progress updated to ${roundedProgress}%`))
        .catch(err => console.error("Error updating project progress:", err));
    }

    return roundedProgress;
  };

  // Calculate progress for a specific milestone
  const getMilestoneProgress = (milestoneId) => {
    const milestoneTasks = tasks.filter(task => task.milestoneId === milestoneId);

    if (milestoneTasks.length === 0) return 0;

    const completedTasks = milestoneTasks.filter(task => task.status === "Completed").length;
    const inProgressTasks = milestoneTasks.filter(task => task.status === "In Progress").length;

    const progress = ((completedTasks * 100) + (inProgressTasks * 50)) / milestoneTasks.length;
    const roundedProgress = Math.round(progress);

    // NEW CODE: Here we update the milestone progress in Firestore whenever it's calculated
    const milestoneRef = doc(db, "Milestones", milestoneId);
    updateDoc(milestoneRef, { Mprogress: roundedProgress })
      .then(() => console.log(`Milestone ${milestoneId} progress updated to ${roundedProgress}%`))
      .catch(err => console.error("Error updating milestone progress:", err));

    return roundedProgress;
  };

  const ProjectHeader = ({ projectName, onBackClick, translations }) => (
    <div className="breadcrumb">
      <div className="breadcrumb-content">
        <button className="back-btn-small" onClick={onBackClick}>
          <img src={LeftArrow} alt="Back" />
          <span>{translations.backToProjects}</span>
        </button>
        <h1 className="project-title-centered">{projectName}</h1>
        <div className="spacer"></div> {/* Empty div to help with flexbox centering */}
      </div>
    </div>
  );
  // Timeline view component with guaranteed working progress bar
  const TimelineView = ({ milestones, tasks, getRiskClass, updateTaskStatus, refreshKey, translations }) => {
    // We'll track state locally in this component
    const [localTasks, setLocalTasks] = useState(tasks);

    // Keep local tasks in sync with parent tasks
    useEffect(() => {
      setLocalTasks(tasks);
    }, [tasks]);

    // Wrapper for updateTaskStatus that ensures local updates
    const handleTaskStatusChange = async (taskId, newStatus) => {
      // Update task in local state immediately (optimistic update)
      setLocalTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Call the parent update function
      await updateTaskStatus(taskId, newStatus);
    };

    const getTranslatedStatus = (status) => {
      switch (status) {
        case "Not Started":
          return translations.statusNotStarted;
        case "In Progress":
          return translations.statusInProgress;
        case "Completed":
          return translations.statusCompleted;
        default:
          return status;
      }
    };

    // Also update the getTranslatedRisk function in TimelineView component
    const getTranslatedRisk = (risk) => {
      if (!risk) return translations.riskUnknown;

      const lowerRisk = risk.toLowerCase();
      if (lowerRisk.includes("high") || lowerRisk.includes("عالي")) return translations.riskHigh;
      if (lowerRisk.includes("medium") || lowerRisk.includes("متوسط")) return translations.riskMedium;
      if (lowerRisk.includes("low") || lowerRisk.includes("منخفض")) return translations.riskLow;
      return translations.riskUnknown;
    };

    return (
      <div className="timeline-view">
        <div className="timeline-container">
          {milestones.map((milestone, index) => {
            // Calculate progress based on localTasks for immediate feedback
            const milestoneTasks = localTasks.filter(task => task.milestoneId === milestone.id);

            let milestoneProgress = 0;
            if (milestoneTasks.length > 0) {
              const completedCount = milestoneTasks.filter(task => task.status === "Completed").length;
              const inProgressCount = milestoneTasks.filter(task => task.status === "In Progress").length;
              milestoneProgress = Math.round(((completedCount * 100) + (inProgressCount * 50)) / milestoneTasks.length);
            }

            return (
              <div className="timeline-item" key={`${index}-${refreshKey}`}>
                <div className={`timeline-node ${milestoneProgress === 100 ? 'completed' : milestoneProgress > 0 ? 'in-progress' : ''}`}>
                  {milestoneProgress === 100 ? (
                    <FontAwesomeIcon icon={faCheck} />
                  ) : milestoneProgress > 0 ? (
                    <FontAwesomeIcon icon={faHourglassHalf} />
                  ) : (
                    <FontAwesomeIcon icon={faClock} />
                  )}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h3>{milestone.Milestone}</h3>
                    <span className={`milestone-status ${milestoneProgress === 100 ? 'completed' : milestoneProgress > 0 ? 'in-progress' : 'not-started'}`}>
                      {milestoneProgress === 100 ? translations.completedStatus :
                        milestoneProgress > 0 ? translations.inProgressStatus :
                          translations.notStartedStatus}
                    </span>
                  </div>

                  {/* Tasks First */}
                  <div className="timeline-tasks">
                    <h4 className="tasks-heading">{translations.tasksHeading} ({milestoneTasks.length})</h4>
                    {milestoneTasks.map((task, taskIndex) => (
                      <div className="timeline-task-item" key={`task-${taskIndex}-${refreshKey}`}>
                        <div className="task-content">
                          <FontAwesomeIcon icon={faTasks} className="task-icon" />
                          <span className="task-text">{task.Task}</span>
                        </div>
                        <div className="task-status-indicator">
                          <div className={`task-status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                            <span className="status-dot"></span>
                            <select
                              value={task.status}
                              onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                              className={`task-status-select ${task.status.toLowerCase().replace(' ', '-')}`}
                            >
                              <option value="Not Started">{translations.statusNotStarted}</option>
                              <option value="In Progress">{translations.statusInProgress}</option>
                              <option value="Completed">{translations.statusCompleted}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar - Completely Rewritten Implementation */}
                  <div className="timeline-progress">
                    <div className="progress-label">
                      <span>{translations.progress}</span>
                      <span className="progress-percentage">{milestoneProgress}%</span>
                    </div>

                    {/* Custom-styled progress bar to avoid CSS conflicts */}
                    <div
                      style={{
                        height: '10px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        position: 'relative',
                        marginTop: '8px'
                      }}
                    >
                      <div
                        style={{
                          width: `${milestoneProgress}%`,
                          backgroundColor: '#e63a46',
                          height: '100%',
                          borderRadius: '5px',
                          transition: 'width 0.3s ease-in-out'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Meta Info Last */}
                  <div className="timeline-meta-top">
                    <div className="meta-item">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{milestone.TimeEstimate} {translations.daysLabel}</span>
                    </div>
                    <div className="meta-item">
                      <FontAwesomeIcon icon={faChartLine} />
                      <span>{milestone.KPI}</span>
                    </div>
                    <div className={`meta-item risk ${getRiskClass(milestone.RiskIndicator)}`}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>{getTranslatedRisk(milestone.RiskIndicator)}</span>
                    </div>
                  </div>
                </div>
                {index < milestones.length - 1 && <div className="timeline-connector"></div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  // Risks View Component
  const RisksView = ({ milestones, getRiskClass, translations }) => {
    const getTranslatedRisk = (risk) => {
      if (!risk) return translations.riskUnknown;

      const lowerRisk = risk.toLowerCase();
      if (lowerRisk.includes("high") || lowerRisk.includes("عالي")) return translations.riskHigh;
      if (lowerRisk.includes("medium") || lowerRisk.includes("متوسط")) return translations.riskMedium;
      if (lowerRisk.includes("low") || lowerRisk.includes("منخفض")) return translations.riskLow;
      return translations.riskUnknown;
    };

    return (
      <div className="risks-view">
        <div className="risks-container">
          {milestones.map((milestone, index) => (
            <div className={`risk-card ${getRiskClass(milestone.RiskIndicator)}`} key={index}>
              <div className="risk-header">
                <h3>{milestone.Milestone}</h3>
                <span className={`risk-level ${getRiskClass(milestone.RiskIndicator)}`}>
                  {getTranslatedRisk(milestone.RiskIndicator)}
                </span>
              </div>
              <div className="risk-body">
                <div className="risk-factors-list">
                  <h4>{translations.riskFactorsLabel}</h4>
                  {milestone.RiskFactors.split(',').map((risk, riskIndex) => (
                    <div className="risk-factor" key={riskIndex}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>{risk.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="goal-decompose-page">
      {/* Header with language toggle */}
      <Header
        showNotifications={true}
        showUserIcon={true}
        showMobileMenu={false}
        showLanguageToggle={true}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Decorative elements */}
      <img className="decoration decoration-top-left" src={SmallSqrs1} alt="" aria-hidden="true" />
      <img className="decoration decoration-bottom-right" src={SmallSqrs2} alt="" aria-hidden="true" />

      {/* Main content */}
      <main className="main-content">
        {/* Project title and back button */}
        <ProjectHeader
          projectName={projectData.project_name}
          onBackClick={() => navigate("/dashboard", { state: { selectedSection: "projects" } })}
          translations={t}
        />

        {/* Project stats overview */}
        <div className="project-overview-card">
          <div className="card-content">
            <div className="stat-box">
              <h3>{t.totalMilestones}</h3>
              <p className="stat-value">{projectData.milestones.length}</p>
            </div>
            <div className="stat-box">
              <h3>{t.tasksLabel}</h3>
              <p className="stat-value">{tasks.length}</p>
            </div>
            <div className="stat-box">
              <h3>{t.timeEstimate}</h3>
              <p className="stat-value">{getTotalDays()} {t.daysLabel}</p>
            </div>
            <div className="stat-box">
              <h3>{t.completionRate}</h3>
              <p className="stat-value">{getProjectProgress()}%</p>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            {t.timelineTab}
          </button>
          <button
            className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
            onClick={() => setActiveTab('risks')}
          >
            {t.risksTab}
          </button>
        </div>

        {/* Tab content */}
        <div className="tab-content">
          {loading ? (
            <LoadingSpinner translations={t} />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              {activeTab === 'timeline' && (
                <TimelineView
                  milestones={projectData.milestones}
                  tasks={tasks}
                  getMilestoneProgress={getMilestoneProgress}
                  getRiskClass={getRiskClass}
                  updateTaskStatus={updateTaskStatus}
                  refreshKey={updateTrigger} // Pass refresh key to force re-renders
                  translations={t}
                />
              )}

              {activeTab === 'risks' && (
                <RisksView
                  milestones={projectData.milestones}
                  getRiskClass={getRiskClass}
                  translations={t}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default GoalDecomposeResult;