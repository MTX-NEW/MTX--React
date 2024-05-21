import { useState } from "react";
import Accordion from "../../components/shared/Accordion";
import DataTable from "../../components/shared/DataTable";
import Header from "../../components/shared/Header";
import SideModal from "../../components/shared/SideModal";

const ManagePrograms = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="flex flex-col gap-y-4">
      <Header
        title="Manage programs"
        addBtnText="Add Program"
        onClickBtn={() => setIsOpen(true)}
      />
      <Accordion title="User Type">
        <DataTable
          cells={["Program ID", "Program Name", "Action"]}
          onClickDelete={() => {}}
          onClickEdit={() => {}}
        />
        <SideModal
          isOpen={isOpen}
          title="Add Program"
          onClickClose={() => setIsOpen(false)}
          textBoxes={[
            "Program ID",
            "Program Name",
            "Company ID",
            "Company Name",
            "Address",
            "City",
            "State",
            "Postal Code",
            "Phone No.",
          ]}
          addBtnText="Create Program"
        />
      </Accordion>
    </div>
  );
};
export default ManagePrograms;
