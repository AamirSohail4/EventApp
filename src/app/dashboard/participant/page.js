"use client";
import Link from "next/link";
import jsPDF from "jspdf";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaEnvelope, FaPrint } from "react-icons/fa"; // Font Awesome React Icons
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { renderToStaticMarkup } from "react-dom/server"; // Import renderToStaticMarkup
import QRCode from "react-qr-code";

export default function Participant() {
  const { participant, userId, displayParticipant, roleId } = useAppContext();
  const [loading, setLoading] = useState(null);
  const [isloading, setIsLoading] = useState(null);
  const router = useRouter();
  // Pagination state

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page");
    if (page) {
      setCurrentPage(Number(page));
    }
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;

  // Change page handler
  const sortedEvents = [...(participant || [])].sort((a, b) => a.id - b.id);

  // Calculate pagination details
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Pagination functions
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleDelete = async (id) => {
    // Confirm deletion action
    if (
      window.confirm(
        `Are you sure you want to delete the Participant with ID: ${id}?`
      )
    ) {
      try {
        const response = await fetch(
          `http://51.112.24.26:5001/api/participant/delete/${id}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          // If deletion was successful
          alert(`Participant with ID: ${id} has been deleted successfully.`);
          displayParticipant(); // Function to refresh or update the UI after deletion
        } else {
          // If the participant was not found or there was an error
          alert(result.message || "Unable to delete Participant.");
        }
      } catch (error) {
        // Handle network or server errors
        alert("Error: Unable to process the request.");
      }
    }
  };
  //new code parinting Certificate
  const handlePrintCertificate = async (id) => {
    try {
      setLoading(id); // Start loading

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

      // Determine the ordinal suffix
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

      const image = new Image();
      image.src = imgBase64;

      // Wait for the image to load
      image.onload = async () => {
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw the certificate image on the canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Define the starting position for the first line of text
        let startY = canvas.height / 2 - 20; // Starting position for participant_name

        // Participant's name
        ctx.font = " 76px Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = "left";
        ctx.fillText(maindata.participant_name, 400, startY);
        // text

        // Increment the y-position for the next line
        startY += 200;
        // Event name with word spacing
        ctx.font = "bold 50px Arial";
        ctx.fillStyle = "#9f3332";
        let eventNameX = 230;
        const eventNameWords = maindata.event_name.split(" "); // Split the event name into words
        eventNameWords.forEach((word) => {
          ctx.fillText(word, eventNameX, startY); // Draw each word
          eventNameX += ctx.measureText(word).width + 20; // Add spacing between words (20px)
        });

        // // Event name
        // ctx.font = "bold 50px Arial";
        // ctx.fillStyle = "#9f3332";
        // ctx.fillText(maindata.event_name, 230, startY);

        // Increment the y-position for the next line
        startY += 200;

        // Fixed text: Lahore Tax Bar Association
        ctx.font = "bold 50px Arial"; // Individual font size
        ctx.fillStyle = "#0ca95d"; // Color for fixed text
        ctx.fillText("Lahore Tax Bar Association", 510, startY);

        // Move the starting position 300px below the fixed text
        startY += 130;

        // Base positions for date text
        let startX = 510; // Starting X position

        // Set font for the date text
        ctx.font = " 40px Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = "left";

        // Draw day
        ctx.fillText(`${day},`, startX, startY);

        // Measure and increment X position
        startX += ctx.measureText(`${day}, `).width;

        // Draw date
        ctx.fillText(`${date}`, startX, startY);

        // Adjust for suffix position (slightly above the main text)
        ctx.font = "20px Arial"; // Smaller font for the suffix
        ctx.fillText(
          suffix,
          startX + ctx.measureText(`${date}`).width + 25,
          startY - 10
        );

        // Reset font and increment X for "of"
        ctx.font = " 40px Arial";
        startX += ctx.measureText(`${date}${suffix}`).width - 20;

        // Draw "of Month"
        ctx.fillText(` of ${month},`, startX, startY);

        // Increment X for year
        startX += ctx.measureText(` of ${month}, `).width;

        // Draw year
        ctx.fillText(`${year}`, startX, startY);

        startY += 330;
        ctx.font = " 20px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.fillText(text, 2180, startY);
        // Step 4: Generate the QR code image for the bottom-right corner
        const qrCodeDataURL = await generateQRCodeImage(
          maindata.id,
          maindata.participant_name
        );

        // Step 5: Draw the QR code onto the canvas
        const qrImage = new Image();
        qrImage.src = qrCodeDataURL;
        qrImage.onload = () => {
          const qrSize = 200;
          // Size of the QR code
          const xPosition = canvas.width - qrSize - 200; // Position from the right
          const yPosition = canvas.height - qrSize - 100; // Position from the bottom
          ctx.drawImage(qrImage, xPosition, yPosition, qrSize, qrSize);

          // Create the PDF with the certificate and QR code
          const updatedImgBase64 = canvas.toDataURL("image/png");

          // Generate the PDF using jsPDF
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width, canvas.height],
          });

          pdf.addImage(
            updatedImgBase64,
            "PNG",
            0,
            0,
            canvas.width,
            canvas.height
          );

          // Save the PDF locally or process further
          pdf.save(`${maindata.participant_name}-Certificate.pdf`);
          setLoading(null); // End loading
        };
      };
    } catch (error) {
      console.error("Error occurred while processing the certificate:", error);
      alert("An error occurred while processing the certificate.");
      setLoading(null); // End loading in case of error
    }
  };

  // Email Certificate
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

      const image = new Image();
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

      const qrImage = new Image();
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

      const img = new Image();
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

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Participant Management</h1>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1></h1>
        <Link href="/dashboard/participant/add" className="btn btn-primary">
          Add Participant
        </Link>
      </div>

      <table className="table table-striped table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Date / Time</th>
            <th>Event Name</th>
            <th>Name</th>
            <th>Mobile Number</th>
            <th>Email</th>
            <th>Picture</th>
            <th>Remarks</th>
            <th>Print Certificate</th>
            <th>Email Certificate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentEvents.map((participant, index) => {
            const globalIndex = indexOfFirstEvent + index + 1; // Global Sr number
            return (
              <tr key={participant.id}>
                <td>{globalIndex + 1}</td>

                <td style={{ width: "105px" }}>
                  {format(
                    new Date(participant.registration_date),
                    "dd-MM-yyyy"
                  )}
                </td>
                <td>{participant.event_name}</td>
                <td>{participant.participant_name}</td>
                <td>{participant.participant_phone_number}</td>
                <td>{participant.participant_email}</td>

                <td>
                  <Image
                    src={
                      participant.participant_picture_file_path
                        ? `http://51.112.24.26:5001/${participant.participant_picture_file_path}`
                        : "/images/product.jpg"
                    }
                    alt="Participant Picture"
                    width={50}
                    height={50}
                    style={{
                      border: "2px solid",
                      objectFit: "contain",
                    }}
                  />
                </td>

                <td>{participant.participant_remarks}</td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handlePrintCertificate(participant.id)}
                    disabled={loading === participant.id}
                  >
                    <FaPrint className="me-1" />
                    {loading === participant.id ? "Processing..." : "Print"}
                  </button>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <button
                    className="btn btn-secondary btn-sm me-2"
                    onClick={() => handleEmailCertificate(participant.id)}
                    disabled={isloading === participant.id}
                  >
                    <FaEnvelope className="me-1" />
                    {isloading === participant.id ? "Processing..." : "Email"}
                  </button>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <Link
                    href={`/dashboard/participant/edit?id=${participant.id}&page=${currentPage}`}
                  >
                    <FaEdit
                      className="text-primary me-3"
                      style={{ cursor: "pointer" }}
                    />
                  </Link>
                  <FaTrashAlt
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(participant.id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-secondary"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <div className="text-center mt-3">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
