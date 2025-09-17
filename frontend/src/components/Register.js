import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css"; // ✅ CSS Modules import
const apiBase = process.env.REACT_APP_API_URL;
function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        countryCode: "+91",
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [resume, setResume] = useState(null);
    const [agree, setAgree] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState(""); // ✅ new state

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (e.target.name === "profilePhoto") {
            setProfilePhoto(file);
        } else if (e.target.name === "resume") {
            if (file && !/\.(pdf|doc|docx)$/i.test(file.name)) {
                setErrorMsg("Only PDF, DOC, and DOCX files are allowed for Resume.");
                return;
            }
            setResume(file);
        }
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (type === "photo") {
            setProfilePhoto(file);
        } else if (type === "resume") {
            if (file && !/\.(pdf|doc|docx)$/i.test(file.name)) {
                setErrorMsg("Only PDF, DOC, and DOCX files are allowed for Resume.");
                return;
            }
            setResume(file);
        }
    };
    const allowDrag = (e) => e.preventDefault();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!agree) {
            setErrorMsg("You must agree to the terms and conditions.");
            return;
        }
        if (!passwordRegex.test(formData.password)) {
            setErrorMsg("Password must be at least 8 characters, include 1 digit and 1 special character.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setErrorMsg("Passwords do not match!");
            return;
        }

        const data = new FormData();
        data.append("full_name", formData.fullName);
        data.append("email", formData.email);
        data.append("phone", formData.countryCode + formData.phone);
        data.append("password", formData.password);
        data.append("confirm_password", formData.confirmPassword);
        if (profilePhoto) data.append("profile_photo", profilePhoto);
        if (resume) data.append("resume", resume);

        try {
            await axios.post("${apiBase}/api/register/", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSuccessMsg("Registration successful! Please check your email to verify your account.");
            setTimeout(() => navigate("/login/"), 2000);
        } catch (error) {
            if (error.response) {
                console.error("Server Error:", error.response.data);
                setErrorMsg(JSON.stringify(error.response.data));
            } else if (error.request) {
                console.error("No Response:", error.request);
                setErrorMsg("No response from server. Is Django running?");
            } else {
                console.error("Error:", error.message);
                setErrorMsg("Error: " + error.message);
            }
        }
    };

    return (
        <div className={styles["register-container"]}>
            <h2>Create Your Account</h2>
            {errorMsg && <div className={styles["error-message"]}>{errorMsg}</div>}
            {successMsg && <div className={styles["success-message"]}>{successMsg}</div>}

            <form onSubmit={handleSubmit}>
                <div className={styles["register-form-group"]}>
                    <label>Full Name</label>
                    <input type="text" name="fullName" placeholder="Enter your full name" onChange={handleChange} required />
                </div>

                <div className={styles["register-form-group"]}>
                    <label>Email</label>
                    <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
                </div>

                <div className={styles["register-form-group"]}>
                    <label>Phone</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <select name="countryCode" value={formData.countryCode} onChange={handleChange} required>
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+61">🇦🇺 +61</option>
                            <option value="+971">🇦🇪 +971</option>
                        </select>
                        <input type="text" name="phone" placeholder="Enter your phone number" onChange={handleChange} required />
                    </div>
                </div>

                <div className={styles["register-form-group"]}>
                    <label>Password</label>
                    <input type="password" name="password" placeholder="Enter password" onChange={handleChange} required />
                </div>

                <div className={styles["register-form-group"]}>
                    <label>Confirm Password</label>
                    <input type="password" name="confirmPassword" placeholder="Confirm password" onChange={handleChange} required />
                </div>

                <div className={styles["drag-drop"]} onDrop={(e) => handleDrop(e, "photo")} onDragOver={allowDrag}>
                    <p>Drag & Drop Profile Photo here</p>
                    {!profilePhoto && <input type="file" name="profilePhoto" onChange={handleFileChange} accept="image/*" />}
                    {profilePhoto && <p>Uploaded: {profilePhoto.name}</p>}
                </div>

                <div className={styles["drag-drop"]} onDrop={(e) => handleDrop(e, "resume")} onDragOver={allowDrag}>
                    <p>Drag & Drop Resume (PDF/DOC) here</p>
                    {!resume && <input type="file" name="resume" onChange={handleFileChange} accept=".pdf,.doc,.docx" />}
                    {resume && <p>Uploaded: {resume.name}</p>}
                </div>

                <div className={styles.checkbox}>
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <span>I agree to the Terms & Conditions</span>
                </div>

                <button type="submit" className={styles["register-button"]}>Register</button>
            </form>
        </div>
    );
}

export default Register;


