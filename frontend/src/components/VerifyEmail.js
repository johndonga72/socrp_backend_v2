import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaEnvelopeOpenText } from "react-icons/fa";
const apiBase = process.env.REACT_APP_API_URL;
function VerifyEmail() {
    const params = useParams(); // grabs UID from URL
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null); // "success", "error"

    useEffect(() => {
        const uid = params.uid;
        axios
            .get(`${apiBase}/api/verify/${uid}/`)
            .then((res) => {
                setMsg(res.data.msg);
                setStatus("success");
            })
            .catch((err) => {
                setMsg(err.response?.data?.error || "Something went wrong.");
                setStatus("error");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [params.uid]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#f4f6f9",
            fontFamily: "Arial, sans-serif"
        }}>
            <div style={{
                background: "#fff",
                padding: "40px",
                borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                textAlign: "center",
                width: "400px"
            }}>
                <FaEnvelopeOpenText size={60} color="#007bff" style={{ marginBottom: "20px" }} />
                <h2>Email Verification</h2>

                {loading && <p style={{ color: "#555" }}>Verifying your email, please wait...</p>}

                {!loading && status === "success" && (
                    <div>
                        <FaCheckCircle size={50} color="green" />
                        <p style={{ color: "green", fontWeight: "bold", marginTop: "15px" }}>{msg}</p>
                        <a href="/login" style={{
                            display: "inline-block",
                            marginTop: "20px",
                            padding: "10px 20px",
                            backgroundColor: "#007bff",
                            color: "#fff",
                            textDecoration: "none",
                            borderRadius: "6px"
                        }}>
                            Go to Login
                        </a>
                    </div>
                )}

                {!loading && status === "error" && (
                    <div>
                        <FaTimesCircle size={50} color="red" />
                        <p style={{ color: "red", fontWeight: "bold", marginTop: "15px" }}>{msg}</p>
                        <a href="/register" style={{
                            display: "inline-block",
                            marginTop: "20px",
                            padding: "10px 20px",
                            backgroundColor: "red",
                            color: "#fff",
                            textDecoration: "none",
                            borderRadius: "6px"
                        }}>
                            Back to Register
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
