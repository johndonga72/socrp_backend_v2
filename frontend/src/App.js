import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/verify-email/:uid" element={<VerifyEmail />} />
      </Routes>
    </Router>
  );
}

export default App;