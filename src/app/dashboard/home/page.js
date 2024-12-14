export default function Home() {
  return (
    <main className="main_container">
      <h3 className="dashboard_title">Dashboard</h3>
      <div className="card_container">
        {/* Events Card */}
        <div className="card">
          <h4 className="card_title">Events</h4>
          <p className="card_description">Number of Events. 15</p>

          <a href="/event" className="card_button">
            View Events
          </a>
        </div>
        {/* Participants Card */}
        <div className="card">
          <h4 className="card_title">Participants</h4>
          <p className="card_description">Number of participants. 15 </p>

          <a href="/participant" className="card_button">
            View Participants
          </a>
        </div>
      </div>
    </main>
  );
}
