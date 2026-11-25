import React from "react";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Clock3,
  BadgeCheck,
  CheckCircle2,
  Wrench,
  ShieldCheck,
  FileText,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import "./ServiceDetails.css";

const ServiceDetails = ({
  selectedService,
  services,
  serviceDetails,
  setDashboardView
}) => {
  if (!selectedService) {
    return (
      <div className="service-details-view">
        <div className="service-details-empty">
          <div className="service-details-empty-icon">
            <Sparkles size={28} />
          </div>
          <h2>Select a Service</h2>
          <p>Choose a solar service from the overview to view full details.</p>
          <button
            type="button"
            className="sd-back-btn"
            onClick={() => setDashboardView("services")}
          >
            <ArrowLeft size={16} />
            <span>Back to Services</span>
          </button>
        </div>
      </div>
    );
  }

  const service = services.find((item) => item.id === selectedService);
  const details = serviceDetails[selectedService];

  const handlePrimaryAction = () => {
    if (selectedService === "amc") {
      setDashboardView("amcplans");
    } else {
      setDashboardView("booking");
    }
  };

  return (
    <div className="service-details-view">
      {/* Top Bar */}
      <div className="sd-topbar">
        <button
          type="button"
          className="sd-back-btn"
          onClick={() => setDashboardView("services")}
        >
          <ArrowLeft size={16} />
          <span>Back to Services</span>
        </button>

        <span className="sd-eyebrow">
          <Sparkles size={13} />
          <span>SERVICE DETAILS</span>
        </span>
      </div>

      {/* Hero Presentation */}
      <div className="sd-hero">
        {service?.image && (
          <div className="sd-hero-media">
            <img
              src={service.image}
              alt={service.imageAlt || service.title}
            />
            {service?.badge && (
              <span className="sd-hero-badge">{service.badge}</span>
            )}
          </div>
        )}

        <div className="sd-hero-content">
          {service?.feature && (
            <span className="sd-category-pill">
              <BadgeCheck size={14} />
              <span>{service.feature}</span>
            </span>
          )}

          <h2>{service?.title}</h2>
          <p className="sd-hero-desc">{service?.description}</p>

          <div className="sd-hero-highlights">
            {(details?.duration || service?.duration) && (
              <div className="sd-highlight-chip">
                <Clock3 size={15} />
                <span>{details?.duration || service?.duration}</span>
              </div>
            )}

            {(details?.price || service?.price) && (
              <div className="sd-highlight-chip sd-highlight-accent">
                <ShieldCheck size={15} />
                <span>{details?.price || service?.price}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="sd-primary-cta"
            onClick={handlePrimaryAction}
          >
            <span>{selectedService === "amc" ? "Choose Plan" : "Book Now"}</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* Main Content + Booking / Pricing Panel */}
      <div className="sd-layout">
        <div className="sd-main-col">
          {/* OVERVIEW */}
          {details?.overview && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <FileText size={17} />
                <h3>Service Overview</h3>
              </div>
              <p className="sd-overview-text">{details.overview}</p>
            </div>
          )}

          {/* BENEFITS */}
          {details?.benefits?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <Sparkles size={17} />
                <h3>
                  {selectedService === "amc"
                    ? "Why Choose AMC?"
                    : "Why Book This Service?"}
                </h3>
              </div>

              {selectedService === "amc" ? (
                <div className="sd-benefits-grid">
                  {details.benefits.map((item, index) => (
                    <div className="sd-benefit-card" key={index}>
                      <div className="sd-benefit-icon">{item.icon}</div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="sd-check-list">
                  {details.benefits.map((item, index) => (
                    <li key={index}>
                      <CheckCircle2 size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* INCLUDED */}
          {details?.includes?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <CheckCircle2 size={17} />
                <h3>What's Included</h3>
              </div>
              <ul className="sd-check-list sd-check-grid">
                {details.includes.map((item, index) => (
                  <li key={index}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PROBLEMS */}
          {details?.problems?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <AlertCircle size={17} />
                <h3>Common Problems We Handle</h3>
              </div>
              <div className="sd-problem-grid">
                {details.problems.map((item, index) => (
                  <div className="sd-problem-card" key={index}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPAIR PROCESS */}
          {details?.repairProcess?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <Wrench size={17} />
                <h3>Repair Process</h3>
              </div>
              <ol className="sd-process-list">
                {details.repairProcess.map((item, index) => (
                  <li key={index}>
                    <span className="sd-step-num">{index + 1}</span>
                    <span className="sd-step-text">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* AMC MAINTENANCE PLANS */}
          {details?.maintenancePlans?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <ShieldCheck size={17} />
                <h3>Maintenance Plans</h3>
              </div>
              <div className="sd-maintenance-plans">
                {details.maintenancePlans.map((plan, index) => (
                  <div
                    className={`sd-plan-card ${
                      plan.recommended ? "sd-recommended-plan" : ""
                    }`}
                    key={index}
                  >
                    {plan.recommended && (
                      <div className="sd-recommended-badge">Recommended</div>
                    )}
                    <h4>{plan.name}</h4>
                    <span className="sd-plan-visits">{plan.visits}</span>
                    <p>{plan.description}</p>
                    <ul>
                      {plan.features.map((feature, i) => (
                        <li key={i}>
                          <CheckCircle2 size={14} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPARISON TABLE */}
          {details?.comparison?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <FileText size={17} />
                <h3>Plan Comparison</h3>
              </div>
              <div className="sd-comparison-wrapper">
                <table className="sd-amc-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Basic</th>
                      <th className="sd-premium-col">Premium</th>
                      <th>Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.comparison.map((row, index) => (
                      <tr key={index}>
                        <td>{row.feature}</td>
                        <td>{row.basic}</td>
                        <td className="sd-premium-col">{row.premium}</td>
                        <td>{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ELIGIBILITY */}
          {details?.eligibility?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <BadgeCheck size={17} />
                <h3>Eligibility</h3>
              </div>
              <ul className="sd-check-list sd-check-grid">
                {details.eligibility.map((item, index) => (
                  <li key={index}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* REQUIREMENTS */}
          {details?.requirements?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <FileText size={17} />
                <h3>What Customer Should Prepare</h3>
              </div>
              <ul className="sd-check-list">
                {details.requirements.map((item, index) => (
                  <li key={index}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* WARRANTY */}
          {details?.warranty?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <ShieldCheck size={17} />
                <h3>Warranty Support</h3>
              </div>
              <ul className="sd-check-list">
                {details.warranty.map((item, index) => (
                  <li key={index}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CHARGES */}
          {details?.charges?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <FileText size={17} />
                <h3>Service Charges</h3>
              </div>
              <ul className="sd-plain-list">
                {details.charges.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* TERMS */}
          {details?.terms?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <FileText size={17} />
                <h3>Terms & Conditions</h3>
              </div>
              <ul className="sd-plain-list">
                {details.terms.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* FAQ */}
          {details?.faq?.length > 0 && (
            <div className="sd-section-card">
              <div className="sd-section-title">
                <HelpCircle size={17} />
                <h3>Frequently Asked Questions</h3>
              </div>
              <div className="sd-faq-list">
                {details.faq.map((item, index) => (
                  <div className="sd-faq-item" key={index}>
                    <strong>{item.q}</strong>
                    <p>{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Booking & Pricing Panel */}
        <aside className="sd-booking-panel">
          <div className="sd-panel-header">
            <span className="sd-panel-label">BOOKING SUMMARY</span>
            <h3>{service?.title}</h3>
          </div>

          <div className="sd-panel-rows">
            {details?.duration && (
              <div className="sd-panel-row">
                <span>Duration</span>
                <strong>{details.duration}</strong>
              </div>
            )}

            {(details?.price || service?.price) && (
              <div className="sd-panel-row">
                <span>Charges</span>
                <strong className="sd-panel-price">
                  {details?.price || service?.price}
                </strong>
              </div>
            )}

            {details?.availability && (
              <div className="sd-panel-row">
                <span>Availability</span>
                <strong>{details.availability}</strong>
              </div>
            )}

            {details?.responseTime && (
              <div className="sd-panel-row">
                <span>Response Time</span>
                <strong>{details.responseTime}</strong>
              </div>
            )}

            {service?.feature && (
              <div className="sd-panel-row">
                <span>Team</span>
                <strong>{service.feature}</strong>
              </div>
            )}
          </div>

          <button
            type="button"
            className="book-now-btn"
            onClick={handlePrimaryAction}
          >
            <span>{selectedService === "amc" ? "Choose Plan" : "Book Now"}</span>
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="details-back-btn"
            onClick={() => setDashboardView("services")}
          >
            <ArrowLeft size={15} />
            <span>Back to Services</span>
          </button>
        </aside>
      </div>
    </div>
  );
};

export default ServiceDetails;