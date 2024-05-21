import Button from "./Button";
import TextBox from "./TextBox";

interface HeaderProps {
  title: string;
  btn?: boolean;
  onClickBtn?: () => void;
  addBtnText: string;
}
const Header: React.FC<HeaderProps> = ({ title, onClickBtn, addBtnText }) => {
  return (
    <div className="flex justify-between">
      <h1>{title}</h1>
      <div className="flex gap-x-4">
        <TextBox placeholder="Search..." />
        <Button
          color="green"
          className="font-bold"
          onClick={onClickBtn ? onClickBtn : () => {}}
        >
          {addBtnText}
        </Button>
      </div>
    </div>
  );
};
export default Header;
