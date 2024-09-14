import { createContext, useState } from "react";

export const DataContext = createContext();

export function DataContextProvider(props){
    const [contextData, setContextData] = useState();
    const [contextsideBarNav, setContextSidebarNav] = useState();
    
    const valor = {contextData, setContextData};
    const valor2 = {contextsideBarNav, setContextSidebarNav};
    //const sideBarNav = {page: "Inicio"};
    
    return(
        <DataContext.Provider value={{valor, valor2}}>
            {props.children}
        </DataContext.Provider>
    );
}

/* import { createContext, useState } from "react";

export const DataContext = createContext();

export function DataContextProvider(props){
    const [contextData, setContextData] = useState();
    
    const valor = {contextData, setContextData};
    
    return(
        <DataContext.Provider value={valor}>
            {props.children}
        </DataContext.Provider>
    );
} */
