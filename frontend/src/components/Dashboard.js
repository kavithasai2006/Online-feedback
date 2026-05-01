import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../App";

function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="card">
        <h3>Welcome to the Feedback Management System</h3>
        <p>Manage your feedback submissions and track their status.</p>
        <div style={{ marginTop: "20px" }}>
          <Link
            to="/feedback/new"
            className="btn btn-primary"
            style={{ marginRight: "10px" }}
          >
            Submit New Feedback
          </Link>
          <Link to="/feedback" className="btn btn-secondary">
            View My Feedback
          </Link>
        </div>
        {user && user.role === "admin" && (
          <div style={{ marginTop: "20px" }}>
            <Link to="/admin" className="btn btn-success">
              Admin Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
