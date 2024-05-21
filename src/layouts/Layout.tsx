import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "../components/shared/NavBar";
import SideNavBar from "../components/shared/SideNavBar";

const Layout = () => {
  const nav = useNavigate();

  const handleItemClickNav = (path: string, parent: string) => {
    nav(`${path}/${parent}`);
  };

  const handleItemClickSide = (path: string) => {
    nav(path);
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <div className="h-full">
        <SideNavBar
          onItemClick={handleItemClickSide}
          items={[
            {
              title: "Dashboard",
              path: "dashboard",
              icon: "/svgs/dashboard.svg",
            },
            {
              title: "Trip system",
              path: "tripsystem",
              icon: "/svgs/trip.svg",
            },
            { title: "Time sheet", path: "timesheet", icon: "/svgs/time.svg" },
            {
              title: "Manage Users",
              path: "manageusers",
              icon: "/svgs/users.svg",
              hoverIcon: "/svgs/usersHover.svg",
            },
            {
              title: "Manage Emails",
              path: "manageemails",
              icon: "/svgs/emails.svg",
            },
            { title: "HR", path: "hr", icon: "/svgs/hr.svg" },
            { title: "Forms", path: "forms", icon: "/svgs/forms.svg" },
            { title: "Billing", path: "billing", icon: "/svgs/billing.svg" },
            {
              title: "Route sheet",
              path: "routesheet",
              icon: "/svgs/route.svg",
            },
            { title: "Vehicles", path: "vehicles", icon: "/svgs/vehicles.svg" },
            {
              title: "Import Data",
              path: "importdata",
              icon: "/svgs/import.svg",
            },
          ]}
        />
      </div>
      <div className="flex flex-col flex-grow h-full overflow-hidden">
        <div className="px-10 mt-8">
          <NavBar
            items={[
              { title: "All Users", path: "users", parent: "manageusers" },
              {
                title: "User Groups",
                path: "usergroups",
                parent: "manageusers",
              },
              { title: "Clinic POCs", path: "clinic", parent: "manageusers" },
              {
                title: "User Settings",
                path: "settings",
                parent: "manageusers",
              },
              { title: "User types", path: "usertypes", parent: "manageusers" },
              {
                title: "Manage Programs",
                path: "manageprograms",
                parent: "manageusers",
              },
            ]}
            onItemClick={handleItemClickNav}
          />
        </div>
        <div className="flex-grow overflow-auto px-10 py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
