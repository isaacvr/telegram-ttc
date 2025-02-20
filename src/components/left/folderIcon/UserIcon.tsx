import React from "../../../lib/teact/teact";
import { FC } from "../../../lib/teact/teact";

type OwnProps = {
  color?: string;
};

const UserIcon: FC<OwnProps> = ({ color = "currentColor" }: OwnProps) => {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 16.8125C22.0376 16.8125 24.5 14.3501 24.5 11.3125C24.5 8.27493 22.0376 5.8125 19 5.8125C15.9624 5.8125 13.5 8.27493 13.5 11.3125C13.5 14.3501 15.9624 16.8125 19 16.8125Z"
        fill={color || "black"}
      />
      <path
        d="M8 25.5942C8 27.5787 9.60875 29.1875 11.5933 29.1875H26.4067C28.3912 29.1875 30 27.5787 30 25.5942C30 24.7942 29.8042 23.999 29.2698 23.4036C28.008 21.9978 24.9618 19.5625 19 19.5625C13.0382 19.5625 9.992 21.9978 8.7302 23.4036C8.19579 23.999 8 24.7942 8 25.5942Z"
        fill={color || "black"}
      />
    </svg>
  );
};

export default UserIcon;
