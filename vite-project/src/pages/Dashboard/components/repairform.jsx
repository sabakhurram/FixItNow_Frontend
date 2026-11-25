import React from "react";
import {
  Wrench,
  User,
  Sun,
  AlertCircle,
  Activity,
  Cpu,
  Battery,
  Upload,
  MapPin,
  Calendar,
  FileText,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import "./RepairForm.css";

const RepairForm = ({
  bookingData,
  handleBookingChange,
  setShowBookingForm,
  handleSubmitBooking,
  setDashboardView
}) => {
  return (
    <div className="booking-form-card repair-form-card">
      <div className="rf-header">
        <span className="rf-eyebrow">
          <Wrench size={13} />
          <span>SOLAR REPAIR REQUEST</span>
        </span>
        <h2>Repair Request</h2>
        <p>
          Tell us what is happening with your solar system so our certified technician can diagnose and fix it quickly.
        </p>
      </div>

      <form className="booking-form" onSubmit={handleSubmitBooking}>
        {/* Customer Information */}
        <div className="form-section">
          <div className="rf-section-title">
            <User size={17} />
            <h3>Customer Information</h3>
          </div>

          <div className="rf-grid">
            <div className="form-group">
              <label>
                Full Name <span className="rf-required">*</span>
              </label>
              <input
                name="name"
                placeholder="Enter full name"
                value={bookingData.name || ""}
                onChange={handleBookingChange}
              />
            </div>

            <div className="form-group">
              <label>
                Phone Number <span className="rf-required">*</span>
              </label>
              <input
                name="phone"
                placeholder="Enter phone number"
                value={bookingData.phone || ""}
                onChange={handleBookingChange}
              />
            </div>

            <div className="form-group rf-span-2">
              <label>
                Email <span className="rf-required">*</span>
              </label>
              <input
                name="email"
                placeholder="Enter email address"
                value={bookingData.email || ""}
                onChange={handleBookingChange}
              />
            </div>
          </div>
        </div>

        {/* Installation Details */}
        <div className="form-section">
          <div className="rf-section-title">
            <Sun size={17} />
            <h3>Solar Installation Details</h3>
          </div>

          <label className="field-label">Installation Type</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="installationType"
                value="residential"
                onChange={handleBookingChange}
              />
              <span>Residential</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="installationType"
                value="commercial"
                onChange={handleBookingChange}
              />
              <span>Commercial</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="installationType"
                value="industrial"
                onChange={handleBookingChange}
              />
              <span>Industrial</span>
            </label>
          </div>

          <div className="form-group">
            <label>System Size</label>
            <select name="systemSize" onChange={handleBookingChange}>
              <option value="">Select System Size</option>
              <option value="3kw">3 kW</option>
              <option value="5kw">5 kW</option>
              <option value="10kw">10 kW</option>
              <option value="15kw_plus">15+ kW</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        {/* Problem Information */}
        <div className="form-section">
          <div className="rf-section-title">
            <AlertCircle size={17} />
            <h3>Problem Information</h3>
          </div>

          <div className="rf-grid">
            <div className="form-group">
              <label>
                Issue Category <span className="rf-required">*</span>
              </label>
              <select name="issueCategory" onChange={handleBookingChange}>
                <option value="">Select Issue</option>
                <option value="inverter_issue">Inverter Issue</option>
                <option value="low_power_generation">Low Power Generation</option>
                <option value="no_power_output">No Power Output</option>
                <option value="solar_panel_damage">Solar Panel Damage</option>
                <option value="battery_issue">Battery Issue</option>
                <option value="electrical_wiring_problem">Electrical Wiring Problem</option>
                <option value="monitoring_app_problem">Monitoring App Problem</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>When Did The Problem Start?</label>
              <select name="problemStarted" onChange={handleBookingChange}>
                <option value="today">Today</option>
                <option value="few_days_ago">Few days ago</option>
                <option value="more_than_a_week">More than a week ago</option>
                <option value="not_sure">Not sure</option>
              </select>
            </div>

            <div className="form-group rf-span-2">
              <label>
                Problem Description <span className="rf-required">*</span>
              </label>
              <textarea
                name="problemDescription"
                placeholder="Describe the issue"
                onChange={handleBookingChange}
              />
            </div>
          </div>

          <label className="field-label">
            <Activity size={15} />
            <span>System Status</span>
          </label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="systemStatus"
                value="not_working"
                onChange={handleBookingChange}
              />
              <span>Completely Not Working</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="systemStatus"
                value="reduced_output"
                onChange={handleBookingChange}
              />
              <span>Working with Reduced Output</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="systemStatus"
                value="intermittent"
                onChange={handleBookingChange}
              />
              <span>Intermittent Problem</span>
            </label>
          </div>
        </div>

        {/* Equipment */}
        <div className="form-section">
          <div className="rf-section-title">
            <Cpu size={17} />
            <h3>Equipment Details</h3>
          </div>

          <div className="rf-grid">
            <div className="form-group">
              <label>Inverter Brand</label>
              <input
                name="inverterBrand"
                placeholder="Huawei / Sungrow / Growatt"
                onChange={handleBookingChange}
              />
            </div>

            <div className="form-group">
              <label>Inverter Error Code</label>
              <input
                name="errorCode"
                placeholder="Example E05"
                onChange={handleBookingChange}
              />
            </div>
          </div>
        </div>

        {/* Battery Details */}
        <div className="form-section">
          <div className="rf-section-title">
            <Battery size={17} />
            <h3>Battery Details</h3>
          </div>

          <label className="field-label">Battery Installed?</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="batteryInstalled"
                value="true"
                checked={bookingData.batteryInstalled === "true"}
                onChange={handleBookingChange}
              />
              <span>Yes</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="batteryInstalled"
                value="false"
                checked={bookingData.batteryInstalled === "false"}
                onChange={handleBookingChange}
              />
              <span>No</span>
            </label>
          </div>

          {bookingData.batteryInstalled === "true" && (
            <div className="rf-grid rf-battery-fields">
              <div className="form-group rf-span-2">
                <label className="field-label">Battery Brand</label>
                <select
                  name="batteryBrand"
                  value={bookingData.batteryBrand}
                  onChange={handleBookingChange}
                >
                  <option value="">Select Battery Brand</option>
                  <option>Tesla</option>
                  <option>Huawei</option>
                  <option>Dyness</option>
                  <option>PylonTech</option>
                  <option>Growatt</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group rf-span-2">
                <label className="field-label">Battery Issue Description</label>
                <textarea
                  name="batteryIssue"
                  value={bookingData.batteryIssue}
                  onChange={handleBookingChange}
                  placeholder="Describe the battery problem..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Upload */}
        <div className="form-section">
          <div className="rf-section-title">
            <Upload size={17} />
            <h3>Upload Evidence</h3>
          </div>

          <div className="rf-grid">
            <label className="file-upload">
              <span>Upload Photos (Optional)</span>
              <input
                type="file"
                multiple
                name="images"
                onChange={handleBookingChange}
              />
            </label>

            <label className="file-upload">
              <span>Upload Video (Optional)</span>
              <input
                type="file"
                accept="video/*"
                name="video"
                onChange={handleBookingChange}
              />
            </label>
          </div>
        </div>

        {/* Location & Visit */}
        <div className="form-section">
          <div className="rf-section-title">
            <MapPin size={17} />
            <h3>Location Details</h3>
          </div>

          <div className="rf-grid">
            <div className="form-group">
              <label>
                Service Address <span className="rf-required">*</span>
              </label>
              <input
                name="serviceAddress"
                placeholder="Service Address"
                onChange={handleBookingChange}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                name="city"
                placeholder="City"
                onChange={handleBookingChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="rf-section-title">
            <Calendar size={17} />
            <h3>Technician Visit Preference</h3>
          </div>

          <div className="rf-grid">
            <div className="form-group">
              <label>Preferred Date</label>
              <input
                type="date"
                name="preferredDate"
                onChange={handleBookingChange}
              />
            </div>

            <div className="form-group">
              <label>
                Preferred Time <span className="rf-required">*</span>
              </label>
              <select name="preferredTime" onChange={handleBookingChange}>
                <option value="">Preferred Time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="rf-section-title">
            <FileText size={17} />
            <h3>Additional Notes</h3>
          </div>

          <textarea
            name="notes"
            placeholder="Anything else technician should know?"
            onChange={handleBookingChange}
          />
        </div>

        <div className="form-section">
          <div className="rf-section-title">
            <h3>Confirmation</h3>
          </div>

          <div className="rf-checkbox-list">
            <label className="checkbox-row">
              <input
                type="checkbox"
                name="informationConfirmed"
                checked={bookingData.informationConfirmed}
                onChange={handleBookingChange}
              />
              <span>I confirm information is correct.</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={bookingData.termsAccepted}
                onChange={handleBookingChange}
              />
              <span>I agree additional charges may apply after diagnosis.</span>
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

          <button className="submit-booking-btn" type="submit">
            <span>Submit Repair Request</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default RepairForm;