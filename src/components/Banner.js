"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Banner() {
  const pathname = usePathname();

  return (
    <div className="banner">
      <div className="container">
        <div className="banner_inner">
          <h3>Event</h3>
          {/* Show the link only if the current path is not "/participant" */}
          {pathname !== "/participant" && (
            <a href="/participant" className="register_btn">
              Click Here For Register
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
