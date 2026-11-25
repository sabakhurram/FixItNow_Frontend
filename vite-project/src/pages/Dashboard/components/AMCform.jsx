import React, { useState } from "react";
import {
  ShieldCheck,
  User,
  Sun,
  Calendar,
  MapPin,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import "./AMCForms.css";

const AMCform = ({
  bookingData,
  handleBookingChange,
  handleSubmitBooking,
  setDashboardView
}) => {
  console.log("AMC FORM LOADED");
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [extraChargesAccepted, setExtraChargesAccepted] = useState(false);

  return (
    <div className="booking-card amc-form-card">
      <div className="booking-header">
        <span className="amc-eyebrow">
          <ShieldCheck size={13} />
          <span>ANNUAL MAINTENANCE CONTRACT</span>
        </span>
        <h2>Annual Maintenance Contract</h2>
        <p>
          Complete the information below to purchase your AMC plan.
        </p>
      </div>

      <form className="booking-form" onSubmit={handleSubmitBooking}>
        {/* Customer Information */}
        <div className="form-section">
          <div className="amc-section-title">
            <User size={17} />
            <h3>Customer Information</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={bookingData.name}
                onChange={handleBookingChange}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={bookingData.phone}
                onChange={handleBookingChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={bookingData.email}
                onChange={handleBookingChange}
              />
            </div>
          </div>
        </div>

        {/* Solar Installation */}
        <div className="form-section">
          <div className="amc-section-title">
            <Sun size={17} />
            <h3>Solar Installation</h3>
          </div>

          <div className="form-grid amc-grid-2">
            <div className="form-group">
              <label>Installation Type</label>
              <select
                name="installationType"
                value={bookingData.installationType}
                onChange={handleBookingChange}
              >
                <option value="">Select</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>

            <div className="form-group">
              <label>System Size</label>
              <select
                name="systemSize"
                value={bookingData.systemSize}
                onChange={handleBookingChange}
              >
                <option value="">Select</option>
                <option value="3kw">3 KW</option>
                <option value="5kw">5 KW</option>
                <option value="10kw">10 KW</option>
                <option value="15kw_plus">15 KW+</option>
                <option value="unknown">Don't Know</option>
              </select>
            </div>
          </div>
        </div>

        {/* AMC Plan */}
        <div className="form-section">
          <div className="amc-section-title">
            <ShieldCheck size={17} />
            <h3>Select AMC Plan</h3>
          </div>

          <div className="plan-grid">
            <label
              className={`plan-card ${
                bookingData.amcPlan === "basic" ? "plan-selected" : ""
              }`}
            >
              <div className="plan-card-top">
                <input
                  type="radio"
                  name="amcPlan"
                  value="basic"
                  checked={bookingData.amcPlan === "basic"}
                  onChange={handleBookingChange}
                />
                <h4>Basic Plan</h4>
              </div>

              <span className="plan-price">PKR 15,000 / Year</span>

              <ul>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>2 Maintenance Visits</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>Panel Cleaning</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>System Inspection</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>Battery Check</span>
                </li>
                <li className="amc-muted-item">
                  <XCircle size={15} className="amc-cross" />
                  <span>Priority Support</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>1 Performance Report</span>
                </li>
              </ul>
            </label>

            <label
              className={`plan-card featured ${
                bookingData.amcPlan === "premium" ? "plan-selected" : ""
              }`}
            >
              <div className="recommended-badge">MOST POPULAR</div>

              <div className="plan-card-top">
                <input
                  type="radio"
                  name="amcPlan"
                  value="premium"
                  checked={bookingData.amcPlan === "premium"}
                  onChange={handleBookingChange}
                />
                <h4>Premium Plan</h4>
              </div>

              <span className="plan-price">PKR 25,000 / Year</span>

              <ul>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>4 Maintenance Visits</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>Panel Cleaning</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>System Inspection</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>Battery Check</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>Priority Support</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>4 Performance Reports</span>
                </li>
              </ul>
            </label>

            <label
              className={`plan-card ${
                bookingData.amcPlan === "enterprise" ? "plan-selected" : ""
              }`}
            >
              <div className="plan-card-top">
                <input
                  type="radio"
                  name="amcPlan"
                  value="enterprise"
                  checked={bookingData.amcPlan === "enterprise"}
                  onChange={handleBookingChange}
                />
                <h4>Enterprise</h4>
              </div>

              <span className="plan-price">Custom Quote</span>

              <ul>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>Unlimited Visits</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>Priority Support</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>Emergency Visits</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>Dedicated Engineer</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="amc-check" />
                  <span>Unlimited Reports</span>
                </li>
              </ul>
            </label>
          </div>
        </div>

        {/* Contract Details */}
        <div className="form-section">
          <div className="amc-section-title">
            <Calendar size={17} />
            <h3>Contract Details</h3>
          </div>

          <div className="form-grid amc-grid-2">
            <div className="form-group">
              <label>Contract Duration</label>
              <input type="text" value="12 Months" readOnly />
            </div>

            <div className="form-group">
              <label>Contract Starts From</label>
              <input
                type="date"
                name="startDate"
                value={bookingData.startDate}
                onChange={handleBookingChange}
              />
            </div>
          </div>
        </div>

        {/* Service Location */}
        <div className="form-section">
          <div className="amc-section-title">
            <MapPin size={17} />
            <h3>Service Location</h3>
          </div>

          <div className="form-grid amc-grid-2">
            <div className="form-group">
              <label>Service Address</label>
              <input
                type="text"
                name="address"
                value={bookingData.address}
                onChange={handleBookingChange}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={bookingData.city}
                onChange={handleBookingChange}
              />
            </div>
          </div>
        </div>

        {/* Preferred Visit */}
        <div className="form-section">
          <div className="amc-section-title">
            <Clock size={17} />
            <h3>Preferred Maintenance Schedule</h3>
          </div>

          <div className="form-grid amc-grid-2">
            <div className="form-group">
              <label>Preferred Day</label>
              <select
                name="preferredDay"
                value={bookingData.preferredDay}
                onChange={handleBookingChange}
              >
                <option value="">Select</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
              </select>
            </div>

            <div className="form-group">
              <label>Preferred Time</label>
              <select
                name="preferredTime"
                value={bookingData.preferredTime}
                onChange={handleBookingChange}
              >
                <option value="">Select</option>
                <option value="morning">Morning (9-12)</option>
                <option value="afternoon">Afternoon (12-3)</option>
                <option value="evening">Evening (3-6)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="amc-section-title">
            <FileText size={17} />
            <h3>Additional Notes</h3>
          </div>

          <textarea
            name="notes"
            rows="5"
            placeholder="Anything our maintenance team should know?"
            value={bookingData.notes}
            onChange={handleBookingChange}
          />
        </div>

        {/* Agreement Section */}
        <div className="amc-section">
          <div className="amc-section-title">
            <ShieldCheck size={17} />
            <h3>Agreement & Confirmation</h3>
          </div>

          <div className="agreement-box">
            <label>
              <input
                type="checkbox"
                name="informationConfirmed"
                checked={bookingData.informationConfirmed}
                onChange={handleBookingChange}
              />
              <span>
                I confirm that the provided solar system information is correct.
              </span>
            </label>

            <label>
              <input
                type="checkbox"
                name="termsAccepted"
                checked={bookingData.termsAccepted}
                onChange={handleBookingChange}
              />
              <span>I agree to the AMC terms and conditions.</span>
            </label>

            <label>
              <input
                type="checkbox"
                name="chargesUnderstood"
                checked={bookingData.chargesUnderstood}
                onChange={handleBookingChange}
              />
              <span>
                I understand that additional charges may apply for replacement parts.
              </span>
            </label>
          </div>
        </div>

        {/* Purchase Summary */}
        <div className="amc-summary">
          <h3>AMC Purchase Summary</h3>

          <div className="summary-item">
            <span>Selected Plan</span>
            <strong className="amc-plan-cap">
              {bookingData.amcPlan || "Not Selected"}
            </strong>
          </div>

          <div className="summary-item">
            <span>Contract Duration</span>
            <strong>12 Months</strong>
          </div>

          <div className="summary-item">
            <span>Maintenance Visits</span>
            <strong>
              {bookingData.amcPlan === "Premium"
                ? "4 Visits / Year"
                : bookingData.amcPlan === "Basic"
                ? "2 Visits / Year"
                : "Customized"}
            </strong>
          </div>

          <div className="summary-item">
            <span>Priority Support</span>
            <strong>
              {bookingData.amcPlan === "Basic" ? "Not Included" : "Included"}
            </strong>
          </div>

          <div className="summary-total">
            <span>Total Amount</span>
            <strong>
              {bookingData.amcPlan === "Premium"
                ? "PKR 25,000"
                : bookingData.amcPlan === "Basic"
                ? "PKR 15,000"
                : "Contact Sales"}
            </strong>
          </div>
        </div>

        <div className="amc-actions">
          <button
            type="button"
            className="back-btn"
            onClick={() => setDashboardView("details")}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="activate-amc-btn"
            disabled={
              !bookingData.informationConfirmed ||
              !bookingData.termsAccepted ||
              !bookingData.chargesUnderstood
            }
          >
            <span>Activate AMC Contract</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AMCform;