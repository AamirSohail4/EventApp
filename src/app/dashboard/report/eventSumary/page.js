"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import withAuth from "@/components/Hoc"; // Import the HOC
function EventSummary() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    name: "",
    fromDate: "",
    toDate: "",
  });
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { roleId } = useAppContext();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  // Fetch all events on component mount
  const fetchAllEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://51.112.24.26:5001/api/email/geteventSumary"
      );
      const mydata = response?.data?.data || [];
      console.log("That is a response", mydata);

      setEvents(mydata);
      setFilteredEvents(mydata); // initially set filtered events to all events
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events. Please try again later.");
      setIsLoading(false);
    }
  }, []);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Apply filters to the data
  const applyFilters = () => {
    let filteredData = [...events];

    // Normalize filter values
    const normalizedName = filters.name.trim().replace(/\s+/g, " "); // normalize name filter

    // Filter by event name
    if (normalizedName) {
      filteredData = filteredData.filter((event) =>
        event.event_name.toLowerCase().includes(normalizedName.toLowerCase())
      );
    }

    // Filter by fromDate (if selected)
    if (filters.fromDate) {
      filteredData = filteredData.filter(
        (event) =>
          new Date(event.first_registration_date) >= new Date(filters.fromDate)
      );
    }

    // Filter by toDate (if selected)
    if (filters.toDate) {
      filteredData = filteredData.filter(
        (event) =>
          new Date(event.first_registration_date) <= new Date(filters.toDate)
      );
    }

    setFilteredEvents(filteredData);
    setCurrentPage(1); // Reset to first page after applying filter
  };

  // Fetch all events initially
  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  // Calculate pagination slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Logic for displaying page numbers (show maximum of 5 page buttons at a time)
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  // Determine which page buttons to display
  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  // Adjust startPage if endPage doesn't show enough buttons
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  // Generate an array of visible page numbers
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Pagination controls for previous and next
  const handlePreviousPage = () => handlePageChange(currentPage - 1);
  const handleNextPage = () => handlePageChange(currentPage + 1);

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Event Summary</h1>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label>Event Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Event Name"
            value={filters.name}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4">
          <label>From Date</label>
          <input
            type="date"
            name="fromDate"
            className="form-control"
            value={filters.fromDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4">
          <label>To Date</label>
          <input
            type="date"
            name="toDate"
            className="form-control"
            value={filters.toDate}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="mb-4">
        <button className="btn btn-primary" onClick={applyFilters}>
          Search
        </button>
      </div>

      {isLoading ? (
        <div>Loading events...</div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : (
        <>
          <table className="table table-striped table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Sr
                </th>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Event
                </th>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Participants Count
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.length > 0 ? (
                currentEvents.map((event, index) => (
                  <tr key={event.event_id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{event.event_name}</td>
                    <td>{event.participants_count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
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
        </>
      )}
    </div>
  );
}
export default withAuth(EventSummary);
