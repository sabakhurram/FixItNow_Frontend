import React from "react";
import { ArrowRight, Clock3, BadgeCheck } from "lucide-react";
import "./ServicesGrid.css";

const ServicesGrid = ({
  services,
  selectedService,
  handleServiceSelect,
}) => {
  return (
    <div className="services-section">
      <div className="services-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className={`dashboard-service-card ${
              selectedService === service.id ? "active" : ""
            } ${service.id === "amc" ? "featured-card" : ""}`}
            onClick={() => handleServiceSelect(service.id)}
          >
            <div className="service-card-media">
              {service.image && (
                <img
                  src={service.image}
                  alt={service.imageAlt || service.title}
                  loading="lazy"
                />
              )}
              <div className="service-media-overlay" aria-hidden="true" />

              <span className="service-badge">
                {service.badge}
              </span>

              <div className="service-icon" aria-hidden="true">
                {service.icon}
              </div>
            </div>

            <div className="service-card-body">
              <h3>{service.title}</h3>

              <p>{service.description}</p>

              <div className="service-meta">
                <div className="meta-item">
                  <Clock3 size={15} />
                  <span>{service.duration}</span>
                </div>

                <div className="meta-item">
                  <BadgeCheck size={15} />
                  <span>{service.feature}</span>
                </div>
              </div>

              <div className="service-footer">
                <span className="service-price">
                  {service.price}
                </span>

                <button
                  type="button"
                  className="details-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleServiceSelect(service.id);
                  }}
                >
                  <span>View Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesGrid;