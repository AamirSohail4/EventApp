"use client";

import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function EditParticipantContent() {
  const [isSubmitting, setIsSubmitting] = useState(false); // State for button loading
  const [loading, setLoading] = useState(true); // State for loading participant data
  const {
    event,
    displayParticipant,
    eventParticipantDisplay,
    eventParticipantSummary,
    roleId,
  } = useAppContext();

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Get participant ID from query string
  const page = searchParams.get("page");
  const [registration_date, setRegistration_date] = useState(null);
  useEffect(() => {
    if (roleId !== 2) {
      router.push("/auth/login");
    }
  }, [roleId, router]);
  const [formData, setFormData] = useState({
    event_id: "",
    participant_name: "",
    registration_date: "",
    participant_phone_number: "",
    participant_email: "",
    participant_picture_file_path: null,
    participant_remarks: "",
  });

  // Fetch participant data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(
          `http://51.112.24.26:5001/api/participant/getOne/${id}`
        );
        if (res.ok) {
          const result = await res.json();
          const fetchData = result?.data;

          if (fetchData) {
            setFormData({
              event_id: fetchData.event_id || "",
              participant_name: fetchData.participant_name || "",
              participant_phone_number:
                fetchData.participant_phone_number || "",
              participant_email: fetchData.participant_email || "",
              participant_picture_file_path:
                fetchData.participant_picture_file_path || null,
              participant_remarks: fetchData.participant_remarks || "",
            });

            if (fetchData.registration_date) {
              setRegistration_date(new Date(fetchData.registration_date));
            }
          }
        } else {
          console.error("Failed to fetch participant data");
        }
      } catch (error) {
        console.error("Error fetching participant data:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleFromDateChange = (date) => {
    setRegistration_date(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set loading state to true when form is submitted

    const data = new FormData();
    data.append("event_id", formData.event_id);
    const formattedDate = registration_date
      ? `${registration_date.getFullYear()}-${String(
          registration_date.getMonth() + 1
        ).padStart(2, "0")}-${String(registration_date.getDate()).padStart(
          2,
          "0"
        )}`
      : "";
    data.append("registration_date", formattedDate);
    data.append("participant_name", formData.participant_name);
    data.append("participant_phone_number", formData.participant_phone_number);
    data.append("participant_email", formData.participant_email);

    if (formData.participant_picture_file_path instanceof File) {
      data.append(
        "participant_picture_file_path",
        formData.participant_picture_file_path
      );
    }
    data.append("participant_remarks", formData.participant_remarks);

    try {
      const res = await fetch(
        `http://51.112.24.26:5001/api/participant/edit/${id}`,
        {
          method: "PATCH",
          body: data,
        }
      );

      if (res.ok) {
        displayParticipant();
        eventParticipantDisplay(),
          eventParticipantSummary(),
          router.push(`/dashboard/participant?page=${page}`);
      } else {
        alert("Error updating the participant");
      }
    } catch (error) {
      console.error("Error updating participant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/participant");
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading until data is fetched
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Edit Participant</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Event Name */}
        <div className="mb-3">
          <label htmlFor="eventName" className="form-label">
            Event Name
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
            Registration Date <span className="stars_color">*</span>
          </label>
          <DatePicker
            selected={registration_date}
            className="form-control"
            onChange={handleFromDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            isClearable
          />
        </div>

        {/* Other Fields */}
        {/* Name */}
        <div className="mb-3">
          <label htmlFor="participant_name" className="form-label">
            Name
          </label>
          <input
            type="text"
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
            Mobile Number
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
            Email
          </label>
          <input
            type="email"
            id="participant_email"
            name="participant_email"
            className="form-control"
            placeholder="Enter email"
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
          <div className="mt-3">
            <Image
              src={
                formData.participant_picture_file_path instanceof File
                  ? URL.createObjectURL(formData.participant_picture_file_path)
                  : formData.participant_picture_file_path
                  ? `http://51.112.24.26:5001/${formData.participant_picture_file_path}`
                  : "/images/product.jpg" // Ensure this path starts with a leading slash
              }
              alt="Event Certificate"
              width={50}
              height={50}
              style={{
                border: "2px solid",
              }}
            />
          </div>
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
          />
        </div>

        <div className="d-flex justify-content-between">
          <button type="submit" className="btn btn-success">
            Update Event
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditParticipantContentWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditParticipantContent />
    </Suspense>
  );
}
