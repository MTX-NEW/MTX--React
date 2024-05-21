import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "../layouts/Layout";
import AllUsers from "../pages/ManageUsers/AllUsers";
import UserGroup from "../pages/ManageUsers/UserGroup";
import UserTypes from "../pages/ManageUsers/UserTypes";
import ManagePrograms from "../pages/ManageUsers/ManagePrograms";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/main" element={<Layout />}>
          <Route path="manageusers" element={<AllUsers />} />
          <Route path="manageusers/users" element={<AllUsers />} />
          <Route path="manageusers/usergroups" element={<UserGroup />} />
          <Route path="manageusers/usertypes" element={<UserTypes />} />
          <Route
            path="manageusers/manageprograms"
            element={<ManagePrograms />}
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
