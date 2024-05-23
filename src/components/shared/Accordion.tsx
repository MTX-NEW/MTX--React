import { CircularProgress } from "@mui/material";
import React, { useState } from "react";

interface AccordionProps {
  title: string;
  children: any;
  loading?: boolean;
  size?: any;
}
const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  size,
  loading,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`accordion w-full bg-MTX-mediumblue rounded-md h-[50px] ${
        isHovered ? "bg-MTX-mediumblueHover" : ""
      }`}
    >
      <div className="accordion-item">
        <div className="accordion-title">
          <button
            className="flex items-center justify-between w-full h-[50px] p-4 border-b border-gray-200"
            onClick={loading ? () => {} : toggleAccordion}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <h2>{title}</h2>
            <span className="icon">
              {loading ? (
                <CircularProgress className="icon mt-1" size={20} />
              ) : isOpen ? (
                <img src={`/svgs/blueArrowUp.svg`} className="w-6 h-6 mt-1" />
              ) : (
                <img src={`/svgs/blueArrowDown.svg`} className="w-6 h-6 mt-1" />
              )}
            </span>
          </button>
        </div>
        <div
          className={`accordion-content text-start text-sm font-bold transition-opacity duration-300 ease-in-out ${
            isOpen ? "" : "hidden"
          } p-4`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
