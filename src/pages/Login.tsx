import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button";
import TextBox from "../components/shared/TextBox";
import { useState } from "react";
import { useLogin } from "../queryClient/hooks/userAuth.hook";

const Login = () => {
  const nav = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginData, setLoginData] = useState<LoginRequest>({
    user_name: "",
    password: "",
  });

  const handleChangeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    setUsername(value);
  };
  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    setPassword(value);
  };
  const { mutateAsync, isPending, isError } = useLogin();
  const login = () => {
    let data = { ...loginData };
    data.user_name = username;
    data.password = password;
    setLoginData(data);
    mutateAsync(data);
    isError ? console.log("Error") : "";
  };

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
            <TextBox
              placeholder=""
              className="w-[70%]"
              onChange={handleChangeUsername}
              value={username}
            />
            <label className="font-medium mt-6 mb-2 w-full ml-[30%] text-start">
              Password
            </label>
            <TextBox
              placeholder=""
              className="w-[70%]"
              onChange={handleChangePassword}
              value={password}
              type="password"
            />
            <label className="font-bold text-sm mt-2 mb-8 self-end mr-[16%] cursor-pointer">
              Forget password?
            </label>
            <Button
              color="green"
              onClick={() => login()}
              className="w-[70%]"
              loading={isPending}
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
