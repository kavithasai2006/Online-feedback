import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            await axios.post('/api/auth/register', formData);
            setSuccess('Registration successful! You can now login.');
            setError('');
            // Auto login after registration
            const loginResponse = await axios.post('/api/auth/login', {
                username: formData.username,
                password: formData.password
            });
            login(loginResponse.data.token, loginResponse.data.user);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response ?.data ?.message || 'Registration failed');
            setSuccess('');
        }
    };

    return (
        <div className="card">
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Role:</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="user">User</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
            </form>
            <p style={{ marginTop: '15px' }}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
}

export default Register;