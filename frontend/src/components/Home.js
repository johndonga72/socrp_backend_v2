// src/components/Home.js
import React, { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Img component with fallback support.
 */
const Img = ({ src, fallback, alt = "", style = {}, ...props }) => {
    const [current, setCurrent] = useState(src);
    const handleError = () => {
        if (current !== fallback) setCurrent(fallback);
    };
    return (
        <img
            src={current}
            alt={alt}
            style={{ display: "block", ...style }}
            onError={handleError}
            {...props}
        />
    );
};

const Home = () => {
    // image links
    const HERO_PRIMARY =
        "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/512/external-medical-research-healthcare-flaticons-lineal-color-flat-icons.png";
    const HERO_FALLBACK = "https://picsum.photos/id/1033/1600/900";

    const RESEARCH_PRIMARY = "https://img.icons8.com/color/512/microscope.png";
    const RESEARCH_FALLBACK = "https://picsum.photos/id/1025/800/600";

    const COURSE_FALLBACK = "https://picsum.photos/96/96";

    const ARTICLES = [
        {
            title: "The Future of Clinical Trials",
            srcPrimary: "https://img.icons8.com/color/512/experiment.png",
            srcFallback: "https://picsum.photos/id/1015/800/600",
        },
        {
            title: "AI in Pharma Research",
            srcPrimary: "https://img.icons8.com/color/512/artificial-intelligence.png",
            srcFallback: "https://picsum.photos/id/1043/800/600",
        },
        {
            title: "Global Standards in Certification",
            srcPrimary: "https://img.icons8.com/color/512/certificate.png",
            srcFallback: "https://picsum.photos/id/1050/800/600",
        },
    ];

    const COURSES = [
        { title: "Clinical Trials", img: "https://img.icons8.com/color/96/clinical-test.png" },
        { title: "Regulatory Affairs", img: "https://img.icons8.com/color/96/approval.png" },
        { title: "Pharmacovigilance", img: "https://img.icons8.com/color/96/pills.png" },
        { title: "Data Management", img: "https://img.icons8.com/color/96/database.png" },
    ];

    // Chatbot state
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hi 👋, I’m your AI assistant. How can I help you today?" },
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { sender: "user", text: input }, { sender: "bot", text: "🤖 I'm still in demo mode! But soon I'll connect with AI backend." }]);
        setInput("");
    };

    return (
        <div style={{ fontFamily: "Arial, sans-serif", color: "#333" }}>
            {/* ---------------- Header ---------------- */}
            <header
                style={{
                    backgroundColor: "#0D47A1",
                    color: "white",
                    padding: "15px 40px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                }}
            >
                <h2 style={{ margin: 0 }}>Pharma Research Company</h2>
                <nav style={{ display: "flex", gap: "20px" }}>
                    <Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
                    <Link to="/Register" style={{ color: "white", textDecoration: "none" }}>Register</Link>
                    <Link to="/login" style={{ color: "white", textDecoration: "none" }}>Login</Link>
                    <a href="#courses" style={{ color: "white", textDecoration: "none" }}>Courses</a>
                    <a href="#articles" style={{ color: "white", textDecoration: "none" }}>Articles</a>
                    <Link to="/admin/login" style={{ color: "white", textDecoration: "none" }}>Admin Login</Link>
                </nav>
            </header>

            {/* ---------------- Hero Section ---------------- */}
            <section style={{ position: "relative", textAlign: "center" }}>
                <Img
                    src={HERO_PRIMARY}
                    fallback={HERO_FALLBACK}
                    alt="Clinical Research Hero"
                    style={{ width: "100%", height: 420, objectFit: "cover" }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        textShadow: "0 4px 12px rgba(0,0,0,0.6)",
                        padding: "0 20px",
                    }}
                >
                    <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>
                        Clinical Research Professional Certification Platform
                    </h1>
                    <p style={{ fontSize: "18px", marginBottom: "30px", maxWidth: 900 }}>
                        Empowering Pharma Professionals with Global Standards
                    </p>
                    <Link
                        to="/Register"
                        style={{
                            backgroundColor: "#FF7043",
                            padding: "12px 25px",
                            borderRadius: "5px",
                            color: "white",
                            textDecoration: "none",
                            fontWeight: "bold",
                        }}
                    >
                        Get Started
                    </Link>
                </div>
            </section>

            {/* ---------------- About Us ---------------- */}
            <section style={{ padding: "60px 40px", display: "flex", gap: "40px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ color: "#0D47A1" }}>About Us</h2>
                    <p>
                        Our platform is built for clinical research professionals seeking globally recognized certifications. Inspired by SOCRA & ACRP, we provide structured learning, verified membership, and tools to share your professional profile with employers securely.
                    </p>
                    <ul>
                        <li>✔ Secure Membership Verification</li>
                        <li>✔ Professional Certification</li>
                        <li>✔ Career Growth in Pharma Industry</li>
                        <li>✔ Trusted by Global Employers</li>
                    </ul>
                </div>
                <div style={{ flex: 1 }}>
                    <Img
                        src={RESEARCH_PRIMARY}
                        fallback={RESEARCH_FALLBACK}
                        alt="Clinical Research Lab"
                        style={{ width: "100%", borderRadius: 10, objectFit: "cover" }}
                    />
                </div>
            </section>

            {/* ---------------- Courses ---------------- */}
            <section id="courses" style={{ backgroundColor: "#F5F5F5", padding: "60px 40px" }}>
                <h2 style={{ textAlign: "center", color: "#0D47A1", marginBottom: "40px" }}>Our Courses</h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {COURSES.map((course, index) => (
                        <div
                            key={index}
                            style={{
                                background: "white",
                                borderRadius: 10,
                                padding: 20,
                                textAlign: "center",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                transition: "transform 0.28s ease, box-shadow 0.28s ease",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-8px)";
                                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.18)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                            }}
                        >
                            <Img
                                src={course.img}
                                fallback={COURSE_FALLBACK}
                                alt={course.title}
                                style={{ marginBottom: 15, width: 96, height: 96, objectFit: "contain", marginLeft: "auto", marginRight: "auto" }}
                            />
                            <h3 style={{ marginBottom: 10 }}>{course.title}</h3>
                            <p>Learn the fundamentals of {course.title} with expert guidance.</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- Articles ---------------- */}
            <section id="articles" style={{ padding: "60px 40px" }}>
                <h2 style={{ textAlign: "center", color: "#0D47A1", marginBottom: "40px" }}>Latest Articles</h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {ARTICLES.map((article, idx) => (
                        <div
                            key={idx}
                            style={{
                                background: "white",
                                borderRadius: 10,
                                overflow: "hidden",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                transition: "transform 0.28s ease, box-shadow 0.28s ease",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-8px)";
                                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.18)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                            }}
                        >
                            <Img
                                src={article.srcPrimary}
                                fallback={article.srcFallback}
                                alt={article.title}
                                style={{ width: "100%", height: 200, objectFit: "contain" }}
                            />
                            <div style={{ padding: 15 }}>
                                <h3 style={{ margin: "10px 0", color: "#0D47A1" }}>{article.title}</h3>
                                <p>Read insights and updates on {article.title.toLowerCase()}.</p>
                                <a href="#" style={{ color: "#1565C0", textDecoration: "none", fontWeight: "bold" }}>
                                    Read More →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- Footer ---------------- */}
            <footer
                style={{
                    backgroundColor: "#0D47A1",
                    color: "white",
                    padding: "40px",
                    marginTop: "60px",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "20px",
                    }}
                >
                    <div>
                        <h3>Pharma Research Company</h3>
                        <p>Leading platform for clinical research certifications. Trusted globally for pharma standards & training.</p>
                    </div>
                    <div>
                        <h3>Quick Links</h3>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            <li><Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link></li>
                            <li><Link to="/Register" style={{ color: "white", textDecoration: "none" }}>Register</Link></li>
                            <li><Link to="/login" style={{ color: "white", textDecoration: "none" }}>Login</Link></li>
                            <li><Link to="/admin/login" style={{ color: "white", textDecoration: "none" }}>Admin Login</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3>Contact</h3>
                        <p>Email: support@pharmaresearch.com</p>
                        <p>Phone: +91 9876543210</p>
                        <p>Address: guntor, India</p>
                    </div>
                </div>
                <p style={{ textAlign: "center", marginTop: "20px" }}>
                    © {new Date().getFullYear()} Pharma Research Company. All rights reserved.
                </p>
            </footer>

            {/* ---------------- Floating Chatbot ---------------- */}
            <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 2000 }}>
                {!isOpen ? (
                    <button
                        onClick={() => setIsOpen(true)}
                        style={{
                            backgroundColor: "#0D47A1",
                            borderRadius: "50%",
                            width: 60,
                            height: 60,
                            border: "none",
                            color: "white",
                            fontSize: 28,
                            cursor: "pointer",
                            boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
                        }}
                    >
                        💬
                    </button>
                ) : (
                    <div
                        style={{
                            width: 320,
                            height: 420,
                            background: "white",
                            borderRadius: 10,
                            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ backgroundColor: "#0D47A1", color: "white", padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong>AI Assistant</strong>
                            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "white", fontSize: 20, cursor: "pointer" }}>✖</button>
                        </div>
                        <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{ marginBottom: 10, textAlign: msg.sender === "user" ? "right" : "left" }}>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            padding: "8px 12px",
                                            borderRadius: 10,
                                            background: msg.sender === "user" ? "#0D47A1" : "#F5F5F5",
                                            color: msg.sender === "user" ? "white" : "#333",
                                        }}
                                    >
                                        {msg.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", borderTop: "1px solid #ddd" }}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Type your message..."
                                style={{ flex: 1, padding: "10px", border: "none", outline: "none" }}
                            />
                            <button
                                onClick={handleSend}
                                style={{
                                    backgroundColor: "#0D47A1",
                                    color: "white",
                                    border: "none",
                                    padding: "0 15px",
                                    cursor: "pointer",
                                }}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
