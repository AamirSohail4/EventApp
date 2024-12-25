import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="main_container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <h1 className="text-primary">Thank You!</h1>
        <p className="fs-5 text-muted">Thanks for registering in the event.</p>
        <p>We look forward to seeing you there!</p>
        <div>
          <Link href="/" className="btn btn-primary mt-3">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
