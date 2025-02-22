import type { FC } from "../../../lib/teact/teact";
import React, { useState } from "../../../lib/teact/teact";

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

const ICONS = [
  "\uD83E\uDD16",
  "\uD83D\uDCE2",
  "✅",
  "\uD83D\uDCAC",
  "\uD83D\uDCC1",
  "\uD83D\uDC65",
  "⭐",
  "\uD83D\uDC64",
  "robot_face",
  "loudspeaker",
  "white_check_mark",
  "speech_balloon",
  "file_folder",
  "busts_in_silhouette",
  "star",
  "bust_in_silhouette",
];

const FolderIcon: FC<OwnProps> = ({
  name,
  isAllFolder = false,
  isPicker = false,
  documentId,
  onClick = () => {},
}) => {
  function renderContent() {
    switch (name) {
      // Emoji
      case "\uD83E\uDD16":
        return <BotIcon />;
      case "\uD83D\uDCE2":
        return <ChannelIcon />;
      case "✅":
        return <ChatIcon />;
      case "\uD83D\uDCAC":
        return <ChatsIcon />;
      case "\uD83D\uDCC1":
        return <FolderDefaultIcon />;
      case "\uD83D\uDC65":
        return <GroupIcon />;
      case "⭐":
        return <StarIcon />;
      case "\uD83D\uDC64":
        return <UserIcon />;

      // Emoji Name
      case "robot_face":
        return <BotIcon />;
      case "loudspeaker":
        return <ChannelIcon />;
      case "white_check_mark":
        return <ChatIcon />;
      case "speech_balloon":
        return <ChatsIcon />;
      case "file_folder":
        return <FolderDefaultIcon />;
      case "busts_in_silhouette":
        return <GroupIcon />;
      case "star":
        return <StarIcon />;
      case "bust_in_silhouette":
        return <UserIcon />;
    }

    return renderTextWithEntities({
      text: name,
      entities: [],
      emojiSize: 80,
    });
  }

  return (
    <div
      className={buildClassName(
        "ChatFolder-icon",
        ICONS.includes(name) && "default"
      )}
      onClick={() => onClick?.(name)}
    >
      {isAllFolder ? (
        <ChatsIcon />
      ) : !name ? (
        <FolderDefaultIcon />
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default FolderIcon;
