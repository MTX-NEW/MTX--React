import { useState } from "react";
import Button from "./Button";

interface SideNavBarProps {
  items: SideBarItem[];
  onItemClick: (path: string) => void;
}

const SideNavBar: React.FC<SideNavBarProps> = ({ items, onItemClick }) => {
  const [currIndex, setCurrIndex] = useState<number>();
  let windowBar = window.location.href;
  return (
    <div className="w-[250px] h-full flex flex-col gap-y-2 bg-MTX-lightblue">
      <img src="/svgs/logo.svg" className="p-8" />
      {items.map((item, index) => (
        <div
          className={`flex gap-x-2 ${
            currIndex === index ||
            (windowBar.includes(item.path.toLocaleLowerCase()) &&
              "bg-MTX-mediumblue font-bold")
          } cursor-pointer px-12 text-MTX-greytext hover:bg-MTX-mediumblue h-[50px] items-center rounded-2xl`}
          key={index}
          onClick={() => {
            setCurrIndex(index);
            onItemClick(item.path);
          }}
        >
          <img
            src={
              currIndex === index ||
              windowBar.includes(item.path.toLocaleLowerCase())
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
              (windowBar.includes(item.path.toLocaleLowerCase()) &&
                "text-MTX-blue")
            }`}
          >
            {item.title}
          </label>
        </div>
      ))}
      <div className="flex gap-x-2 fixed bottom-20 px-12">
        <img src="/svgs/profile.svg" />
        <label className="text-MTX-blue font-bold">Profile</label>
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
