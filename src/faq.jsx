import React, { useState, useRef } from "react";
import "./faq.css";

const FAQ = ({ faq, language = "ar" }) => {
  // Store only the currently open item ID (or null if none open)
  const [activeItem, setActiveItem] = useState(null);

  // Create refs object to store references to answer elements
  const answerRefs = useRef({});

  const toggleItem = (id) => {
    // If the clicked item is already open, close it
    // Otherwise, set it as the active item (and close any previously open item)
    setActiveItem(activeItem === id ? null : id);
  };

  // Add language-specific classes
  const isRTL = language === "ar";
  const directionClass = isRTL ? "rtl-text" : "ltr-text";

  return (
    <div className={`faq-container ${directionClass}`}>
      <div className="faq-list">
        {faq.map((item) => {
          // Calculate dynamic styles for smooth height animation
          const isActive = activeItem === item.f_id;
          const answerStyle = isActive
            ? { maxHeight: answerRefs.current[item.f_id]?.scrollHeight + 'px' || '1000px' }
            : { maxHeight: '0px' };

          return (
            <div
              key={item.f_id}
              className={`faq-item ${isActive ? 'open' : ''}`}
            >
              <div
                className="faq-question-container"
                onClick={() => toggleItem(item.f_id)}
              >
                <div className="faq-question">{item.f_question}</div>
                <div className="faq-toggle">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: `rotate(${isActive ? 180 : 0}deg)` }}
                    className="chevron-icon"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              <div
                className={`faq-answer ${isActive ? 'expanded' : ''}`}
                style={answerStyle}
                ref={el => answerRefs.current[item.f_id] = el}
              >
                <div className="faq-answer-content">
                  {item.f_answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;