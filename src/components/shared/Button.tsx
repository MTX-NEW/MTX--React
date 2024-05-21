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
      className={`${color === "blue" ? "bg-MTX-blue" : "bg-MTX-green"} ${
        isHovered && color === "blue"
          ? "bg-MTX-blueHover"
          : isHovered && color === "green"
          ? "bg-MTX-greenHover"
          : ""
      }
      } text-white text-sm px-4 py-2 inline-flex items-center justify-center ${className} rounded-sm`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
