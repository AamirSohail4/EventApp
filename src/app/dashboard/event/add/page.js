"use client";

import { useAppContext } from "@/context/AppContext";
import { toDate } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AddEvent() {
  const {
    event,
    userId,
    eventDisplay,
    eventParticipantDisplay,
    eventParticipantSummary,
  } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Handle date change
  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    setToDate(date); // Correct state update
  };

  const [formData, setFormData] = useState({
    event_name: "",
    event_from_date: "",
    event_to_date: "",
    event_location: "",
    event_certificate_file_path: null,
    event_banner_file_path: null,
    is_active: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("event_name", formData.event_name);

      // Format From date as DD/MM/YYYY
      const formattedfromDate = fromDate
        ? `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(fromDate.getDate()).padStart(2, "0")}`
        : "";
      data.append("event_from_date", formattedfromDate);
      const formattedtoDate = toDate
        ? `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(toDate.getDate()).padStart(2, "0")}`
        : "";
      data.append("event_to_date", formattedtoDate);
      data.append("event_location", formData.event_location);
      data.append("user_id", userId);
      data.append("is_active", formData.is_active ? 1 : 0);

      if (formData.event_certificate_file_path) {
        data.append(
          "event_certificate_file_path",
          formData.event_certificate_file_path
        );
      }
      if (formData.event_banner_file_path) {
        data.append("event_banner_file_path", formData.event_banner_file_path);
      }

      const res = await fetch("http://51.112.24.26:5001/api/event/addNew", {
        method: "POST",
        body: data,
      });

      const responseData = await res.json();

      if (!res.ok) {
        if (responseData.message === "Event with this name already exists.") {
          alert(responseData.message); // Display the error message in an alert
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      alert("Event added successfully.");
      eventDisplay();
      eventParticipantDisplay();
      eventParticipantSummary();
      router.push("/dashboard/event");
    } catch (error) {
      console.error("Failed to submit Event data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/event");
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Add New Event</h1>

      <form onSubmit={handleSubmit}>
        {/* Event Name */}
        <div className="mb-3">
          <label htmlFor="event_name" className="form-label">
            Event Name<span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            id="event_name"
            name="event_name"
            className="form-control"
            placeholder="Enter event name"
            value={formData.event_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Event From Date */}
        <div className="mb-3">
          <label htmlFor="event_from_date" className="form-label">
            Event Start Date <span style={{ color: "red" }}>*</span>
          </label>
          <DatePicker
            selected={fromDate}
            className="form-control"
            onChange={handleFromDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            isClearable
          />
        </div>

        {/* Event To Date */}
        <div className="mb-3">
          <label htmlFor="event_to_date" className="form-label">
            Event End Date <span style={{ color: "red" }}>*</span>
          </label>
          <DatePicker
            selected={toDate}
            className="form-control"
            onChange={handleToDateChange} // Updated here
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            isClearable
          />
        </div>

        {/* Event Place */}
        <div className="mb-3">
          <label htmlFor="event_location" className="form-label">
            Event Place <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            id="event_location"
            name="event_location"
            className="form-control"
            placeholder="Enter event place"
            value={formData.event_location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="event_certificate_file_path" className="form-label">
            Event Certificate (Picture)
          </label>
          <input
            type="file"
            id="event_certificate_file_path"
            name="event_certificate_file_path"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        {/* Event Banner */}
        <div className="mb-3">
          <label htmlFor="event_banner_file_path" className="form-label">
            Event Banner (Optional)
          </label>
          <input
            type="file"
            id="event_banner_file_path"
            name="event_banner_file_path"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        {/* Active/Inactive */}
        <div className="mb-3 form-check form-switch">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            className="form-check-input"
            checked={formData.is_active}
            onChange={handleChange}
          />
          <label htmlFor="is_active" className="form-check-label">
            Active
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary me-5"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <button onClick={handleCancel} className="btn btn-danger">
          Cancel
        </button>
      </form>
    </div>
  );
}
