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
// const jsPDF = dynamic(() => import("jspdf"), { ssr: false });

export default function Participant() {
  const { participant, userId, displayParticipant, roleId } = useAppContext();
  const [loading, setLoading] = useState(null);
  const [isloading, setIsLoading] = useState(null);
  const router = useRouter();
  // Pagination state

  useEffect(() => {
    if (roleId == 2) {
      router.push("/dashboard/participant");
    } else {
      router.push("/auth/login");
    }
  }, [roleId, router]);

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 4;

  // Calculate pagination details
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = participant.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(participant.length / eventsPerPage);

  // Change page handler
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

      // Step 2: Load the certificate image
      const imgUrl = `http://51.112.24.26:5001/${maindata.event_certificate_file_path}`;
      const img = await fetch(imgUrl);
      const blob = await img.blob();
      const imgBase64 = await blobToBase64(blob);

      // Step 3: Create a canvas and draw the certificate image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const image = new window.Image(); // Use global Image object
      image.src = imgBase64;

      // Wait for the image to load
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw the certificate image on the canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Step 4: Add the participant's name to the canvas
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "#000"; // Black color
        ctx.textAlign = "center";

        // Position the text (adjust these values based on your certificate template)
        ctx.fillText(
          maindata.participant_name,
          canvas.width / 2,
          canvas.height / 2 + 50
        );

        // Step 5: Convert the canvas to a data URL
        const updatedImgBase64 = canvas.toDataURL("image/png");

        // Step 6: Generate the PDF using jsPDF
        const pdf = new jsPDF({
          orientation: "landscape", // Adjust based on your certificate
          unit: "px",
          format: [canvas.width, canvas.height], // Match the image dimensions
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
    } catch (error) {
      console.error("Error occurred while processing the certificate:", error);
      alert("An error occurred while processing the certificate.");
      setLoading(null); // End loading in case of error
    }
  };

  //Printing Certificate
  // const handlePrintCertificate = async (id) => {
  //   try {
  //     setLoading(id); // Start loading

  //     // Step 1: Fetch participant data
  //     const res = await fetch(
  //       `http://51.112.24.26:5001/api/participant/getOne/${id}`
  //     );
  //     const fetchdata = await res.json();
  //     const maindata = fetchdata.data;

  //     console.log("Fetched Data:", maindata);

  //     // Step 2: Load the certificate image
  //     const imgUrl = `http://51.112.24.26:5001/${maindata.event_certificate_file_path}`;
  //     const img = await fetch(imgUrl);
  //     const blob = await img.blob();
  //     const imgBase64 = await blobToBase64(blob);

  //     // Step 3: Create a canvas and draw the certificate image
  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d");

  //     const image = new Image();
  //     image.src = imgBase64;

  //     // Wait for the image to load
  //     image.onload = () => {
  //       canvas.width = image.width;
  //       canvas.height = image.height;

  //       // Draw the certificate image on the canvas
  //       ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  //       // Step 4: Add the participant's name to the canvas
  //       ctx.font = "bold 40px Arial";
  //       ctx.fillStyle = "#000"; // Black color
  //       ctx.textAlign = "center";

  //       // Position the text (adjust these values based on your certificate template)
  //       ctx.fillText(
  //         maindata.participant_name,
  //         canvas.width / 2,
  //         canvas.height / 2 + 50
  //       );

  //       // Step 5: Convert the canvas to a data URL
  //       const updatedImgBase64 = canvas.toDataURL("image/png");

  //       // Step 6: Generate the PDF using jsPDF
  //       const pdf = new jsPDF({
  //         orientation: "landscape", // Adjust based on your certificate
  //         unit: "px",
  //         format: [canvas.width, canvas.height], // Match the image dimensions
  //       });

  //       pdf.addImage(
  //         updatedImgBase64,
  //         "PNG",
  //         0,
  //         0,
  //         canvas.width,
  //         canvas.height
  //       );

  //       // Save the PDF locally or process further
  //       pdf.save(`${maindata.participant_name}-Certificate.pdf`);

  //       setLoading(null); // End loading
  //     };
  //   } catch (error) {
  //     console.error("Error occurred while processing the certificate:", error);
  //     alert("An error occurred while processing the certificate.");
  //     setLoading(null); // End loading in case of error
  //   }
  // };

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

      // Step 2: Load the certificate image
      const imgUrl = `http://51.112.24.26:5001/${maindata.event_certificate_file_path}`;
      const img = await fetch(imgUrl);
      const blob = await img.blob();
      const imgBase64 = await blobToBase64(blob);

      // Step 3: Create a canvas and draw the certificate image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // const image = new Image();
      const image = new window.Image(); // Use global Image object
      image.src = imgBase64;

      // Wait for the image to load
      await new Promise((resolve) => (image.onload = resolve));
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw the certificate image on the canvas
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Step 4: Add the participant's name to the canvas
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#000"; // Black color
      ctx.textAlign = "center";

      // Position the text (adjust these values based on your certificate template)
      ctx.fillText(
        maindata.participant_name,
        canvas.width / 2,
        canvas.height / 2 + 50
      );

      // Step 5: Convert the canvas to a data URL
      const updatedImgBase64 = canvas.toDataURL("image/png");

      // Step 6: Generate the PDF using jsPDF
      const pdf = new jsPDF({
        orientation: "landscape", // Adjust based on your certificate
        unit: "px",
        format: [canvas.width, canvas.height], // Match the image dimensions
      });

      pdf.addImage(updatedImgBase64, "PNG", 0, 0, canvas.width, canvas.height);

      const pdfBlob = pdf.output("blob");

      // Step 7: Send the PDF file to the backend
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
          {currentEvents.map((participant, index) => (
            <tr key={participant.id}>
              <td>{index + 1}</td>

              <td>
                {format(new Date(participant.registration_date), "dd-MM-yyyy")}
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
                <Link href={`/dashboard/participant/edit?id=${participant.id}`}>
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
          ))}
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
