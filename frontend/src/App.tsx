import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Footer from "./components/layout/Footer";
import Account from "./pages/Account";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
          <Routes>   
        {/* PUBLIC AUTH ROUTES (Only for guests) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* PUBLIC APP ROUTES (Everyone can see the Navbar and Home page) */}
        <Route element={<MainLayout />}>
           <Route path="/" element={<Home />} />
        </Route>

        {/* PROTECTED APP ROUTES (Only for logged-in users) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
           <Route path="/account" element={<Account />} />
            {/* Put authenticated-only pages here */}
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            {/* <Route path="/analyse" element={<Analyse />} /> */}
          </Route>
        </Route>

      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;