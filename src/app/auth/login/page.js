"use client";
import React, { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Image from "next/image";

export default function Page() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // If token exists, redirect to the dashboard
      router.push("/dashboard");
    }
  }, [router]);
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("user_name", formData.user_name);
      data.append("password", formData.password);

      const res = await fetch("http://51.112.24.26:5001/api/users/userLogin", {
        method: "POST",
        body: data,
      });

      const response = await res.json();

      if (res.ok && response.success) {
        alert(response.message);
        localStorage.setItem("token", response.token);

        router.push("/dashboard");
      } else {
        alert(response.message || "An error occurred. Please try again."); // Show error message
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  const handleCancel = () => {
    router.push("/");
  };
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow-lg"
        style={{ width: "400px", borderRadius: "10px" }}
      >
        <div className="card-body p-4">
          <h4 className="text-center mb-4 text-primary fw-bold">
            Welcome to Event Registration
          </h4>
          <div className="text-center mb-4">
            <Image
              src="/images/logo1.jpg"
              alt="eventRegistration"
              width={100} // Width in pixels
              height={100} // Height in pixels, you can adjust this as needed
              style={{ width: "100px", height: "auto" }} // Ensures responsive sizing
              className="img-fluid" // Bootstrap class for responsiveness
            />
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="user_name" className="form-label">
                User Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="user_name"
                name="user_name"
                placeholder="Enter User Name"
                value={formData.user_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type={passwordVisible ? "text" : "password"}
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Enter Your Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={togglePasswordVisibility}
                >
                  <i
                    className={`fa-solid ${
                      passwordVisible ? "fa-eye" : "fa-eye-slash"
                    }`}
                  ></i>
                </button>
              </div>
            </div>
            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-primary">
                Log In
              </button>
            </div>
          </form>

          <p
            className="text-center mt-4 text-muted"
            style={{ fontSize: "12px" }}
          >
            Copyright © 2024 | Event Registration | All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
