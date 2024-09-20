import React, { useContext }from 'react';
import Sidebar from './components/Sidebar';
import SidebarUser from './components/SidebarUser';
import SidebarSop from './components/SidebarSop';
import ContentAdmin from './pages/ContentAdmin';
import { DataContext } from "./contexts/dataContext";

const AppAdmin = ({usuari}) => {

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const {contextsideBarNav, setContextSidebarNav} = valor2;

  console.log("AppAdmin: " + contextData.uid);
  console.log("AppAdmin: " + contextData.email);
  console.log("AppAdmin: " + contextData.rol);
  console.log("AppAdmin: " + contextData.sucursal);
  //console.log("AppAdmin=> navegacion: " + contextsideBarNav.page);
  console.log("AppAdmin=> navegacion1: " + contextsideBarNav);

  return (
    
     <div className="dashboard">
      
      {
        (usuari.rol==="admin")
        ? <Sidebar />
        : (usuari.rol==="user")
          ? <SidebarUser />
          : <SidebarSop />
      }
        
        <div className="dashboard--content">
           <ContentAdmin />
          
        </div>
        </div>
          
  )
}

export default AppAdmin;