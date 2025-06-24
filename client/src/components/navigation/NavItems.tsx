import { PiDogBold } from "react-icons/pi";
import { MdOutlineSettings } from "react-icons/md";
import { FiHome } from "react-icons/fi";
import { PiSignInBold } from "react-icons/pi";
import { TbLogout2 } from "react-icons/tb";

export const navItems = [
  { href: "/", label: "Home", icon: <FiHome className="w-7 h-7" /> },
  {
    href: "/my-dogs",
    label: "My Dogs",
    icon: <PiDogBold className="w-7 h-7" />,
  },
  {
    href: "/dashboard",
    label: "Settings",
    icon: <MdOutlineSettings className="w-7 h-7" />,
  },
  {
    href: "/login",
    label: "Login",
    icon: <PiSignInBold className="w-7 h-7" />,
  },
  {
    href: "/register",
    label: "Register",
    icon: <PiSignInBold className="w-7 h-7" />,
  },
  {
    href: "/logout",
    label: "Logout",
    icon: <TbLogout2 className="w-7 h-7" />,
  },
];
