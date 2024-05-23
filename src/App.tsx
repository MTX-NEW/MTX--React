import { QueryClientProvider } from "@tanstack/react-query";
import "./App.scss";
import AppRouter from "./routing/AppRouter";
import { queryClient } from "./queryClient/queryClient";
import { UserProvider } from "./store/userContext";

function App() {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </UserProvider>
  );
}

export default App;
