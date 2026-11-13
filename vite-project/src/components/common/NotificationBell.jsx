import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Info, AlertTriangle, Wrench, ShieldAlert } from "lucide-react";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../api/notificationApi";
import { useAuth } from "../../contexts/AuthContext";
import "./NotificationBell.css";

const NotificationBell = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      const list = await fetchNotifications();
      setNotifications(list);
    } catch (err) {
      console.warn("Could not load notifications:", err.message);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "assignment":
        return <Wrench size={16} className="notif-icon notif-assignment" />;
      case "warning":
        return <AlertTriangle size={16} className="notif-icon notif-warning" />;
      case "status_change":
        return <ShieldAlert size={16} className="notif-icon notif-status" />;
      default:
        return <Info size={16} className="notif-icon notif-info" />;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMin = Math.floor((now - date) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (!currentUser) return null;

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <div className="notif-title-row">
              <h4>Notifications</h4>
              {unreadCount > 0 && <span className="unread-tag">{unreadCount} new</span>}
            </div>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={handleMarkAllRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={24} className="empty-bell" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`notif-item ${!item.is_read ? "unread" : ""}`}
                  onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                >
                  <div className="notif-icon-box">{getTypeIcon(item.type)}</div>
                  <div className="notif-body">
                    <div className="notif-item-header">
                      <span className="notif-item-title">{item.title}</span>
                      <span className="notif-time">{formatTime(item.created_at)}</span>
                    </div>
                    <p className="notif-message">{item.message}</p>
                  </div>
                  {!item.is_read && <span className="unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

