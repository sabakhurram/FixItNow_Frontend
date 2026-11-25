import React from "react";
import {
  Sparkles,
  User,
  Home,
  Sun,
  Zap,
  Calendar,
  FileText,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import "./inspectionform.css";

const InspectionForm = ({
  selectedService,
  services,
  bookingData,
  handleBookingChange,
  setBookingData,
  setDashboardView,
  handleSubmitBooking
}) => {
  const activeServiceTitle = services.find(
    (service) => service.id === selectedService
  )?.title;

  return (
    <form
      className="booking-form-card inspection-form-card"
      onSubmit={handleSubmitBooking}
    >
      <div className="form-container">
        <div className="if-header">
          <div className="booking-header">
            <Sparkles size={14} />
            <span>BOOKING REQUEST</span>
          </div>

          <h2>{activeServiceTitle}</h2>
          <p>
            Please provide your details and our solar engineer will contact you.
          </p>
        </div>

        {/* Personal Information */}
        <div className="if-section">
          <div className="if-section-title">
            <User size={17} />
            <h3>Personal Information</h3>
          </div>

          <div className="if-grid">
            <div className="if-field">
              <label>
                Full Name <span className="if-required">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={bookingData.name}
                onChange={handleBookingChange}
              />
            </div>

            <div className="if-field">
              <label>
                Phone Number <span className="if-required">*</span>
              </label>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={bookingData.phone}
                onChange={handleBookingChange}
              />
            </div>

            <div className="if-field if-span-2">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={bookingData.email}
                onChange={handleBookingChange}
              />
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="if-section">
          <div className="if-section-title">
            <Home size={17} />
            <h3>Property Information</h3>
          </div>

          <div className="if-grid">
            <div className="if-field">
              <label>Property Type</label>
              <select
                name="propertyType"
                value={bookingData.propertyType}
                onChange={handleBookingChange}
              >
                <option value="">Property Type</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="commercial">Commercial Building</option>
                <option value="industrial">Industrial Building</option>
                <option value="farm">Farm</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="if-field">
              <label>Street Address</label>
              <input
                name="streetAddress"
                placeholder="Street Address"
                value={bookingData.streetAddress}
                onChange={handleBookingChange}
              />
            </div>

            <div className="if-field">
              <label>City</label>
              <input
                name="city"
                placeholder="City"
                value={bookingData.city}
                onChange={handleBookingChange}
              />
            </div>

            <div className="if-field">
              <label>Province / State</label>
              <input
                name="province"
                placeholder="Province / State"
                value={bookingData.province}
                onChange={handleBookingChange}
              />
            </div>

            <div className="if-field if-span-2">
              <label>Postal Code (Optional)</label>
              <input
                name="postalCode"
                placeholder="Postal Code (Optional)"
                value={bookingData.postalCode}
                onChange={handleBookingChange}
              />
            </div>
          </div>
        </div>

        {/* Roof Information */}
        <div className="if-section">
          <div className="if-section-title">
            <Sun size={17} />
            <h3>Roof Information</h3>
          </div>

          <div className="if-field">
            <label>Roof Type</label>
            <select
              name="roofType"
              value={bookingData.roofType}
              onChange={handleBookingChange}
            >
              <option>Roof Type</option>
              <option value="concrete">Concrete</option>
              <option value="metal">Metal</option>
              <option value="tile">Tile</option>
              <option value="flat">Flat Roof</option>
              <option value="sloped">Sloped Roof</option>
              <option value="other">Other</option>
            </select>
          </div>

          <label className="field-label">Roof Access</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="roofAccess"
                value="easy"
                checked={bookingData.roofAccess === "easy"}
                onChange={handleBookingChange}
              />
              <span>Easy</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="roofAccess"
                value="moderate"
                checked={bookingData.roofAccess === "moderate"}
                onChange={handleBookingChange}
              />
              <span>Moderate</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="roofAccess"
                value="difficult"
                checked={bookingData.roofAccess === "difficult"}
                onChange={handleBookingChange}
              />
              <span>Difficult</span>
            </label>
          </div>
        </div>

        {/* Electricity Information */}
        <div className="if-section">
          <div className="if-section-title">
            <Zap size={17} />
            <h3>Electricity Information</h3>
          </div>

          <div className="if-grid">
            <div className="if-field">
              <label>Average Monthly Electricity Bill (PKR)</label>
              <input
                type="number"
                name="electricityBill"
                placeholder="Average Monthly Electricity Bill (PKR)"
                value={bookingData.electricityBill}
                onChange={handleBookingChange}
              />
            </div>

            <div className="if-field">
              <label>Current Electricity Provider</label>
              <select
                name="electricityProvider"
                value={bookingData.electricityProvider}
                onChange={handleBookingChange}
              >
                <option value="">Current Electricity Provider</option>
                <option>LESCO</option>
                <option>IESCO</option>
                <option>FESCO</option>
                <option>K-Electric</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="if-field if-span-2">
              <label>Upload Latest Electricity Bill</label>
              <input
                type="file"
                name="electricityBillFile"
                accept="image/*,.pdf"
                onChange={(e) =>
                  setBookingData((prev) => ({
                    ...prev,
                    electricityBillFile: e.target.files[0]
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Preferred Schedule */}
        <div className="if-section">
          <div className="if-section-title">
            <Calendar size={17} />
            <h3>Preferred Schedule</h3>
          </div>

          <div className="if-grid">
            <div className="if-field">
              <label>
                Preferred Date <span className="if-required">*</span>
              </label>
              <input
                type="date"
                name="preferredDate"
                value={bookingData.preferredDate}
                onChange={handleBookingChange}
              />
            </div>

            <div className="if-field">
              <label>Preferred Time</label>
              <select
                name="preferredTime"
                value={bookingData.preferredTime}
                onChange={handleBookingChange}
              >
                <option value="">Preferred Time</option>
                <option value="9-11">9 AM - 11 AM</option>
                <option value="11-1">11 AM - 1 PM</option>
                <option value="2-4">2 PM - 4 PM</option>
                <option value="4-6">4 PM - 6 PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="if-section">
          <div className="if-section-title">
            <FileText size={17} />
            <h3>Additional Notes</h3>
          </div>

          <textarea
            name="notes"
            placeholder="Example: The roof was renovated last year."
            value={bookingData.notes}
            onChange={handleBookingChange}
          />
        </div>

        {/* Confirmation */}
        <div className="if-section">
          <div className="if-section-title">
            <h3>Confirmation</h3>
          </div>

          <div className="if-checkbox-list">
            <label className="checkbox-row">
              <input
                type="checkbox"
                name="informationConfirmed"
                checked={bookingData.informationConfirmed}
                onChange={(e) =>
                  setBookingData((prev) => ({
                    ...prev,
                    informationConfirmed: e.target.checked
                  }))
                }
              />
              <span>I confirm the provided information is accurate.</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={bookingData.termsAccepted}
                onChange={(e) =>
                  setBookingData((prev) => ({
                    ...prev,
                    termsAccepted: e.target.checked
                  }))
                }
              />
              <span>I agree to the inspection terms and conditions.</span>
            </label>
          </div>
        </div>

        <div className="booking-actions">
          <button
            type="button"
            className="back-btn"
            onClick={() => setDashboardView("details")}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <button type="submit" className="submit-booking-btn">
            <span>Submit Request</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default InspectionForm;