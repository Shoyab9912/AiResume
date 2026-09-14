import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import JobMatcher from "./pages/JobMatcher";
import InterviewPrep from "./pages/InterviewPrep";
import BuildResume from "./pages/BuildResume";
import {ErrorBoundary} from "./components/Errorboundary"
import { DefaultFallback } from "./components/DefaultFallback";


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
          <Route path="/" element={withBoundary(<Home />)} />
        </Route>

        <Route element={<PublicRoute />}>
          <Route path="/login" element={withBoundary(<Login />)} />
          <Route path="/register" element={withBoundary(<Register />)} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/account" element={withBoundary(<Account />)} />
            <Route path="/analyze" element={withBoundary(<Analyze />)} />
            <Route path="/jobmatcher" element={withBoundary(<JobMatcher />)} />
            <Route
              path="/interviewprep"
              element={withBoundary(<InterviewPrep />)}
            />
            <Route
              path="/resumebuilder"
              element={withBoundary(<BuildResume />)}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
