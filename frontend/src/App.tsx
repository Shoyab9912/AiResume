import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Footer from "./components/layout/Footer";
import Account from "./pages/Account";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import JobMatcher from "./pages/JobMatcher";

function App() {
  return (
    <BrowserRouter>
          <Routes>   
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<MainLayout />}>
           <Route path="/" element={<Home />} />
        </Route>

          <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
           <Route path="/account" element={<Account />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/jobmatcher" element={<JobMatcher />} />
            
          </Route>
        </Route>

      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;