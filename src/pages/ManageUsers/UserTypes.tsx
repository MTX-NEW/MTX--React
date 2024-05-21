import { useState } from "react";
import Accordion from "../../components/shared/Accordion";
import DataTable from "../../components/shared/DataTable";
import Header from "../../components/shared/Header";
import SideModal from "../../components/shared/SideModal";

const UserTypes = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="flex flex-col gap-y-4">
      <Header
        title="User Types"
        addBtnText="Add user type"
        onClickBtn={() => setIsOpen(true)}
      />
      <Accordion title="User type">
        <DataTable cells={["Type ID", "Type Name", "Status", "Action"]} />
        <SideModal
          isOpen={isOpen}
          title="Add new user type"
          onClickClose={() => setIsOpen(false)}
          textBoxes={["Type ID", "Type Name", "Display name"]}
          radioBoxes={[
            {
              title: "Status",
              items: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
          ]}
          addBtnText="Create user type"
        />
      </Accordion>
    </div>
  );
};
export default UserTypes;
