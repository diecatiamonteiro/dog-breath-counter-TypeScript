import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import Button from "../Button";

export default function ShowHidePassword({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      onClick={onToggle}
      ariaLabel={show ? "Hide password" : "Show password"}
      variant="ghost"
      className="absolute inset-y-0 right-3 border-none"
    >
      {show ? (
        <IoEyeOffOutline className="h-5 w-5" />
      ) : (
        <IoEyeOutline className="h-5 w-5" />
      )}
    </Button>
  );
}
