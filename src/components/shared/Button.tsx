interface ButtonProps {
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className }) => {
  return (
    <button
      className={`bg-MTX-blue text-white text-sm px-4 py-2 inline-flex items-center justify-center ${className} rounded-sm`}
    >
      {children}
    </button>
  );
};

export default Button;
