import type { FC } from "../../../lib/teact/teact";
import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
} from "../../../lib/teact/teact";
import { getActions, getGlobal, withGlobal } from "../../../global";

import "./ChatFolders.scss";

import type {
  ApiChatFolder,
  ApiChatlistExportedInvite,
  ApiSession,
} from "../../../api/types";
import type { GlobalState } from "../../../global/types";
import type { MenuItemContextAction } from "../../ui/ListItem";
import type { TabWithProperties } from "../../ui/TabList";

import { ALL_FOLDER_ID } from "../../../config";
import {
  selectCanShareFolder,
  selectTabState,
} from "../../../global/selectors";
import { selectCurrentLimit } from "../../../global/selectors/limits";
import buildClassName from "../../../util/buildClassName";
import captureEscKeyListener from "../../../util/captureEscKeyListener";
import { captureEvents, SwipeDirection } from "../../../util/captureEvents";
import { MEMO_EMPTY_ARRAY } from "../../../util/memo";
import { IS_TOUCH_ENV } from "../../../util/windowEnvironment";
import { renderTextWithEntities } from "../../common/helpers/renderTextWithEntities";

import { useFolderManagerForUnreadCounters } from "../../../hooks/useFolderManager";
import useHistoryBack from "../../../hooks/useHistoryBack";
import useLang from "../../../hooks/useLang";
import useLastCallback from "../../../hooks/useLastCallback";
import useShowTransition from "../../../hooks/useShowTransition";

import Button from "../../ui/Button";
import FolderIcon from "../folderIcon/FolderIcon";

type OwnProps = {
  shouldHideFolderTabs?: boolean;
  isForumPanelOpen?: boolean;
};

type StateProps = {
  chatFoldersById: Record<number, ApiChatFolder>;
  folderInvitesById: Record<number, ApiChatlistExportedInvite[]>;
  orderedFolderIds?: number[];
  activeChatFolder: number;
  currentUserId?: string;
  shouldSkipHistoryAnimations?: boolean;
  maxFolders: number;
  maxChatLists: number;
  maxFolderInvites: number;
  hasArchivedChats?: boolean;
  hasArchivedStories?: boolean;
  archiveSettings: GlobalState["archiveSettings"];
  isStoryRibbonShown?: boolean;
  sessions?: Record<string, ApiSession>;
};

const SAVED_MESSAGES_HOTKEY = "0";
const FIRST_FOLDER_INDEX = 0;

const ChatFolders: FC<OwnProps & StateProps> = ({
  chatFoldersById,
  orderedFolderIds,
  activeChatFolder,
  currentUserId,
  isForumPanelOpen,
  maxFolders,
  maxChatLists,
  shouldHideFolderTabs,
  folderInvitesById,
  maxFolderInvites,
  isStoryRibbonShown,
}) => {
  const {
    loadChatFolders,
    setActiveChatFolder,
    openChat,
    openShareChatFolderModal,
    openDeleteChatFolderModal,
    openEditChatFolder,
    openLimitReachedModal,
  } = getActions();

  const lang = useLang();

  useEffect(() => {
    loadChatFolders();
  }, []);

  const { ref, shouldRender: shouldRenderStoryRibbon } = useShowTransition({
    isOpen: isStoryRibbonShown,
    className: false,
    withShouldRender: true,
  });

  const allChatsFolder: ApiChatFolder = useMemo(() => {
    return {
      id: ALL_FOLDER_ID,
      title: {
        text:
          orderedFolderIds?.[0] === ALL_FOLDER_ID
            ? lang("FilterAllChatsShort")
            : lang("FilterAllChats"),
      },
      includedChatIds: MEMO_EMPTY_ARRAY,
      excludedChatIds: MEMO_EMPTY_ARRAY,
    } satisfies ApiChatFolder;
  }, [orderedFolderIds, lang]);

  const displayedFolders = useMemo(() => {
    return orderedFolderIds
      ? orderedFolderIds
          .map((id) => {
            if (id === ALL_FOLDER_ID) {
              return allChatsFolder;
            }

            return chatFoldersById[id] || {};
          })
          .filter(Boolean)
      : undefined;
  }, [chatFoldersById, allChatsFolder, orderedFolderIds]);

  const isInFirstFolder = FIRST_FOLDER_INDEX === activeChatFolder;

  const folderCountersById = useFolderManagerForUnreadCounters();
  const folderTabs = useMemo(() => {
    if (!displayedFolders || !displayedFolders.length) {
      return undefined;
    }

    return displayedFolders.map((folder, i) => {
      const { id, title } = folder;
      const isBlocked = id !== ALL_FOLDER_ID && i > maxFolders - 1;
      const canShareFolder = selectCanShareFolder(getGlobal(), id);
      const contextActions: MenuItemContextAction[] = [];

      if (canShareFolder) {
        contextActions.push({
          title: lang("FilterShare"),
          icon: "link",
          handler: () => {
            const chatListCount = Object.values(chatFoldersById).reduce(
              (acc, el) => acc + (el.isChatList ? 1 : 0),
              0
            );
            if (chatListCount >= maxChatLists && !folder.isChatList) {
              openLimitReachedModal({
                limit: "chatlistJoined",
              });
              return;
            }

            // Greater amount can be after premium downgrade
            if (folderInvitesById[id]?.length >= maxFolderInvites) {
              openLimitReachedModal({
                limit: "chatlistInvites",
              });
              return;
            }

            openShareChatFolderModal({
              folderId: id,
            });
          },
        });
      }

      if (id !== ALL_FOLDER_ID) {
        contextActions.push({
          title: lang("FilterEdit"),
          icon: "edit",
          handler: () => {
            openEditChatFolder({ folderId: id });
          },
        });

        contextActions.push({
          title: lang("FilterDelete"),
          icon: "delete",
          destructive: true,
          handler: () => {
            openDeleteChatFolderModal({ folderId: id });
          },
        });
      }

      return {
        id,
        title: renderTextWithEntities({
          text: title.text,
          entities: title.entities,
          noCustomEmojiPlayback: folder.noTitleAnimations,
        }),
        badgeCount: folderCountersById[id]?.chatsCount,
        isBadgeActive: Boolean(folderCountersById[id]?.notificationsCount),
        isBlocked,
        contextActions: contextActions?.length ? contextActions : undefined,
        emoticon: folder.emoticon,
      } satisfies TabWithProperties;
    });
  }, [
    displayedFolders,
    maxFolders,
    folderCountersById,
    lang,
    chatFoldersById,
    maxChatLists,
    folderInvitesById,
    maxFolderInvites,
  ]);

  // Prevent `activeTab` pointing at non-existing folder after update
  useEffect(() => {
    if (!folderTabs?.length) {
      return;
    }

    if (activeChatFolder >= folderTabs.length) {
      setActiveChatFolder({ activeChatFolder: FIRST_FOLDER_INDEX });
    }
  }, [activeChatFolder, folderTabs, setActiveChatFolder]);

  const isNotInFirstFolderRef = useRef();
  isNotInFirstFolderRef.current = !isInFirstFolder;
  useEffect(
    () =>
      isNotInFirstFolderRef.current
        ? captureEscKeyListener(() => {
            if (isNotInFirstFolderRef.current) {
              setActiveChatFolder({ activeChatFolder: FIRST_FOLDER_INDEX });
            }
          })
        : undefined,
    [activeChatFolder, setActiveChatFolder]
  );

  useHistoryBack({
    isActive: !isInFirstFolder,
    onBack: () => {
      setActiveChatFolder(
        { activeChatFolder: FIRST_FOLDER_INDEX },
        { forceOnHeavyAnimation: true }
      );
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code.startsWith("Digit") && folderTabs) {
        const [, digit] = e.code.match(/Digit(\d)/) || [];
        if (!digit) return;

        if (digit === SAVED_MESSAGES_HOTKEY) {
          openChat({ id: currentUserId, shouldReplaceHistory: true });
          return;
        }

        const folder = Number(digit) - 1;
        if (folder > folderTabs.length - 1) return;

        setActiveChatFolder(
          { activeChatFolder: folder },
          { forceOnHeavyAnimation: true }
        );
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [currentUserId, folderTabs, openChat, setActiveChatFolder]);

  const shouldRenderFolders = folderTabs && folderTabs.length > 1;

  return (
    <div
      ref={ref}
      className={buildClassName(
        "ChatFolders",
        shouldRenderFolders &&
          shouldHideFolderTabs &&
          "ChatFolders--tabs-hidden",
        shouldRenderStoryRibbon && "with-story-ribbon"
      )}
    >
      <ul className="ChatList">
        {folderTabs?.map((folder, id) => (
          <li
            className={buildClassName(
              "ChatFolder",
              id === activeChatFolder && "active"
            )}
          >
            <Button
              size="default"
              color="translucent"
              isRectangular
              onClick={() => setActiveChatFolder({ activeChatFolder: id })}
            >
              <FolderIcon
                name={folder.emoticon || ""}
                isAllFolder={folder.id === ALL_FOLDER_ID}
              />
              {Boolean(folder.badgeCount) && (
                <span className="badge">{folder.badgeCount}</span>
              )}
              <span className="FolderTitle">{folder.title}</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default memo(
  withGlobal<OwnProps>((global): StateProps => {
    const {
      chatFolders: {
        byId: chatFoldersById,
        orderedIds: orderedFolderIds,
        invites: folderInvitesById,
      },
      chats: {
        listIds: { archived },
      },
      stories: {
        orderedPeerIds: { archived: archivedStories },
      },
      activeSessions: { byHash: sessions },
      currentUserId,
      archiveSettings,
    } = global;
    const { shouldSkipHistoryAnimations, activeChatFolder } =
      selectTabState(global);
    const {
      storyViewer: { isRibbonShown: isStoryRibbonShown },
    } = selectTabState(global);

    return {
      chatFoldersById,
      folderInvitesById,
      orderedFolderIds,
      activeChatFolder,
      currentUserId,
      shouldSkipHistoryAnimations,
      hasArchivedChats: Boolean(archived?.length),
      hasArchivedStories: Boolean(archivedStories?.length),
      maxFolders: selectCurrentLimit(global, "dialogFilters"),
      maxFolderInvites: selectCurrentLimit(global, "chatlistInvites"),
      maxChatLists: selectCurrentLimit(global, "chatlistJoined"),
      archiveSettings,
      isStoryRibbonShown,
      sessions,
    };
  })(ChatFolders)
);
