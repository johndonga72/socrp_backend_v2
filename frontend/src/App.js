import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";
import Login from "./components/Login";
import ProfileForm from "./components/ProfileForm";
import Home from "./components/Home";
import ProfilePreview from "./components/ProfilePreview";
import Admin from "./components/Admin";
import AdminDashboard from "./components/AdminDashboard";
import SharedProfilePage from "./components/SharedProfilePage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify/:uid" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/profile" element={<ProfileForm />} />
        <Route path="/profile/preview" element={<ProfilePreview />} />
        <Route path="/admin/login" element={<Admin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/shared-profile/:token" element={<SharedProfilePage />} />
      </Routes>
    </Router>

  );
}

export default App;