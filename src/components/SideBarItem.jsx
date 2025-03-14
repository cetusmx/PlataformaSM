import { useState, useContext } from "react"
import { DataContext } from "../contexts/dataContext";
import { Link } from "react-router-dom";


export default function SideBarItem({item}){

    const [open, setOpen] = useState(false)
    const { valor, valor2 } = useContext(DataContext);
    const { contextData, setContextData } = valor;
  const {contextsideBarNav, setContextSidebarNav} = valor2;
    
    if(item.childrens){
        return (
            <div className={open ? "sidebar-item open" : "sidebar-item"}>
                <div className="sidebar-title">
                    <span>
                        { item.icon && <i className={item.icon}></i> }
                        {item.title}  
                    </span> 
                    <i className="bi-chevron-down toggle-btnS" onClick={() => setOpen(!open)}></i>
                </div>
                <div className="sidebar-content" style={{paddingLeft: "0.75rem"}}>
                    { item.childrens.map((child, index) => <SideBarItem key={index} item={child} />) }
                </div>
            </div>
        )
    }else{
        return (
            <Link to={item.path} className="sidebar-item plain" onClick={()=>{setContextSidebarNav(item.title)}}>
                      { item.icon && <i className={item.icon}></i> }
                      {item.title}
                    </Link>
        )
    }
}