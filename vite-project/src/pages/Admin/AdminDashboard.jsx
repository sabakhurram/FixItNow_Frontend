import "./AdminDashboard.css";
import logo from "../../assets/FixItNow Logo.png";
import StatCard from "./components/overview/StatCard";
import SalesChart from "./components/overview/SalesChart";
import CustomerChart from "./components/overview/CustomerChart";
import ServiceChart from "./components/overview/ServiceChart";
import RecentActivity from "./components/overview/RecentActivity";
import Technician from "./components/Technicians/Technician";
import { useState,useEffect } from "react";
import { getOverview } from "../../api/overviewService";
import CustomerPage from "./components/Customers/CustomerPage";
import ProductPage from "./components/Products/ProductPage";
import ServicePage from "./components/Services/ServicePage";
import OrderPage from "./components/orders/OrderPage";
import ReviewPage from "./components/reviews/ReviewPage";
import { fetchSalesSummary } from "../../api/orderApi";

import NotificationDropdown from "./components/overview/NotificationDropdown";
import {doSignOut } from "../../firebase/auth";
import { broadcastGlobalNotification } from "../../api/notificationApi";
import {
    LayoutDashboard,
    Users,
    Package,
    Wrench,
    UserCog,
    Settings,
    LogOut,
    Menu, Search, Bell, CircleDollarSign,
    ShoppingBag,
    Star,
    Megaphone,
    X,
    Send,
    CheckCircle2
} from "lucide-react";

function AdminDashboard() {
   
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dateRange, setDateRange] = useState("Last 30 Days");
    const [activeTab, setActiveTab] = useState("overview");
   
 const [overviewData, setOverviewData] = useState(null);
const [overviewLoading, setOverviewLoading] = useState(true);
const [overviewError, setOverviewError] = useState("");
const [totalSales, setTotalSales] = useState(0);
const [salesLoading, setSalesLoading] = useState(true);
const [notificationsOpen, setNotificationsOpen] = useState(false);

// Feature 8: Global Broadcast Notification Modal
const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    type: "info",
    target_role: "all"
});
const [broadcastSending, setBroadcastSending] = useState(false);
const [broadcastSuccess, setBroadcastSuccess] = useState(false);

const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
        alert("Title and message are required.");
        return;
    }
    setBroadcastSending(true);
    try {
        await broadcastGlobalNotification(broadcastForm);
        setBroadcastSuccess(true);
        setTimeout(() => {
            setBroadcastModalOpen(false);
            setBroadcastSuccess(false);
            setBroadcastForm({ title: "", message: "", type: "info", target_role: "all" });
        }, 2500);
    } catch (err) {
        alert("Failed to broadcast notification: " + err.message);
    } finally {
        setBroadcastSending(false);
    }
};
useEffect(() => {

    const loadOverview = async () => {

        try {

            setOverviewLoading(true);
            setOverviewError("");

            const data = await getOverview(dateRange);

            setOverviewData(data);

        } catch (error) {

            console.error(
                "Failed to load overview:",
                error
            );

            setOverviewError(
                error.message ||
                "Failed to load overview data"
            );

        } finally {

            setOverviewLoading(false);

        }

    };

    loadOverview();

}, [dateRange]);
useEffect(() => {

    const loadSalesSummary = async () => {

        try {

            setSalesLoading(true);

            const data = await fetchSalesSummary();

            setTotalSales(data.totalSales || 0);

        } catch (error) {

            console.error(
                "Failed to load sales summary:",
                error
            );

        } finally {

            setSalesLoading(false);

        }

    };

    loadSalesSummary();

}, []);
const formatSales = (amount) => {

    if (amount >= 1000000) {
        return `Rs. ${(amount / 1000000).toFixed(2)}M`;
    }

    if (amount >= 1000) {
        return `Rs. ${(amount / 1000).toFixed(1)}K`;
    }

    return `Rs. ${Number(amount).toLocaleString()}`;

};

    return (
        <div className="admin-dashboard" data-theme="light">

            {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>

                <div className="admin-logo">
    <img src={logo} alt="FixItNow" />
    <p>ADMIN PANEL</p>
</div>
               

                <nav className="admin-nav">

                    <button
    className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
    onClick={() => {
        setActiveTab("overview");
        setSidebarOpen(false);
    }}
>
    <LayoutDashboard size={19} strokeWidth={1.8} />
    <span>Overview</span>
</button>


                   <button
    className={`nav-item ${activeTab === "customers" ? "active" : ""}`}
    onClick={() => {
        setActiveTab("customers");
        setSidebarOpen(false);
    }}
>
    <Users size={19} strokeWidth={1.8} />
    <span>Customers</span>
</button>
<button
    className={`nav-item ${activeTab === "technicians" ? "active" : ""}`}
    onClick={() => {
        setActiveTab("technicians");
        setSidebarOpen(false);
    }}
>
    <UserCog size={19} strokeWidth={1.8} />
    <span>Technicians</span>
</button>
<button
    className={`nav-item ${activeTab === "products" ? "active" : ""}`}
    onClick={() => {
        setActiveTab("products");
        setSidebarOpen(false);
    }}
>
    <Package size={19} strokeWidth={1.8} />
    <span>Products</span>
</button>
<button
    className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
    onClick={() => {
        setActiveTab("orders");
        setSidebarOpen(false);
    }}
>
    <ShoppingBag size={19} strokeWidth={1.8} />
    <span>Orders</span>
</button>

                  <button
    className={`nav-item ${
        activeTab === "services" ? "active" : ""
    }`}
    onClick={() => setActiveTab("services")}
>
    <Wrench size={19} strokeWidth={1.8} />
    <span>Services</span>
</button>

<button
    className={`nav-item ${activeTab === "reviews" ? "active" : ""}`}
    onClick={() => {
        setActiveTab("reviews");
        setSidebarOpen(false);
    }}
>
    <Star size={19} strokeWidth={1.8} />
    <span>Reviews</span>
</button>

                </nav>

                <div className="sidebar-bottom">

                   

                  <button
    className="nav-item logout"
    onClick={async () => {
        try {
            await doSignOut();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }}
>
    <LogOut size={19} strokeWidth={1.8} />
    <span>Logout</span>
</button>
                </div>

            </aside>

{sidebarOpen && (
    <div
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
    ></div>
)}
            {/* Main Area */}
            <main className="admin-main">

                {/* Topbar */}
                <header className="admin-topbar">
   <button
    className="mobile-menu-btn"
    onClick={() => setSidebarOpen(!sidebarOpen)}
    aria-label="Open navigation"
>
    <Menu size={20} />
</button>
                    <div>
                        <h1>Overview</h1>
                        <p>Welcome back, Admin</p>
                    </div>

                    <div className="topbar-right">

                      

         <div className="notification-wrapper">

    <button
        className="notification-btn"
        aria-label="Notifications"
        onClick={() =>
            setNotificationsOpen((prev) => !prev)
        }
    >
        <Bell size={18} />

        {overviewData?.recentActivity?.length > 0 && (
            <span className="notification-dot"></span>
        )}
    </button>

    {notificationsOpen && (
        <NotificationDropdown
            notifications={
                overviewData?.recentActivity || []
            }
        />
    )}

</div>

<button
    onClick={() => setBroadcastModalOpen(true)}
    className="broadcast-btn"
    title="Broadcast Notification (Feature 8)"
>
    <Megaphone size={15} />
    <span>Broadcast</span>
</button>
                        <div className="admin-profile">

                            <div className="profile-avatar">
                                A
                            </div>

                            <div className="profile-info">
                                <strong>Admin User</strong>
                                <span>Administrator</span>
                            </div>

                        </div>

                    </div>

                </header>


                {/* Dashboard Content */}
    

  <section className="admin-content">
{activeTab === "overview" && overviewLoading && (
    <div className="overview-loading">
        Loading overview...
    </div>
)}

{activeTab === "overview" && overviewError && (
    <div className="overview-error">
        {overviewError}
    </div>
)}
    {activeTab === "overview" &&
    !overviewLoading &&
    !overviewError &&
    overviewData && (
        <>
            {/* =========================
                OVERVIEW
            ========================= */}

            <div className="overview-heading">

                <div>
                    <h2>Good to see you again</h2>

                    <p className="content-subtitle">
                        Here's what's happening with FixItNow today.
                    </p>
                </div>

                <div className="date-filter">

                    <span>Period</span>

                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="Last 7 Days">
                            Last 7 Days
                        </option>

                        <option value="Last 30 Days">
                            Last 30 Days
                        </option>

                        <option value="Last 3 Months">
                            Last 3 Months
                        </option>

                        <option value="Last 6 Months">
                            Last 6 Months
                        </option>

                        <option value="This Year">
                            This Year
                        </option>
                    </select>

                </div>

            </div>


            {/* STATISTICS */}

            <div className="stats-grid">

              <StatCard
    title="Total Sales"
    value={
        salesLoading
            ? "Loading..."
            : formatSales(totalSales)
    }
    change=""
    description="excluding cancelled orders"
    icon={
        <CircleDollarSign
            size={19}
            strokeWidth={1.8}
        />
    }
/>

                <StatCard
    title="New Customers"
    value={overviewData?.stats?.customers ?? 0}
    change=""
    description="total customers"
    icon={
        <Users
            size={19}
            strokeWidth={1.8}
        />
    }
/>

<StatCard
    title="Products"
    value={overviewData?.stats?.products ?? 0}
    change=""
    description="total products"
    icon={
        <Package
            size={19}
            strokeWidth={1.8}
        />
    }
/>

<StatCard
    title="Service Requests"
    value={overviewData?.stats?.serviceRequests ?? 0}
    change=""
    description="total requests"
    icon={
        <Wrench
            size={19}
            strokeWidth={1.8}
        />
    }
/>
            </div>


            {/* CHARTS */}

            <div className="charts-grid">

                <SalesChart />

     <CustomerChart
    data={overviewData?.customerChart?.monthly}
    thisMonth={overviewData?.customerChart?.thisMonth}
/>

            </div>


            {/* SECONDARY OVERVIEW */}

            <div className="secondary-content-grid">

             <ServiceChart
    serviceChart={overviewData?.serviceChart}
/>

               <RecentActivity
    activities={overviewData?.recentActivity || []}
/>

            </div>
        </>
    )}


   {activeTab === "customers" && (
    <CustomerPage />
)}
{activeTab === "technicians" && (
    <Technician />
)}
    {activeTab === "products" && (
    <>
        <ProductPage />
    </>
)}

{activeTab === "services" && <ServicePage />}
{activeTab === "orders" && <OrderPage />}
{activeTab === "reviews" && <ReviewPage />}
</section>

{/* BROADCAST ANNOUNCEMENT MODAL (FEATURE 8) */}
{broadcastModalOpen && (
    <div className="broadcast-modal-overlay">
        <div className="broadcast-modal-card">
            <div className="broadcast-modal-header">
                <h3>
                    <Megaphone size={18} />
                    Broadcast Global Announcement
                </h3>
                <button
                    onClick={() => setBroadcastModalOpen(false)}
                    className="broadcast-close-btn"
                >
                    <X size={18} />
                </button>
            </div>

            {broadcastSuccess ? (
                <div className="broadcast-success-msg">
                    <CheckCircle2 size={18} /> Announcement broadcasted to all targets successfully!
                </div>
            ) : (
                <form onSubmit={handleSendBroadcast} className="broadcast-form">
                    <div>
                        <label className="broadcast-label">
                            Target Audience
                        </label>
                        <select
                            value={broadcastForm.target_role}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, target_role: e.target.value })}
                            className="broadcast-select"
                        >
                            <option value="all">All Users & Technicians</option>
                            <option value="technician">Technicians Only</option>
                            <option value="user">Customers Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="broadcast-label">
                            Announcement Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Scheduled System Maintenance / Monsoon Solar Safety Notice"
                            value={broadcastForm.title}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                            className="broadcast-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="broadcast-label">
                            Message Body
                        </label>
                        <textarea
                            placeholder="Write message content for all users..."
                            value={broadcastForm.message}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                            className="broadcast-textarea"
                            required
                        />
                    </div>

                    <div className="broadcast-actions">
                        <button
                            type="button"
                            onClick={() => setBroadcastModalOpen(false)}
                            className="broadcast-cancel-btn"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={broadcastSending}
                            className="broadcast-submit-btn"
                        >
                            <Send size={14} />
                            {broadcastSending ? "Publishing..." : "Broadcast Alert"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    </div>
)}


            </main>

        </div>
    );
}

export default AdminDashboard;