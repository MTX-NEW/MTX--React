import { useState, useEffect } from "react";
import Button from "./Button";

interface SideNavBarProps {
  items: SideBarItem[];
  onItemClick: (path: string) => void;
}

const SideNavBar: React.FC<SideNavBarProps> = ({ items, onItemClick }) => {
  const [currIndex, setCurrIndex] = useState<number>();

  useEffect(() => {
    const currentPath = window.location.pathname.toLowerCase();
    const currentIndex = items.findIndex((item) =>
      currentPath.includes(item.path.toLowerCase())
    );
    setCurrIndex(currentIndex);
  }, [items]);

  return (
    <div className="w-[250px] h-full flex flex-col gap-y-2 bg-MTX-lightblue">
      <img src="/svgs/logo.svg" className="p-8" />
      {items.map((item, index) => (
        <div
          className={`flex gap-x-2 cursor-pointer px-12 text-MTX-greytext hover:bg-MTX-mediumblue h-[50px] items-center rounded-2xl ${
            currIndex === index ||
            window.location.pathname
              .toLowerCase()
              .includes(item.path.toLowerCase())
              ? "bg-MTX-mediumblue font-bold"
              : ""
          }`}
          key={index}
          onClick={() => {
            setCurrIndex(index);
            onItemClick(item.path);
          }}
        >
          <img
            src={
              currIndex === index ||
              window.location.pathname
                .toLowerCase()
                .includes(item.path.toLowerCase())
                ? item.hoverIcon
                  ? item.hoverIcon
                  : item.icon
                : item.icon
            }
            className="w-5 h-5"
          />
          <label
            className={`text-md ${
              currIndex === index ||
              window.location.pathname
                .toLowerCase()
                .includes(item.path.toLowerCase())
                ? "text-MTX-blue"
                : ""
            }`}
          >
            {item.title}
          </label>
        </div>
      ))}
      <div className="flex gap-x-2 fixed bottom-20 px-12">
        <img src="/svgs/profile.svg" />
        <label className="text-MTX-blue font-bold cursor-pointer">
          Profile
        </label>
      </div>
      <Button
        className="ml-10 w-[180px] fixed bottom-8"
        color="blue"
        onClick={() => {}}
      >
        Switch to TS panel
      </Button>
    </div>
  );
};

export default SideNavBar;
