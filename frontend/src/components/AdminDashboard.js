import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../App";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PieController,
    ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PieController,
    ArcElement,
);

function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({
        category: "",
        status: "",
        userId: "",
    });
    const { user } = useContext(AuthContext);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get("/api/analytics");
            setAnalytics(response.data);
        } catch (error) {
            setError("Failed to load analytics");
        }
    };

    const fetchFeedback = async () => {
        try {
            const params = {};
            if (filters.category) params.category = filters.category;
            if (filters.status) params.status = filters.status;
            if (filters.userId) params.userId = filters.userId;

            const response = await axios.get("/api/feedback", { params });
            setFeedback(response.data);
        } catch (error) {
            setError("Failed to load feedback");
        }
    };

    useEffect(() => {
        if (user && user.role === "admin") {
            fetchAnalytics();
            fetchFeedback();
            setLoading(false);
        }
    }, [user, filters]);

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.put(`/api/feedback/${id}`, { status: newStatus });
            fetchFeedback();
        } catch (error) {
            setError("Failed to update feedback status");
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "approved":
                return "status-approved";
            case "rejected":
                return "status-rejected";
            default:
                return "status-pending";
        }
    };

    if (!user || user.role !== "admin") {
        return <div>Access denied. Admin privileges required.</div>;
    }

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    const categoryChartData = {
        labels: Object.keys(analytics?.categoryDistribution || {}),
        datasets: [
            {
                label: "Feedback Count",
                data: Object.values(analytics?.categoryDistribution || {}),
                backgroundColor: [
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 205, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                    "rgba(255, 159, 64, 0.6)",
                ],
            },
        ],
    };

    const statusChartData = {
        labels: Object.keys(analytics?.statusDistribution || {}),
        datasets: [
            {
                label: "Status Count",
                data: Object.values(analytics?.statusDistribution || {}),
                backgroundColor: [
                    "rgba(255, 206, 86, 0.6)", // pending
                    "rgba(75, 192, 192, 0.6)", // approved
                    "rgba(255, 99, 132, 0.6)", // rejected
                ],
            },
        ],
    };

    return (
        <div>
            <h2>Admin Dashboard</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {analytics && (
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <h3>{analytics.totalFeedback}</h3>
                        <p>Total Feedback</p>
                    </div>
                    <div className="stat-card">
                        <h3>{analytics.averageRating}</h3>
                        <p>Average Rating</p>
                    </div>
                </div>
            )}
            <div className="chart-container">
                <h3>Feedback by Category</h3>
                <Pie data={categoryChartData} />
            </div>
            <div className="chart-container">
                <h3>Feedback by Status</h3>
                <Bar data={statusChartData} />
            </div>
            <div className="filters">
                <h3>Filter Feedback</h3>
                <div className="form-group">
                    <label>Category:</label>
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Categories</option>
                        <option value="general">General</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="improvement">Improvement</option>
                        <option value="complaint">Complaint</option>
                        <option value="praise">Praise</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Status:</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>
            <h3>All Feedback</h3>
            {feedback.length === 0 ? (
                <div className="card">
                    <p>No feedback found.</p>
                </div>
            ) : (
                feedback.map((item) => (
                    <div key={item.id} className="feedback-item">
                        <h3>{item.title}</h3>
                        <div className="feedback-meta">
                            <span>Category: {item.category}</span> |{" "}
                            <span>
                                Rating: {"★".repeat(item.rating)}{" "}
                                {"☆".repeat(5 - item.rating)}
                            </span> |{" "}
                            <span>
                                Status:{" "}
                                <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                                    {item.status}
                                </span>
                            </span> |{" "}
                            <span>User ID: {item.userId}</span> |{" "}
                            <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p>{item.description}</p>
                        <div>
                            <button
                                className="btn btn-success"
                                onClick={() => handleStatusUpdate(item.id, "approved")}
                                style={{ marginRight: "10px" }}
                                disabled={item.status === "approved"}
                            >
                                Approve
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleStatusUpdate(item.id, "rejected")}
                                disabled={item.status === "rejected"}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default AdminDashboard;