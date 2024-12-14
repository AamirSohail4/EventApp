"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export default function Dashboard() {
  const { event, participant, roleId, userId, getTokenAndSetUserId } =
    useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (roleId == 2) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  }, [roleId, router]);

  return (
    <main className="main_container">
      <h3 className="dashboard_title">Dashboard</h3>
      <div className="card_container">
        {/* Events Card */}
        <div className="card">
          <h4 className="card_title">Events</h4>
          <p className="card_description">Number of Events. {event?.length}</p>

          <a href="/dashboard/event" className="card_button">
            View Events
          </a>
        </div>
        {/* Participants Card */}
        <div className="card">
          <h4 className="card_title">Participants</h4>
          <p className="card_description">
            Number of participants. {participant?.length}
          </p>

          <a href="/dashboard/participant" className="card_button">
            View Participants
          </a>
        </div>
      </div>
    </main>
  );
}
