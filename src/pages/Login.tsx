import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button";
import TextBox from "../components/shared/TextBox";

const Login = () => {
  const nav = useNavigate();
  return (
    <div
      className="h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/loginBG.png)" }}
    >
      <div className="flex items-center justify-center h-full gap-x-10">
        <img src="/svgs/logoBG.svg" className="mb-[10%] mr-[10%]" />
        <div className="bg-white w-[40%] h-[90%] rounded-md shadow-3xl">
          <div className="flex flex-col justify-center items-center p-20">
            <h1>
              Welcome <span className="text-MTX-green">Back</span>
            </h1>
            <label className="font-medium mt-12 mb-2 text-start w-full ml-[30%]">
              Email or Username
            </label>
            <TextBox placeholder="" className="w-[70%]"></TextBox>
            <label className="font-medium mt-6 mb-2 w-full ml-[30%] text-start">
              Password
            </label>
            <TextBox placeholder="" className="w-[70%] "></TextBox>
            <label className="font-bold text-sm mt-2 mb-8 self-end mr-[16%] cursor-pointer">
              Forget password?
            </label>
            <Button
              color="green"
              onClick={() => nav("/main")}
              className="w-[70%]"
            >
              Sign in
            </Button>
            <label className="font-bold mt-10 text-center w-[70%] cursor-pointer">
              No account? sign up
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
