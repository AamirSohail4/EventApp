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
import { useAuth } from "@/context/AuthContext";
import withAuth from "@/components/Hoc"; // Import the HOC

function Event() {
  const { event, eventDisplay } = useAppContext();
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;

  // **Sort events by ID** in ascending order before processing
  const sortedEvents = [...(event || [])].sort((a, b) => a.id - b.id);

  // Calculate pagination details
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);

  // Logic for displaying page numbers (show maximum of 5 page buttons at a time)
  const pageNumbers = [];
  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Handle page change
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

  // Fetch the correct page on mount (from query params)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page");
    if (page) {
      setCurrentPage(Number(page));
    }
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the Event with ID: ${id}?`
    );

    if (confirmDelete) {
      try {
        const response = await fetch(
          `http://51.112.24.26:5001/api/event/delete/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
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
            <th>Sr</th>
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
            const globalIndex = indexOfFirstEvent + index + 1; // Global Sr number
            const isExpired = new Date(event.event_to_date) < new Date();
            return (
              <tr key={event.id}>
                <td>{globalIndex}</td>
                <td>{event.event_name}</td>
                <td>{format(new Date(event.event_from_date), "dd-MM-yyyy")}</td>
                <td>{format(new Date(event.event_to_date), "dd-MM-yyyy")}</td>
                <td>{event.event_location}</td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <Image
                    src={
                      event.event_certificate_file_path
                        ? `http://51.112.24.26:5001/${event.event_certificate_file_path}`
                        : "/images/product.jpg"
                    }
                    alt="Event Certificate"
                    width={50}
                    height={50}
                  />
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <Image
                    src={
                      event.event_banner_file_path
                        ? `http://51.112.24.26:5001/${event.event_banner_file_path}`
                        : "/images/product.jpg"
                    }
                    alt="Event Banner"
                    width={50}
                    height={50}
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
                  <Link
                    href={`/dashboard/event/edit?id=${event.id}&page=${currentPage}`}
                  >
                    <FaEdit className="text-primary me-3" />
                  </Link>
                  <FaTrashAlt
                    className="text-danger"
                    onClick={() => handleDelete(event.id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-center mt-3">
        {/* Previous Button */}
        <button
          className="btn btn-secondary mx-1"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            className={`btn mx-1 ${
              page === currentPage ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          className="btn btn-secondary mx-1"
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
export default withAuth(Event);
