// "use client";

// import { useAuth } from "@/context/AuthContext"; // Update path based on your structure
// import { useRouter } from "next/navigation"; // Using next/navigation for router
// import { useEffect, useState } from "react";

// const withAuth = (WrappedComponent, allowedRoles) => {
//   const AuthHOC = (props) => {
//     const { authData } = useAuth();
//     const router = useRouter();
//     const [isMounted, setIsMounted] = useState(false); // State to check if client-side rendering has mounted

//     // Ensure that the component is mounted on the client side
//     useEffect(() => {
//       setIsMounted(true); // Set mounted to true on client side
//     }, []);

//     // Ensure that router logic only runs when mounted and on the client
//     useEffect(() => {
//       if (isMounted) {
//         // Redirect if no token or role is not allowed
//         if (!authData?.token || !allowedRoles.includes(authData.role)) {
//           router.push("/auth/login"); // Redirect to login if unauthorized
//         }
//       }
//     }, [authData, isMounted, router]);

//     // Show a loading state until client-side rendering has mounted
//     if (
//       !isMounted ||
//       !authData?.token ||
//       !allowedRoles.includes(authData.role)
//     ) {
//       return <div>Loading...</div>; // You can replace with a spinner or null
//     }

//     return <WrappedComponent {...props} />;
//   };

//   // Set a display name for the HOC
//   AuthHOC.displayName = `WithAuth(${
//     WrappedComponent.displayName || WrappedComponent.name || "Component"
//   })`;

//   return AuthHOC;
// };

// export default withAuth;

"use client";

import { useAuth } from "@/context/AuthContext"; // Update path based on your structure
import { useRouter } from "next/navigation"; // Using next/navigation for router
import { useEffect, useState } from "react";

const withAuth = (WrappedComponent) => {
  const AuthHOC = (props) => {
    const { authData } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false); // State to check if client-side rendering has mounted

    // Ensure that the component is mounted on the client side
    useEffect(() => {
      setIsMounted(true); // Set mounted to true on client side
    }, []);

    // Ensure that router logic only runs when mounted and on the client
    useEffect(() => {
      if (isMounted) {
        // Redirect to login if no token is found
        if (!authData?.token) {
          router.push("/auth/login"); // Redirect to login if no token
        }
      }
    }, [authData, isMounted, router]);

    // Show a loading state until client-side rendering has mounted
    if (!isMounted || !authData?.token) {
      return <div>Loading...</div>; // You can replace with a spinner or null
    }

    return <WrappedComponent {...props} />;
  };

  // Set a display name for the HOC
  AuthHOC.displayName = `WithAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AuthHOC;
};

export default withAuth;
