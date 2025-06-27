import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export default function ShowHidePassword({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 z-10"
    >
      {show ? (
        <IoEyeOffOutline className="h-5 w-5" />
      ) : (
        <IoEyeOutline className="h-5 w-5" />
      )}
    </button>
  );
}
