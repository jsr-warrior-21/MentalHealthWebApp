import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import logo from "../assets/logo.svg";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { token, setToken, userData } = useContext(AppContext); // ✅ use userData
  const [showMenu, setShowMenu] = useState(false);

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/"); // ✅ send back to homepage after logout
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        className="w-44 cursor-pointer"
        src={logo}
        alt="Logo"
      />

      {/* Desktop menu */}
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <li className="py-1">
          <NavLink to="/" className={({ isActive }) => (isActive ? "border-b-2 border-[#5f6FFF]" : "")}>
            HOME
          </NavLink>
        </li>
        <li className="py-1">
          <NavLink to="/doctors" className={({ isActive }) => (isActive ? "border-b-2 border-[#5f6FFF]" : "")}>
            ALL DOCTORS
          </NavLink>
        </li>
        <li className="py-1">
          <NavLink to="/about" className={({ isActive }) => (isActive ? "border-b-2 border-[#5f6FFF]" : "")}>
            ABOUT
          </NavLink>
        </li>
        <li className="py-1">
          <NavLink to="/contact" className={({ isActive }) => (isActive ? "border-b-2 border-[#5f6FFF]" : "")}>
            CONTACT
          </NavLink>
        </li>
      </ul>

      {/* Right side (auth / menu) */}
      <div className="flex items-center gap-4">
        {token && userData ? (
          // ✅ Dropdown menu
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img
              className="w-8 h-8 rounded-full object-cover border"
              src={userData.image || assets.profile_pic} // ✅ fallback placeholder
              alt="Profile"
            />
            <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4 shadow-md">
                <p
                  onClick={() => navigate("/my-profile")}
                  className="hover:text-black cursor-pointer"
                >
                  My Profile
                </p>
                <p
                  onClick={() => navigate("/my-appointments")}
                  className="hover:text-black cursor-pointer"
                >
                  My Appointments
                </p>
                <p
                  onClick={logout}
                  className="hover:text-black cursor-pointer"
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          // ✅ Show login button if not authenticated
          <button
            onClick={() => navigate("/login")}
            className="bg-[#5f6FFF] rounded-full text-white px-8 py-3 font-light cursor-pointer hidden md:block"
          >
            Create Account
          </button>
        )}

        {/* Mobile hamburger */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="Menu"
        />

        {/* Mobile menu */}
        <div
          className={`${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden top-0 right-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36 cursor-pointer" src={logo} alt="Logo" />
            <img
              className="w-7 cursor-pointer"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt="Close"
            />
          </div>

          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded inline-block">Home</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded inline-block">ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded inline-block">ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block">CONTACT</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
