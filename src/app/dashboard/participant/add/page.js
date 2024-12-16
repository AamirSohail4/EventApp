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
    roleId,
  } = useAppContext();
  console.log("event", event);
  const router = useRouter();
  const [Event, setEvent] = useState([]);
  const [registration_date, setRgistration_date] = useState(null);

  // Handle date change
  const handleFromDateChange = (date) => {
    setRgistration_date(date);
  };

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

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };
  useEffect(() => {
    if (roleId == 2) {
      router.push("/dashboard/participant/add");
    } else {
      router.push("/auth/login");
    }
  }, [roleId, router]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set loading state to true while submitting
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("event_id", formData.event_id);
      data.append("participant_name", formData.participant_name);
      const formattedDate = registration_date
        ? `${registration_date.getFullYear()}-${String(
            registration_date.getMonth() + 1
          ).padStart(2, "0")}-${String(registration_date.getDate()).padStart(
            2,
            "0"
          )}`
        : "";
      data.append("registration_date", formattedDate);
      data.append(
        "participant_phone_number",
        formData.participant_phone_number
      );
      data.append("participant_email", formData.participant_email);
      data.append("participant_remarks", formData.participant_remarks);
      data.append("user_id", userId); // Add user_id if applicable

      if (formData.participant_picture_file_path) {
        data.append(
          "participant_picture_file_path",
          formData.participant_picture_file_path
        );
      }

      const res = await fetch(
        "http://51.112.24.26:5001/api/participant/addNew",
        {
          method: "POST",
          body: data, // Send as FormData
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      alert("Participant added successfully.");
      displayParticipant();
      eventParticipantDisplay(),
        eventParticipantSummary(),
        router.push("/dashboard/participant");
    } catch (error) {
      console.error("Failed to submit participant data:", error);
    } finally {
      // Set loading state to false after submission is complete
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/participant");
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Add New Participant</h1>
      <form onSubmit={handleSubmit}>
        {/* Event Name */}
        <div className="mb-3">
          <label htmlFor="eventName" className="form-label">
            Event Name<span style={{ color: "red" }}>*</span>
          </label>
          <select
            required
            className="form-select"
            name="event_id"
            onChange={handleChange}
            value={formData.event_id}
          >
            <option value="">Select Event</option>
            {event.map((option, index) => (
              <option key={index} value={option.id}>
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
            selected={registration_date}
            className="form-control" // Make DatePicker have the same style as other inputs
            onChange={handleFromDateChange}
            dateFormat="dd/MM/yyyy" // Show DD/MM/YYYY format in calendar
            placeholderText="DD/MM/YYYY" // Placeholder to indicate format
            isClearable
          />
        </div>

        {/* Name */}
        <div className="mb-3">
          <label htmlFor="participant_name" className="form-label">
            Name<span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="tel"
            id="participant_name"
            name="participant_name"
            className="form-control"
            placeholder="Enter participant name"
            value={formData.participant_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Mobile Number */}
        <div className="mb-3">
          <label htmlFor="participant_phone_number" className="form-label">
            Mobile Number<span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="tel"
            id="participant_phone_number"
            name="participant_phone_number"
            className="form-control"
            placeholder="Enter mobile number"
            value={formData.participant_phone_number}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="participant_email" className="form-label">
            Email<span style={{ color: "red" }}>*</span>
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
            placeholder="Enter remarks"
            value={formData.participant_remarks}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="d-flex">
          <button
            type="submit"
            className="btn btn-primary me-3"
            disabled={isSubmitting} // Disable the button when submitting
          >
            {isSubmitting ? "Submitting..." : "Submit"}
            {/* Show loading text */}
          </button>
          <button onClick={handleCancel} className="btn btn-danger">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
