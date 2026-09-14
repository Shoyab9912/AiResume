import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";

import { ErrorBoundary } from "./components/Errorboundary";
import { DefaultFallback } from "./components/DefaultFallback";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

const Account = lazy(() => import("./pages/Account"));
const Analyze = lazy(() => import("./pages/Analyze"));
const JobMatcher = lazy(() => import("./pages/JobMatcher"));
const InterviewPrep = lazy(() => import("./pages/InterviewPrep"));
const BuildResume = lazy(() => import("./pages/BuildResume"));

const withBoundary = (element: React.ReactElement) => (
  <ErrorBoundary fallback={DefaultFallback}>
    {element}
  </ErrorBoundary>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route element={<PublicRoute />}>
          <Route path="/login" element={withBoundary(<Login />)} />
          <Route path="/register" element={withBoundary(<Register />)} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/account" element={<Account />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/jobmatcher" element={<JobMatcher />} />
            <Route path="/interviewprep" element={<InterviewPrep />} />
            <Route path="/resumebuilder" element={<BuildResume />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;