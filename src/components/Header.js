"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Header() {
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();

    router.push("/auth/signup");
  };

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg custom_color">
        <div className="container-fluid">
          <Link href="/" className="navbar-brand">
            Event App
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {/* Admin with hover dropdown */}
              <li className="nav-item dropdown">
                <Link
                  href="#"
                  className="nav-link dropdown-toggle"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Admin
                </Link>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <Link href="/auth/login" className="dropdown-item">
                      Login
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("token");
                        router.push("/auth/login");
                      }}
                      className="dropdown-item"
                    >
                      Log out
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
