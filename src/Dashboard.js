import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FaUserCircle,
    FaEye,
    FaEyeSlash,
    FaBars,
    FaTimes,
    FaLock,
    FaBuilding,
    FaInfoCircle,
    FaBriefcase,
    FaUsers,
    FaUserFriends,
    FaSpinner,
    FaCheckCircle,
    FaTimesCircle,
    FaSave,
    FaEdit,
    FaChevronRight,
    FaChevronLeft,
    FaEnvelope,
    FaUserSlash,
    FaShieldAlt
} from "react-icons/fa";
import "./DashboardPage.css";
import DashBIcon from "./assets/DashBIcon.svg";
import ProjIcon from "./assets/ProjIcon.svg";
import CompanyFileIcon from "./assets/CompanyFileIcon.svg";
import BMIconD from "./assets/BMIconD.svg";
import GDIcon from "./assets/GDIcon.svg";
import { db } from "./firebase";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    query,
    where,
} from "firebase/firestore";
import Header from "./Header";

// Translations for all UI text
const translations = {
    en: {
        dashboard: "Dashboard",
        projects: "Projects",
        newProject: "New Project",
        businessModel: "Business Model",
        companyProfile: "Company Profile",
        comingSoon: "Coming Soon",
        existingProjects: "Existing Projects",
        totalProjects: "Projects",
        ongoingProjects: "Ongoing Projects",
        completedProjects: "Completed Projects",
        filterByStatus: "Filter by Status:",
        all: "All",
        inProgress: "In Progress",
        completed: "Completed",
        notStarted: "Not Started",
        delayed: "Delayed",
        noProjects: "No projects available at the moment",
        noFilteredProjects: "No projects with the status",
        createNewProject: "Create New Project",
        duration: "Duration:",
        goals: "Goals:",
        status: "Status:",
        loading: "Loading...",
        undetermined: "Undetermined",
        days: "days",
        viewDetails: "View Details",
        companyName: "Company Name",
        companyDescription: "Company Description",
        companyField: "Company Field",
        totalEmployees: "Total Company Employees",
        registeredEmployees: "Registered Employees",
        securityCode: "Security Code",
        managerOnly: "Only managers can edit data",
        saveChanges: "Save Changes",
        saving: "Saving...",
        saved: "Saved",
        saveFailed: "Save Failed",
        editData: "Edit Data",
        cancel: "Cancel",
        manager: "Manager",
        page: "Page",
        of: "of",
        previous: "Previous",
        next: "Next",
        noRegisteredMembers: "No registered members found",
        statusValues: {
            "In Progress": "In Progress",
            "Completed": "Completed",
            "Not Started": "Not Started",
            "قيد التنفيذ": "In Progress",
            "مكتمل": "Completed",
            "لم يبدأ": "Not Started",
        }
    },
    ar: {
        dashboard: "لوحة التحكم",
        projects: "المشاريع القائمة",
        newProject: "مشروع جديد",
        businessModel: "نموذج العمل",
        companyProfile: "ملف الشركة",
        comingSoon: "قريبًا",
        existingProjects: "المشاريع القائمة",
        totalProjects: "المشاريع",
        ongoingProjects: "المشاريع الجارية",
        completedProjects: "المشاريع المكتملة",
        filterByStatus: "تصفية حسب الحالة:",
        all: "الكل",
        inProgress: "قيد التنفيذ",
        completed: "مكتمل",
        notStarted: "لم يبدأ",
        delayed: "متأخر",
        noProjects: "لا توجد مشاريع متاحة حاليًا",
        noFilteredProjects: "لا توجد مشاريع بحالة",
        createNewProject: "إنشاء مشروع جديد",
        duration: "المدة:",
        goals: "عدد الأهداف:",
        status: "الحالة:",
        loading: "جاري التحميل...",
        undetermined: "غير محدد",
        days: "يوم",
        viewDetails: "مشاهدة التفاصيل",
        companyName: "اسم الشركة",
        companyDescription: "وصف الشركة",
        companyField: "مجال الشركة",
        totalEmployees: "إجمالي عدد موظفي الشركة",
        registeredEmployees: "الموظفين المسجلين",
        securityCode: "رمز الأمان",
        managerOnly: "لا يمكن تعديل البيانات إلا من قبل المدير",
        saveChanges: "حفظ التغييرات",
        saving: "جاري الحفظ...",
        saved: "تم الحفظ",
        saveFailed: "فشل الحفظ",
        editData: "تعديل البيانات",
        cancel: "إلغاء",
        manager: "مدير",
        page: "الصفحة",
        of: "من",
        previous: "السابق",
        next: "التالي",
        noRegisteredMembers: "لم يتم العثور على أعضاء مسجلين",
        statusValues: {
            "In Progress": "قيد التنفيذ",
            "Completed": "مكتمل",
            "Not Started": "لم يبدأ",
            "قيد التنفيذ": "قيد التنفيذ",
            "مكتمل": "مكتمل",
            "لم يبدأ": "لم يبدأ",
        }
    }
};

const refreshSecurityKeyIfExpired = async (companyId) => {
    const companyRef = doc(db, "Company", companyId);
    const companySnap = await getDoc(companyRef);
    if (companySnap.exists()) {
        const data = companySnap.data();
        const createdAt = data.SecurityKeyCreatedAt?.toDate?.();
        if (createdAt) {
            const now = new Date();
            const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
            if (diffInDays >= 14) {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                let newKey = "";
                for (let i = 0; i < 5; i++) {
                    newKey += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                await updateDoc(companyRef, {
                    SecurityKey: newKey,
                    SecurityKeyCreatedAt: now,
                });
                console.log("Security key refreshed.");
            }
        }
    }
};

const DashboardPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedSection, setSelectedSection] = useState("dashboard");
    const [isEditing, setIsEditing] = useState(false);
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState("User"); // Default to regular user
    const [projects, setProjects] = useState([]);
    const [companyInfo, setCompanyInfo] = useState({
        CompanyName: "جاري التحميل...",
        members: "جاري التحميل...",
        securityCode: "جاري التحميل...",
        description: "جاري التحميل...",
        field: "جاري التحميل...",
    });
    const [companyRefState, setCompanyRefState] = useState(null);
    const [showSecurityCode, setShowSecurityCode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [hasVisitedProfile, setHasVisitedProfile] = useState(false);
    const [projectMilestones, setProjectMilestones] = useState({});
    const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);

    // Add language state
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('app-language') || 'en'; // Default to English
    });

    // Get translations for current language
    const t = translations[language];

    // Add state for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const projectsPerPage = 6;

    // Add state for company members
    const [companyMembers, setCompanyMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);

    // Add these state variables to the existing state declarations
    const [activeFilter, setActiveFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [filteredProjects, setFilteredProjects] = useState([]);

    // Add this new state for member pagination
    const [memberCurrentPage, setMemberCurrentPage] = useState(1);
    const membersPerPage = 5;

    // Update document direction when language changes
    useEffect(() => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('app-language', language);
    }, [language]);

    // Optimized useEffect to fetch milestone data once for all projects
    useEffect(() => {
        const fetchMilestonesForProjects = async () => {
            if (projects.length === 0) return;

            setIsLoadingMilestones(true);
            const milestonesData = {};

            // Initialize with empty data to avoid undefined errors
            projects.forEach(project => {
                milestonesData[project.id] = {
                    count: project.goals || 0, // Use existing data as initial value
                    totalDays: parseInt(project.duration) || 0, // Try to parse duration if available
                    milestones: []
                };
            });

            try {
                // Create a timeout to avoid showing loading forever
                const timeoutPromise = new Promise(resolve => {
                    setTimeout(() => {
                        resolve("timeout");
                    }, 5000); // 5 second timeout
                });

                // Fetch all milestones with one query that matches any of our project IDs
                const fetchPromise = async () => {
                    if (projects.length <= 10) {
                        // For a small number of projects, we can use a simple "in" query
                        const milestonesQuery = query(
                            collection(db, "Milestones"),
                            where("ProjectID", "in", projects.map(p => p.id).slice(0, 10)) // Firestore limits "in" to 10 values
                        );

                        const milestonesSnapshot = await getDocs(milestonesQuery);

                        // Group milestones by project ID
                        milestonesSnapshot.docs.forEach(doc => {
                            const milestone = { ...doc.data(), id: doc.id };
                            const projectId = milestone.ProjectID;

                            if (!milestonesData[projectId]) {
                                milestonesData[projectId] = { count: 0, totalDays: 0, milestones: [] };
                            }

                            milestonesData[projectId].milestones.push(milestone);
                            milestonesData[projectId].count = (milestonesData[projectId].milestones || []).length;
                            milestonesData[projectId].totalDays += parseInt(milestone.TimeEstimate) || 0;
                        });
                    } else {
                        // For many projects, we need to do multiple queries in batches
                        const batches = [];
                        const projectIds = projects.map(p => p.id);

                        // Split into batches of 10 (Firestore "in" operator limit)
                        for (let i = 0; i < projectIds.length; i += 10) {
                            const batch = projectIds.slice(i, i + 10);
                            batches.push(batch);
                        }

                        // Execute each batch query
                        for (const batch of batches) {
                            const batchQuery = query(
                                collection(db, "Milestones"),
                                where("ProjectID", "in", batch)
                            );

                            const batchSnapshot = await getDocs(batchQuery);

                            batchSnapshot.docs.forEach(doc => {
                                const milestone = { ...doc.data(), id: doc.id };
                                const projectId = milestone.ProjectID;

                                if (!milestonesData[projectId]) {
                                    milestonesData[projectId] = { count: 0, totalDays: 0, milestones: [] };
                                }

                                milestonesData[projectId].milestones.push(milestone);
                                milestonesData[projectId].count = (milestonesData[projectId].milestones || []).length;
                                milestonesData[projectId].totalDays += parseInt(milestone.TimeEstimate) || 0;
                            });
                        }
                    }

                    return "completed";
                };

                // Race between timeout and fetch
                const result = await Promise.race([fetchPromise(), timeoutPromise]);

                if (result === "timeout") {
                    console.warn("Milestone fetching timed out, using fallback values");
                }

                setProjectMilestones(milestonesData);
            } catch (error) {
                console.error("Error fetching milestones:", error);
            } finally {
                setIsLoadingMilestones(false);
            }
        };

        fetchMilestonesForProjects();
    }, [projects]);

    // Helper functions remain the same but with quick fallback
    const getMilestoneCount = (projectId, fallbackValue = 0) => {
        // Return fallback immediately if still loading after 500ms
        if (isLoadingMilestones && Date.now() - initialRenderTime > 500) {
            return fallbackValue;
        }

        if (projectMilestones[projectId]) {
            return projectMilestones[projectId].count;
        }
        return fallbackValue;
    };

    const getProjectDuration = (projectId, fallbackValue = t.undetermined) => {
        // Return fallback immediately if still loading after 500ms
        if (isLoadingMilestones && Date.now() - initialRenderTime > 500) {
            return fallbackValue;
        }

        if (projectMilestones[projectId] && projectMilestones[projectId].totalDays > 0) {
            return `${projectMilestones[projectId].totalDays} ${t.days}`;
        }
        return fallbackValue;
    };

    // Add this at the top of your component to track render time
    const initialRenderTime = React.useRef(Date.now()).current;

    // Handle language change
    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
    };

    useEffect(() => {
        // First filter projects based on activeFilter
        let results = [...projects];

        if (activeFilter !== "all") {
            results = projects.filter(project => {
                // Handle both English and Arabic status values
                const status = project.status || "";
                const lowercaseStatus = status.toLowerCase().trim();

                if (activeFilter === "In Progress") {
                    return lowercaseStatus === "in progress" || lowercaseStatus === "قيد التنفيذ";
                } else if (activeFilter === "Completed") {
                    return lowercaseStatus === "completed" || lowercaseStatus === "مكتمل";
                } else if (activeFilter === "Not Started") {
                    return lowercaseStatus === "not started" || lowercaseStatus === "لم يبدأ";
                } else {
                    return status === activeFilter;
                }
            });
        }

        // Then sort the filtered results
        results = sortProjects(results, sortBy);

        // Update filteredProjects state
        setFilteredProjects(results);

        // Reset to first page when filter/sort changes
        setCurrentPage(1);
    }, [projects, activeFilter, sortBy]);

    // Add this function to handle sorting
    const sortProjects = (projectsToSort, sortCriteria) => {
        return [...projectsToSort].sort((a, b) => {
            switch (sortCriteria) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "status":
                    return a.status.localeCompare(b.status);
                case "goals":
                    return (b.goals || 0) - (a.goals || 0);
                default:
                    return 0;
            }
        });
    };

    // Add this function to handle filter button clicks
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
    };

    // Add this function to handle sort selection changes
    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };


    useEffect(() => {
        // Check if we have a state with selectedSection from navigation
        if (location.state && location.state.selectedSection) {
            setSelectedSection(location.state.selectedSection);
            // Clear the state to prevent it from being reused on refresh
            window.history.replaceState({}, document.title);
        }
        const fetchUserAndCompanyData = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) return;

            const userRef = doc(db, "User", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                setUserName(userData.FirstName);
                setUserRole(userData.UserType || "User"); // Set the user role

                const companyRef = userData.CompanyID;
                if (companyRef?.id) {
                    setCompanyRefState(companyRef); // store the company reference for later use
                    await refreshSecurityKeyIfExpired(companyRef.id);

                    const companySnap = await getDoc(doc(db, "Company", companyRef.id));
                    if (companySnap.exists()) {
                        const data = companySnap.data();
                        setCompanyInfo({
                            CompanyName: data.CompanyName || "",
                            members: data.CompanySize || "",
                            securityCode: data.SecurityKey || "",
                            description: data.CompDescription || "",
                            field: data.Industry || "",
                        });

                        // Fetch company members
                        setIsLoadingMembers(true);
                        try {
                            const membersQuery = query(
                                collection(db, "User"),
                                where("CompanyID", "==", companyRef)
                            );
                            const membersSnap = await getDocs(membersQuery);
                            const membersData = membersSnap.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));

                            // Sort members with managers at the top
                            const sortedMembers = membersData.sort((a, b) => {
                                if (a.UserType === "Manager" && b.UserType !== "Manager") return -1;
                                if (a.UserType !== "Manager" && b.UserType === "Manager") return 1;
                                return 0;
                            });

                            setCompanyMembers(sortedMembers);
                        } catch (error) {
                            console.error("Error fetching company members:", error);
                        } finally {
                            setIsLoadingMembers(false);
                        }
                    }

                    // Fetch projects for the company
                    const projectQuery = query(
                        collection(db, "Project"),
                        where("CompanyID", "==", companyRef)
                    );
                    const projectSnap = await getDocs(projectQuery);
                    const rawProjects = projectSnap.docs.map((doc) => ({
                        id: doc.id,
                        name: doc.data().ProjectName || "",
                        duration: doc.data().TimeEstimate || "",
                        status: doc.data().Status || "",
                        goals: doc.data().GoalsCount || 0,
                    }));
                    const uniqueProjectsMap = new Map();
                    rawProjects.forEach((proj) => {
                        if (!uniqueProjectsMap.has(proj.id)) {
                            uniqueProjectsMap.set(proj.id, proj);
                        }
                    });
                    setProjects([...uniqueProjectsMap.values()]);
                }
            }
        };

        fetchUserAndCompanyData();
    }, [location]);


    // Function to handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top of projects list
        document.querySelector('.projects-list').scrollIntoView({ behavior: 'smooth' });
    };

    const getStatusClass = (status) => {
        // Normalize the status by trimming and converting to lowercase for comparison
        const normalizedStatus = (status || "").trim().toLowerCase();

        if (normalizedStatus === "completed" || normalizedStatus === "مكتمل") {
            return "status-completed";
        } else if (normalizedStatus === "in progress" || normalizedStatus === "قيد التنفيذ") {
            return "status-inprogress";
        } else if (normalizedStatus === "not started" || normalizedStatus === "لم يبدأ") {
            return "status-notstarted";
        }

        // Fallback to default styling
        return "";
    };

    // Calculate pagination values
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    // Render pagination components
    const renderPagination = () => {
        const pageNumbers = [];

        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination">
                {currentPage > 1 && (
                    <button
                        className="page-button"
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        {t.previous}
                    </button>
                )}

                {pageNumbers.map(number => (
                    <button
                        key={number}
                        className={`page-button ${currentPage === number ? 'active' : ''}`}
                        onClick={() => handlePageChange(number)}
                    >
                        {number}
                    </button>
                ))}

                {currentPage < totalPages && (
                    <button
                        className="page-button"
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        {t.next}
                    </button>
                )}
            </div>
        );
    };

    const handleBusinessModelClick = async () => {
        if (!companyRefState) {
            navigate("/business-model");
            return;
        }
        try {
            const bmInputRef = collection(db, "BusinessModel_UserInput");
            const q = query(bmInputRef, where("CompanyID", "==", companyRefState));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // Assume the first matching document represents the company's BM_UserInput.
                const bmDoc = querySnapshot.docs[0];
                const modelField = bmDoc.data().ModelID;
                if (modelField) {
                    // If ModelID is a DocumentReference, get its id; if it's a string, use it directly.
                    const finalModelId = modelField.id ? modelField.id : modelField;
                    navigate("/business-model-result", { state: { model_id: finalModelId } });
                } else {
                    navigate("/business-model");
                }
            } else {
                navigate("/business-model");
            }
        } catch (error) {
            console.error("Error checking business model:", error);
            navigate("/business-model"); // fallback navigation
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Don't allow changing securityCode
        if (name === "securityCode") return;

        setCompanyInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    // Update the setSelectedSection function to reset security code visibility
    const handleSectionChange = (section) => {
        setSelectedSection(section);
        setMobileMenuOpen(false);

        // If leaving company profile, hide security code
        if (selectedSection === "company-profile" && section !== "company-profile") {
            setShowSecurityCode(false);
        }

        // If visiting company profile, mark as visited
        if (section === "company-profile") {
            setHasVisitedProfile(true);
        }
    };

    const handleEditClick = async () => {
        // Only allow Managers to edit
        if (userRole !== "Manager") {
            return;
        }

        if (isEditing) {
            try {
                setSaveStatus("saving");
                const userId = localStorage.getItem("userId");
                const userRef = doc(db, "User", userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const companyRef = userSnap.data().CompanyID;
                    if (companyRef?.id) {
                        await updateDoc(doc(db, "Company", companyRef.id), {
                            CompanySize: Number(companyInfo.members),
                            // Don't update SecurityKey
                            CompDescription: companyInfo.description,
                            Industry: companyInfo.field,
                            CompanyName: companyInfo.CompanyName,
                        });
                        setSaveStatus("success");
                        setTimeout(() => setSaveStatus(null), 3000);
                    }
                }
            } catch (error) {
                console.error("Error updating company information:", error);
                setSaveStatus("error");
                setTimeout(() => setSaveStatus(null), 3000);
            }
        }
        setIsEditing(!isEditing);
    };

    const handleViewDetails = (project_id) => {
        navigate("/goal-decomposing-result", { state: { project_id } });
    };

    // Update the toggle security code function
    const toggleSecurityCode = () => {
        // Only allow Managers to toggle security code visibility
        if (userRole === "Manager") {
            setShowSecurityCode(!showSecurityCode);
        }
    };

    // Update CSS for the toggle visibility button
    const toggleVisibilityStyles = {
        position: 'absolute',
        left: '10px', // Change from right to left
        top: '50%',
        transform: 'translateY(-50%)',
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const statusColors = {
        "قيد التنفيذ": "#FF9249",
        "متأخر": "#E63A46",
        "اختبار التشغيل": "#0F9DDB",
        "مكتمل": "#10C154",
    };

    const formatSecurityCode = (code) => {
        return showSecurityCode ? code : "•".repeat(code.length);
    };

    // Function to handle member pagination
    const paginateMembers = (pageNumber) => {
        setMemberCurrentPage(pageNumber);
    };

    // Function to handle sending messages to members
    const handleSendMessage = (email) => {
        // Implementation could be:
        // 1. Open a modal with a message form
        // 2. Navigate to a messaging page
        // 3. Open the default email client
        window.location.href = `mailto:${email}`;

        // Alternatively, you could show a modal:
        // setMessageModal({ open: true, recipient: email });
    };

    // Calculate pagination values for members
    const indexOfLastMember = memberCurrentPage * membersPerPage;
    const indexOfFirstMember = indexOfLastMember - membersPerPage;
    const currentMembers = companyMembers.slice(indexOfFirstMember, indexOfLastMember);
    const totalMemberPages = Math.ceil(companyMembers.length / membersPerPage);

    // function to translate status values
    const translateStatus = (status) => {
        if (!status) return t.undetermined;

        // Check if we have a translation for this status
        if (t.statusValues && t.statusValues[status]) {
            return t.statusValues[status];
        }

        // If no translation found, return the original status
        return status;
    };
    return (
        <div className="dashboard-container">
            {/*Header component with language toggle */}
            <Header
                showNotifications={true}
                showUserIcon={true}
                showMobileMenu={true} // Enable mobile menu toggle for Dashboard
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                showLanguageToggle={true}
                currentLanguage={language}
                onLanguageChange={handleLanguageChange}
            />

            <div className="content-wrapper">
                <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <ul>
                        <li
                            className={`sidebar-item ${selectedSection === "dashboard" ? "active" : ""}`}
                            onClick={() => {
                                handleSectionChange("dashboard");
                            }}
                        >
                            {t.dashboard}{" "}
                            <img className="sidebar-icon" alt="Dashboard Icon" src={DashBIcon} />
                        </li>
                        <li
                            className={`sidebar-item ${selectedSection === "projects" ? "active" : ""} mobile-projects`}
                            onClick={() => {
                                handleSectionChange("projects");
                            }}
                        >
                            {t.projects}{" "}
                            <img className="sidebar-icon" alt="Project Icon" src={ProjIcon} />
                        </li>
                        <li
                            className="sidebar-item"
                            onClick={() => {
                                navigate("/goal-decomposing");
                                setMobileMenuOpen(false);
                            }}
                        >
                            {t.newProject} <img className="sidebar-icon" alt="GD Icon" src={GDIcon} />
                        </li>
                        <li
                            className="sidebar-item"
                            onClick={() => {
                                handleBusinessModelClick();
                                setMobileMenuOpen(false);
                            }}
                        >
                            {t.businessModel} <img className="sidebar-icon" alt="BM Icon" src={BMIconD} />
                        </li>
                        <li
                            className={`sidebar-item ${selectedSection === "company-profile" ? "active" : ""}`}
                            onClick={() => {
                                handleSectionChange("company-profile");
                            }}
                        >
                            {t.companyProfile}{" "}
                            <img
                                className="sidebar-icon"
                                alt="File Icon"
                                src={CompanyFileIcon}
                            />
                        </li>
                    </ul>
                </div>

                <div className="main-content">
                    {selectedSection === "dashboard" && (
                        <div className="empty-dashboard">
                            <h1>{t.dashboard}</h1>
                            <div className="dashboard-placeholder">
                                <p>{t.comingSoon}</p>
                            </div>
                        </div>
                    )}

                    {selectedSection === "projects" && (
                        <div className="projects-container">
                            <h1 className="section-title">{t.existingProjects}</h1>

                            {/* Projects Stats Overview */}
                            {projects.length > 0 && (
                                <div className="project-overview-card">
                                    <div className="card-content">
                                        <div className="stat-box">
                                            <h3>{t.totalProjects}</h3>
                                            <p className="stat-value">{projects.length}</p>
                                        </div>
                                        <div className="stat-box">
                                            <h3>{t.ongoingProjects}</h3>
                                            <p className="stat-value">
                                                {projects.filter(p => p.status === "In Progress" || p.status === "قيد التنفيذ").length}
                                            </p>
                                        </div>
                                        <div className="stat-box">
                                            <h3>{t.completedProjects}</h3>
                                            <p className="stat-value">
                                                {projects.filter(p => p.status === "Completed" || p.status === "مكتمل").length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Projects Filter Controls */}
                            {projects.length > 0 && (
                                <div className="projects-filter">
                                    <div className="filter-group">
                                        <label>{t.filterByStatus}</label>
                                        <div className="filter-options">
                                            <button
                                                className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                                                onClick={() => handleFilterChange("all")}
                                            >
                                                {t.all}
                                            </button>
                                            <button
                                                className={`filter-btn ${activeFilter === "In Progress" || activeFilter === "قيد التنفيذ" ? "active" : ""}`}
                                                onClick={() => handleFilterChange("In Progress")}
                                            >
                                                {t.inProgress}
                                            </button>
                                            <button
                                                className={`filter-btn ${activeFilter === "Completed" || activeFilter === "مكتمل" ? "active" : ""}`}
                                                onClick={() => handleFilterChange("Completed")}
                                            >
                                                {t.completed}
                                            </button>
                                            <button
                                                className={`filter-btn ${activeFilter === "Not Started" || activeFilter === "لم يبدأ" ? "active" : ""}`}
                                                onClick={() => handleFilterChange("Not Started")}
                                            >
                                                {t.notStarted}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}


                            <div className="projects-list">
                                {filteredProjects.length > 0 ? (
                                    currentProjects.map((project) => (
                                        <div className="project-card" key={project.id}>
                                            <div className="project-header">
                                                <div className="project-title-area">
                                                    <h3>{project.name}</h3>
                                                    <span
                                                        className={`status-indicator ${project.status ? project.status.replace(/\s+/g, '-').toLowerCase() : ''}`}
                                                    ></span>
                                                </div>
                                            </div>
                                            <div className="project-details">
                                                <div className="project-info-group">
                                                    <div className="project-info-item">
                                                        <i className="fas fa-calendar-alt info-icon"></i>
                                                        <div className="info-content">
                                                            <span className="info-label">{t.duration}</span>
                                                            <span className="info-value">
                                                                {isLoadingMilestones && Date.now() - initialRenderTime <= 500 ? (
                                                                    <span className="loading-indicator small">{t.loading}</span>
                                                                ) : (
                                                                    getProjectDuration(project.id, project.duration || t.undetermined)
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="project-info-item">
                                                        <i className="fas fa-tasks info-icon"></i>
                                                        <div className="info-content">
                                                            <span className="info-label">{t.goals}</span>
                                                            <span className="info-value">
                                                                {isLoadingMilestones && Date.now() - initialRenderTime <= 500 ? (
                                                                    <span className="loading-indicator small">{t.loading}</span>
                                                                ) : (
                                                                    getMilestoneCount(project.id, project.goals || 0)
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="project-info-item">
                                                        <i className="fas fa-chart-line info-icon"></i>
                                                        <div className="info-content">
                                                            <span className="info-label">{t.status}</span>
                                                            <span className={`status-badge ${getStatusClass(project.status)}`}>
                                                                {translateStatus(project.status) || t.undetermined}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="project-actions">
                                                    <button
                                                        className="details-button"
                                                        onClick={() => handleViewDetails(project.id)}
                                                    >
                                                        <i className="fas fa-eye button-icon"></i>
                                                        {t.viewDetails}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-projects">
                                        <i className="fas fa-folder-open empty-icon"></i>
                                        <p>{activeFilter !== "all" ? `${t.noFilteredProjects} "${activeFilter}"` : t.noProjects}</p>
                                        <button
                                            className="create-project-btn"
                                            onClick={() => navigate("/goal-decomposing")}
                                        >
                                            {t.createNewProject}
                                        </button>
                                    </div>
                                )}
                            </div>
                            {filteredProjects.length > projectsPerPage && renderPagination()}
                        </div>
                    )}

                    {selectedSection === "company-profile" && (
                        <div className={`company-profile ${language === 'en' ? 'ltr-content' : ''}`}>
                            <h2 className="section-title">{t.companyProfile}</h2>
                            <div className="enhanced-profile-form">
                                {/* Company name (at the top) */}
                                <div className="profile-box company-name-box">
                                    <label>
                                        <FaBuilding className="label-icon" /> {t.companyName}
                                    </label>
                                    <div className="input-container">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="CompanyName"
                                                value={companyInfo.CompanyName}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}
                                            />
                                        ) : (
                                            <p className="info-display company-name" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                                                {companyInfo.CompanyName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Company description */}
                                <div className="profile-box">
                                    <label>
                                        <FaInfoCircle className="label-icon" /> {t.companyDescription}
                                    </label>
                                    <div className="input-container">
                                        {isEditing ? (
                                            <textarea
                                                name="description"
                                                value={companyInfo.description}
                                                onChange={handleInputChange}
                                                className="input-field textarea"
                                                rows="4"
                                                style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}
                                            ></textarea>
                                        ) : (
                                            <p className="info-display description" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                                                {companyInfo.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Company field (moved up) */}
                                <div className="profile-box">
                                    <label>
                                        <FaBriefcase className="label-icon" /> {t.companyField}
                                    </label>
                                    <div className="input-container">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="field"
                                                value={companyInfo.field}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}
                                            />
                                        ) : (
                                            <p className="info-display" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                                                {companyInfo.field}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Total members count */}
                                <div className="profile-box members-count-box">
                                    <label>
                                        <FaUsers className="label-icon" /> {t.totalEmployees}
                                    </label>
                                    <div className="input-container">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name="members"
                                                value={companyInfo.members}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                min="1"
                                                style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}
                                            />
                                        ) : (
                                            <p className="info-display" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                                                {companyInfo.members}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Registered members with pagination */}
                                <div className="profile-box members-box">
                                    <label>
                                        <FaUserFriends className="label-icon" /> {t.registeredEmployees} ({companyMembers.length})
                                    </label>
                                    <div className="input-container">
                                        <div className="members-count-container">
                                            {isLoadingMembers ? (
                                                <div className="members-loading"><FaSpinner className="fa-spin" /> {t.loading}</div>
                                            ) : (
                                                <>
                                                    <div className="members-list">
                                                        {currentMembers.length > 0 ? (
                                                            currentMembers.map((member) => (
                                                                <div key={member.id} className={`member-card ${member.UserType === "Manager" ? "manager-card" : ""}`}>
                                                                    <div className="member-avatar" style={{ marginRight: '15px', marginLeft: '0' }}>
                                                                        <FaUserCircle size={40} />
                                                                        {member.UserType === "Manager" && (
                                                                            <span className="manager-badge">{t.manager}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="member-info" style={{ textAlign: language === 'en' ? 'left' : 'right' }}>
                                                                        <h4>{member.FirstName} {member.LastName}</h4>
                                                                        <p className="member-email">{member.Email}</p>
                                                                    </div>
                                                                    <div className="member-actions">
                                                                        <button
                                                                            className="send-message-btn"
                                                                            onClick={() => handleSendMessage(member.Email)}
                                                                            aria-label="Send Message"
                                                                        >
                                                                            <FaEnvelope />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="no-members">
                                                                <FaUserSlash /> {t.noRegisteredMembers}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Pagination */}
                                                    {companyMembers.length > membersPerPage && (
                                                        <div className="pagination-container" style={{ flexDirection: language === 'en' ? 'row' : 'row-reverse' }}>
                                                            <button
                                                                onClick={() => paginateMembers(memberCurrentPage - 1)}
                                                                disabled={memberCurrentPage === 1}
                                                                className="pagination-btn"
                                                            >
                                                                {language === 'en' ? <FaChevronLeft /> : <FaChevronRight />}
                                                            </button>

                                                            <span className="page-info">
                                                                {t.page} {memberCurrentPage} {t.of} {totalMemberPages}
                                                            </span>

                                                            <button
                                                                onClick={() => paginateMembers(memberCurrentPage + 1)}
                                                                disabled={memberCurrentPage === totalMemberPages}
                                                                className="pagination-btn"
                                                            >
                                                                {language === 'en' ? <FaChevronRight /> : <FaChevronLeft />}
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Security code */}
                                <div className="profile-box security-box">
                                    <label>
                                        <FaShieldAlt className="label-icon" /> {t.securityCode}
                                    </label>
                                    <div className="input-container security-code-container">
                                        <p className="info-display security-code" style={{
                                            paddingLeft: language === 'en' ? '40px' : '15px',
                                            paddingRight: language === 'en' ? '15px' : '40px',
                                            direction: language === 'en' ? 'ltr' : 'rtl'
                                        }}>
                                            {formatSecurityCode(companyInfo.securityCode)}
                                        </p>
                                        {userRole === "Manager" && (
                                            <button
                                                className="toggle-visibility"
                                                type="button"
                                                onClick={toggleSecurityCode}
                                                style={{
                                                    left: language === 'en' ? '10px' : 'auto',
                                                    right: language === 'en' ? 'auto' : '10px'
                                                }}
                                                aria-label={showSecurityCode ? "Hide Code" : "Show Code"}
                                            >
                                                {showSecurityCode ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {userRole !== "Manager" && (
                                <div className="role-notice">
                                    <FaLock className="lock-icon" />
                                    <p>{t.managerOnly}</p>
                                </div>
                            )}

                            {/* Moved button container outside and to the bottom */}
                            <div className="profile-actions-container">
                                {userRole === "Manager" && (
                                    <button
                                        className={`update-button ${isEditing ? 'save' : 'edit'} ${saveStatus ? saveStatus : ''}`}
                                        onClick={handleEditClick}
                                    >
                                        {saveStatus === "saving" ? (
                                            <><FaSpinner className="fa-spin" style={{ marginRight: '8px' }} /> {t.saving}</>
                                        ) : saveStatus === "success" ? (
                                            <><FaCheckCircle style={{ marginRight: '8px' }} /> {t.saved}</>
                                        ) : saveStatus === "error" ? (
                                            <><FaTimesCircle style={{ marginRight: '8px' }} /> {t.saveFailed}</>
                                        ) : isEditing ? (
                                            <><FaSave style={{ marginRight: '8px' }} /> {t.saveChanges}</>
                                        ) : (
                                            <><FaEdit style={{ marginRight: '8px' }} /> {t.editData}</>
                                        )}
                                    </button>
                                )}

                                {isEditing && (
                                    <button
                                        className="cancel-button"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        <FaTimes style={{ marginRight: '8px' }} /> {t.cancel}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;