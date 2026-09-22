
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  User,
  LogOut,
  Menu,
  X,
  MapPin,
  Clock3,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  ArrowRight,
  Wrench,
} from "lucide-react";

import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useAuth } from "../../contexts/AuthContext";

import "./TechnicianDashboard.css";

const TechnicianDashboard = () => {
  const { currentUser } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const technicianName =
    currentUser?.displayName || "Technician";

  const services = [
    {
      id: "#SRV-1042",
      title: "Solar Panel Inspection",
      customer: "Ahmed Khan",
      location: "Islamabad",
      type: "Local",
      date: "Today",
      time: "10:00 AM",
      status: "Assigned",
    },
    {
      id: "#SRV-1043",
      title: "Solar System Maintenance",
      customer: "Hassan Ali",
      location: "Lahore",
      type: "Outstation",
      date: "Today",
      time: "02:00 PM",
      status: "In Progress",
    },
    {
      id: "#SRV-1044",
      title: "Inverter Inspection",
      customer: "Usman Ahmed",
      location: "Rawalpindi",
      type: "Local",
      date: "Tomorrow",
      time: "11:30 AM",
      status: "Pending",
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="technician-dashboard">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="technician-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`technician-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        <div className="technician-brand">
          <div className="brand-icon">
            <Wrench size={22} />
          </div>

          <div>
            <h2>FixItNow</h2>
            <span>Technician Portal</span>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="technician-nav">

          <button className="nav-item active">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button className="nav-item">
            <ClipboardList size={19} />
            <span>My Services</span>
          </button>

          <button className="nav-item">
            <CalendarDays size={19} />
            <span>Schedule</span>
          </button>

          <button className="nav-item">
            <User size={19} />
            <span>Profile</span>
          </button>

        </nav>

        <button
          className="technician-logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>

      </aside>

      {/* Main Content */}
      <main className="technician-main">

        {/* Header */}
        <header className="technician-header">

          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={23} />
          </button>

          <div className="header-title">
            <h1>Dashboard</h1>
            <p>Manage your assigned services and schedule.</p>
          </div>

          <div className="technician-profile">

            <div className="profile-avatar">
              {technicianName.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">
              <strong>{technicianName}</strong>
              <span>Technician</span>
            </div>

          </div>

        </header>

        {/* Dashboard Content */}
        <section className="technician-content">

          {/* Welcome */}
          <div className="welcome-section">
            <div>
              <span className="welcome-label">
                TECHNICIAN PORTAL
              </span>

              <h2>
                Welcome back, {technicianName}
              </h2>

              <p>
                Here's an overview of your assigned services.
              </p>
            </div>

            <div className="welcome-icon">
              <Wrench size={32} />
            </div>
          </div>

          {/* Statistics */}
          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon">
                <ClipboardList size={21} />
              </div>

              <div>
                <span>Assigned</span>
                <strong>08</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <CircleDot size={21} />
              </div>

              <div>
                <span>In Progress</span>
                <strong>02</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Completed</span>
                <strong>24</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <AlertCircle size={21} />
              </div>

              <div>
                <span>Pending</span>
                <strong>04</strong>
              </div>
            </div>

          </div>

          {/* Services */}
          <div className="services-section">

            <div className="section-heading">

              <div>
                <span className="section-label">
                  WORK ASSIGNMENTS
                </span>

                <h2>Today's Services</h2>
              </div>

              <button className="view-all-btn">
                View All
                <ArrowRight size={16} />
              </button>

            </div>

            <div className="services-list">

              {services.map((service) => (

                <div
                  className="service-card"
                  key={service.id}
                >

                  <div className="service-main">

                    <div className="service-icon">
                      <Wrench size={20} />
                    </div>

                    <div className="service-info">

                      <div className="service-title-row">

                        <h3>{service.title}</h3>

                        <span
                          className={`status-badge ${service.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {service.status}
                        </span>

                      </div>

                      <p>
                        Service ID: {service.id}
                      </p>

                      <strong>
                        {service.customer}
                      </strong>

                    </div>

                  </div>

                  <div className="service-details">

                    <div>
                      <MapPin size={16} />
                      <span>{service.location}</span>
                    </div>

                    <div>
                      <CalendarDays size={16} />
                      <span>{service.date}</span>
                    </div>

                    <div>
                      <Clock3 size={16} />
                      <span>{service.time}</span>
                    </div>

                    <span
                      className={`service-type ${service.type
                        .toLowerCase()}`}
                    >
                      {service.type}
                    </span>

                  </div>

                  <button className="service-action">
                    View Details
                    <ArrowRight size={16} />
                  </button>

                </div>

              ))}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default TechnicianDashboard;

