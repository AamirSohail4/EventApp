"use client";
import Link from "next/link";
import {
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa"; // Font Awesome React Icons
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppContext } from "@/context/AppContext";
import { format } from "date-fns";
import Image from "next/image";

export default function Event() {
  const { event, userId, roleId, eventDisplay } = useAppContext();
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 4;

  // Calculate pagination details
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = event?.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(event?.length / eventsPerPage);

  useEffect(() => {
    if (roleId == 2) {
      router.push("/dashboard/event");
    } else {
      router.push("/auth/login");
    }
  }, [roleId, router]);
  // Page change handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Pagination controls for previous and next
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDelete = async (id) => {
    // Confirm deletion action
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the Event with ID: ${id}?`
    );

    if (confirmDelete) {
      try {
        // Send DELETE request to the server
        const response = await fetch(
          `http://51.112.24.26:5001/api/event/delete/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          const result = await response.json();

          alert(`Event with ID: ${id} has been deleted successfully.`);
          eventDisplay();
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message || "Unable to delete Event."}`);
        }
      } catch (error) {
        console.error("Error during delete operation:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/event");
  };
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Event Management</h1>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1></h1>
        <Link href="/dashboard/event/add" className="btn btn-primary">
          Add Event
        </Link>
      </div>

      <table className="table table-striped table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Event Name</th>
            <th>Event From Date</th>
            <th>Event To Date</th>
            <th>Event Place</th>
            <th>Event Certificate</th>
            <th>Event Banner</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentEvents.map((event, index) => {
            const isExpired = new Date(event.event_to_date) < new Date(); // Check if event_to_date is before today's date
            return (
              <tr key={event.id}>
                <td>{index + 1}</td>
                <td>{event.event_name}</td>
                <td>{format(new Date(event.event_from_date), "dd-MM-yyyy")}</td>
                <td>{format(new Date(event.event_to_date), "dd-MM-yyyy")}</td>
                <td>{event.event_location}</td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <Image
                    src={
                      event.event_certificate_file_path
                        ? `http://51.112.24.26:5001/${event.event_certificate_file_path}` // Full URL with the prefix
                        : "/images/product.jpg" // Path to your dummy image
                    }
                    alt="Event Certificate"
                    width={50} // Width in pixels
                    height={50} // Height in pixels
                    style={{
                      border: "2px solid",
                      objectFit: "contain",
                    }}
                  />
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <Image
                    src={
                      event.event_banner_file_path
                        ? `http://51.112.24.26:5001/${event.event_banner_file_path}` // Full URL with the prefix
                        : "/images/product.jpg" // Path to your dummy image
                    }
                    alt="Event Banner"
                    width={50} // Width in pixels
                    height={50} // Height in pixels
                    style={{
                      border: "2px solid",
                      objectFit: "contain",
                    }}
                  />
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  {isExpired ? (
                    <FaTimesCircle
                      style={{ color: "red", fontSize: "1.5em" }}
                      title="Expired"
                    />
                  ) : (
                    <FaCheckCircle
                      style={{ color: "green", fontSize: "1.5em" }}
                      title="Active"
                    />
                  )}
                </td>

                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <Link href={`/dashboard/event/edit?id=${event.id}`}>
                    <FaEdit
                      className="text-primary me-3"
                      style={{ cursor: "pointer" }}
                    />
                  </Link>
                  <FaTrashAlt
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(event.id)}
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
