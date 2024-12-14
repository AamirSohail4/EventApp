"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    mobileNumber: "",
    email: "",
    isActive: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);

    try {
      const response = await fetch("http://51.112.24.26:5001/api/users/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Registration successful!");
        router.push("/auth/login");
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push("/auth/login");
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: "500px", width: "100%", borderRadius: "10px" }}
      >
        <h2 className="text-center text-primary fw-bold mb-4">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="mb-3">
            <label htmlFor="mobileNumber" className="form-label">
              Mobile Number <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              className="form-control"
              placeholder="Enter your mobile number"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Checkbox */}
          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              className="form-check-input"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label htmlFor="isActive" className="form-check-label">
              I agree to the terms and conditions
            </label>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary">
              Register
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-outline-danger"
            >
              Cancel
            </button>
          </div>
        </form>
        <p className="text-center mt-4">
          Already have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.push("/auth/login");
            }}
            className="text-primary"
          >
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
}
