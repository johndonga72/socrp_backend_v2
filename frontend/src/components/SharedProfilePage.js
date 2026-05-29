import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
const apiBase = process.env.REACT_APP_API_URL;

function SharedProfilePage() {
    const { token } = useParams();
    const [profile, setProfile] = useState(null);
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        axios.get(`${apiBase}/api/profile/share/${token}/`)
            .then(res => setProfile(res.data))
            .catch(() => setExpired(true));
    }, [token]);

    if (expired) return <h2>❌ Link Expired</h2>;
    if (!profile) return <h2>Loading...</h2>;

    // Helper: ensure correct file URL
    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        return filePath.startsWith("http")
            ? filePath
            : `${apiBase}${filePath}`;
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
            <h2>{profile.full_name || "Unnamed User"}</h2>

            {/* Profile Photo */}
            {profile.profile_photo && (
                <img
                    src={getFileUrl(profile.profile_photo)}
                    alt="Profile"
                    style={{ width: "150px", borderRadius: "10px", marginBottom: "15px" }}
                />
            )}

            {/* Education */}
            <h3>🎓 Education</h3>
            {profile.educations?.map((edu, idx) => (
                <div key={idx}>
                    {edu.degree} - {edu.university} ({edu.year_of_completion}) | CGPA: {edu.marks_cgpa}
                </div>
            ))}

            {/* Work Experience */}
            <h3>💼 Work Experience</h3>
            {profile.experiences?.map((exp, idx) => (
                <div key={idx}>
                    {exp.designation} at {exp.company_name} ({exp.start_date} - {exp.end_date})
                </div>
            ))}

            {/* Skills */}
            <h4>🛠 Skills: {profile.skills || "-"}</h4>

            {/* Resume */}
            {profile.resume && (
                <p>
                    <a href={getFileUrl(profile.resume)} download>
                        📄 Download Resume
                    </a>
                </p>
            )}
        </div>
    );
}

export default SharedProfilePage;

