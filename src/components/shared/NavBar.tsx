import { useState } from "react";

interface NavBarProps {
  items: NavBarItem[];
  onItemClick: (parent: string, path: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ items, onItemClick }) => {
  const [currIndex, setCurrIndex] = useState<number>(0);
  return (
    <div>
      <div className="w-full flex gap-x-10 overflow-x-auto overflow-y-hidden">
        {items.map((item, index) => (
          <label
            key={index}
            className={`${
              currIndex === index && "text-MTX-blue font-bold"
            } cursor-pointer transition-all ease-in-out duration-300 p-2 hover:scale-110`}
            onClick={() => {
              setCurrIndex(index);
              onItemClick(item.parent, item.path);
            }}
          >
            {item.title}
          </label>
        ))}
      </div>
      <div className="flex-grow border-t border-[#EEEEEE] mt-2" />
    </div>
  );
};

export default NavBar;
