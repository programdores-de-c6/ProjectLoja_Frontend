// src/components/InfoCard/InfoCard.js
import React from "react";
import { Card } from "react-bootstrap";

const InfoCard = ({ icon, title, value, bgColor }) => (
  <Card className="p-3">
    <div className="d-flex align-items-center">
      <div className={`me-3 bg-${bgColor} text-white rounded-circle p-3`}>
        {icon}
      </div>
      <div>
        <p className="mb-0">{title}</p>
        <h5>{value}</h5>
      </div>
    </div>
  </Card>
);

export default InfoCard;