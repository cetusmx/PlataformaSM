import React from 'react'
import SideBarItem from "./SideBarItem";
import items from "../data/sidebarUser.json";
import "../styles/sidebartree.css";
import { BiHome } from "react-icons/bi";
import logoImage from "../assets/Logo3tr.png";

const SidebarTreeUser = () => {
    return (
        <>
          <div className="sidebar">
            <div className="logo">
              <img src={logoImage} alt="Logo" className="logo-image" />
              {/* <BiHome className="logo-icon" /> */}
              <h4 style={{ padding: 0 }}>Seal Market</h4>
            </div>
            {items.map((item, index) => (
              <SideBarItem key={index} item={item} />
            ))}
          </div>
        </>
      );
}

export default SidebarTreeUser