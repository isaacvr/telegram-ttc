import type { FC } from "../../../lib/teact/teact";
import React, { memo, useRef, useState } from "../../../lib/teact/teact";
import { getActions } from "../../../global";

import type { ApiSticker, ApiVideo } from "../../../api/types";
import type { IAnchorPosition, ThreadId } from "../../../types";

import {
  EDITABLE_INPUT_CSS_SELECTOR,
  EDITABLE_INPUT_MODAL_CSS_SELECTOR,
} from "../../../config";
import buildClassName from "../../../util/buildClassName";

import useFlag from "../../../hooks/useFlag";
import useLastCallback from "../../../hooks/useLastCallback";

import Icon from "../../common/icons/Icon";
import Button from "../../ui/Button";
import ResponsiveHoverButton from "../../ui/ResponsiveHoverButton";
import Spinner from "../../ui/Spinner";
import SymbolMenu from "./SymbolMenu.async";
import { FoldersState } from "../../../hooks/reducers/useFoldersReducer";
import FolderIcon from "../../left/folderIcon/FolderIcon";

const MOBILE_KEYBOARD_HIDE_DELAY_MS = 100;

type OwnProps = {
  chatId: string;
  state?: FoldersState;
  threadId?: ThreadId;
  isMobile?: boolean;
  isReady?: boolean;
  isSymbolMenuOpen?: boolean;
  canSendGifs?: boolean;
  canSendStickers?: boolean;
  isMessageComposer?: boolean;
  idPrefix: string;
  forceDarkTheme?: boolean;
  openSymbolMenu: VoidFunction;
  closeSymbolMenu: VoidFunction;
  onCustomEmojiSelect: (emoji: ApiSticker) => void;
  onStickerSelect?: (
    sticker: ApiSticker,
    isSilent?: boolean,
    shouldSchedule?: boolean,
    shouldPreserveInput?: boolean,
    canUpdateStickerSetsOrder?: boolean
  ) => void;
  onGifSelect?: (
    gif: ApiVideo,
    isSilent?: boolean,
    shouldSchedule?: boolean
  ) => void;
  onRemoveSymbol: VoidFunction;
  onEmojiSelect: (emoji: string) => void;
  closeBotCommandMenu?: VoidFunction;
  closeSendAsMenu?: VoidFunction;
  isSymbolMenuForced?: boolean;
  isAttachmentModal?: boolean;
  canSendPlainText?: boolean;
  className?: string;
  inputCssSelector?: string;
};

const SymbolMenuButton: FC<OwnProps> = ({
  chatId,
  state,
  threadId,
  isMobile,
  canSendGifs,
  canSendStickers,
  isMessageComposer,
  isReady,
  isSymbolMenuOpen,
  idPrefix,
  isAttachmentModal,
  canSendPlainText,
  isSymbolMenuForced,
  className,
  forceDarkTheme,
  inputCssSelector = EDITABLE_INPUT_CSS_SELECTOR,
  openSymbolMenu,
  closeSymbolMenu,
  onCustomEmojiSelect,
  onStickerSelect,
  onGifSelect,
  onRemoveSymbol,
  onEmojiSelect,
  closeBotCommandMenu,
  closeSendAsMenu,
}) => {
  const {
    setStickerSearchQuery,
    setGifSearchQuery,
    addRecentEmoji,
    addRecentCustomEmoji,
  } = getActions();

  // eslint-disable-next-line no-null/no-null
  const triggerRef = useRef<HTMLDivElement>(null);

  const [isSymbolMenuLoaded, onSymbolMenuLoadingComplete] = useFlag();
  const [contextMenuAnchor, setContextMenuAnchor] = useState<
    IAnchorPosition | undefined
  >(undefined);

  const symbolMenuButtonClassName = buildClassName(
    "mobile-symbol-menu-button",
    !isReady && "not-ready",
    isSymbolMenuLoaded
      ? isSymbolMenuOpen && "menu-opened"
      : isSymbolMenuOpen && "is-loading"
  );

  const handleActivateSymbolMenu = useLastCallback(() => {
    closeBotCommandMenu?.();
    closeSendAsMenu?.();
    openSymbolMenu();
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;
    let { x, y } = triggerEl.getBoundingClientRect();
    if (chatId.startsWith("--folder")) {
      x += 250;
      y -= 90;
    }
    setContextMenuAnchor({ x, y });
  });

  const handleSearchOpen = useLastCallback((type: "stickers" | "gifs") => {
    if (type === "stickers") {
      setStickerSearchQuery({ query: "" });
      setGifSearchQuery({ query: undefined });
    } else {
      setGifSearchQuery({ query: "" });
      setStickerSearchQuery({ query: undefined });
    }
  });

  const handleSymbolMenuOpen = useLastCallback(() => {
    const messageInput = document.querySelector<HTMLDivElement>(
      isAttachmentModal ? EDITABLE_INPUT_MODAL_CSS_SELECTOR : inputCssSelector
    );

    if (!isMobile || messageInput !== document.activeElement) {
      openSymbolMenu();
      return;
    }

    messageInput?.blur();
    setTimeout(() => {
      closeBotCommandMenu?.();
      openSymbolMenu();
    }, MOBILE_KEYBOARD_HIDE_DELAY_MS);
  });

  const getTriggerElement = useLastCallback(() => triggerRef.current);
  const getRootElement = useLastCallback(() =>
    triggerRef.current?.closest(".custom-scroll, .no-scrollbar")
  );
  const getMenuElement = useLastCallback(() =>
    document.querySelector("#portals .SymbolMenu .bubble")
  );
  const getLayout = useLastCallback(() => ({ withPortal: true }));

  return (
    <>
      {isMobile ? (
        <Button
          className={buildClassName(
            symbolMenuButtonClassName,
            chatId.startsWith("--folder") && "folder-icon"
          )}
          round
          color="translucent"
          onClick={isSymbolMenuOpen ? closeSymbolMenu : handleSymbolMenuOpen}
          ariaLabel="Choose emoji, sticker or GIF"
        >
          <div ref={triggerRef} className="symbol-menu-trigger" />
          {chatId.startsWith("--folder") && state?.mode === "edit" ? (
            <FolderIcon
              name={state?.folder.emoticon || ""}
              documentId={state.folder.title.text.split(":")[1]}
            />
          ) : (
            <>
              <Icon name="smile" />
              <Icon name="keyboard" />
            </>
          )}
          {isSymbolMenuOpen && !isSymbolMenuLoaded && <Spinner color="gray" />}
        </Button>
      ) : (
        <ResponsiveHoverButton
          className={buildClassName(
            "symbol-menu-button",
            isSymbolMenuOpen && "activated",
            chatId.startsWith("--folder") && "folder-icon"
          )}
          round
          color="translucent"
          onActivate={handleActivateSymbolMenu}
          ariaLabel="Choose emoji, sticker or GIF"
        >
          <div ref={triggerRef} className="symbol-menu-trigger" />
          {chatId.startsWith("--folder") && state?.mode === "edit" ? (
            <FolderIcon
              name={state?.folder.emoticon || ""}
              documentId={state.folder.title.text.split(":")[1]}
            />
          ) : (
            <Icon name="smile" />
          )}
        </ResponsiveHoverButton>
      )}

      <SymbolMenu
        chatId={chatId}
        threadId={threadId}
        isOpen={isSymbolMenuOpen || Boolean(isSymbolMenuForced)}
        canSendGifs={canSendGifs}
        canSendStickers={canSendStickers}
        isMessageComposer={isMessageComposer}
        idPrefix={idPrefix}
        onLoad={onSymbolMenuLoadingComplete}
        onClose={closeSymbolMenu}
        onEmojiSelect={onEmojiSelect}
        onStickerSelect={onStickerSelect}
        onCustomEmojiSelect={onCustomEmojiSelect}
        onGifSelect={onGifSelect}
        onRemoveSymbol={onRemoveSymbol}
        onSearchOpen={handleSearchOpen}
        addRecentEmoji={addRecentEmoji}
        addRecentCustomEmoji={addRecentCustomEmoji}
        isAttachmentModal={isAttachmentModal}
        canSendPlainText={canSendPlainText}
        className={buildClassName(
          className,
          forceDarkTheme && "component-theme-dark"
        )}
        anchor={isAttachmentModal ? contextMenuAnchor : undefined}
        getTriggerElement={isAttachmentModal ? getTriggerElement : undefined}
        getRootElement={isAttachmentModal ? getRootElement : undefined}
        getMenuElement={isAttachmentModal ? getMenuElement : undefined}
        getLayout={isAttachmentModal ? getLayout : undefined}
      />
    </>
  );
};

export default memo(SymbolMenuButton);
