import React from "react";
import { BiLogoHtml5, BiLogoAndroid, BiBuilding } from "react-icons/bi";

const course = [
  {
    title: "Web Development",
    icon: <BiLogoHtml5 />,
  },
  {
    title: "App Development",
    duration: "2 hours",
    icon: <BiLogoAndroid />,
  },
  {
    title: "UX & UI",
    duration: "2 hours",
    icon: <BiBuilding />,
  },
];
const course1 = [
  {
    title: "Web Development",
    icon: <BiLogoHtml5 />,
  },
  {
    title: "App Development",
    duration: "2 hours",
    icon: <BiLogoAndroid />,
  },
  {
    title: "UX & UI",
    duration: "2 hours",
    icon: <BiBuilding />,
  },
];

const Card = () => {
  return ( <>
    <div className="cardM--container">
      {course.map((item) => (
        <div className="cardM">
          <div className="cardM--cover">{item.icon}</div>
          <div className="cardM--title">
            <h6>{item.title}</h6>
          </div>
        </div>
      ))}
    </div>

    <div className="cardM--container">
      {course1.map((item) => (
        <div className="cardM">
          <div className="cardM--cover">{item.icon}</div>
          <div className="cardM--title">
            <h6>{item.title}</h6>
          </div>
        </div>
      ))}
    </div>
    </>
  );
};

export default Card;
