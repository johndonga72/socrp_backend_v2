import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function VerifyEmail() {
    const params = useParams(); // grabs UID from URL
    const [msg, setMsg] = useState("");

    useEffect(() => {
        const uid = params.uid;
        axios.get("http://127.0.0.1:8000/api/verify/${uid}/")
            .then(res => setMsg(res.data.msg))
            .catch(err => setMsg(err.response.data.error));
    }, [params.uid]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Email Verification</h2>
            <p>{msg}</p>
        </div>
    );
}

export default VerifyEmail;
