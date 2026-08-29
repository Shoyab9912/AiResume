import { Outlet } from "react-router-dom";
import Navbar from  "./Navbar"; 

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div className="pt-20 min-h-screen bg-[#080b14]"> 
        <Outlet /> 
      </div>
    </>
  );
};

export default MainLayout;