import { Outlet } from "react-router-dom";
import Navbar from  "./Navbar";
import Footer from "./Footer";
import { ErrorBoundary } from "../ErrorBoundary";
import { DefaultFallback } from "../DefaultFallback";
import { LoadingState } from "../ui/Feedback";
import { Suspense } from "react";


const MainLayout = () => {
  return (
    <>
      <Navbar />

      <main className="pt-20 min-h-screen bg-[#080b14]">
        <ErrorBoundary fallback={DefaultFallback}>
          <Suspense fallback={<LoadingState message="Loading...."/>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
    </>
  );
};

export default MainLayout;