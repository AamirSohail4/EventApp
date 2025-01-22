"use client";

import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
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
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

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
    const { name, value } = e.target; // Also get the value of the input
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Update the state with the new value for the corresponding field
    }));
  };

  const handleCertificateChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        // Create a new image instance only on the client side
        if (typeof window !== "undefined") {
          const img = new window.Image();
          img.src = e.target.result;

          img.onload = () => {
            if (img.width === 2560 && img.height === 1810) {
              // If dimensions are valid
              setFormData({ ...formData, event_certificate_file_path: file });
              setCertificatePreview(reader.result); // Set the preview URL for the certificate
            } else {
              // If dimensions are invalid
              alert("Image dimensions must be 2560x1810.");
              event.target.value = ""; // Reset the file input
              setCertificatePreview(null); // Clear the preview
            }
          };
        }
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    } else {
      setCertificatePreview(null); // Clear the preview if no file is selected
    }
  };

  // const handleCertificateChange = async (e) => {
  //   const file = e.target.files[0];
  //   if (file) {

  //     const img = new Image();
  //     const fileReader = new FileReader();

  //     fileReader.onload = (event) => {
  //       img.src = event.target.result;
  //     };

  //     img.onload = () => {
  //       if (img.width === 2560 && img.height === 1810) {
  //         setCertificatePreview(URL.createObjectURL(file));
  //       } else {
  //         alert("Image dimensions must be 2560x1810.");
  //         e.target.value = ""; // Reset file input
  //         setCertificatePreview(null);
  //       }
  //     };

  //     fileReader.readAsDataURL(file);
  //   }
  // };

  const handleBannerChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, event_banner_file_path: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result); // Set the preview URL for the banner
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    } else {
      setBannerPreview(null); // Clear the preview if no file is selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      // Append files if they exist
      if (formData.event_certificate_file_path) {
        data.append(
          "event_certificate_file_path",
          formData.event_certificate_file_path
        );
      }

      if (formData.event_banner_file_path) {
        data.append("event_banner_file_path", formData.event_banner_file_path);
      }

      // Submit the form
      const response = await axios.post(
        "http://51.112.24.26:5001/api/event/addNew",
        data
      );

      if (response.status === 201) {
        alert("Event added successfully.");
        eventDisplay();
        eventParticipantDisplay();
        eventParticipantSummary();
        router.push("/dashboard/event");
      } else {
        throw new Error(response.data.message || "Unexpected error occurred.");
      }
    } catch (error) {
      console.error("Failed to submit Event data:", error);
      alert(error.message || "Something went wrong. Please try again later.");
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
            Event Name <span className="stars_color">*</span>
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

        <div className="mb-3">
          <label htmlFor="event_from_date" className="form-label">
            Event Start Date <span className="stars_color">*</span>
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

        <div className="mb-3">
          <label htmlFor="event_to_date" className="form-label">
            Event End Date <span className="stars_color">*</span>
          </label>
          <DatePicker
            selected={toDate}
            className="form-control"
            onChange={handleToDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            isClearable
            required
            maxLength={11}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="event_location" className="form-label">
            Event Place <span className="stars_color">*</span>
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
            maxLength={60}
          />
        </div>

        {/* Event Certificate */}
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
            onChange={handleCertificateChange}
          />
          {certificatePreview && (
            <div style={{ marginTop: "10px" }}>
              <Image
                src={certificatePreview}
                alt="Event Certificate"
                width={50}
                height={50}
              />
            </div>
          )}
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
            onChange={handleBannerChange}
          />
          {bannerPreview && (
            <div style={{ marginTop: "10px" }}>
              <Image
                src={bannerPreview}
                alt="Event Banner"
                width={50}
                height={50}
              />
            </div>
          )}
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
