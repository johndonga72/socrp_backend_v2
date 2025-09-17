import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
const apiBase = process.env.REACT_APP_API_URL;
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("${apiBase}/api/token/", {
                email,
                password
            });
            // Save token in localStorage
            localStorage.setItem("access_token", res.data.access);
            localStorage.setItem("refresh_token", res.data.refresh);
            setMessage("Login successful!");
            navigate("/profile/preview");
        } catch (err) {
            console.error(err);
            setMessage("Invalid credentials");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Login</h2>
            {message && <div className={styles.message}>{message}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="email"
                    placeholder="Email"
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
                <button type="submit" className={styles.button}>Login</button>
            </form>
        </div>
    );
}

export default Login;
