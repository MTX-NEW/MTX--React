import Button from "./Button";

interface EmptyStateProps {
  title: string;
  subTitle: string;
  onClick: () => void;
  btnTitle: string;
  loading: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subTitle,
  onClick,
  btnTitle,
  loading,
}) => {
  return (
    <div className="flex justify-center">
      <div>
        <div className="w-full text-center mx-auto py-12">
          <img
            className="w-40 h-40 mx-auto"
            src="/empty.png"
            alt="image empty states"
          />
          <p className="font-medium text-lg text-center">{title}</p>
          <p className="text-gray-500 text-center">{subTitle} </p>
          <div className="mt-8">
            <Button
              color="blue"
              loading={loading}
              onClick={onClick}
              className="w-[60%]"
            >
              {btnTitle}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EmptyState;
