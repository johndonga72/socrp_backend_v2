import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ProfilePreview.module.css"; // create a separate CSS module

const ProfilePreview = () => {
    const [profile, setProfile] = useState(null);
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
                    <h2>{profile.full_name || "Your Name"}</h2>
                    <p><strong>Email:</strong> {profile.email}</p>
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
                    {profile.educations?.map((edu, idx) => (
                        <div key={idx} className={styles.subSection}>
                            <p><strong>Degree:</strong> {edu.degree}</p>
                            <p><strong>University:</strong> {edu.university}</p>
                            <p><strong>Year:</strong> {edu.year_of_completion}</p>
                            <p><strong>Marks/CGPA:</strong> {edu.marks_cgpa}</p>
                        </div>
                    ))}
                </div>

                {/* Work Experience */}
                <div className={styles.section}>
                    <h3>Work Experience</h3>
                    {profile.experiences?.map((exp, idx) => (
                        <div key={idx} className={styles.subSection}>
                            <p><strong>Company:</strong> {exp.company_name}</p>
                            <p><strong>Designation:</strong> {exp.designation}</p>
                            <p><strong>Start:</strong> {exp.start_date} | <strong>End:</strong> {exp.end_date}</p>
                            <p><strong>Responsibilities:</strong> {exp.responsibilities}</p>
                        </div>
                    ))}
                </div>

                {/* Resume Download */}
                {profile.resume && (
                    <div style={{ marginTop: "20px" }}>
                        <a
                            href={profile.resume}
                            download
                            className={styles.downloadBtn}
                        >
                            Download Resume
                        </a>
                    </div>
                )}

                {/* Edit Profile Button */}
                <button
                    onClick={() => navigate("/profile")}
                    className={styles.editBtn}
                >
                    Edit Profile
                </button>
            </div>
        </div>
    );
};

export default ProfilePreview;
