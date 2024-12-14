"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";
import { FaTrashAlt } from "react-icons/fa";

export default function EventSummary() {
  const [filters, setFilters] = useState({
    participant_name: "",
    event_name: "",
    fromDate: "",
    toDate: "",
    mobile_number: "",
    email: "",
  });

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Fetch all events on component mount
  const fetchAllEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://51.112.24.26:5001/api/email/getReport"
      );
      const mydata = response?.data?.data || [];
      setEvents(mydata);
      setFilteredEvents(mydata);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events. Please try again later.");
      setIsLoading(false);
    }
  }, []); // Empty array because fetchAllEvents does not depend on any state

  // Fetch filtered events based on filters
  const fetchFilteredEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://51.112.24.26:5001/api/email/getReport",
        {
          params: {
            event_name: filters.event_name,
            from_date: filters.fromDate,
            to_date: filters.toDate,
            participant_name: filters.participant_name,
            email: filters.email,
            mobile_number: filters.mobile_number,
          },
        }
      );
      const filteredData = response?.data?.data || [];
      setFilteredEvents(filteredData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching filtered events:", error);
      setError("Failed to fetch filtered events. Please try again later.");
      setIsLoading(false);
    }
  }, [filters]); // Depend on filters to refetch data when they change

  // Fetch all events initially
  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]); // Depend on fetchAllEvents to avoid unnecessary re-renders

  // Apply filters when filters are modified
  useEffect(() => {
    fetchFilteredEvents();
  }, [filters, fetchFilteredEvents]); // Include fetchFilteredEvents in the dependency array

  // Calculate pagination slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredEvents.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDelete = (id) => {
    // Implement delete functionality as needed
    console.log(`Delete event with ID: ${id}`);
  };
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Event Summary</h1>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <input
            type="text"
            name="event_name"
            className="form-control"
            placeholder="Event Name"
            value={filters.event_name}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            name="mobile_number"
            className="form-control"
            placeholder="Mobile Number"
            value={filters.mobile_number}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4 ">
          <input
            type="text"
            name="email"
            className="form-control"
            placeholder="Email"
            value={filters.email}
            onChange={handleFilterChange}
          />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-4">
          <label></label>
          <input
            type="text"
            name="participant_name"
            className="form-control"
            placeholder="Event Participant Name"
            value={filters.participant_name}
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
                  Date / Time
                </th>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Event Name
                </th>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Name
                </th>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Mobile Number
                </th>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Email
                </th>
                {/* <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody>
              {currentEvents.length > 0 ? (
                currentEvents.map((eventReport, index) => (
                  <tr key={eventReport.id}>
                    <td>{index + 1 + startIndex}</td>
                    <td>
                      {eventReport.registration_date
                        ? format(
                            new Date(eventReport.registration_date),
                            "dd-MM-yyyy hh:mm:ss a"
                          )
                        : "N/A"}
                    </td>
                    <td>{eventReport.event_name}</td>
                    <td>{eventReport.participant_name}</td>
                    <td>{eventReport.participant_phone_number}</td>
                    <td>{eventReport.participant_email}</td>
                    {/* <td>
                      <FaTrashAlt
                        className="text-danger"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDelete(eventReport.id)}
                      />
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No events found
                  </td>
                </tr>
              )}
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
              disabled={
                currentPage >= Math.ceil(filteredEvents.length / itemsPerPage)
              }
            >
              Next
            </button>
          </div>

          <div className="text-center mt-3">
            Page {currentPage} of{" "}
            {Math.ceil(filteredEvents.length / itemsPerPage) || 1}
          </div>
        </>
      )}
    </div>
  );
}
