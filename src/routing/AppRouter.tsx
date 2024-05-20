import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "../layouts/Layout";
import AllUsers from "../pages/ManageUsers/AllUsers";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/main" element={<Layout />}>
          <Route path="manageusers" element={<AllUsers />} />
          <Route path="manageusers/users" element={<AllUsers />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
