import React, { useState, useEffect } from "react";
import {
    fetchDashboard,
    fetchUsers,
    fetchUserDetail,
    blockUser,       // ✅ fixed
    unblockUser,     // ✅ fixed
    editUser         // ✅ fixed
} from "./adminApi";
import { useNavigate } from "react-router-dom";

import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState("dashboard");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Load dashboard + users
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const dashboardRes = await fetchDashboard();
                setStats(dashboardRes.data);

                const usersRes = await fetchUsers();
                setUsers(usersRes.data);
            } catch (err) {
                console.error("API error:", err);
                setError("Failed to load data. Check console for details.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Filtering
    const filteredUsers = users.filter((u) => {
        const fullName = u.full_name || "";
        const email = u.email || "";
        const matchesSearch =
            fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            filterStatus === "all"
                ? true
                : filterStatus === "active"
                    ? u.is_active && !u.is_blocked
                    : filterStatus === "blocked"
                        ? u.is_blocked
                        : filterStatus === "pending"
                            ? !u.is_active && !u.is_blocked
                            : true;

        return matchesSearch && matchesStatus;
    });

    // View user
    const viewUser = async (id) => {
        try {
            const res = await fetchUserDetail(id);
            setSelectedUser(res.data);
            setActivePage("userProfile");
        } catch (err) {
            console.error("Failed to fetch user:", err);
            alert("Unable to load user details.");
        }
    };

    // ✅ fixed toggleBlock (calls unblockUser/blockUser) and refreshes stats
    const toggleBlock = async (id, isBlocked) => {
        try {
            const res = isBlocked ? await unblockUser(id) : await blockUser(id);
            alert(res.data.message);

            // Update state
            setUsers(
                users.map((u) =>
                    u.id === id ? { ...u, is_blocked: !u.is_blocked } : u
                )
            );

            if (selectedUser?.id === id) {
                setSelectedUser({
                    ...selectedUser,
                    is_blocked: !selectedUser.is_blocked,
                });
            }

            // refresh dashboard cards immediately
            try {
                const dashboardRes = await fetchDashboard();
                setStats(dashboardRes.data);
            } catch (err) {
                console.error("Failed to refresh stats after block toggle:", err);
            }

        } catch (err) {
            console.error("Failed to block/unblock user:", err);
            alert("Action failed.");
        }
    };

    // ✅ fixed edit to send nested JSON for profile + files separately
    const handleEditSubmit = async (id, formData) => {
        try {
            await editUser(id, formData);
            alert("User updated successfully!");
            const usersRes = await fetchUsers();
            setUsers(usersRes.data);
            // refresh dashboard cards
            try {
                const dashboardRes = await fetchDashboard();
                setStats(dashboardRes.data);
            } catch (err) {
                console.error("Failed to refresh stats after edit:", err);
            }
            setActivePage("dashboard");
        } catch (err) {
            console.error("Failed to edit user:", err);
            alert("Update failed.");
        }
    };

    const editUserPage = (id) => {
        const user = users.find((u) => u.id === id);
        setSelectedUser(user);
        setActivePage("editUser");
    };

    const logout = () => {
        localStorage.removeItem("admin_access_token");
        navigate("/admin/login");
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.adminContainer}>
            {/* Header */}
            <header className={styles.adminHeader}>
                <h1 className={styles.logo}>Admin Panel</h1>
                <div className={styles.profileBtn} onClick={logout}>Logout</div>
            </header>

            <div className={styles.adminBody}>
                {/* Sidebar */}
                <aside className={styles.adminSidebar}>
                    <ul>
                        <li
                            className={activePage === "dashboard" ? styles.active : ""}
                            onClick={() => setActivePage("dashboard")}
                        >
                            Dashboard
                        </li>
                        <li
                            className={activePage === "userList" ? styles.active : ""}
                            onClick={() => setActivePage("userList")}
                        >
                            Users
                        </li>
                    </ul>
                </aside>

                {/* Main */}
                <main className={styles.adminMain}>
                    {/* DASHBOARD */}
                    {activePage === "dashboard" && stats && (
                        <>
                            <div className={styles.cardContainer}>
                                <div className={`${styles.card} ${styles.blue}`}>
                                    <h3>Total Users</h3>
                                    <p>{stats.total_users ?? 0}</p>
                                </div>
                                <div className={`${styles.card} ${styles.green}`}>
                                    <h3>Active Users</h3>
                                    <p>{stats.active_users ?? 0}</p>
                                </div>
                                <div className={`${styles.card} ${styles.red}`}>
                                    <h3>Blocked Users</h3>
                                    <p>{stats.blocked_users ?? 0}</p>
                                </div>
                                <div className={`${styles.card} ${styles.yellow}`}>
                                    <h3>Pending Users</h3>
                                    <p>{stats.pending_users ?? 0}</p>
                                </div>
                            </div>

                            <h2>User List</h2>
                            <div className={styles.searchFilter}>
                                <input
                                    type="text"
                                    placeholder="Search by name or email"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="active">Active</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <table className={styles.userTable}>
                                <thead>
                                    <tr>
                                        <th>Membership ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id}>
                                            <td>{u.membership_id || "-"}</td>
                                            <td>{u.full_name || "-"}</td>
                                            <td>{u.email || "-"}</td>
                                            <td>
                                                {u.is_blocked
                                                    ? "Blocked"
                                                    : !u.is_active
                                                        ? "Pending"
                                                        : "Active"}
                                            </td>
                                            <td>
                                                <button onClick={() => viewUser(u.id)}>View</button>
                                                <button onClick={() => editUserPage(u.id)}>Edit</button>
                                                <button onClick={() => toggleBlock(u.id, u.is_blocked)}>
                                                    {u.is_blocked ? "Unblock" : "Block"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* USER PROFILE */}
                    {activePage === "userProfile" && selectedUser && (
                        <div className={styles.profileSection}>
                            <h2>👤 User Profile</h2>
                            <p><b>Name:</b> {selectedUser.full_name || "-"}</p>
                            <p><b>Email:</b> {selectedUser.email || "-"}</p>
                            <p><b>Phone:</b> {selectedUser.phone || "-"}</p>
                            <p><b>Status:</b> {selectedUser.is_blocked ? "Blocked" : (!selectedUser.is_active ? "Pending" : "Active")}</p>
                            <p><b>DOB:</b> {selectedUser.profile?.dob || "-"}</p>
                            <p><b>Gender:</b> {selectedUser.profile?.gender || "-"}</p>
                            <p><b>Contact:</b> {selectedUser.profile?.contact || "-"}</p>
                            <p><b>Address:</b> {selectedUser.profile?.address || "-"}</p>
                            <p><b>Skills:</b> {selectedUser.profile?.skills || "-"}</p>
                            <p><b>Languages:</b> {selectedUser.profile?.languages || "-"}</p>
                            <p><b>Resume:</b> {selectedUser.profile?.resume && <a href={selectedUser.profile.resume} target="_blank" rel="noreferrer">View</a>}</p>
                            <p><b>Profile Photo:</b> {selectedUser.profile?.profile_photo && <img src={selectedUser.profile.profile_photo} alt="Profile" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />}</p>

                            <h3>Education:</h3>
                            {selectedUser.profile?.educations?.map((edu, idx) => (
                                <p key={idx}>{edu.degree} at {edu.university} ({edu.year_of_completion}) - {edu.marks_cgpa}</p>
                            ))}

                            <h3>Experience:</h3>
                            {selectedUser.profile?.experiences?.map((exp, idx) => (
                                <p key={idx}>{exp.company_name} - {exp.designation} ({exp.start_date} to {exp.end_date})</p>
                            ))}

                            <button onClick={() => toggleBlock(selectedUser.id, selectedUser.is_blocked)}>
                                {selectedUser.is_blocked ? "Unblock" : "Block"}
                            </button>
                            <button onClick={() => editUserPage(selectedUser.id)}>Edit</button>
                            <button onClick={() => setActivePage("dashboard")}>Back</button>
                        </div>
                    )}

                    {/* EDIT USER */}
                    {activePage === "editUser" && selectedUser && (
                        <div className={styles.editSection}>
                            <h2>✏️ Edit User</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();

                                    const formData = new FormData();

                                    // --- Top-level user fields ---
                                    formData.append("full_name", e.target.full_name.value);
                                    formData.append("email", e.target.email.value);
                                    formData.append("phone", e.target.phone.value);
                                    formData.append("is_blocked", e.target.is_blocked.checked);

                                    // --- Profile object ---
                                    const profileObj = {
                                        dob: e.target.dob.value,
                                        gender: e.target.gender.value,
                                        contact: e.target.contact.value,
                                        address: e.target.address.value,
                                        skills: e.target.skills.value,
                                        languages: e.target.languages.value,
                                    };

                                    // attach JSON profile
                                    formData.append("profile", JSON.stringify(profileObj));

                                    // --- File fields (profile_photo & resume) ---
                                    if (e.target.profile_photo.files[0]) {
                                        formData.append("profile.profile_photo", e.target.profile_photo.files[0]);
                                    }
                                    if (e.target.resume.files[0]) {
                                        formData.append("profile.resume", e.target.resume.files[0]);
                                    }

                                    handleEditSubmit(selectedUser.id, formData);
                                }}
                            >
                                <label>Name:</label>
                                <input type="text" name="full_name" defaultValue={selectedUser.full_name || ""} />

                                <label>Email:</label>
                                <input type="email" name="email" defaultValue={selectedUser.email || ""} />

                                <label>Phone:</label>
                                <input type="text" name="phone" defaultValue={selectedUser.phone || ""} />

                                <label>Blocked:</label>
                                <input type="checkbox" name="is_blocked" defaultChecked={selectedUser.is_blocked} />

                                <label>DOB:</label>
                                <input type="date" name="dob" defaultValue={selectedUser.profile?.dob || ""} />

                                <label>Gender:</label>
                                <select name="gender" defaultValue={selectedUser.profile?.gender || ""}>
                                    <option value="">Select</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>

                                <label>Contact:</label>
                                <input type="text" name="contact" defaultValue={selectedUser.profile?.contact || ""} />

                                <label>Address:</label>
                                <textarea name="address" defaultValue={selectedUser.profile?.address || ""}></textarea>

                                <label>Skills:</label>
                                <input type="text" name="skills" defaultValue={selectedUser.profile?.skills || ""} />

                                <label>Languages:</label>
                                <input type="text" name="languages" defaultValue={selectedUser.profile?.languages || ""} />

                                <label>Profile Photo:</label>
                                <input type="file" name="profile_photo" accept="image/*" />

                                <label>Resume:</label>
                                <input type="file" name="resume" accept=".pdf,.doc,.docx" />

                                <button type="submit">Save</button>
                                <button
                                    type="button"
                                    onClick={() => setActivePage("dashboard")}
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className={styles.adminFooter}>
                <p>© 2025 Admin Panel. All Rights Reserved.</p>
            </footer>
        </div>
    );
}


