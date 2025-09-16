import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf"; // ✅ for PDF export
import styles from "./ProfilePreview.module.css"; // CSS module

const ProfilePreview = () => {
    const [profile, setProfile] = useState(null);
    const [shareUrl, setShareUrl] = useState("");
    const [expiry, setExpiry] = useState("1");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const res = await axios.get("http://127.0.0.1:8000/api1/profile/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.length > 0) setProfile(res.data[0]);
            } catch (err) {
                console.error(err);
            }
        };

        fetchProfile();
    }, [navigate]);

    const generateLink = async () => {
        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/api/profile/share/generate/",
                { days: expiry },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );
            setShareUrl(res.data.share_url);
        } catch (err) {
            console.error(err);
            alert("Error generating link");
        }
    };

    // ✅ New: Download Profile Preview as stylish PDF resume
    const downloadProfile = () => {
        if (!profile) return;

        const doc = new jsPDF("p", "pt", "a4"); // portrait, points, A4
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 60;

        // 🔹 Header background
        doc.setFillColor(0, 123, 255); // Blue
        doc.rect(0, 0, pageWidth, 50, "F");

        // 🔹 Name in header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text(profile.full_name || profile.user?.full_name || "Your Name", pageWidth / 2, 30, { align: "center" });

        // Reset font color
        doc.setTextColor(0, 0, 0);

        // Contact Info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(
            `Email: ${profile.email || profile.user?.email || "-"} | Contact: ${profile.contact || "-"} | Address: ${profile.address || "-"}`,
            pageWidth / 2,
            y,
            { align: "center" }
        );
        y += 20;
        doc.text(`DOB: ${profile.dob || "-"} | Gender: ${profile.gender || "-"}`, pageWidth / 2, y, { align: "center" });
        y += 30;

        // Divider line
        doc.setDrawColor(180);
        doc.setLineWidth(0.5);
        doc.line(40, y, pageWidth - 40, y);
        y += 30;

        // Section: Education
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Education", 40, y);
        y += 20;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        if (profile.educations?.length > 0) {
            profile.educations.forEach((edu) => {
                doc.text(`• ${edu.degree} (${edu.year_of_completion})`, 50, y);
                y += 15;
                doc.text(`${edu.university} - Marks/CGPA: ${edu.marks_cgpa}`, 70, y);
                y += 25;
            });
        } else {
            doc.text("No education details available", 50, y);
            y += 25;
        }

        // Section: Work Experience
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Work Experience", 40, y);
        y += 20;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        if (profile.experiences?.length > 0) {
            profile.experiences.forEach((exp) => {
                doc.text(`• ${exp.designation} at ${exp.company_name}`, 50, y);
                y += 15;
                doc.text(`${exp.start_date} - ${exp.end_date}`, 70, y);
                y += 15;
                doc.text(`Responsibilities: ${exp.responsibilities}`, 70, y, { maxWidth: pageWidth - 100 });
                y += 30;
            });
        } else {
            doc.text("No work experience available", 50, y);
            y += 25;
        }

        // Section: Skills
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Skills", 40, y);
        y += 20;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(profile.skills || "-", 50, y, { maxWidth: pageWidth - 100 });
        y += 30;

        // Section: Languages
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Languages", 40, y);
        y += 20;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(profile.languages || "-", 50, y, { maxWidth: pageWidth - 100 });

        // Save PDF
        doc.save("ProfilePreview_Resume.pdf");
    };

    if (!profile) return <p style={{ textAlign: "center" }}>Loading profile...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Profile Photo */}
                <div className={styles.photoContainer} onClick={() => navigate("/profile")}>
                    <img
                        src={profile.profile_photo}
                        alt="Profile"
                        className={styles.profilePhoto}
                    />
                    <p className={styles.editPhotoText}>Click to Edit</p>
                </div>

                {/* Basic Info */}
                <div className={styles.infoSection}>
                    <h2>{profile.full_name || profile.user?.full_name || "Your Name"}</h2>
                    <p><strong>Email:</strong> {profile.email || profile.user?.email}</p>
                    <p><strong>DOB:</strong> {profile.dob}</p>
                    <p><strong>Gender:</strong> {profile.gender}</p>
                    <p><strong>Contact:</strong> {profile.contact}</p>
                    <p><strong>Address:</strong> {profile.address}</p>
                    <p><strong>Skills:</strong> {profile.skills}</p>
                    <p><strong>Languages:</strong> {profile.languages}</p>
                </div>

                {/* Education */}
                <div className={styles.section}>
                    <h3>Education</h3>
                    {profile.educations?.length > 0 ? (
                        profile.educations.map((edu, idx) => (
                            <div key={idx} className={styles.subSection}>
                                <p><strong>Degree:</strong> {edu.degree}</p>
                                <p><strong>University:</strong> {edu.university}</p>
                                <p><strong>Year:</strong> {edu.year_of_completion}</p>
                                <p><strong>Marks/CGPA:</strong> {edu.marks_cgpa}</p>
                            </div>
                        ))
                    ) : (
                        <p>No education details available</p>
                    )}
                </div>

                {/* Work Experience */}
                <div className={styles.section}>
                    <h3>Work Experience</h3>
                    {profile.experiences?.length > 0 ? (
                        profile.experiences.map((exp, idx) => (
                            <div key={idx} className={styles.subSection}>
                                <p><strong>Company:</strong> {exp.company_name}</p>
                                <p><strong>Designation:</strong> {exp.designation}</p>
                                <p><strong>Start:</strong> {exp.start_date} | <strong>End:</strong> {exp.end_date}</p>
                                <p><strong>Responsibilities:</strong> {exp.responsibilities}</p>
                            </div>
                        ))
                    ) : (
                        <p>No work experience available</p>
                    )}
                </div>

                {/* Resume Download */}
                <div style={{ marginTop: "20px" }}>
                    <button onClick={downloadProfile} className={styles.downloadBtn}>
                        📄 Download Profile Preview
                    </button>
                </div>

                {/* Edit Profile Button */}
                <button
                    onClick={() => navigate("/profile")}
                    className={styles.editBtn}
                >
                    Edit Profile
                </button>

                {/* 🔹 Share Options */}
                <div className={styles.section} style={{ marginTop: "30px" }}>
                    <h3>Share Your Profile</h3>
                    <label>Expiry:</label>
                    <select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                        <option value="1">1 Day</option>
                        <option value="2">2 Days</option>
                        <option value="7">7 Days</option>
                    </select>
                    <button onClick={generateLink} className={styles.shareBtn}>
                        Generate Share Link
                    </button>

                    {shareUrl && (
                        <div className={styles.shareLink}>
                            <p>Share this link:</p>
                            <a href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePreview;