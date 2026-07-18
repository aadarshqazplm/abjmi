import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/protectedroute"; // Fixed casing
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Home from "./pages/home";
import About from "./components/about";
import Issues from "./components/issues";
import Guidelines from "./components/guidelines";
import EditorialBoard from "./pages/editorialboard";
import Contact from "./pages/contact";
import JournalInformation from "./components/about";
function App() {
  return (
    <Routes>
      {/* Public Routes - Wrapped in Layout for Navbar/Footer */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home/>} />
      </Route>
         <Route element={<Layout />}>
        <Route path="/about" element={<JournalInformation/>} />
      </Route>
      <Route element={<Layout />}>
        <Route path="/issues" element={<Issues/>} />
      </Route>
       <Route element={<Layout />}>
        <Route path="/guidelines" element={<Guidelines/>} />
      </Route>
       <Route element={<Layout />}>
        <Route path="/editorial-board" element={<EditorialBoard/>} />
      </Route>
        <Route element={<Layout />}>
        <Route path="/contact" element={<Contact/>} />
      </Route>
      {/* Admin Login - No Layout (Standalone) */}
      <Route path="/admin" element={<Login />} />

      {/* Protected Routes (Strictly for Admins) */}
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        {/* Since you don't have a separate dashboard, redirecting to home is perfect */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-stone-100">
            <h1 className="text-5xl font-bold text-red-950">
              404 | Page Not Found
            </h1>
          </div>
        }
      />
    </Routes>
  );
}

export default App;