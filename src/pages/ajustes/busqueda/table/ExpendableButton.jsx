import React from "react";

const ExpendableButton = ({ isOpenNew, toggle }) => {
  return (
    <button style={{ border: "none", background: "#fff" }} onClick={toggle}>
      <span
        class="material-symbols-outlined"
        style={{
          transform: `rotate(${isOpenNew ? 90 : 0}deg)`,
          transition: "all 0.25s",
          background: "#fff",
        }}
      >
        chevron_right
      </span>
    </button>
  );
};

export default ExpendableButton;
