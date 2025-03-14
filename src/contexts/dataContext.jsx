import React from "react";
import { createContext, useState } from "react";

export const DataContext = createContext();

export function DataContextProvider(props){
    const [contextData, setContextData] = useState();
    const [contextsideBarNav, setContextSidebarNav] = useState();
    const [contextAdminNav, setContextAdminNav] = useState("");
    
    const valor = {contextData, setContextData};
    const valor2 = {contextsideBarNav, setContextSidebarNav};
    const valor3 = {contextAdminNav, setContextAdminNav};
    //const sideBarNav = {page: "Inicio"};
    
    return(
        <DataContext.Provider value={{valor, valor2, valor3}}>
            {props.children}
        </DataContext.Provider>
    );
}