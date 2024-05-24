import Button from "./Button";

interface ErrorStateProps {
  title: string;
  subTitle: string;
  onClick: () => void;
  loading: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  subTitle,
  onClick,
  loading,
}) => {
  return (
    <div className="flex justify-center">
      <div>
        <div className="w-full text-center mx-auto py-12">
          <img className="w-44 h-44 mx-auto" src="/errorImg.png" alt="error" />
          <p className="font-medium text-lg text-center">{title}</p>
          <p className="text-MTX-greytext text-center">{subTitle} </p>
          <div className="mt-8">
            <Button
              color="blue"
              loading={loading}
              onClick={onClick}
              className="w-[60%]"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ErrorState;
