import { useEffect, useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { getApiBaseUrl } from "../../../../config/apiConfig";
import {
  UserCog,
  Plus,
  Mail,
  ShieldCheck,
  X,
  Loader2,
  UserPlus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import "./Technician.css";
const getTechniciansApiUrl = () => getApiBaseUrl();
const Technician = () => {
  const { currentUser } = useAuth();

  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    display_name: "",
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await currentUser.getIdToken();

      const response = await fetch(`${getTechniciansApiUrl()}/users/technicians`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch technicians"
        );
      }

      setTechnicians(data.technicians || []);
    } catch (err) {
      console.error("Fetch technicians error:", err);
      setError(err.message || "Failed to load technicians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTechnicians();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.display_name.trim()) {
      setError("Please enter the technician's name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter the technician's email.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const token = await currentUser.getIdToken();

      const response = await fetch(`${getTechniciansApiUrl()}/users/technicians`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: formData.display_name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create technician"
        );
      }

      setSuccess("Technician created successfully.");

      setFormData({
        display_name: "",
        email: "",
        password: "",
      });

      await fetchTechnicians();

      setTimeout(() => {
        setShowForm(false);
        setSuccess("");
      }, 1200);
    } catch (err) {
      console.error("Create technician error:", err);
      setError(err.message || "Failed to create technician");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="technician-page">
      {/* Header */}
      <div className="technician-header">
        <div>
          <div className="technician-title-row">
            <UserCog size={24} />
            <h1>Technicians</h1>
          </div>

          <p>
            Manage technician accounts and access.
          </p>
        </div>

        <button
          className="add-technician-btn"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add Technician
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="technician-message error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="technician-message success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Technician count */}
      <div className="technician-summary">
        <div className="technician-summary-icon">
          <UserCog size={20} />
        </div>

        <div>
          <span>Total Technicians</span>
          <strong>{technicians.length}</strong>
        </div>
      </div>

      {/* Technician List */}
      <div className="technician-section">
        <div className="technician-section-header">
          <div>
            <h2>All Technicians</h2>
            <p>
              Technician accounts currently registered in FixItNow.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="technician-loading">
            <Loader2 size={24} className="spin" />
            <span>Loading technicians...</span>
          </div>
        ) : technicians.length === 0 ? (
          <div className="technician-empty">
            <UserPlus size={36} />
            <h3>No technicians yet</h3>
            <p>
              Add your first technician to get started.
            </p>

            <button
              className="add-technician-btn secondary"
              onClick={() => setShowForm(true)}
            >
              <Plus size={17} />
              Add Technician
            </button>
          </div>
        ) : (
          <div className="technician-table-wrapper">
            <table className="technician-table">
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {technicians.map((technician) => (
                  <tr key={technician.id}>
                    <td>
                      <div className="technician-user">
                        <div className="technician-avatar">
                          {technician.display_name
                            ?.charAt(0)
                            ?.toUpperCase() || "T"}
                        </div>

                        <div>
                          <strong>
                            {technician.display_name || "Unnamed"}
                          </strong>

                          <span>
                            Technician ID:{" "}
                            {technician.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="technician-email">
                        <Mail size={15} />
                        {technician.email}
                      </div>
                    </td>

                    <td>
                      <span className="technician-role">
                        <ShieldCheck size={14} />
                        Technician
                      </span>
                    </td>

                    <td>
                      {technician.created_at
                        ? new Date(
                            technician.created_at
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Technician Modal */}
      {showForm && (
        <div
          className="technician-modal-overlay"
          onClick={() => {
            if (!submitting) {
              setShowForm(false);
            }
          }}
        >
          <div
            className="technician-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="technician-modal-header">
              <div>
                <h2>Add Technician</h2>
                <p>
                  Create a new technician account.
                </p>
              </div>

              <button
                className="technician-close-btn"
                onClick={() => {
                  if (!submitting) {
                    setShowForm(false);
                  }
                }}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="technician-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label htmlFor="display_name">
                  Full Name
                </label>

                <input
                  id="display_name"
                  name="display_name"
                  type="text"
                  placeholder="Enter technician name"
                  value={formData.display_name}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="technician@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Temporary Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="technician-form-note">
                <ShieldCheck size={16} />
                <span>
                  This account will automatically be assigned the
                  Technician role.
                </span>
              </div>

              {error && (
                <div className="technician-form-error">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="technician-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-technician-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={17} className="spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={17} />
                      Create Technician
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Technician;