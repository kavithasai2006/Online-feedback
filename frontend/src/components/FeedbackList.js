import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../App";

function FeedbackList() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    status: "",
  });
  const { user } = useContext(AuthContext);

  const fetchFeedback = async () => {
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;

      const response = await axios.get("/api/feedback", { params });
      setFeedback(response.data);
      setError("");
    } catch (error) {
      setError("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await axios.delete(`/api/feedback/${id}`);
        fetchFeedback();
      } catch (error) {
        setError("Failed to delete feedback");
      }
    }
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
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

  if (loading) {
    return <div>Loading feedback...</div>;
  }

  return (
    <div>
      <h2>My Feedback</h2>
      <div className="filters">
        <h3>Filters</h3>
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
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginBottom: "20px" }}>
        <Link to="/feedback/new" className="btn btn-primary">
          Submit New Feedback
        </Link>
      </div>
      {feedback.length === 0 ? (
        <div className="card">
          <p>
            No feedback found.{" "}
            <Link to="/feedback/new">Submit your first feedback</Link>
          </p>
        </div>
      ) : (
        feedback.map((item) => (
          <div key={item.id} className="feedback-item">
            <h3>{item.title}</h3>
            <div className="feedback-meta">
              <span>Category: {item.category}</span> |{" "}
              <span>
                Rating:{" "}
                <span className="rating">{renderStars(item.rating)}</span>
              </span>{" "}
              |{" "}
              <span>
                Status:{" "}
                <span
                  className={`status-badge ${getStatusBadgeClass(item.status)}`}
                >
                  {item.status}
                </span>
              </span>{" "}
              |{" "}
              <span>
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p>{item.description}</p>
            <div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  /* TODO: Implement edit */
                }}
                style={{ marginRight: "10px" }}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default FeedbackList;
