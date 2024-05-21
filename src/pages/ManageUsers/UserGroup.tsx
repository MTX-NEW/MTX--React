import { useState } from "react";
import Accordion from "../../components/shared/Accordion";
import DataTable from "../../components/shared/DataTable";
import Header from "../../components/shared/Header";
import SideModal from "../../components/shared/SideModal";

const UserGroup = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="flex flex-col gap-y-4">
      <Header
        title="User Groups"
        addBtnText="Add new group"
        onClickBtn={() => setIsOpen(true)}
      />
      <Accordion title="Group 1">
        <DataTable
          onClickDelete={() => {}}
          onClickEdit={() => {}}
          cells={[
            "Group 1",
            "Full name",
            "Common name",
            "Short name",
            "Email",
            "Phone",
            "Parent group",
            "Auto routing",
            "Status",
            "Action",
          ]}
        />
        <SideModal
          isOpen={isOpen}
          title="Add new groups"
          onClickClose={() => setIsOpen(false)}
          textBoxes={[
            "Group ID",
            "Full Name",
            "Common name",
            "Phone",
            "Short name",
            "Phone",
            "Email",
            "Parent ID",
          ]}
          radioBoxes={[
            {
              title: "Status",
              items: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "Inactive" },
              ],
            },
            {
              title: "Send PDF",
              items: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
          ]}
          addBtnText="Create group"
        />
      </Accordion>
    </div>
  );
};
export default UserGroup;
