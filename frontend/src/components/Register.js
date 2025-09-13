import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [resume, setResume] = useState(null);
    const [agree, setAgree] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // Handle text field changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle file uploads
    const handleFileChange = (e) => {
        if (e.target.name === "profilePhoto") {
            setProfilePhoto(e.target.files[0]);
        } else if (e.target.name === "resume") {
            setResume(e.target.files[0]);
        }
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!agree) {
            alert("You must agree to the terms and conditions.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const data = new FormData();
        data.append("full_name", formData.fullName);
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        data.append("password", formData.password);
        data.append("confirm_password", formData.confirmPassword);
        data.append("profile_photo", profilePhoto);
        data.append("resume", resume);

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/register/", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSuccessMsg(response.data.msg);
        } catch (error) {
            if (error.response) {
                // Server responded with a status (400, 404, 500, etc.)
                console.error("Server Error:", error.response.data);
                alert(JSON.stringify(error.response.data));
            } else if (error.request) {
                // Request was made but no response
                console.error("No Response:", error.request);
                alert("No response from server. Is Django running?");
            } else {
                // Something else happened
                console.error("Error:", error.message);
                alert("Error: " + error.message);
            }
        }
    };

    return (
        <div className="register-container">
            <h2>Create Your Account</h2>
            <form onSubmit={handleSubmit}>
                <div className="register-form-group">
                    <label>Full Name</label>
                    <input type="text" name="fullName" placeholder="Enter your full name" onChange={handleChange} required />
                </div>

                <div className="register-form-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
                </div>

                <div className="register-form-group">
                    <label>Phone</label>
                    <input type="text" name="phone" placeholder="Enter your phone number" onChange={handleChange} required />
                </div>

                <div className="register-form-group">
                    <label>Password</label>
                    <input type="password" name="password" placeholder="Enter password" onChange={handleChange} required />
                </div>

                <div className="register-form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="confirmPassword" placeholder="Confirm password" onChange={handleChange} required />
                </div>

                <div className="register-form-group">
                    <label>Profile Photo</label>
                    <input type="file" name="profilePhoto" onChange={handleFileChange} accept="image/*" />
                </div>

                <div className="register-form-group">
                    <label>Resume (PDF/DOC)</label>
                    <input type="file" name="resume" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                </div>

                <div className="checkbox">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <span>I agree to the Terms & Conditions</span>
                </div>

                <button type="submit" className="register-button">Register</button>
            </form>
            {successMsg && <div className="success-message">{successMsg}</div>}
        </div>
    );
}

export default Register;
