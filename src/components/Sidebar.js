"use client"; // Ensure this is a client component
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation"; // Use usePathname for App Router
import Image from "next/image"; // Import Image from next/image

export function Sidebar() {
  const pathname = usePathname(); // Get the current pathname
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  // Function to toggle dropdown visibility for Reports
  const toggleReports = () => {
    setIsReportsOpen(!isReportsOpen);
  };

  // Function to check if the current route matches a given path
  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path); // Now using pathname directly
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link href="/dashboard">
          {/* Replace img tag with Image component */}
          <Image
            src="/images/logo.jpg"
            alt="Logo"
            className="sidebar-logo"
            width={150} // Specify the width
            height={50} // Specify the height
          />
        </Link>
      </div>

      <nav>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link
              href="/dashboard"
              className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
            >
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link
              href="/dashboard/event"
              className={`nav-link ${
                isActive("/dashboard/event") ? "active" : ""
              }`}
            >
              Event
            </Link>
          </li>
          <li className="nav-item">
            <Link
              href="/dashboard/participant"
              className={`nav-link ${
                isActive("/dashboard/participant") ? "active" : ""
              }`}
            >
              Participant
            </Link>
          </li>
          <li className="nav-item">
            <a
              href="#"
              className={`nav-link ${isReportsOpen ? "active" : ""}`}
              onClick={toggleReports}
              style={{ cursor: "pointer" }}
            >
              Reports
              <span className="dropdown-icon">{isReportsOpen ? "▲" : "▼"}</span>
            </a>
            {isReportsOpen && (
              <ul className="submenu">
                <li>
                  <Link
                    href="/dashboard/report/eventParticipant"
                    className={`nav-link ${
                      isActive("/dashboard/report/eventParticipant")
                        ? "active"
                        : ""
                    }`}
                  >
                    Event Participants
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/report/eventSumary"
                    className={`nav-link ${
                      isActive("/dashboard/report/eventSumary") ? "active" : ""
                    }`}
                  >
                    Event Summary
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}
