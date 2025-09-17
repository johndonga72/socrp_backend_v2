import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Profile.module.css";
const apiBase = process.env.REACT_APP_API_URL;

function ProfileForm() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        id: null,
        dob: "",
        gender: "",
        contact: "",
        address: "",
        skills: "",
        languages: "",
        profile_photo: null,
        resume: null,
        educations: [],
        experiences: []
    });

    const [message, setMessage] = useState("");

    // Fetch profile data on component load
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        axios.get("${apiBase}/api1/profile/", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.data && res.data.length > 0) {
                    const profileData = res.data[0];

                    // Ensure nested arrays exist
                    profileData.educations = profileData.educations || [];
                    profileData.experiences = profileData.experiences || [];

                    setProfile(profileData);
                }
            })
            .catch(err => console.error(err));
    }, []);

    // Handle text input changes
    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    // Handle file input changes
    const handleFileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.files[0] });
    };

    // Add new education row
    const addEducation = () => {
        setProfile({
            ...profile,
            educations: [...profile.educations, { degree: "", university: "", year_of_completion: "", marks_cgpa: "" }]
        });
    };

    // Add new experience row
    const addExperience = () => {
        setProfile({
            ...profile,
            experiences: [...profile.experiences, { company_name: "", designation: "", start_date: "", end_date: "", responsibilities: "" }]
        });
    };

    // Handle form submit (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const token = localStorage.getItem("access_token");

        // Append basic fields
        ["dob", "gender", "contact", "address", "skills", "languages"].forEach(key => {
            formData.append(key, profile[key]);
        });

        // Append files only if selected
        if (profile.profile_photo instanceof File) formData.append("profile_photo", profile.profile_photo);
        if (profile.resume instanceof File) formData.append("resume", profile.resume);

        // Append nested arrays as JSON
        formData.append("educations", JSON.stringify(profile.educations));
        formData.append("experiences", JSON.stringify(profile.experiences));

        try {
            if (profile.id) {
                await axios.patch(
                    `http://127.0.0.1:8000/api1/profile/${profile.id}/`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            } else {
                const res = await axios.post(
                    "http://127.0.0.1:8000/api1/profile/",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setProfile(res.data); // store created profile with ID
            }

            setMessage("Profile saved successfully!");
            navigate("/profile/preview");
        } catch (err) {
            console.error(err);
            setMessage("Error saving profile");
        }
    };

    return (
        <div className={styles.profileContainer}>
            <h2>Edit Profile</h2>
            {message && <div className={styles.successMsg}>{message}</div>}
            <form onSubmit={handleSubmit}>
                {/* --- Personal Info --- */}
                <label>DOB</label>
                <input type="date" name="dob" value={profile.dob || ""} onChange={handleChange} />

                <label>Gender</label>
                <select name="gender" value={profile.gender || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                </select>

                <label>Contact</label>
                <input type="text" name="contact" value={profile.contact || ""} onChange={handleChange} />

                <label>Address</label>
                <textarea name="address" value={profile.address || ""} onChange={handleChange}></textarea>

                <label>Skills</label>
                <input type="text" name="skills" value={profile.skills || ""} onChange={handleChange} />

                <label>Languages</label>
                <input type="text" name="languages" value={profile.languages || ""} onChange={handleChange} />

                {/* --- File Uploads --- */}
                <label>Profile Photo</label>
                <input type="file" name="profile_photo" onChange={handleFileChange} />
                {profile.profile_photo && typeof profile.profile_photo === "string" && (
                    <img src={profile.profile_photo} alt="Profile" className={styles.previewImage} />
                )}

                <label>Resume</label>
                <input type="file" name="resume" onChange={handleFileChange} />
                {profile.resume && typeof profile.resume === "string" && (
                    <a href={profile.resume} target="_blank" rel="noreferrer">View Resume</a>
                )}

                {/* --- Education --- */}
                <h3>Education</h3>
                {profile.educations.map((edu, idx) => (
                    <div key={idx} className={styles.subSection}>
                        <input type="text" placeholder="Degree" value={edu.degree || ""} onChange={(e) => {
                            const newEdus = [...profile.educations];
                            newEdus[idx].degree = e.target.value;
                            setProfile({ ...profile, educations: newEdus });
                        }} />
                        <input type="text" placeholder="University" value={edu.university || ""} onChange={(e) => {
                            const newEdus = [...profile.educations];
                            newEdus[idx].university = e.target.value;
                            setProfile({ ...profile, educations: newEdus });
                        }} />
                        <input type="number" placeholder="Year" value={edu.year_of_completion || ""} onChange={(e) => {
                            const newEdus = [...profile.educations];
                            newEdus[idx].year_of_completion = e.target.value;
                            setProfile({ ...profile, educations: newEdus });
                        }} />
                        <input type="text" placeholder="Marks/CGPA" value={edu.marks_cgpa || ""} onChange={(e) => {
                            const newEdus = [...profile.educations];
                            newEdus[idx].marks_cgpa = e.target.value;
                            setProfile({ ...profile, educations: newEdus });
                        }} />
                    </div>
                ))}
                <button type="button" onClick={addEducation}>➕ Add Education</button>

                {/* --- Work Experience --- */}
                <h3>Work Experience</h3>
                {profile.experiences.map((exp, idx) => (
                    <div key={idx} className={styles.subSection}>
                        <input type="text" placeholder="Company" value={exp.company_name || ""} onChange={(e) => {
                            const newExps = [...profile.experiences];
                            newExps[idx].company_name = e.target.value;
                            setProfile({ ...profile, experiences: newExps });
                        }} />
                        <input type="text" placeholder="Designation" value={exp.designation || ""} onChange={(e) => {
                            const newExps = [...profile.experiences];
                            newExps[idx].designation = e.target.value;
                            setProfile({ ...profile, experiences: newExps });
                        }} />
                        <input type="date" placeholder="Start Date" value={exp.start_date || ""} onChange={(e) => {
                            const newExps = [...profile.experiences];
                            newExps[idx].start_date = e.target.value;
                            setProfile({ ...profile, experiences: newExps });
                        }} />
                        <input type="date" placeholder="End Date" value={exp.end_date || ""} onChange={(e) => {
                            const newExps = [...profile.experiences];
                            newExps[idx].end_date = e.target.value;
                            setProfile({ ...profile, experiences: newExps });
                        }} />
                        <textarea placeholder="Responsibilities" value={exp.responsibilities || ""} onChange={(e) => {
                            const newExps = [...profile.experiences];
                            newExps[idx].responsibilities = e.target.value;
                            setProfile({ ...profile, experiences: newExps });
                        }} />
                    </div>
                ))}
                <button type="button" onClick={addExperience}>➕ Add Experience</button>

                <button type="submit">Save Profile</button>
            </form>
        </div>
    );
}

export default ProfileForm;
