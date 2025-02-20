import React from "../../../lib/teact/teact";
import { FC } from "../../../lib/teact/teact";

type OwnProps = {
  color?: string;
};

const ChatIcon: FC<OwnProps> = ({ color = "currentColor" }: OwnProps) => {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M30 17.2847C30 11.2598 24.6274 6.37561 18 6.37561C11.3726 6.37561 6 11.2598 6 17.2847C6 20.7209 7.60509 23.5375 10.3363 25.5371C10.6856 25.7929 11.0073 27.2137 10.2288 28.4072C9.45024 29.6006 8.47959 30.146 8.96637 30.3502C9.26647 30.4761 11.0397 30.5384 12.3196 29.8206C14.1496 28.7943 14.6613 27.7725 15.0551 27.8629C15.9973 28.079 16.9839 28.1938 18 28.1938C24.6274 28.1938 30 23.3096 30 17.2847Z"
        fill={color || "black"}
      />
    </svg>
  );
};

export default ChatIcon;
