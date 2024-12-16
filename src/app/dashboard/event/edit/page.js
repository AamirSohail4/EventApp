"use client";

import { useAppContext } from "@/context/AppContext";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";

function EditEventContent() {
  const {
    event,
    userId,
    eventDisplay,
    eventParticipantDisplay,
    eventParticipantSummary,
    roleId,
  } = useAppContext();

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    event_name: "",
    event_location: "",
    event_certificate_file_path: null,
    event_banner_file_path: null,
    is_active: false,
    event_id: "",
  });
  useEffect(() => {
    if (roleId == 2) {
      router.push("/event/edit");
    } else {
      router.push("/auth/login");
    }
  }, [roleId, router]);
  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(
        `http://51.112.24.26:5001/api/event/getOne/${id}`
      );
      const result = await res.json();
      const fetchData = result?.data;

      if (fetchData) {
        const eventFromDate = new Date(fetchData.event_from_date);
        const eventToDate = new Date(fetchData.event_to_date);

        setFormData({
          event_name: fetchData.event_name,
          event_location: fetchData.event_location,
          event_certificate_file_path: fetchData.event_certificate_file_path,
          event_banner_file_path: fetchData.event_banner_file_path,
          is_active: fetchData.is_active,
          event_id: fetchData.event_id,
        });

        // Set the date states for DatePicker
        setFromDate(eventFromDate);
        setToDate(eventToDate);
      }
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleFromDateChange = (date) => {
    setFromDate(date); // Update fromDate state when date changes
  };

  const handleToDateChange = (date) => {
    setToDate(date); // Update toDate state when date changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("event_name", formData.event_name);
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
    data.append(
      "event_certificate_file_path",
      formData.event_certificate_file_path
    );
    data.append("event_banner_file_path", formData.event_banner_file_path);
    data.append("is_active", formData.is_active ? 1 : 0);
    data.append("event_id", formData.event_id);

    const res = await fetch(`http://51.112.24.26:5001/api/event/edit/${id}`, {
      method: "PATCH",
      body: data,
    });

    if (res.ok) {
      eventDisplay();
      eventParticipantDisplay();
      eventParticipantSummary();
      router.push("/dashboard/event");
    } else {
      alert("Error updating the event");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/event");
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Edit Event</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
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
              required
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
              onChange={handleToDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              isClearable
              required
            />
          </div>

          {/* Event Place */}
          <div className="mb-3">
            <label htmlFor="event_location" className="form-label">
              Event Place
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
              onChange={handleChange}
            />
            <div className="mt-3">
              <Image
                src={
                  formData.event_certificate_file_path
                    ? `http://51.112.24.26:5001/${formData.event_certificate_file_path}`
                    : "/images/product.jpg"
                }
                alt="Event Certificate"
                width={50}
                height={50}
                style={{ border: "2px solid" }}
              />
            </div>
          </div>

          {/* Event Banner */}
          <div className="mb-3">
            <label htmlFor="event_banner_file_path" className="form-label">
              Event Banner
            </label>
            <input
              type="file"
              id="event_banner_file_path"
              name="event_banner_file_path"
              className="form-control"
              accept="image/*"
              onChange={handleChange}
            />
            <div className="mt-3">
              <Image
                src={
                  formData.event_banner_file_path
                    ? `http://51.112.24.26:5001/${formData.event_banner_file_path}`
                    : "/images/product.jpg"
                }
                alt="Event Banner"
                width={50}
                height={50}
                style={{ border: "2px solid" }}
              />
            </div>
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
      )}
    </div>
  );
}

export default function EditEvent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditEventContent />
    </Suspense>
  );
}
