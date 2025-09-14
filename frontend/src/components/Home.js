import React from "react";
import { Link, Outlet } from "react-router-dom";

const Home = () => {
    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif", flexDirection: "column" }}>

            {/* Main Content Wrapper */}
            <div style={{ display: "flex", flex: 1 }}>
                {/* Sidebar Navigation */}
                <aside
                    style={{
                        width: "250px",
                        backgroundColor: "#0D47A1", // Dark Blue
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        padding: "20px",
                    }}
                >
                    <h2 style={{ textAlign: "center", marginBottom: "40px" }}>SOCRP Platform</h2>
                    <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <Link
                            to="/Register"
                            style={{
                                color: "white",
                                textDecoration: "none",
                                padding: "10px",
                                borderRadius: "5px",
                                backgroundColor: "#1565C0",
                                textAlign: "center",
                                transition: "0.3s",
                            }}
                        >
                            Register
                        </Link>
                        <Link
                            to="/login"
                            style={{
                                color: "white",
                                textDecoration: "none",
                                padding: "10px",
                                borderRadius: "5px",
                                backgroundColor: "#1565C0",
                                textAlign: "center",
                                transition: "0.3s",
                            }}
                        >
                            Login
                        </Link>
                        <Link
                            to="/profile"
                            style={{
                                color: "white",
                                textDecoration: "none",
                                padding: "10px",
                                borderRadius: "5px",
                                backgroundColor: "#1565C0",
                                textAlign: "center",
                                transition: "0.3s",
                            }}
                        >
                            Profile
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, backgroundColor: "#E3F2FD", padding: "30px" }}>
                    {/* Hero Section */}
                    <section
                        style={{
                            marginBottom: "40px",
                            backgroundColor: "white",
                            padding: "30px",
                            borderRadius: "10px",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        }}
                    >
                        <h1 style={{ color: "#0D47A1" }}>Welcome to the SOCRP Platform</h1>
                        <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333" }}>
                            The SOCRP platform is a membership and certification system for clinical research professionals,
                            inspired by international bodies such as SOCRA and ACRP. Here you can register, manage your profile,
                            upload qualifications and experiences, and securely share your professional profile with employers.
                        </p>
                    </section>

                    {/* Render Selected Component */}
                    <section>
                        <Outlet />
                    </section>
                </main>
            </div>

            {/* Footer */}
            <footer
                style={{
                    backgroundColor: "#0D47A1",
                    color: "white",
                    textAlign: "center",
                    padding: "15px 0",
                    marginTop: "auto",
                }}
            >
                <p style={{ margin: 0 }}>
                    &copy; {new Date().getFullYear()} SOCRP Platform | Designed for Clinical Research Professionals
                </p>
            </footer>
        </div>
    );
};

export default Home;
