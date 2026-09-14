import { Outlet } from "react-router-dom";
import Navbar from  "./Navbar"; 
import Footer from "./Footer";
import { ErrorBoundary } from "../Errorboundary";
import { DefaultFallback } from "../DefaultFallback";



const MainLayout = () => {
  return (
    <>
      <Navbar />

      <div className="pt-20 min-h-screen bg-[#080b14]">
        <ErrorBoundary fallback={DefaultFallback}>
          <Outlet />
        </ErrorBoundary>
      </div>

      <Footer />
    </>
  );
};

export default MainLayout;