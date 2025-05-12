import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "@/Router";
import { ToastContainer } from "react-toastify";
//import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
//import "./App.css";

// Create a client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      suspense: false // Changed to false to control suspense manually
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingFallback />}>
        <AuthProvider>
          <Router>
            <AppRouter />
            <ToastContainer position="top-right" autoClose={5000} />
          </Router>
        </AuthProvider>
      </Suspense>
    </QueryClientProvider>
  );
};

export default App;
