import React from "react";
import { useParams, Link } from "react-router-dom";
const COURSE_DETAILS = {
    "Clinical Trials": {
        description: "Comprehensive training on clinical trial phases, ethics, and GCP standards.",
        duration: "6 Weeks",
        price: 4999,
    },
    "Regulatory Affairs": {
        description: "Covers global regulations, drug approval process, and compliance documentation.",
        duration: "8 Weeks",
        price: 5999,
    },
    "Pharmacovigilance": {
        description: "Learn adverse drug reaction monitoring and post-market surveillance systems.",
        duration: "5 Weeks",
        price: 4499,
    },
    "Data Management": {
        description: "Focus on clinical data collection, cleaning, validation, and reporting.",
        duration: "7 Weeks",
        price: 3999,
    },
};

function CourseDetails() {
    const { title } = useParams();
    const decodedTitle = decodeURIComponent(title);
    const course = COURSE_DETAILS[decodedTitle];
    const startPayment = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/create-order/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    course_title: decodedTitle,
                    amount: course.price,  // in rupees
                }),
            });

            const data = await response.json();

            if (!data.order_id) {
                alert("Failed to create order");
                return;
            }

            // 2. Open Razorpay Checkout
            var options = {
                key: data.key_id,
                amount: data.amount,
                currency: "INR",
                name: decodedTitle,
                description: "Course Purchase",
                order_id: data.order_id,
                handler: async function (response) {
                    // 3. Verify payment
                    await fetch("http://localhost:8000/api/verify-payment/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            our_order_id: data.our_order_id,
                        }),
                    });

                    alert("Payment Successful!");
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error(error);
            alert("Payment failed to start");
        }
    };

    if (!course) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <h2>Course Not Found</h2>
                <Link to="/" style={{ color: "#0D47A1" }}>
                    Go Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div style={{ padding: "60px 40px", fontFamily: "Arial, sans-serif" }}>
            <Link to="/" style={{ color: "#0D47A1", textDecoration: "none" }}>← Back to Home</Link>
            <div
                style={{
                    maxWidth: 800,
                    margin: "40px auto",
                    backgroundColor: "white",
                    padding: 30,
                    borderRadius: 10,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
            >
                <h1 style={{ color: "#0D47A1" }}>{decodedTitle}</h1>
                <p style={{ marginTop: 20, lineHeight: 1.6 }}>{course.description}</p>
                <p><strong>Duration:</strong> {course.duration}</p>
                <p><strong>Price:</strong> ₹{course.price}</p>

                <button
                    onClick={startPayment}
                    style={{
                        backgroundColor: "#43A047",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: 5,
                        cursor: "pointer",
                        fontSize: "16px",
                        marginTop: "20px",
                    }}
                >
                    Buy Now
                </button>
            </div>
        </div>
    );
}
export default CourseDetails;
