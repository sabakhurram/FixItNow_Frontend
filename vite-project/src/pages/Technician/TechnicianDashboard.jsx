import React, { useState, useEffect, useMemo } from "react";
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
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

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

/* ------------------------------------------------------------
   Small helpers (display only)
------------------------------------------------------------ */

const STATUS_COLORS = {
  assigned: "#F5A623",
  in_progress: "#2E7DD1",
  completed: "#06D6A0",
  other: "#B8BEC9"
};

const STATUS_LABELS = {
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  other: "Other"
};

const pad = (n) => String(n).padStart(2, "0");

const keyFromDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Turns a job date (plain date or ISO timestamp) into a local YYYY-MM-DD key
const toDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return keyFromDate(d);
};

const percent = (part, total) =>
  total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const JOB_STEPS = ["assigned", "in_progress", "completed"];

/* ------------------------------------------------------------
   Schedule calendar: month view with dots on days that have jobs
------------------------------------------------------------ */

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const ScheduleCalendar = ({ services, onViewDetails }) => {
  const today = new Date();
  const todayKey = keyFromDate(today);

  const [month, setMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const jobsByDate = useMemo(() => {
    const map = {};
    services.forEach((service) => {
      const key = toDateKey(service.preferredDate);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(service);
    });
    return map;
  }, [services]);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const monthLabel = month.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });

  const selectedJobs = jobsByDate[selectedKey] || [];
  const [sy, sm, sd] = selectedKey.split("-").map(Number);
  const selectedLabel = new Date(sy, sm - 1, sd).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short"
  });

  const goToToday = () => {
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedKey(todayKey);
  };

  return (
    <div className="schedule-calendar">
      <div className="calendar-head">
        <h3>Schedule</h3>

        <div className="calendar-nav">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
          >
            <ChevronLeft size={18} />
          </button>
          <span>{monthLabel}</span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} className="calendar-empty" />;

          const key = `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
          const jobs = jobsByDate[key] || [];
          const hasActive = jobs.some(
            (j) => j.status !== "completed" && j.status !== "cancelled"
          );

          return (
            <button
              type="button"
              key={key}
              onClick={() => setSelectedKey(key)}
              className={[
                "calendar-day",
                key === todayKey ? "is-today" : "",
                key === selectedKey ? "is-selected" : "",
                jobs.length ? "has-jobs" : ""
              ].join(" ")}
              aria-label={`${day} ${monthLabel}, ${jobs.length} jobs`}
              aria-pressed={key === selectedKey}
            >
              <span>{day}</span>
              {jobs.length > 0 && (
                <i className={hasActive ? "dot-active" : "dot-done"} />
              )}
            </button>
          );
        })}
      </div>

      <div className="calendar-day-list">
        <div className="calendar-day-list__head">
          <strong>{selectedLabel}</strong>
          <span>
            {selectedJobs.length} {selectedJobs.length === 1 ? "job" : "jobs"}
          </span>
          {selectedKey !== todayKey && (
            <button type="button" onClick={goToToday}>
              Today
            </button>
          )}
        </div>

        {selectedJobs.length === 0 ? (
          <p className="calendar-day-list__empty">No jobs scheduled for this day.</p>
        ) : (
          <ul>
            {selectedJobs.map((job) => (
              <li key={job.id}>
                <button type="button" onClick={() => onViewDetails(job)}>
                  <span className="calendar-job__time">
                    {job.preferredTime || "Flexible"}
                  </span>
                  <span className="calendar-job__info">
                    <strong>{job.title}</strong>
                    <small>{job.customerName}</small>
                  </span>
                  <span className={`status-badge ${job.status}`}>
                    {String(job.status).replace("_", " ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------
   Loading placeholders
------------------------------------------------------------ */

const DashboardSkeleton = () => (
  <div className="dash-skeleton" aria-busy="true" aria-label="Loading dashboard">
    <div className="skeleton-block skeleton-banner" />
    <div className="stats-grid">
      {[0, 1, 2, 3].map((i) => (
        <div className="skeleton-block skeleton-kpi" key={i} />
      ))}
    </div>
    <div className="dash-grid">
      <div className="skeleton-block skeleton-panel" />
      <div className="skeleton-block skeleton-panel" />
    </div>
  </div>
);

const ListSkeleton = () => (
  <>
    {[0, 1, 2].map((i) => (
      <div className="service-card skeleton-block skeleton-row" key={i} aria-hidden="true" />
    ))}
  </>
);

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

  /* ----------------------------------------------------------
     Values for the dashboard widgets (derived from your data)
  ---------------------------------------------------------- */

  const activeServices = useMemo(
    () => services.filter(s => s.status !== "completed" && s.status !== "cancelled"),
    [services]
  );

  const statusData = useMemo(() => {
    const counts = { assigned: 0, in_progress: 0, completed: 0, other: 0 };
    services.forEach((s) => {
      if (counts[s.status] !== undefined) counts[s.status] += 1;
      else counts.other += 1;
    });
    return Object.keys(counts)
      .filter((key) => counts[key] > 0)
      .map((key) => ({
        key,
        name: STATUS_LABELS[key],
        value: counts[key],
        color: STATUS_COLORS[key]
      }));
  }, [services]);

  const workloadData = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const key = keyFromDate(d);

      return {
        key,
        day: i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" }),
        jobs: activeServices.filter((s) => toDateKey(s.preferredDate) === key).length,
        isToday: i === 0
      };
    });
  }, [activeServices]);

  const ratingCounts = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: (Array.isArray(reviews) ? reviews : []).filter(
          (r) => Math.round(Number(r.rating)) === star
        ).length
      })),
    [reviews]
  );

  const todayKey = keyFromDate(new Date());
  const totalAssigned = stats.totalAssigned || services.length;
  const inProgressCount = stats.inProgressJobs || 0;
  const completedCount = stats.completedJobs || 0;
  const ratingValue = stats.averageRating || 5.0;
  const reviewCount = stats.totalReviews || reviews.length;
  const completionRate = percent(completedCount, totalAssigned);
  const urgentCount = activeServices.filter(
    (s) => String(s.urgency || "").toLowerCase() === "urgent"
  ).length;
  const todayCount = activeServices.filter(
    (s) => toDateKey(s.preferredDate) === todayKey
  ).length;
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  const showSkeleton = loading && services.length === 0;
  const chartTotal = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="technician-dashboard" data-theme="light">
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
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
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
            {activeServices.length > 0 && (
              <em className="nav-badge">{activeServices.length}</em>
            )}
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
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
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

          {/* Quick search: opens Assigned Services with your search text */}
          <form
            className="header-search"
            onSubmit={(e) => {
              e.preventDefault();
              setActiveTab("services");
              loadDashboardData();
            }}
          >
            <Search size={16} />
            <input
              type="text"
              placeholder="Search jobs, customers, tickets..."
              aria-label="Search jobs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="header-actions">
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
            showSkeleton ? (
              <DashboardSkeleton />
            ) : (
              <>
                {/* Welcome Banner */}
                <div className="welcome-section">
                  <div className="welcome-copy">
                    <span className="welcome-label">{todayLabel}</span>
                    <h2>{greeting()}, {technicianName}</h2>
                    <p>
                      You have <strong>{activeServices.length}</strong> active{" "}
                      {activeServices.length === 1 ? "job" : "jobs"}
                      {todayCount > 0 && <> · <strong>{todayCount}</strong> scheduled today</>}
                      {urgentCount > 0 && <> · <strong>{urgentCount}</strong> urgent</>}.
                    </p>
                    <button
                      type="button"
                      className="welcome-btn"
                      onClick={() => setActiveTab("services")}
                    >
                      View assigned jobs <ArrowRight size={16} />
                    </button>
                  </div>

                  <div
                    className="welcome-ring"
                    style={{ "--p": completionRate }}
                    role="img"
                    aria-label={`Completion rate ${completionRate} percent`}
                  >
                    <div>
                      <strong>{completionRate}%</strong>
                      <span>Completed</span>
                    </div>
                  </div>
                </div>

                {/* KPI Statistics Grid */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-card__top">
                      <div className="stat-icon tone-blue">
                        <ClipboardList size={20} />
                      </div>
                      <span>Total Assigned</span>
                    </div>
                    <strong>{totalAssigned}</strong>
                    <div className="stat-progress tone-blue">
                      <span style={{ width: `${totalAssigned ? 100 : 0}%` }} />
                    </div>
                    <small>{activeServices.length} still active</small>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card__top">
                      <div className="stat-icon tone-yellow">
                        <CircleDot size={20} />
                      </div>
                      <span>In Progress</span>
                    </div>
                    <strong>{inProgressCount}</strong>
                    <div className="stat-progress tone-yellow">
                      <span style={{ width: `${percent(inProgressCount, totalAssigned)}%` }} />
                    </div>
                    <small>{percent(inProgressCount, totalAssigned)}% of your jobs</small>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card__top">
                      <div className="stat-icon tone-green">
                        <CheckCircle2 size={20} />
                      </div>
                      <span>Completed</span>
                    </div>
                    <strong>{completedCount}</strong>
                    <div className="stat-progress tone-green">
                      <span style={{ width: `${completionRate}%` }} />
                    </div>
                    <small>{completionRate}% completion rate</small>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card__top">
                      <div className="stat-icon tone-gold">
                        <Star size={20} />
                      </div>
                      <span>Customer Rating</span>
                    </div>
                    <strong>{ratingValue} ★</strong>
                    <div className="stat-progress tone-gold">
                      <span style={{ width: `${(ratingValue / 5) * 100}%` }} />
                    </div>
                    <small>
                      {reviewCount > 0
                        ? `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
                        : "No reviews yet"}
                    </small>
                  </div>
                </div>

                <div className="dash-grid">
                  {/* ---------- Main column ---------- */}
                  <div className="dash-main">
                    <div className="dash-charts">
                      {/* Status breakdown (donut) */}
                      <div className="dash-card">
                        <div className="dash-card__head">
                          <h3>Job Status</h3>
                          <span>{chartTotal} total</span>
                        </div>

                        <div className="chart-donut">
                          <ResponsiveContainer width="100%" height={190}>
                            <PieChart>
                              <Pie
                                data={
                                  statusData.length
                                    ? statusData
                                    : [{ key: "none", name: "No jobs", value: 1, color: "#E6E8EC" }]
                                }
                                dataKey="value"
                                nameKey="name"
                                innerRadius="66%"
                                outerRadius="92%"
                                paddingAngle={statusData.length > 1 ? 3 : 0}
                                stroke="none"
                              >
                                {(statusData.length
                                  ? statusData
                                  : [{ key: "none", color: "#E6E8EC" }]
                                ).map((item) => (
                                  <Cell key={item.key} fill={item.color} />
                                ))}
                              </Pie>
                              {statusData.length > 0 && (
                                <Tooltip
                                  formatter={(value, name) => [value, name]}
                                  contentStyle={{
                                    borderRadius: 12,
                                    border: "1px solid rgba(10,14,26,0.1)",
                                    boxShadow: "0 12px 28px rgba(10,14,26,0.12)",
                                    fontSize: 12
                                  }}
                                />
                              )}
                            </PieChart>
                          </ResponsiveContainer>

                          <div className="chart-donut__center">
                            <strong>{chartTotal}</strong>
                            <span>Jobs</span>
                          </div>
                        </div>

                        <ul className="chart-legend">
                          {statusData.map((item) => (
                            <li key={item.key}>
                              <i style={{ background: item.color }} />
                              <span>{item.name}</span>
                              <strong>{item.value}</strong>
                            </li>
                          ))}
                          {statusData.length === 0 && (
                            <li className="chart-legend__empty">No jobs to show yet.</li>
                          )}
                        </ul>
                      </div>

                      {/* Workload for the next 7 days (bars) */}
                      <div className="dash-card">
                        <div className="dash-card__head">
                          <h3>Next 7 Days</h3>
                          <span>Active jobs per day</span>
                        </div>

                      

<div className="chart-bars">
    <ResponsiveContainer width="100%" height={230}>
        <BarChart
            data={workloadData}
            margin={{ top: 12, right: 4, left: 4, bottom: 0 }}
        >
            <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#5B6478" }}
            />

            <YAxis
                hide
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
            />

            <Tooltip
                cursor={{ fill: "rgba(245,166,35,0.10)" }}
                formatter={(value) => [value, "Jobs"]}
                contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(10,14,26,0.1)",
                    boxShadow: "0 12px 28px rgba(10,14,26,0.12)",
                    fontSize: 12
                }}
            />

            <Bar
                dataKey="jobs"
                radius={[8, 8, 0, 0]}
                maxBarSize={34}
            >
                {workloadData.map((d) => (
                    <Cell
                        key={d.key}
                        fill={d.isToday ? "#F5A623" : "#FFD166"}
                    />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
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
                            <CheckCircle2 size={36} className="icon-success" />
                            <h3>All Caught Up!</h3>
                            <p>You have no active pending jobs right now. Check back when Admin assigns new tickets.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ---------- Side column ---------- */}
                  <aside className="dash-side">
                    <div className="dash-card">
                      <ScheduleCalendar
                        services={services}
                        onViewDetails={(job) => setSelectedTicket(job)}
                      />
                    </div>

                    <div className="dash-card">
                      <div className="dash-card__head">
                        <h3>Customer Satisfaction</h3>
                        <button
                          type="button"
                          className="dash-card__link"
                          onClick={() => setActiveTab("reviews")}
                        >
                          All reviews
                        </button>
                      </div>

                      <div className="satisfaction-score">
                        <strong>{ratingValue}</strong>
                        <div>
                          <span className="stars-row">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                size={16}
                                className="star-icon"
                                fill={i <= Math.round(ratingValue) ? "currentColor" : "none"}
                              />
                            ))}
                          </span>
                          <small>
                            {reviewCount > 0
                              ? `Based on ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
                              : "No reviews yet"}
                          </small>
                        </div>
                      </div>

                      <ul className="rating-bars">
                        {ratingCounts.map(({ star, count }) => (
                          <li key={star}>
                            <span>{star} ★</span>
                            <span className="rating-bars__track">
                              <span
                                style={{
                                  width: `${percent(count, reviews.length)}%`
                                }}
                              />
                            </span>
                            <span>{count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </aside>
                </div>
              </>
            )
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
                {showSkeleton && <ListSkeleton />}

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

                {services.length === 0 && !showSkeleton && (
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
              <div className="section-heading">
                <div>
                  <span className="section-label">CLIENT RELATIONSHIPS</span>
                  <h2>My Customer Directory</h2>
                </div>
                <span className="customers-count">
                  {customers.length} total clients served
                </span>
              </div>

              <div className="tech-customers-grid">
                {customers.map((c, idx) => (
                  <div className="tech-customer-card" key={idx}>
                    <div className="customer-card-header">
                      <div className="customer-avatar-box">
                        {(c.name || "?").charAt(0).toUpperCase()}
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
                        <strong className="is-active">{c.activeServices}</strong>
                      </div>
                      <div className="stat-chip">
                        <span>Completed</span>
                        <strong className="is-done">{c.completedServices}</strong>
                      </div>
                    </div>

                    <button
                      className="btn-send-reminder btn-block"
                      onClick={() => handleOpenReminderModal(c)}
                    >
                      <Send size={14} /> Send Service Reminder
                    </button>
                  </div>
                ))}

                {customers.length === 0 && (
                  <div className="tech-empty-state tech-empty-state--wide">
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
              <div className="section-heading">
                <div>
                  <span className="section-label">RESOLVED JOBS</span>
                  <h2>Completed Service History</h2>
                </div>
              </div>

              <div className="services-list">
                {showSkeleton && <ListSkeleton />}

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

                {services.filter(s => s.status === "completed").length === 0 && !showSkeleton && (
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
                        className="star-icon"
                        fill={i <= Math.round(stats.averageRating || 5) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className="big-rating-count">
                    Based on {reviews?.length || 0} reviews
                  </span>
                </div>

                <div className="reviews-summary-text">
                  <h3>Customer Satisfaction Score</h3>
                  <p>
                    Verified feedback left by property owners after you complete solar panel inspection, maintenance, or inverter repair visits.
                  </p>
                </div>

                <ul className="rating-bars reviews-summary-bars">
                  {ratingCounts.map(({ star, count }) => (
                    <li key={star}>
                      <span>{star} ★</span>
                      <span className="rating-bars__track">
                        <span style={{ width: `${percent(count, reviews.length)}%` }} />
                      </span>
                      <span>{count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Review Cards List */}
              <div className="reviews-list">
                {(Array.isArray(reviews) ? reviews : []).map((r, i) => (
                  <div className="review-card-item" key={i}>
                    <div className="review-card-header">
                      <div className="review-card-who">
                        <span className="review-avatar" aria-hidden="true">
                          {(r.author_name || "C").charAt(0).toUpperCase()}
                        </span>
                        <span className="reviewer-name">{r.author_name || "Customer"}</span>
                        {r.service_type && (
                          <span className="review-type-tag">
                            {r.service_type.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="review-card-meta">
                        <div className="stars-row">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              size={14}
                              className="star-icon"
                              fill={s <= r.rating ? "currentColor" : "none"}
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
                    <Star size={36} className="icon-gold" />
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
              <button className="tech-modal-close" onClick={() => setReminderModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="tech-modal-body">
              {reminderSuccess && (
                <div className="tech-modal-success">
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

              <div className="tech-modal-grid">
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
              <button className="tech-modal-close" onClick={() => setCompleteModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="tech-modal-body">
              <p className="tech-modal-note">
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
              <button className="tech-modal-close" onClick={() => setSelectedTicket(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="tech-modal-body">
              <div className="tech-modal-ticketrow">
                <span>Ticket ID: {selectedTicket.ticketNumber}</span>
                <span className={`status-badge ${selectedTicket.status}`}>{selectedTicket.status.toUpperCase()}</span>
              </div>

              <div className="tech-modal-detail-box">
                <p><strong>Client:</strong> {selectedTicket.customerName}</p>
                <p><strong>Phone:</strong> {selectedTicket.customerPhone || "N/A"}</p>
                <p><strong>Email:</strong> {selectedTicket.customerEmail || "N/A"}</p>
                <p><strong>Address:</strong> {selectedTicket.address} {selectedTicket.city}</p>
                <p><strong>Date / Time:</strong> {selectedTicket.preferredDate} ({selectedTicket.preferredTime || "Flexible"})</p>
              </div>

              {selectedTicket.additionalNotes && (
                <div>
                  <label className="tech-input-label">Customer Problem / Service Notes</label>
                  <div className="tech-modal-detail-box">
                    {selectedTicket.additionalNotes}
                  </div>
                </div>
              )}

              {selectedTicket.resolutionNotes && (
                <div>
                  <label className="tech-input-label">Technician Resolution Notes</label>
                  <div className="tech-modal-detail-box is-success">
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
  const stepIndex = Math.max(0, JOB_STEPS.indexOf(service.status));
  const urgency = String(service.urgency || "standard");

  return (
    <div className="service-card">
      <div className="service-main">
        {/* <div className="service-icon">
          <Wrench size={20} />
        </div> */}

        <div className="service-info">
          <div className="service-title-row">
            <h3>{service.title}</h3>
            <span className={`status-badge ${service.status}`}>
              {String(service.status).replace("_", " ").toUpperCase()}
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
        <span className={`service-type ${urgency.toLowerCase()}`}>
          {urgency}
        </span>
      </div>

      {/* Job progress: assigned -> in progress -> completed */}
      <ol className="job-steps" aria-label="Job progress">
        {JOB_STEPS.map((step, i) => (
          <li
            key={step}
            className={i < stepIndex ? "is-done" : i === stepIndex ? "is-current" : ""}
          >
            <i />
            <span>{STATUS_LABELS[step]}</span>
          </li>
        ))}
      </ol>

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