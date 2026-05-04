import { useState, useContext } from "react";
import { DataContext } from "../contexts/dataContext";
import { Link } from "react-router-dom";

export default function SideBarItem({ item, isOpen, toggleOpen }) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isMenuOpen = isOpen !== undefined ? isOpen : internalOpen;
  const handleToggle = toggleOpen || (() => setInternalOpen(!internalOpen));

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const { contextsideBarNav, setContextSidebarNav } = valor2;

  if (item.childrens) {
    return (
      <div className={isMenuOpen ? "sidebar-item open" : "sidebar-item"}>
        <div className="sidebar-title">
          <span onClick={handleToggle} style={{ cursor: 'pointer', flexGrow: 1 }}>
            {item.icon && <i className={item.icon}></i>}
            {item.title}
          </span>
          <i
            className="bi-chevron-down toggle-btnS"
            onClick={handleToggle}
          ></i>
        </div>
        <div className="sidebar-content" style={{ paddingLeft: "0.75rem" }}>
          {item.childrens.map((child, index) => (
            <SideBarItem key={index} item={child} />
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <Link
        to={item.path}
        className="sidebar-item plain"
        onClick={() => {
          setContextSidebarNav(item.title);
        }}
      >
        {item.icon && <i className={item.icon}></i>}
        {item.title}
      </Link>
    );
  }
}
