"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";
import withAuth from "@/components/Hoc"; // Import the HOC

function EventSummary() {
  const [events, setEvents] = useState([]); // Original events fetched from the API
  const [filteredEvents, setFilteredEvents] = useState([]); // Events to display in the table
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    eventName: "",
    participantName: "",
    participantPhone: "",
    participantEmail: "",
    fromDate: "",
    toDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch all events on component mount
  const fetchAllEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://51.112.24.26:5001/api/email/getReport"
      );
      const mydata = response?.data?.data || [];
      console.log("Fetched event data:", mydata);

      // Sort events by registration_date (ascending order)
      const sortedEvents = mydata.sort(
        (a, b) => new Date(a.registration_date) - new Date(b.registration_date)
      );

      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents); // Initialize filtered events with all events
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events. Please try again later.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  // Handle input change for filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value.trim(), // Trim input value as user types
    }));
  };

  // Apply filters
  const applyFilters = () => {
    const {
      eventName,
      participantName,
      participantPhone,
      participantEmail,
      fromDate,
      toDate,
    } = filters;

    const filtered = events.filter((event) => {
      const matchesEventName = eventName
        ? event.event_name?.toLowerCase().includes(eventName.toLowerCase())
        : true;
      const matchesParticipantName = participantName
        ? event.participant_name
            ?.toLowerCase()
            .includes(participantName.toLowerCase())
        : true;
      const matchesParticipantPhone = participantPhone
        ? event.participant_phone_number?.includes(participantPhone)
        : true;
      const matchesParticipantEmail = participantEmail
        ? event.participant_email
            ?.toLowerCase()
            .includes(participantEmail.toLowerCase())
        : true;
      const matchesFromDate = fromDate
        ? new Date(event.registration_date) >= new Date(fromDate)
        : true;
      const matchesToDate = toDate
        ? new Date(event.registration_date) <= new Date(toDate)
        : true;

      return (
        matchesEventName &&
        matchesParticipantName &&
        matchesParticipantPhone &&
        matchesParticipantEmail &&
        matchesFromDate &&
        matchesToDate
      );
    });

    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset to the first page
  };

  // Calculate pagination slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Event Participants</h1>
      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label">Event Name</label>
          <input
            type="text"
            className="form-control"
            name="eventName"
            placeholder="Enter Event Name"
            value={filters.eventName}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            name="participantName"
            placeholder="Enter Participant Name"
            value={filters.participantName}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Mobile Number</label>
          <input
            type="text"
            className="form-control"
            name="participantPhone"
            placeholder="Enter Mobile Number"
            value={filters.participantPhone}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="participantEmail"
            placeholder="Enter Email"
            value={filters.participantEmail}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">From Date</label>
          <input
            type="date"
            className="form-control"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">To Date</label>
          <input
            type="date"
            className="form-control"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-12 text-center mt-3">
          <button className="btn btn-primary" onClick={applyFilters}>
            Search
          </button>
        </div>
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
                <th>Sr</th>
                <th>Date / Time</th>
                <th>Event Name</th>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.length > 0 ? (
                currentEvents.map((event, index) => (
                  <tr key={event.id}>
                    <td>{index + 1 + startIndex}</td>
                    <td>
                      {event.registration_date
                        ? format(
                            new Date(event.registration_date),
                            "dd-MM-yyyy hh:mm:ss a"
                          )
                        : "N/A"}
                    </td>
                    <td>{event.event_name}</td>
                    <td>{event.participant_name}</td>
                    <td>{event.participant_phone_number}</td>
                    <td>{event.participant_email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="d-flex justify-content-center align-items-center mt-4">
            <button
              className="btn btn-secondary me-2"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={`btn ${
                  currentPage === index + 1 ? "btn-primary" : "btn-light"
                } mx-1`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="btn btn-secondary ms-2"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
export default withAuth(EventSummary);
