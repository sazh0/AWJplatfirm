import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { TbLanguage } from "react-icons/tb";

import "./Header.css";
import AWJwithName from "./assets/AWJwithName.svg";
import NotificationIcon from "./NotificationIcon";

/**
 * Reusable Header Component
 * @param {Object} props
 * @param {boolean} props.showNotifications - Whether to show the notification icon
 * @param {boolean} props.showUserIcon - Whether to show the user icon
 * @param {Function} props.onUserIconClick - Function to call when user icon is clicked
 * @param {boolean} props.showMobileMenu - Whether to show the mobile menu toggle (for Dashboard)
 * @param {boolean} props.mobileMenuOpen - Mobile menu state (for Dashboard)
 * @param {Function} props.setMobileMenuOpen - Function to update mobile menu state (for Dashboard)
 * @param {boolean} props.showLanguageToggle - Whether to show the language toggle button
 * @param {string} props.currentLanguage - Current language (en or ar)
 * @param {Function} props.onLanguageChange - Function to call when language is changed
 */
const Header = ({
  showNotifications = true,
  showUserIcon = true,
  onUserIconClick,
  showMobileMenu = false,
  mobileMenuOpen,
  setMobileMenuOpen,
  showLanguageToggle = true,
  currentLanguage = "ar",
  onLanguageChange
}) => {
  const navigate = useNavigate();

  // Toggle mobile menu function
  const toggleMobileMenu = () => {
    if (setMobileMenuOpen) {
      setMobileMenuOpen(!mobileMenuOpen);
    }
  };

  // Handle logo click to navigate to homepage
  const handleLogoClick = () => {
    navigate("/");
  };

  // Handle language selection
  const handleLanguageSelect = (lang) => {
    if (onLanguageChange && lang !== currentLanguage) {
      onLanguageChange(lang);
    }
  };

  return (
    <header className="app-header">
      {/* Logo - now clickable and navigates to homepage */}
      <img
        className="logo-with-name"
        src={AWJwithName}
        alt="AWJ"
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }} // Add pointer cursor to indicate it's clickable
      />

      {/* Action buttons */}
      <div className="header-actions">
        {/* Mobile menu toggle button - only shown if showMobileMenu is true */}
        {showMobileMenu && (
          <div
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>
        )}

        {/* Language toggle button with hover dropdown */}
        {showLanguageToggle && (
          <button
            className="btn-secondary app-language-toggle"
            aria-label="Language selector"
          >
            <TbLanguage className="app-language-icon" />
            <div className="app-language-selector">
              <div
                className={`app-language-option ${currentLanguage === "en" ? "active" : ""}`}
                onClick={() => handleLanguageSelect("en")}
              >
                English
              </div>
              <div
                className={`app-language-option ${currentLanguage === "ar" ? "active" : ""}`}
                onClick={() => handleLanguageSelect("ar")}
              >
                العربية
              </div>
            </div>
          </button>
        )}

        {showNotifications && <NotificationIcon />}

        {showUserIcon && (
          <button
            className="btn-secondary"
            onClick={onUserIconClick || (() => navigate("/dashboard"))}
          >
            <i className="fas fa-user-circle"></i>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;