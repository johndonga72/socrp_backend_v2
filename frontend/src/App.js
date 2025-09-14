import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";
import Login from "./components/Login";
import ProfileForm from "./components/ProfileForm";
import Home from "./components/Home";
import ProfilePreview from "./components/ProfilePreview";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify-email/:uid" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/profile" element={<ProfileForm />} />
        <Route path="/profile/preview" element={<ProfilePreview />} />

      </Routes>
    </Router>

  );
}

export default App;