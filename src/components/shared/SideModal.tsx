import React from "react";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import TextBox from "./TextBox";
import Radiobox from "./Radiobox";
import Dropbox from "./Dropbox";
import Button from "./Button";

interface SideModalProps {
  isOpen: boolean;
  onClickClose: () => void;
  title: string;
  textBoxes: string[];
  radioBoxes?: RadioboxGroup[];
  dropdowns?: Dropdowns[];
  addBtnText: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const SideModal: React.FC<SideModalProps> = ({
  isOpen,
  onClickClose,
  textBoxes,
  addBtnText,
  dropdowns,
  radioBoxes,
  title,
}) => {
  return (
    <React.Fragment>
      <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        maxWidth={false}
        onClose={onClickClose}
        aria-describedby="alert-dialog-slide-description"
        fullWidth
        PaperProps={{
          style: {
            height: "100vh",
            width: "calc(100vw - 1400px)",
            marginLeft: "auto",
          },
        }}
      >
        <div className="flex flex-col gap-y-6 p-10">
          <div className="flex justify-between">
            <h1>{title}</h1>
            <img
              src="/svgs/x.svg"
              className="hover:opacity-75 cursor-pointer"
              onClick={onClickClose}
            />
          </div>
          <div className="flex flex-col gap-y-4">
            {textBoxes.map((value, index) => (
              <div className="flex flex-col gap-y-2" key={index}>
                <label className="text-black font-bold text-sm">{value}</label>
                <TextBox placeholder="" />
              </div>
            ))}
            {radioBoxes?.map((radiobox, index) => (
              <Radiobox
                key={index}
                title={radiobox.title}
                group={radiobox.items}
              />
            ))}
            {dropdowns?.map((record, index) => (
              <Dropbox key={index} title={record.title} items={record.items} />
            ))}
          </div>
          <Button onClick={() => {}} color="green">
            {addBtnText}
          </Button>
        </div>
      </Dialog>
    </React.Fragment>
  );
};

export default SideModal;
