"use client";

import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { renderToStaticMarkup } from "react-dom/server"; // Import renderToStaticMarkup
import QRCode from "react-qr-code";
import jsPDF from "jspdf";

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
  const [isloading, setIsLoading] = useState(null);
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

      const response = await fetch(
        "`http://51.112.24.26:5001/api/participant/addNew",
        { method: "POST", body: data }
      );
      if (response.ok) {
        const responseData = await response.json();
        const newData = responseData?.data?.participant;
        console.log("That is a point of newData.id", newData.id);
        if (newData && newData.id) {
          await handleEmailCertificate(newData.id);
        } else {
          console.error("Response did not contain participant ID.");
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to submit participant data:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };
  const handleEmailCertificate = async (id) => {
    setIsLoading(id);
    try {
      // Step 1: Fetch participant data
      const res = await fetch(
        `http://51.112.24.26:5001/api/participant/getOne/${id}`
      );
      const fetchdata = await res.json();
      const maindata = fetchdata.data;

      console.log("Fetched Data:", maindata);

      const eventDate = new Date(maindata.event_from_date);
      const day = eventDate.toLocaleDateString("en-US", { weekday: "long" });
      const month = eventDate.toLocaleDateString("en-US", { month: "long" });
      const date = eventDate.getDate();
      const year = eventDate.getFullYear();
      const shortYear = year.toString().slice(-2);

      const suffix = (() => {
        if (date % 10 === 1 && date !== 11) return "st";
        if (date % 10 === 2 && date !== 12) return "nd";
        if (date % 10 === 3 && date !== 13) return "rd";
        return "th";
      })();
      const formattedId = String(id).padStart(6, "0"); // Format ID as 000001
      const text = `LTBA-${formattedId}-${shortYear}`;

      // Step 2: Load the certificate image
      const imgUrl = `http://51.112.24.26:5001/${maindata.event_certificate_file_path}`;
      const img = await fetch(imgUrl);
      const blob = await img.blob();
      const imgBase64 = await blobToBase64(blob);

      // Step 3: Create a canvas and draw the certificate image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const image = new window.Image();
      image.src = imgBase64;

      // Wait for the image to load
      await new Promise((resolve) => (image.onload = resolve));
      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      let startY = canvas.height / 2 - 20; // Starting position for participant_name

      // Participant's name
      ctx.font = "76px Arial";
      ctx.fillStyle = "#000";
      ctx.textAlign = "left";
      ctx.fillText(maindata.participant_name, 400, startY);

      startY += 200;
      // Event name with word spacing
      ctx.font = "bold 50px Arial";
      ctx.fillStyle = "#9f3332";
      let eventNameX = 230;
      const eventNameWords = maindata.event_name.split(" ");
      eventNameWords.forEach((word) => {
        ctx.fillText(word, eventNameX, startY);
        eventNameX += ctx.measureText(word).width + 20;
      });

      startY += 200;
      // Fixed text
      ctx.font = "bold 50px Arial";
      ctx.fillStyle = "#0ca95d";
      ctx.fillText("Lahore Tax Bar Association", 510, startY);

      startY += 130;

      let startX = 510;
      ctx.font = "40px Arial";
      ctx.fillStyle = "#000";
      ctx.textAlign = "left";
      ctx.fillText(`${day},`, startX, startY);
      startX += ctx.measureText(`${day}, `).width;
      ctx.fillText(`${date}`, startX, startY);
      ctx.font = "20px Arial";
      ctx.fillText(
        suffix,
        startX + ctx.measureText(`${date}`).width + 25,
        startY - 10
      );
      ctx.font = "40px Arial";
      startX += ctx.measureText(`${date}${suffix}`).width - 20;
      ctx.fillText(` of ${month},`, startX, startY);
      startX += ctx.measureText(` of ${month}, `).width;
      ctx.fillText(`${year}`, startX, startY);

      startY += 330;
      ctx.font = "20px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, 2180, startY);

      // Generate QR code and add to the canvas
      const qrCodeDataURL = await generateQRCodeImage(
        maindata.id,
        maindata.participant_name
      );

      const qrImage = new window.Image();
      qrImage.src = qrCodeDataURL;
      await new Promise((resolve) => (qrImage.onload = resolve));

      const qrSize = 200;
      const xPosition = canvas.width - qrSize - 200;
      const yPosition = canvas.height - qrSize - 100;
      ctx.drawImage(qrImage, xPosition, yPosition, qrSize, qrSize);

      // Step 4: Convert the canvas to a data URL
      const updatedImgBase64 = canvas.toDataURL("image/png");

      // Step 5: Generate the PDF using jsPDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(updatedImgBase64, "PNG", 0, 0, canvas.width, canvas.height);

      const pdfBlob = pdf.output("blob");

      // Step 6: Send the PDF to the backend
      const formData = new FormData();
      formData.append(
        "pdf",
        pdfBlob,
        `${maindata.participant_name}-Certificate.pdf`
      );
      formData.append("participant_email", maindata.participant_email);
      formData.append("participant_name", maindata.participant_name);
      formData.append("event_name", maindata.event_name);

      const emailRes = await fetch(
        "http://51.112.24.26:5001/api/email/sendEmail",
        {
          method: "POST",
          body: formData,
        }
      );

      const emailResult = await emailRes.json();

      if (emailRes.ok) {
        alert("Certificate emailed successfully!");
      } else {
        console.error(emailResult.message);
        alert("Failed to send the certificate email.");
      }
    } catch (error) {
      console.error("Error occurred:", error);
      alert("An error occurred while processing the request.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  };
  // Helper function to generate QR code image

  const generateQRCodeImage = (id, participantName) => {
    return new Promise((resolve, reject) => {
      const value = `${id} - ${participantName}`;
      const qrCodeElement = <QRCode value={value} size={250} />;
      const svgString = renderToStaticMarkup(qrCodeElement);

      const img = new window.Image();
      const svg64 = btoa(svgString);
      const b64Data = "data:image/svg+xml;base64," + svg64;
      img.src = b64Data;

      img.onload = () => {
        const padding = 10; // Padding around the QR code
        const border = 2; // Border thickness
        const totalPadding = padding + border;

        // Create a canvas with extra space for border and padding
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width + totalPadding * 2;
        canvas.height = img.height + totalPadding * 2;

        // Fill canvas with white (background color)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the border
        ctx.fillStyle = "#FFFFFF"; // Border color (white in this case)
        ctx.fillRect(
          padding,
          padding,
          canvas.width - padding * 1,
          canvas.height - padding * 1
        );

        // Draw the QR code image inside the padded and bordered area
        ctx.drawImage(img, totalPadding, totalPadding);

        // Return the QR code as base64 PNG
        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = (err) => reject(err);
    });
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
