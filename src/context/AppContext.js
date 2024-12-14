/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
"use client";
import { useEffect, createContext, useState, useContext } from "react";
import jwtDecode from "jsonwebtoken"; // Import the JWT library

export const AppContext = createContext({});

// Provider
export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null); // State to hold userId
  const [event, setEvent] = useState([]);
  const [eventParticipant, setEventParticipant] = useState([]);
  const [eventSumary, setEventSumary] = useState([]);
  const [participant, setParticipant] = useState([]);

  // Fetch all Events
  const eventDisplay = async () => {
    try {
      const response = await fetch("http://51.112.24.26:5001/api/event/getAll");
      const eventItem = await response.json();
      setEvent(eventItem?.data);
    } catch (error) {
      console.log("Error fetching events", error);
    }
  };

  // Fetch all Participants
  const displayParticipant = async () => {
    try {
      const response = await fetch(
        "http://51.112.24.26:5001/api/participant/getAll"
      );
      const participantItem = await response.json();
      setParticipant(participantItem?.data);
    } catch (error) {
      console.log("Error fetching participants", error);
    }
  };

  // Decrypt token and extract userId
  const getTokenAndSetUserId = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode.decode(token);
        console.log("decodedToken", decodedToken);
        if (decodedToken?.userId) {
          setUserId(decodedToken.userId); // Set the userId in state
        }
        if (decodedToken?.roleId) {
          setRoleId(decodedToken.roleId); // Set the roleId in state
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  };
  // Fetch all EventsParcipant Report
  const eventParticipantDisplay = async () => {
    try {
      const response = await fetch(
        "http://51.112.24.26:5001/api/email/getReport"
      );
      const getReport = await response.json();
      setEventParticipant(getReport?.data);
    } catch (error) {
      console.log("Error fetching events", error);
    }
  };
  // Fetch all EventsParcipant Summary
  const eventParticipantSummary = async () => {
    try {
      const response = await fetch(
        "http://51.112.24.26:5001/api/email/geteventSumary"
      );
      const eventSumary = await response.json();

      setEventSumary(eventSumary?.data);
    } catch (error) {
      console.log("Error fetching events", error);
    }
  };
  // console.log("that is a eventSumary==========>", eventSumary);

  useEffect(() => {
    getTokenAndSetUserId(); // Decode the token when the component mounts
    eventDisplay(); // Fetch events
    displayParticipant(); // Fetch participants
    eventParticipantDisplay();
    eventParticipantSummary();
  }, []);

  return (
    <AppContext.Provider
      value={{
        roleId,
        userId,
        event,
        eventDisplay,
        participant,
        displayParticipant,
        getTokenAndSetUserId,
        eventParticipant,
        eventParticipantDisplay,
        eventSumary,
        eventParticipantSummary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
