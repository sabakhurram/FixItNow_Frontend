import React from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import "./BookingConfirmation.css";

const BookingConfirmation = ({
  latestBooking,
  setDashboardView
}) => {
  return (
    <div className="confirmation-card">
      <div className="confirmation-icon-wrap">
        <CheckCircle size={34} />
      </div>

      <h2>Booking Confirmed!</h2>

      <p>
        Your service request has been successfully submitted.
      </p>

      <div className="confirmation-details">
        <div className="confirmation-row">
          <span>Request ID</span>
          <strong>{latestBooking.id}</strong>
        </div>

        {latestBooking?.contractType && (
          <div className="confirmation-contract">
            <h3>AMC Contract Activated Successfully</h3>

            <div className="confirmation-grid">
              <div>
                <span>Plan</span>
                <strong>{latestBooking.contractType}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{latestBooking.contractStatus}</strong>
              </div>

              <div>
                <span>Start Date</span>
                <strong>{latestBooking.startDate}</strong>
              </div>

              <div>
                <span>Duration</span>
                <strong>{latestBooking.endDate}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="confirmation-row">
          <span>Service</span>
          <strong>{latestBooking.type}</strong>
        </div>

        <div className="confirmation-row">
          <span>Date</span>
          <strong>
            {new Date(latestBooking.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </strong>
        </div>

        <div className="confirmation-row">
          <span>Status</span>
          <strong className="confirmation-status-pill">{latestBooking.status}</strong>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDashboardView("services")}
      >
        <span>Go To Dashboard</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default BookingConfirmation;