"use client";

import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AddParticipant() {
  const {
    event,
    userId,
    displayParticipant,
    eventParticipantDisplay,
    eventParticipantSummary,
  } = useAppContext();
  const router = useRouter();
  const [Event, setEvent] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    event_id: "",
    participant_name: "",
    registration_date: "",
    participant_phone_number: "",
    participant_email: "",
    participant_picture_file_path: null,
    participant_remarks: "",
    user_id: "",
  });

  const [loading, setLoading] = useState(false); // State to manage button disabling

  // Fetch events
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("http://51.112.24.26:5001/api/event/getAll");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setEvent(data.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    }
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        const maxFileSize = 2 * 1024 * 1024; // 3 MB in bytes
        if (file.size > maxFileSize) {
          setErrors((prev) => ({
            ...prev,
            participant_picture_file_path: "File size should not exceed 2 MB.",
          }));
          return; // Do not update the formData if file size exceeds limit
        } else {
          // Clear the error if the file size is valid
          setErrors((prev) => ({
            ...prev,
            participant_picture_file_path: undefined,
          }));
        }
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // Handle date change
  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Validate participant name
    if (!formData.participant_name.trim()) {
      errors.participant_name = "Participant name is required.";
    } else if (!/^[A-Za-z\s]+$/.test(formData.participant_name.trim())) {
      errors.participant_name =
        "Participant name should only contain alphabets.";
    }

    // Validate mobile number
    if (!formData.participant_phone_number.trim()) {
      errors.participant_phone_number = "Mobile number is required.";
    } else if (!/^\d+$/.test(formData.participant_phone_number.trim())) {
      errors.participant_phone_number =
        "Mobile number should only contain numbers.";
    } else if (
      formData.participant_phone_number.trim().length < 11 ||
      formData.participant_phone_number.trim().length > 12
    ) {
      errors.participant_phone_number =
        "Mobile number should be between 11 to 12 digits.";
    }

    // Validate email
    if (!formData.participant_email.trim()) {
      errors.participant_email = "Email is required.";
    } else if (
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.participant_email.trim())
    ) {
      errors.participant_email = "Email is not valid.";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    if (loading) return; // Prevent multiple form submissions

    setLoading(true); // Set loading state to true

    try {
      const data = new FormData();
      data.append("event_id", formData.event_id);
      data.append("participant_name", formData.participant_name);
      // Format date
      const formattedDate = fromDate
        ? `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(fromDate.getDate()).padStart(2, "0")}`
        : "";
      data.append("registration_date", formattedDate);
      data.append(
        "participant_phone_number",
        formData.participant_phone_number
      );
      data.append("participant_email", formData.participant_email);
      data.append("participant_remarks", formData.participant_remarks);
      data.append("user_id", formData.user_id || "");

      if (formData.participant_picture_file_path) {
        data.append(
          "participant_picture_file_path",
          formData.participant_picture_file_path
        );
      }

      const res = await fetch(
        "http://51.112.24.26:5001/api/participant/addNew",
        { method: "POST", body: data }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      alert("Participant register successfully.");
      router.push("/thankyou");
    } catch (error) {
      console.error("Failed to submit participant data:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleCancel = () => {
    router.push("/"); // Redirect to the home page or another page
  };

  return (
    <div className="container mt-5 custom_margin">
      <h1 className="mb-4">Add New Participant</h1>
      <form onSubmit={handleSubmit}>
        {/* Event Selection */}
        <label htmlFor="event_id" className="form-label">
          Event <span style={{ color: "red" }}>*</span>
        </label>
        <div className="mb-3">
          <select
            required
            className="form-select"
            name="event_id"
            onChange={handleChange}
            value={formData.event_id}
          >
            <option value="">Select Event</option>
            {Event.map((option) => (
              <option key={option.id} value={option.id}>
                {option.event_name}
              </option>
            ))}
          </select>
        </div>

        {/* Registration Date */}
        <div className="mb-3">
          <label htmlFor="registration_date" className="form-label">
            Registration Date <span style={{ color: "red" }}>*</span>
          </label>
          <DatePicker
            selected={fromDate}
            className="form-control"
            onChange={handleFromDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            isClearable
            required
            maxLength={11}
          />
        </div>

        {/* Participant Name */}
        <div className="mb-3">
          <label htmlFor="participant_name" className="form-label">
            Name <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            id="participant_name"
            name="participant_name"
            className="form-control"
            placeholder="Enter Participant name"
            value={formData.participant_name}
            onChange={handleChange}
            maxLength={25}
            required
          />
          {errors.participant_name && (
            <p className="error-message">{errors.participant_name}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div className="mb-3">
          <label htmlFor="participant_phone_number" className="form-label">
            Mobile Number <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="tel"
            id="participant_phone_number"
            name="participant_phone_number"
            className="form-control"
            placeholder="e.g.,  0301-456-7890"
            value={formData.participant_phone_number}
            onChange={handleChange}
            required
            maxLength={13}
          />
          {errors.participant_phone_number && (
            <p className="error-message">{errors.participant_phone_number}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="participant_email" className="form-label">
            Email <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="email"
            id="participant_email"
            name="participant_email"
            className="form-control"
            placeholder="Enter participant email"
            value={formData.participant_email}
            onChange={handleChange}
            required
          />
          {errors.participant_email && (
            <p className="error-message">{errors.participant_email}</p>
          )}
        </div>

        {/* Picture */}
        <div className="mb-3">
          <label htmlFor="participant_picture_file_path" className="form-label">
            Picture
          </label>
          <input
            type="file"
            id="participant_picture_file_path"
            name="participant_picture_file_path"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
          />
          {errors.participant_picture_file_path && (
            <p className="error-message">
              {errors.participant_picture_file_path}
            </p>
          )}
        </div>

        {/* Remarks */}
        <div className="mb-3">
          <label htmlFor="participant_remarks" className="form-label">
            Remarks
          </label>
          <textarea
            id="participant_remarks"
            name="participant_remarks"
            className="form-control"
            placeholder="Enter Remarks"
            value={formData.participant_remarks}
            onChange={handleChange}
            maxLength={200}
          />
        </div>

        {/* Submit and Cancel Buttons */}
        <button
          type="submit"
          className="btn btn-primary me-3"
          disabled={loading} // Disable submit button while loading
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
        <button type="button" onClick={handleCancel} className="btn btn-danger">
          Cancel
        </button>
      </form>
    </div>
  );
}
