import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./AdminLogin.module.css";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/admin/login/", {
                email,
                password,
            });
            // Save token in localStorage
            localStorage.setItem("admin_access_token", res.data.access);
            setMessage("Login successful!");
            navigate("/admin/dashboard");
        } catch (err) {
            console.error(err);
            setMessage("Invalid credentials");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <h2 className={styles.title}>SOCRP Admin Portal</h2>
                <p className={styles.info}>
                    Login to manage users, verify profiles, and monitor platform activity.
                </p>
                {message && <div className={styles.message}>{message}</div>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="email"
                        placeholder="Admin Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                    />
                    <button type="submit" className={styles.button}>
                        Login
                    </button>
                </form>
                <div className={styles.footer}>
                    &copy; {new Date().getFullYear()} SOCRP Admin Portal
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
