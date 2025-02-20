import { ApiMessageEntityTypes } from "../../../api/types";
import type { FC } from "../../../lib/teact/teact";
import React from "../../../lib/teact/teact";

import buildClassName from "../../../util/buildClassName";
import { renderTextWithEntities } from "../../common/helpers/renderTextWithEntities";
import BotIcon from "./BotIcon";
import ChannelIcon from "./ChannelIcon";
import ChatIcon from "./ChatIcon";
import ChatsIcon from "./ChatsIcon";
import FolderDefaultIcon from "./FolderDefaultIcon";

import "./FolderIcon.scss";
import GroupIcon from "./GroupIcon";
import StarIcon from "./StarIcon";
import UserIcon from "./UserIcon";

type OwnProps = {
  name: string;
  isAllFolder?: boolean;
  isPicker?: boolean;
  documentId?: string;
  onClick?: (name: string) => any;
};

const ICONS = {
  // Emoji
  "\uD83E\uDD16": <BotIcon />,
  "\uD83D\uDCE2": <ChannelIcon />,
  "✅": <ChatIcon />,
  "\uD83D\uDCAC": <ChatsIcon />,
  "\uD83D\uDCC1": <FolderDefaultIcon />,
  "\uD83D\uDC65": <GroupIcon />,
  "⭐": <StarIcon />,
  "\uD83D\uDC64": <UserIcon />,

  // Emoji Name
  "robot_face": <BotIcon />,
  "loudspeaker": <ChannelIcon />,
  "white_check_mark": <ChatIcon />,
  "speech_balloon": <ChatsIcon />,
  "file_folder": <FolderDefaultIcon />,
  "busts_in_silhouette": <GroupIcon />,
  "star": <StarIcon />,
  "bust_in_silhouette": <UserIcon />,
} as any;

const FolderIcon: FC<OwnProps> = ({
  name,
  isAllFolder = false,
  isPicker = false,
  documentId,
  onClick,
}) => {
  const Icon = isAllFolder ? (
    <ChatsIcon />
  ) : !name ? (
    <FolderDefaultIcon />
    ) : (
    ICONS[name] ||
    renderTextWithEntities({
      text: name,
      entities: [],
      emojiSize: 80,
    })
  );

  return (
    <div
      className={buildClassName("ChatFolder-icon", name in ICONS && "default")}
      onClick={() => onClick?.(name)}
    >
      {Icon}
    </div>
  );
};

export default FolderIcon;
