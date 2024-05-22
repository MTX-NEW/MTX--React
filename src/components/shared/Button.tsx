import { useState } from "react";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  color: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  color,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  return (
    <button
      className={`${
        color === "blue"
          ? "bg-MTX-blue text-white"
          : color === "green"
          ? "bg-MTX-green text-white"
          : color === "red"
          ? "bg-[#FF3A29] text-white"
          : "bg-transparent border border-MTX-greytext text-MTX-greytext font-bold"
      } ${
        isHovered && color === "blue"
          ? "bg-MTX-blueHover"
          : isHovered && color === "green"
          ? "bg-MTX-greenHover"
          : isHovered && color === "red"
          ? "bg-[#E53220]"
          : isHovered && color === "grey"
          ? "bg-[#e1e0e0]"
          : ""
      }
      }  text-sm px-4 py-2 inline-flex items-center justify-center ${className} rounded-sm`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
