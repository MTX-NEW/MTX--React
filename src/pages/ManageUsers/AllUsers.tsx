import { useState } from "react";
import Accordion from "../../components/shared/Accordion";
import DataTable from "../../components/shared/DataTable";
import Header from "../../components/shared/Header";
import SideModal from "../../components/shared/SideModal";
import DeleteDialog from "../../components/shared/DeleteDialog";

const AllUsers = () => {
  const [isOpenAdd, setIsOpenAdd] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
  const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-y-4">
      <Header
        title="All Users"
        addBtnText="Add new user"
        onClickBtn={() => setIsOpenAdd(true)}
      />
      <Accordion title="Users">
        <DataTable
          onClickEdit={() => setIsOpenEdit(true)}
          onClickDelete={() => setIsOpenDelete(true)}
          cells={[
            "Full name",
            "Last name",
            "Username",
            "Email",
            "Phone",
            "EMP code",
            "User type",
            "User group",
            "Status",
            "Action",
          ]}
        />
        <SideModal
          isOpen={isOpenAdd}
          title="Edit User"
          onClickClose={() => setIsOpenAdd(false)}
          textBoxes={[
            "First Name",
            "Last Name",
            "Email",
            "Phone",
            "Password",
            "EMP Code",
            "Hiring Date",
            "Last Employment Date",
          ]}
          radioBoxes={[
            {
              title: "Sex",
              items: [
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ],
            },
            {
              title: "Spnaish Speaking",
              items: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
            {
              title: "Stauts",
              items: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Suspended", value: "suspended" },
              ],
            },
            {
              title: "Payment Structure",
              items: [
                { label: "Pay per hour", value: "hour" },
                { label: "Pay per mile", value: "mile" },
                { label: "Pay per trip", value: "trip" },
              ],
            },
          ]}
          dropdowns={[
            {
              items: [
                { label: "1", value: "one" },
                { label: "2", value: "two" },
              ],
              title: "User group",
            },
            {
              items: [
                { label: "1", value: "one" },
                { label: "2", value: "two" },
              ],
              title: "User type",
            },
          ]}
          addBtnText="Add user"
        />
        <SideModal
          isOpen={isOpenEdit}
          title="Edit User"
          onClickClose={() => setIsOpenEdit(false)}
          textBoxes={[
            "First Name",
            "Last Name",
            "Email",
            "Phone",
            "Password",
            "EMP Code",
            "Hiring Date",
            "Last Employment Date",
          ]}
          radioBoxes={[
            {
              title: "Sex",
              items: [
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ],
            },
            {
              title: "Spnaish Speaking",
              items: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
            {
              title: "Stauts",
              items: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Suspended", value: "suspended" },
              ],
            },
            {
              title: "Payment Structure",
              items: [
                { label: "Pay per hour", value: "hour" },
                { label: "Pay per mile", value: "mile" },
                { label: "Pay per trip", value: "trip" },
              ],
            },
          ]}
          dropdowns={[
            {
              items: [
                { label: "1", value: "one" },
                { label: "2", value: "two" },
              ],
              title: "User group",
            },
            {
              items: [
                { label: "1", value: "one" },
                { label: "2", value: "two" },
              ],
              title: "User type",
            },
          ]}
          addBtnText="Save edit"
        />
        <DeleteDialog
          open={isOpenDelete}
          onClose={() => setIsOpenDelete(false)}
          onConfirm={() => setIsOpenDelete(false)}
          title="Delete Confirmation"
        />
      </Accordion>
    </div>
  );
};
export default AllUsers;
