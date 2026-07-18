import { Outlet } from "react-router-dom";
import Navbar from "./Nabvar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-stone-50">
      <Navbar />
      
      {/* Outlet is where the specific page content will be injected */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}