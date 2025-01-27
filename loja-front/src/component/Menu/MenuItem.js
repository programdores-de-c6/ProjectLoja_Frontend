// src/components/Menu/MenuItem.js
import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

const MenuItem = ({ icon, title, subItems, isMenuCollapsed }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (isMenuCollapsed) {
      setShowOverlay(!showOverlay);
    }
  };

  return (
    <div>
      <Nav.Link
        as={Link}
        to="#"
        className="text-dark mb-2 d-flex align-items-center"
        onClick={toggleExpand}
        style={{ cursor: "pointer", transition: "background-color 0.3s" }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
      >
        {icon}
        {!isMenuCollapsed && <span className="ms-2">{title}</span>}
        {!isMenuCollapsed && subItems && (
          <span className="ms-auto">
            {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
          </span>
        )}
      </Nav.Link>

      {!isMenuCollapsed && subItems && isExpanded && (
        <Nav className="flex-column ms-4">
          {subItems.map((subItem, index) => (
            <Nav.Link
              key={index}
              as={Link}
              to={subItem.path}
              className="text-dark mb-2"
              style={{ cursor: "pointer", transition: "background-color 0.3s" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            >
              {subItem.icon}
              <span className="ms-2">{subItem.title}</span>
            </Nav.Link>
          ))}
        </Nav>
      )}

      {isMenuCollapsed && showOverlay && subItems && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: "80px",
            width: "200px",
            height: "100%",
            backgroundColor: "white",
            boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
          }}
        >
          <Nav className="flex-column p-3">
            {subItems.map((subItem, index) => (
              <Nav.Link
                key={index}
                as={Link}
                to={subItem.path}
                className="text-dark mb-2"
                style={{ cursor: "pointer", transition: "background-color 0.3s" }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                {subItem.icon}
                <span className="ms-2">{subItem.title}</span>
              </Nav.Link>
            ))}
          </Nav>
        </div>
      )}
    </div>
  );
};

export default MenuItem;