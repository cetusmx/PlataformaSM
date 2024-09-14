import React, { useContext } from "react";
import ContentHeader from "./ContentHeader";
import "../styles/content.css";
import Card from "./Card";
import { DataContext } from "../contexts/dataContext";

const Content = () => {
  
 /*  const { contextData, setContextData } = useContext(DataContext);

  console.log(contextData); */

  return (
    <div className="content">
      <ContentHeader />
      <Card />
    </div>
  );
};

export default Content;