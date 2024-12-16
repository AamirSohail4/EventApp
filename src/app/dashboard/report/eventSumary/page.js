"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

export default function EventSummary() {
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

  useEffect(() => {
    if (roleId == 2) {
      router.push("/dashboard/report/eventSumary");
    } else {
      router.push("/auth/login");
    }
  }, [roleId, router]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

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
      setFilteredEvents(mydata);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events. Please try again later.");
      setIsLoading(false);
    }
  }, []); // empty array because fetchAllEvents does not depend on any state

  // Fetch filtered events based on filters
  const fetchFilteredEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://51.112.24.26:5001/api/email/geteventSumary",
        {
          params: {
            event_name: filters.name,
            from_date: filters.fromDate,
            to_date: filters.toDate,
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
  }, [filters]); // depend on filters to refetch data when filters change

  // Fetch all events initially
  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]); // depend on fetchAllEvents to avoid unnecessary re-renders

  // Apply filters when user modifies them
  useEffect(() => {
    if (filters.name || filters.fromDate || filters.toDate) {
      fetchFilteredEvents();
    } else {
      setFilteredEvents(events);
    }
  }, [filters, events, fetchFilteredEvents]); // include fetchFilteredEvents

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

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Event Summary</h1>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label></label>
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
