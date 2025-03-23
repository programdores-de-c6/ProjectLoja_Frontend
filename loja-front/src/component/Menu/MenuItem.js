import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const MenuItem = ({ icon, title, subItems, isMenuCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSubItems = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Nav.Item>
        <Nav.Link onClick={toggleSubItems} className="d-flex align-items-center text-dark">
          {icon}
          {!isMenuCollapsed && <span className="ms-2">{title}</span>}
          {!isMenuCollapsed && subItems && (
            <span className="ms-auto">
              {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          )}
        </Nav.Link>
      </Nav.Item>
      {isOpen && subItems && (
        <Nav className="flex-column ms-3">
          {subItems.map((subItem, index) => (
            <Nav.Item key={index}>
              <Nav.Link href={subItem.path} className="d-flex align-items-center text-dark">
                {subItem.icon}
                <span className="ms-2">{subItem.title}</span>
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      )}
    </>
  );
};

export default MenuItem;