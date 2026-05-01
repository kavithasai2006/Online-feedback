import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../App";

function FeedbackForm() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "general",
        rating: 5,
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "rating" ? parseInt(value) : value,
        });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            await axios.post("/api/feedback", formData);
            setSuccess("Feedback submitted successfully!");
            setError("");
            setTimeout(() => {
                navigate("/feedback");
            }, 2000);
        } catch (error) {
            setError(error.response ?.data ?.message || "Failed to submit feedback");
            setSuccess("");
        }
    };

    if (!user) {
        return <div>Please login to submit feedback.</div>;
    }

    return (
        <div>
            <h2>Submit Feedback</h2>
            <div className="card">
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title:</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Brief title for your feedback"
                        />
                    </div>
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Detailed description of your feedback"
                        />
                    </div>
                    <div className="form-group">
                        <label>Category:</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="general">General</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                            <option value="improvement">Improvement</option>
                            <option value="complaint">Complaint</option>
                            <option value="praise">Praise</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Rating (1-5):</label>
                        <select
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                        >
                            <option value={1}>1 - Very Poor</option>
                            <option value={2}>2 - Poor</option>
                            <option value={3}>3 - Average</option>
                            <option value={4}>4 - Good</option>
                            <option value={5}>5 - Excellent</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Submit Feedback
                    </button>
                </form>
            </div>
        </div>
    );
}

export default FeedbackForm;