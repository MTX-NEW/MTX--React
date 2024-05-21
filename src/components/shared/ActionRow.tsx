interface ActionRowProps {
  onClickDelete: () => void;
  onClickEdit: () => void;
}
const ActionRow: React.FC<ActionRowProps> = ({
  onClickDelete,
  onClickEdit,
}) => {
  return (
    <div className="flex gap-x-2 cursor-pointer">
      <img
        src="/svgs/edit.svg"
        className="hover:opacity-75"
        onClick={onClickEdit}
      />
      <img
        src="/svgs/delete.svg"
        className="hover:opacity-75"
        onClick={onClickDelete}
      />
    </div>
  );
};
export default ActionRow;
