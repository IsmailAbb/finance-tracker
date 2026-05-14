import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth/AuthContext";
import { ConfirmProvider } from "./components/ConfirmDialog";
import { ThemeProvider } from "./theme/ThemeContext";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ConfirmProvider>
            <App />
            <Toaster position="top-right" richColors closeButton />
          </ConfirmProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
