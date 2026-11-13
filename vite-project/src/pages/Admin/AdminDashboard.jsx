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
        <div className="admin-dashboard">

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
    style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(2, 132, 199, 0.12)",
        color: "#38bdf8",
        border: "1px solid rgba(2, 132, 199, 0.3)",
        borderRadius: "8px",
        padding: "7px 12px",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
        marginRight: "4px"
    }}
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
    <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px"
    }}>
        <div style={{
            background: "#0f172a",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "14px",
            width: "100%",
            maxWidth: "500px",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Megaphone size={18} color="#38bdf8" />
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#f8fafc" }}>Broadcast Global Announcement</h3>
                </div>
                <button
                    onClick={() => setBroadcastModalOpen(false)}
                    style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                >
                    <X size={18} />
                </button>
            </div>

            {broadcastSuccess ? (
                <div style={{ padding: "16px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", borderRadius: "8px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={18} /> Announcement broadcasted to all targets successfully!
                </div>
            ) : (
                <form onSubmit={handleSendBroadcast} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                            Target Audience
                        </label>
                        <select
                            value={broadcastForm.target_role}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, target_role: e.target.value })}
                            style={{
                                width: "100%",
                                background: "#1e293b",
                                color: "#f8fafc",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: "8px",
                                padding: "9px 12px",
                                fontSize: "13px",
                                outline: "none"
                            }}
                        >
                            <option value="all">All Users & Technicians</option>
                            <option value="technician">Technicians Only</option>
                            <option value="user">Customers Only</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                            Announcement Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Scheduled System Maintenance / Monsoon Solar Safety Notice"
                            value={broadcastForm.title}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                            style={{
                                width: "100%",
                                background: "#1e293b",
                                color: "#f8fafc",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: "8px",
                                padding: "9px 12px",
                                fontSize: "13px",
                                outline: "none"
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                            Message Body
                        </label>
                        <textarea
                            placeholder="Write message content for all users..."
                            value={broadcastForm.message}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                            style={{
                                width: "100%",
                                minHeight: "80px",
                                background: "#1e293b",
                                color: "#f8fafc",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: "8px",
                                padding: "9px 12px",
                                fontSize: "13px",
                                outline: "none",
                                resize: "vertical"
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                        <button
                            type="button"
                            onClick={() => setBroadcastModalOpen(false)}
                            style={{
                                background: "transparent",
                                color: "#94a3b8",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: "8px",
                                padding: "8px 16px",
                                fontSize: "13px",
                                cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={broadcastSending}
                            style={{
                                background: "#0284c7",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px 18px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: broadcastSending ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                            }}
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