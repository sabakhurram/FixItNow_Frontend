import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Star,
  History,
  LogOut,
  Menu,
  X,
  MapPin,
  Clock3,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  ArrowRight,
  Wrench,
  Search,
  Filter,
  Send,
  Play,
  Check,
  Phone,
  Mail,
  Building2,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles
} from "lucide-react";

import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useAuth } from "../../contexts/AuthContext";
import NotificationBell from "../../components/common/NotificationBell";
import {
  fetchAssignedServices,
  updateAssignedServiceStatus,
  fetchTechnicianCustomers,
  sendServiceReminder,
  fetchTechnicianDashboardStats,
  fetchTechnicianReviews
} from "../../api/technicianApi";

import "./TechnicianDashboard.css";

const TechnicianDashboard = () => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'services' | 'customers' | 'history' | 'reviews'

  const technicianName = currentUser?.displayName || "Technician";

  // Data states
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    activeJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    inProgressJobs: 0,
    completionRate: 100,
    averageRating: 5.0,
    totalReviews: 0
  });
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Filtering & Sorting (Feature 6)
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [partsUsed, setPartsUsed] = useState("");
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  // Reminder Email Modal (Feature 4)
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderData, setReminderData] = useState({
    customer_email: "",
    customer_name: "",
    service_id: "",
    service_type: "inspection",
    reminder_type: "Upcoming Visit Reminder",
    scheduled_date: "",
    scheduled_time: "",
    custom_message: "",
    service_title: ""
  });
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState("");

  // Load all technician data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, servicesRes, customersRes, reviewsRes] = await Promise.all([
        fetchTechnicianDashboardStats().catch(() => ({})),
        fetchAssignedServices({
          type: typeFilter,
          status: statusFilter,
          urgency: urgencyFilter,
          sortBy,
          search: searchQuery
        }).catch(() => []),
        fetchTechnicianCustomers().catch(() => []),
        fetchTechnicianReviews().catch(() => [])
      ]);

      const reviewsList = Array.isArray(reviewsRes) ? reviewsRes : (reviewsRes?.reviews || []);
      const servicesList = Array.isArray(servicesRes) ? servicesRes : [];
      const customersList = Array.isArray(customersRes) ? customersRes : [];

      setStats(prev => ({
        ...prev,
        ...(statsRes || {}),
        ...(reviewsList.length > 0
          ? {
              totalReviews: reviewsList.length,
              averageRating: Number(
                (
                  reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) /
                  reviewsList.length
                ).toFixed(1)
              )
            }
          : {})
      }));

      setServices(servicesList);
      setCustomers(customersList);
      setReviews(reviewsList);
    } catch (err) {
      console.error("Error loading technician dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [typeFilter, statusFilter, urgencyFilter, sortBy]);

  // Handle Search submit / Enter
  const handleSearch = (e) => {
    e.preventDefault();
    loadDashboardData();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Feature 3: Status Transition (Start Job)
  const handleStartJob = async (service) => {
    try {
      await updateAssignedServiceStatus(service.serviceType, service.id, {
        status: "in_progress"
      });
      // Update local state
      setServices(prev =>
        prev.map(s => (s.id === service.id ? { ...s, status: "in_progress" } : s))
      );
      setStats(prev => ({
        ...prev,
        inProgressJobs: (prev.inProgressJobs || 0) + 1,
        activeJobs: (prev.activeJobs || 0)
      }));
    } catch (err) {
      alert("Failed to start job: " + err.message);
    }
  };

  // Feature 3: Status Transition (Complete Job with notes)
  const handleOpenCompleteModal = (service) => {
    setSelectedTicket(service);
    setCompletionNotes("");
    setPartsUsed("");
    setCompleteModalOpen(true);
  };

  const submitCompleteJob = async () => {
    if (!selectedTicket) return;
    setIsSubmittingComplete(true);
    try {
      await updateAssignedServiceStatus(selectedTicket.serviceType, selectedTicket.id, {
        status: "completed",
        resolution_notes: completionNotes,
        parts_used: partsUsed
      });
      setServices(prev =>
        prev.map(s =>
          s.id === selectedTicket.id
            ? { ...s, status: "completed", resolutionNotes: completionNotes, partsUsed }
            : s
        )
      );
      setStats(prev => ({
        ...prev,
        completedJobs: (prev.completedJobs || 0) + 1,
        inProgressJobs: Math.max(0, (prev.inProgressJobs || 1) - 1)
      }));
      setCompleteModalOpen(false);
    } catch (err) {
      alert("Failed to complete job: " + err.message);
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  // Feature 4: Open Reminder Modal
  const handleOpenReminderModal = (serviceOrCustomer) => {
    setReminderSuccess("");
    const isService = !!serviceOrCustomer.serviceType;
    setReminderData({
      customer_email: serviceOrCustomer.customerEmail || serviceOrCustomer.email || "",
      customer_name: serviceOrCustomer.customerName || serviceOrCustomer.name || "Customer",
      customer_id: serviceOrCustomer.userId || serviceOrCustomer.customerId || "",
      service_id: isService ? serviceOrCustomer.id : "",
      service_type: isService ? serviceOrCustomer.serviceType : "inspection",
      reminder_type: "Upcoming Visit Reminder",
      scheduled_date: isService ? serviceOrCustomer.preferredDate : "",
      scheduled_time: isService ? serviceOrCustomer.preferredTime : "",
      custom_message: "Our technical specialist will be arriving to inspect and service your solar equipment.",
      service_title: isService ? serviceOrCustomer.title : "Solar Service"
    });
    setReminderModalOpen(true);
  };

  const handleSendReminder = async () => {
    if (!reminderData.customer_email) {
      alert("Customer email is required.");
      return;
    }
    setIsSendingReminder(true);
    try {
      const res = await sendServiceReminder(reminderData);
      setReminderSuccess(res?.message || "Reminder processed successfully!");
      setTimeout(() => {
        setReminderModalOpen(false);
        setReminderSuccess("");
      }, 3000);
    } catch (err) {
      alert("Failed to send reminder email: " + err.message);
    } finally {
      setIsSendingReminder(false);
    }
  };

  return (
    <div className="technician-dashboard">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="technician-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`technician-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="technician-brand">
          <div className="brand-icon">
            <Wrench size={22} />
          </div>
          <div>
            <h2>FixItNow</h2>
            <span>Technician Portal</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <nav className="technician-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === "services" ? "active" : ""}`}
            onClick={() => { setActiveTab("services"); setSidebarOpen(false); }}
          >
            <ClipboardList size={19} />
            <span>Assigned Services</span>
          </button>

          <button
            className={`nav-item ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => { setActiveTab("customers"); setSidebarOpen(false); }}
          >
            <Users size={19} />
            <span>My Customers</span>
          </button>

          <button
            className={`nav-item ${activeTab === "history" ? "active" : ""}`}
            onClick={() => { setActiveTab("history"); setSidebarOpen(false); }}
          >
            <History size={19} />
            <span>Service History</span>
          </button>

          <button
            className={`nav-item ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => { setActiveTab("reviews"); setSidebarOpen(false); }}
          >
            <Star size={19} />
            <span>Customer Reviews</span>
          </button>
        </nav>

        <button className="technician-logout" onClick={handleLogout}>
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="technician-main">
        {/* Header with Global Notification Bell */}
        <header className="technician-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={23} />
          </button>

          <div className="header-title">
            <h1>
              {activeTab === "dashboard" && "Technician Overview"}
              {activeTab === "services" && "Assigned Service Tickets"}
              {activeTab === "customers" && "My Customer Directory"}
              {activeTab === "history" && "Completed Service History"}
              {activeTab === "reviews" && "Customer Ratings & Reviews"}
            </h1>
            <p>Manage on-site diagnostics, inspections, maintenance, and client communication.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Feature 8: Global In-App Notifications */}
            <NotificationBell />

            <div className="technician-profile">
              <div className="profile-avatar">
                {technicianName.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <strong>{technicianName}</strong>
                <span>Certified Field Engineer</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Views */}
        <section className="technician-content">
          {/* =========================================================
              VIEW 1: DASHBOARD OVERVIEW & STATS (FEATURE 5)
          ========================================================== */}
          {activeTab === "dashboard" && (
            <>
              {/* Welcome Banner */}
              <div className="welcome-section">
                <div>
                  <span className="welcome-label">SMART SOLAR FIELD PORTAL</span>
                  <h2>Welcome back, {technicianName}</h2>
                  <p>Here is your real-time operational status and customer schedule for today.</p>
                </div>
                <div className="welcome-icon">
                  <Wrench size={32} />
                </div>
              </div>

              {/* KPI Statistics Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: "rgba(2, 132, 199, 0.15)", color: "#0284c7" }}>
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <span>Total Assigned</span>
                    <strong>{stats.totalAssigned || services.length}</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                    <CircleDot size={22} />
                  </div>
                  <div>
                    <span>In Progress</span>
                    <strong>{stats.inProgressJobs || 0}</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <span>Completed</span>
                    <strong>{stats.completedJobs || 0}</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: "rgba(250, 204, 21, 0.15)", color: "#facc15" }}>
                    <Star size={22} />
                  </div>
                  <div>
                    <span>Customer Rating</span>
                    <strong>{stats.averageRating || 5.0} ★</strong>
                  </div>
                </div>
              </div>

              {/* Today's Active Work Section */}
              <div className="services-section">
                <div className="section-heading">
                  <div>
                    <span className="section-label">ACTIVE JOBS</span>
                    <h2>Current Queue</h2>
                  </div>
                  <button className="view-all-btn" onClick={() => setActiveTab("services")}>
                    View All Filtered <ArrowRight size={16} />
                  </button>
                </div>

                <div className="services-list">
                  {services.filter(s => s.status !== "completed" && s.status !== "cancelled").slice(0, 4).map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onStart={() => handleStartJob(service)}
                      onComplete={() => handleOpenCompleteModal(service)}
                      onReminder={() => handleOpenReminderModal(service)}
                      onViewDetails={() => setSelectedTicket(service)}
                    />
                  ))}

                  {services.filter(s => s.status !== "completed" && s.status !== "cancelled").length === 0 && (
                    <div className="tech-empty-state">
                      <CheckCircle2 size={36} color="#10b981" />
                      <h3>All Caught Up!</h3>
                      <p>You have no active pending jobs right now. Check back when Admin assigns new tickets.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              VIEW 2: ASSIGNED SERVICES (FEATURE 1, 3, 6)
          ========================================================== */}
          {activeTab === "services" && (
            <div>
              {/* Filter & Search Bar */}
              <div className="tech-filter-bar">
                <form className="tech-search-box" onSubmit={handleSearch}>
                  <Search size={16} className="tech-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by customer, phone, address, or ticket #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                <select
                  className="tech-filter-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Service Types</option>
                  <option value="inspection">Solar Inspections</option>
                  <option value="repair">System Repairs</option>
                  <option value="amc">AMC Contracts</option>
                </select>

                <select
                  className="tech-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  className="tech-filter-select"
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                  <option value="all">All Urgency</option>
                  <option value="urgent">Urgent</option>
                  <option value="medium">Medium</option>
                  <option value="standard">Standard / Low</option>
                </select>

                <select
                  className="tech-filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Sort: Date (Earliest)</option>
                  <option value="urgency">Sort: Urgency (Highest)</option>
                  <option value="status">Sort: Status</option>
                </select>
              </div>

              {/* Service Cards List */}
              <div className="services-list">
                {services.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onStart={() => handleStartJob(service)}
                    onComplete={() => handleOpenCompleteModal(service)}
                    onReminder={() => handleOpenReminderModal(service)}
                    onViewDetails={() => setSelectedTicket(service)}
                  />
                ))}

                {services.length === 0 && (
                  <div className="tech-empty-state">
                    <ClipboardList size={36} />
                    <h3>No Services Found</h3>
                    <p>No services match your active search and filter criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 3: MY CUSTOMERS DIRECTORY (FEATURE 2)
          ========================================================== */}
          {activeTab === "customers" && (
            <div>
              <div className="section-heading" style={{ marginBottom: "16px" }}>
                <div>
                  <span className="section-label">CLIENT RELATIONSHIPS</span>
                  <h2>My Customer Directory</h2>
                </div>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                  {customers.length} total clients served
                </span>
              </div>

              <div className="tech-customers-grid">
                {customers.map((c, idx) => (
                  <div className="tech-customer-card" key={idx}>
                    <div className="customer-card-header">
                      <div className="customer-avatar-box">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="customer-header-text">
                        <h3>{c.name}</h3>
                        <span>{c.propertyType || "Solar Asset Owner"}</span>
                      </div>
                    </div>

                    <div className="customer-contact-list">
                      {c.phone && (
                        <div className="contact-row">
                          <Phone size={14} />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="contact-row">
                          <Mail size={14} />
                          <span>{c.email}</span>
                        </div>
                      )}
                      {c.address && (
                        <div className="contact-row">
                          <MapPin size={14} />
                          <span>{c.address}{c.city ? `, ${c.city}` : ""}</span>
                        </div>
                      )}
                    </div>

                    <div className="customer-stats-pill">
                      <div className="stat-chip">
                        <span>Total Jobs</span>
                        <strong>{c.totalServices}</strong>
                      </div>
                      <div className="stat-chip">
                        <span>Active</span>
                        <strong style={{ color: "#38bdf8" }}>{c.activeServices}</strong>
                      </div>
                      <div className="stat-chip">
                        <span>Completed</span>
                        <strong style={{ color: "#4ade80" }}>{c.completedServices}</strong>
                      </div>
                    </div>

                    <button
                      className="btn-send-reminder"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleOpenReminderModal(c)}
                    >
                      <Send size={14} /> Send Service Reminder
                    </button>
                  </div>
                ))}

                {customers.length === 0 && (
                  <div className="tech-empty-state" style={{ gridColumn: "1/-1" }}>
                    <Users size={36} />
                    <h3>No Customers Yet</h3>
                    <p>When service requests are assigned to you by Admin, your clients will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 4: SERVICE HISTORY (FEATURE 5)
          ========================================================== */}
          {activeTab === "history" && (
            <div>
              <div className="section-heading" style={{ marginBottom: "16px" }}>
                <div>
                  <span className="section-label">RESOLVED JOBS</span>
                  <h2>Completed Service History</h2>
                </div>
              </div>

              <div className="services-list">
                {services.filter(s => s.status === "completed").map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onStart={() => {}}
                    onComplete={() => {}}
                    onReminder={() => handleOpenReminderModal(service)}
                    onViewDetails={() => setSelectedTicket(service)}
                  />
                ))}

                {services.filter(s => s.status === "completed").length === 0 && (
                  <div className="tech-empty-state">
                    <History size={36} />
                    <h3>No Completed History Yet</h3>
                    <p>Once you finish on-site jobs and mark them complete, they will be archived here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 5: CUSTOMER REVIEWS & RATINGS (FEATURE 7)
          ========================================================== */}
          {activeTab === "reviews" && (
            <div>
              {/* Rating Summary Card */}
              <div className="reviews-summary-card">
                <div className="big-rating-box">
                  <span className="big-rating-num">{stats.averageRating || 5.0}</span>
                  <div className="stars-row">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        size={18}
                        fill={i <= Math.round(stats.averageRating || 5) ? "#facc15" : "none"}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Based on {reviews?.length || 0} reviews
                  </span>
                </div>

                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#f8fafc" }}>
                    Customer Satisfaction Score
                  </h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", lineHeight: "1.5" }}>
                    Verified feedback left by property owners after you complete solar panel inspection, maintenance, or inverter repair visits.
                  </p>
                </div>
              </div>

              {/* Review Cards List */}
              <div className="reviews-list">
                {(Array.isArray(reviews) ? reviews : []).map((r, i) => (
                  <div className="review-card-item" key={i}>
                    <div className="review-card-header">
                      <div>
                        <span className="reviewer-name">{r.author_name || "Customer"}</span>
                        <span style={{ marginLeft: "8px", fontSize: "11px", color: "#0284c7", background: "rgba(2, 132, 199, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                          {r.service_type?.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "2px", color: "#facc15" }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              size={14}
                              fill={s <= r.rating ? "#facc15" : "none"}
                            />
                          ))}
                        </div>
                        <span className="review-date-badge">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="review-comment-text">{r.review_text || "No written comments provided."}</p>
                  </div>
                ))}

                {(!reviews || reviews.length === 0) && (
                  <div className="tech-empty-state">
                    <Star size={36} color="#facc15" />
                    <h3>No Reviews Received Yet</h3>
                    <p>After you complete services, customers receive a prompt to rate your field visit.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* =========================================================
          MODAL 1: SEND REMINDER EMAIL (FEATURE 4)
      ========================================================== */}
      {reminderModalOpen && (
        <div className="tech-modal-overlay">
          <div className="tech-modal-card">
            <div className="tech-modal-header">
              <h3>Send Reminder Email to Client</h3>
              <button className="tech-modal-close" onClick={() => setReminderModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="tech-modal-body">
              {reminderSuccess && (
                <div style={{ padding: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", borderRadius: "8px", fontSize: "13px" }}>
                  {reminderSuccess}
                </div>
              )}

              <div>
                <label className="tech-input-label">Customer Email</label>
                <input
                  type="email"
                  className="tech-modal-input"
                  value={reminderData.customer_email}
                  onChange={(e) => setReminderData({ ...reminderData, customer_email: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="tech-input-label">Reminder Purpose / Subject</label>
                <select
                  className="tech-modal-select"
                  value={reminderData.reminder_type}
                  onChange={(e) => setReminderData({ ...reminderData, reminder_type: e.target.value })}
                >
                  <option value="Upcoming Visit Reminder">Upcoming Visit Reminder</option>
                  <option value="Technician En-Route (Arriving Soon)">Technician En-Route (Arriving Soon)</option>
                  <option value="AMC Routine Maintenance Notice">AMC Routine Maintenance Notice</option>
                  <option value="Solar Safety & Access Confirmation">Solar Safety & Access Confirmation</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="tech-input-label">Target Date</label>
                  <input
                    type="date"
                    className="tech-modal-input"
                    value={reminderData.scheduled_date}
                    onChange={(e) => setReminderData({ ...reminderData, scheduled_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="tech-input-label">Time Window</label>
                  <input
                    type="text"
                    className="tech-modal-input"
                    placeholder="e.g. 10:00 AM - 12:00 PM"
                    value={reminderData.scheduled_time}
                    onChange={(e) => setReminderData({ ...reminderData, scheduled_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="tech-input-label">Message Details (Sent via Brevo)</label>
                <textarea
                  className="tech-modal-textarea"
                  value={reminderData.custom_message}
                  onChange={(e) => setReminderData({ ...reminderData, custom_message: e.target.value })}
                  placeholder="Enter details or site access instructions..."
                />
              </div>
            </div>

            <div className="tech-modal-footer">
              <button className="btn-modal-cancel" onClick={() => setReminderModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn-modal-submit"
                onClick={handleSendReminder}
                disabled={isSendingReminder}
              >
                {isSendingReminder ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                {isSendingReminder ? "Dispatching..." : "Send Reminder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: COMPLETE JOB WITH NOTES (FEATURE 3)
      ========================================================== */}
      {completeModalOpen && selectedTicket && (
        <div className="tech-modal-overlay">
          <div className="tech-modal-card">
            <div className="tech-modal-header">
              <h3>Complete Service Job: {selectedTicket.ticketNumber}</h3>
              <button className="tech-modal-close" onClick={() => setCompleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="tech-modal-body">
              <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>
                Customer: <strong>{selectedTicket.customerName}</strong> ({selectedTicket.address})
              </p>

              <div>
                <label className="tech-input-label">Resolution & Findings Notes</label>
                <textarea
                  className="tech-modal-textarea"
                  placeholder="Detail the work carried out (e.g., Inverter DC terminals replaced, array cleaned, voltage checked 380V)..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                />
              </div>

              <div>
                <label className="tech-input-label">Replacement Parts or Hardware Used</label>
                <input
                  type="text"
                  className="tech-modal-input"
                  placeholder="e.g. 1x 1000V DC Fuse, 2x MC4 Connectors"
                  value={partsUsed}
                  onChange={(e) => setPartsUsed(e.target.value)}
                />
              </div>
            </div>

            <div className="tech-modal-footer">
              <button className="btn-modal-cancel" onClick={() => setCompleteModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn-modal-submit"
                style={{ background: "#10b981" }}
                onClick={submitCompleteJob}
                disabled={isSubmittingComplete}
              >
                {isSubmittingComplete ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
                {isSubmittingComplete ? "Completing..." : "Confirm Job Completed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: TICKET FULL DETAILS
      ========================================================== */}
      {selectedTicket && !completeModalOpen && (
        <div className="tech-modal-overlay">
          <div className="tech-modal-card">
            <div className="tech-modal-header">
              <h3>{selectedTicket.title}</h3>
              <button className="tech-modal-close" onClick={() => setSelectedTicket(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="tech-modal-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>Ticket ID: {selectedTicket.ticketNumber}</span>
                <span className={`status-badge ${selectedTicket.status}`}>{selectedTicket.status.toUpperCase()}</span>
              </div>

              <div style={{ background: "#141b29", padding: "14px", borderRadius: "8px", fontSize: "13px" }}>
                <p style={{ margin: "4px 0" }}><strong>Client:</strong> {selectedTicket.customerName}</p>
                <p style={{ margin: "4px 0" }}><strong>Phone:</strong> {selectedTicket.customerPhone || "N/A"}</p>
                <p style={{ margin: "4px 0" }}><strong>Email:</strong> {selectedTicket.customerEmail || "N/A"}</p>
                <p style={{ margin: "4px 0" }}><strong>Address:</strong> {selectedTicket.address} {selectedTicket.city}</p>
                <p style={{ margin: "4px 0" }}><strong>Date / Time:</strong> {selectedTicket.preferredDate} ({selectedTicket.preferredTime || "Flexible"})</p>
              </div>

              {selectedTicket.additionalNotes && (
                <div>
                  <label className="tech-input-label">Customer Problem / Service Notes</label>
                  <div style={{ background: "#141b29", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#cbd5e1" }}>
                    {selectedTicket.additionalNotes}
                  </div>
                </div>
              )}

              {selectedTicket.resolutionNotes && (
                <div>
                  <label className="tech-input-label">Technician Resolution Notes</label>
                  <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#a7f3d0" }}>
                    {selectedTicket.resolutionNotes}
                  </div>
                </div>
              )}
            </div>

            <div className="tech-modal-footer">
              <button className="btn-modal-cancel" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Service Card Component
const ServiceCard = ({ service, onStart, onComplete, onReminder, onViewDetails }) => {
  return (
    <div className="service-card">
      <div className="service-main">
        <div className="service-icon">
          <Wrench size={20} />
        </div>

        <div className="service-info">
          <div className="service-title-row">
            <h3>{service.title}</h3>
            <span className={`status-badge ${service.status}`}>
              {service.status.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <p>Ticket: {service.ticketNumber}</p>
          <strong>{service.customerName}</strong>
        </div>
      </div>

      <div className="service-details">
        {service.city && (
          <div>
            <MapPin size={16} />
            <span>{service.city}</span>
          </div>
        )}
        {service.preferredDate && (
          <div>
            <CalendarDays size={16} />
            <span>{new Date(service.preferredDate).toLocaleDateString()}</span>
          </div>
        )}
        {service.preferredTime && (
          <div>
            <Clock3 size={16} />
            <span>{service.preferredTime}</span>
          </div>
        )}
        <span className={`service-type ${service.urgency.toLowerCase()}`}>
          {service.urgency}
        </span>
      </div>

      {/* Feature 3 Action Buttons */}
      <div className="card-actions-row">
        {service.status === "assigned" && (
          <button className="btn-start-job" onClick={onStart}>
            <Play size={14} /> Start Job
          </button>
        )}

        {service.status === "in_progress" && (
          <button className="btn-complete-job" onClick={onComplete}>
            <Check size={14} /> Complete Job
          </button>
        )}

        {service.status !== "completed" && (
          <button className="btn-send-reminder" onClick={onReminder}>
            <Send size={14} /> Send Reminder
          </button>
        )}

        <button className="btn-view-ticket" onClick={onViewDetails}>
          View Details <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
