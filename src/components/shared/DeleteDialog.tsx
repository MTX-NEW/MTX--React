import React from "react";
import { Dialog, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import Button from "./Button";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
}) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <div className="p-10">
        <div className="flex flex-col gap-y-2">
          <img src="/svgs/danger.svg" className="w-10 h-10" />
          <label className="text-[#FF3A29] font-bold">{title}</label>
          <label className="text-MTX-greytext">{description}</label>
          <div className="flex gap-x-2 mt-4">
            <Button color="grey" onClick={onConfirm} className="w-[200px]">
              Cancel
            </Button>
            <Button color="red" onClick={onConfirm} className="w-[200px]">
              Delete
            </Button>{" "}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteDialog;
