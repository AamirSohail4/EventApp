// In _app.js or _document.js
import "@fortawesome/fontawesome-free/css/all.min.css";

import "../style/auth.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
