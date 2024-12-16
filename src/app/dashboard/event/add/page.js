"use client";

import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AddEvent() {
  const {
    eventDisplay,
    eventParticipantDisplay,
    eventParticipantSummary,
    userId,
    roleId,
  } = useAppContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (roleId == 2) {
      router.push("/dashboard/event/add");
    } else {
      router.push("/auth/login");
    }
  }, [roleId, router]);
  const [formData, setFormData] = useState({
    event_name: "",
    event_from_date: "",
    event_to_date: "",
    event_location: "",
    event_certificate_file_path: null,
    event_banner_file_path: null,
    is_active: false,
  });

  const validateForm = () => {
    const errors = {};

    if (!formData.event_name.trim()) {
      errors.event_name = "Event name is required.";
    } else if (!/^[A-Za-z\s]+$/.test(formData.event_name.trim())) {
      // Check if the event name contains only alphabets and spaces
      errors.event_name = "Event name should only contain alphabets.";
    }

    if (!formData.event_location.trim()) {
      errors.event_location = "Event location is required.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
  };

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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("event_name", formData.event_name);

      const formattedFromDate = fromDate
        ? `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(fromDate.getDate()).padStart(2, "0")}`
        : "";
      data.append("event_from_date", formattedFromDate);

      const formattedToDate = toDate
        ? `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(toDate.getDate()).padStart(2, "0")}`
        : "";
      data.append("event_to_date", formattedToDate);

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

      const response = await fetch(
        "http://51.112.24.26:5001/api/event/addNew",
        {
          method: "POST",
          body: data,
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.message === "Event with this name already exists.") {
          alert(responseData.message);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
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
        <div className="mb-3">
          <label htmlFor="event_name" className="form-label">
            Event Name <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            id="event_name"
            name="event_name"
            className="form-control"
            placeholder="Enter event name"
            value={formData.event_name}
            onChange={handleChange}
          />
          {errors.event_name && (
            <p style={{ color: "red" }}>{errors.event_name}</p>
          )}
        </div>

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

        <div className="mb-3">
          <label htmlFor="event_to_date" className="form-label">
            Event End Date <span style={{ color: "red" }}>*</span>
          </label>
          <DatePicker
            selected={toDate}
            className="form-control"
            onChange={handleToDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            isClearable
          />
        </div>

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
          />
          {errors.event_location && (
            <p style={{ color: "red" }}>{errors.event_location}</p>
          )}
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

        <button
          type="submit"
          className="btn btn-primary me-5"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <button type="button" className="btn btn-danger" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}
