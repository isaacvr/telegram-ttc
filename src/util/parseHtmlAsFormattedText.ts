import type { ApiFormattedText } from "../api/types";
import { ApiMessageEntityTypes } from "../api/types";

export const ENTITY_CLASS_BY_NODE_NAME: Record<string, ApiMessageEntityTypes> =
  {
    B: ApiMessageEntityTypes.Bold,
    STRONG: ApiMessageEntityTypes.Bold,
    I: ApiMessageEntityTypes.Italic,
    EM: ApiMessageEntityTypes.Italic,
    INS: ApiMessageEntityTypes.Underline,
    U: ApiMessageEntityTypes.Underline,
    S: ApiMessageEntityTypes.Strike,
    STRIKE: ApiMessageEntityTypes.Strike,
    DEL: ApiMessageEntityTypes.Strike,
    CODE: ApiMessageEntityTypes.Code,
    PRE: ApiMessageEntityTypes.Pre,
    BLOCKQUOTE: ApiMessageEntityTypes.Blockquote,
    MARK: ApiMessageEntityTypes.Highlight,
  };

const EntitiesReg = [
  // Headings (H1 - H6)
  [/^(#{1,6}) (.+)/, "HEADING"],
  [
    /^<b([\s\S]*?)data-entity-type="MessageEntityHeading([1-6])"[^>]*>([\s\S]*?)<\/b>/,
    "HEADING_HTML",
  ],

  // Bold (**) o (__)
  [/^\*\*([^*]+?)\*\*/, "BOLD"],
  [/^<b[^>]*>([\s\S]*?)<\/b>/, "BOLD"],

  // Underline (__)
  [/^__([^_]+)__/, "UNDERLINE"],
  [/^<u[^>]*>([\s\S]*?)<\/u>/, "UNDERLINE"],

  // Italic (*) o (_)
  [/^\*([^*]+)\*/, "ITALIC"],
  [/^_([^_]+)_/, "ITALIC"],
  [/^<i[^>]*>([\s\S]*?)<\/i>/, "ITALIC"],

  // Strikethrough (~~)
  [/^~~([^~]+)~~/, "STRIKETHROUGH"],
  [/^<del[^>]*>([\s\S]*?)<\/del[^>]*>/, "STRIKETHROUGH"],

  // Spoiler delimiter (||)
  [/^\|\|([^|]+)\|\|/, "SPOILER"],
  [
    /^<span([\s\S]*?)data-entity-type="MessageEntitySpoiler"[^>]*>([\s\S]*?)<\/span>/,
    "SPOILER",
  ],

  // Blockquote (>)
  [/^(>|&gt;) (.+)/, "BLOCKQUOTE"],
  [/^<blockquote[^>]*>([\s\S]*?)<\/blockquote[^>]*>/, "BLOCKQUOTE"],

  // Unordered List (-, *, +)
  // [/^[-*+] .+[\n\r]?/, "ULIST"],

  // Ordered List (1., 2., ...)
  // [/^\d+\. .+[\n\r]?/, "OLIST"],

  // Code Block (```)
  [/^```([^\n\r]+[\n\r])?([\s\S]+?)```/, "CODE_BLOCK"],

  // Inline Code (`inline code`)
  [/^`([^`]+)`/, "INLINE_CODE"],
  [/^<code[^>]*>([\s\S]*?)<\/code[^>]*>/, "INLINE_CODE"],

  // URL (protocol? + domain | IP)
  [
    new RegExp(
      "^((https?:\\/\\/)?" +
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
        "((\\d{1,3}\\.){3}\\d{1,3}))" +
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
        "(\\?[;&a-z\\d%_.~+=-]*)?" +
        "(\\#[-a-z\\d_]*)?)",
      "i"
    ),
    "URL",
  ],

  // Mention (@username)
  [/^@[a-zA-Z][a-zA-Z0-9_]{3,}/, "MENTION"],

  // Hashtag (#sports)
  [/^#[a-zA-Z][a-zA-Z0-9_]*/, "HASHTAG"],

  // Cashtag ($USD)
  [/^(\$[A-Z]{1,8}(?:@[a-zA-Z0-9_]{3,})?)(?![a-zA-Z0-9$])/, "CASHTAG"],

  // BankCard (####-####-####-####)
  [
    /^(?:\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}|\d{4}[- ]?\d{6}[- ]?\d{5}|\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{1,3})/,
    "BANKCARD",
  ],

  // Email (name@domain.com)
  [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})/, "EMAIL"],

  // Phone (+1 (765) 1234 2213)
  [/^(?=(?:[^\d\n]*\d){8,})[+]?\d+(\s*\(\d+\))?[\d -]+\d/, "PHONE"],

  // CommandBot (/start)
  [/^(\/[a-zA-Z0-9_]{1,32})/, "BOTCOMMAND"],

  // HTML Links <a href="url">Text</a>
  [/^<a([\s\S]*?)href="([^"]*)"[^>]*>([\s\S]*?)<\/a[^>]*>/, "HTML_LINK"],

  // MD Links [text](url)
  [/^\[([^\]]+)\]\(([^)]+)\)/, "LINK"],

  // CustomEmoji (<img src="" alt="$1">)
  [
    /^<img[\s\S]+?alt="([^"]+)"[\s\S]*?data-document-id="([^"]+)"[^>]*>/,
    "CUSTOM_EMOJI",
  ],

  // Emoji (<img src="" alt="$1">)
  [/^<img[^>]+alt="([^"]+)"[^>]*>/, "EMOJI"],

  // Images ![alt](url)
  // [/^!\[([^\]]*)\]\(([^)]+)\)/, "IMAGE"],

  // Tables (| Col1 | Col2 |)
  // [/^\|.+\|[\n\r]?/, "TABLE"],

  // Highlight (==highlight==)
  [/^==([^=]+)==/, "HIGHLIGHT"],
  [/^<mark[^>]*>([\s\S]*?)<\/mark>/, "HIGHLIGHT"],

  // Subscript (~sub~)
  [/^~([^~]+)~/, "SUBSCRIPT"],
  [/^<sub[^>]*>([\s\S]*?)<\/sub>/, "SUBSCRIPT"],

  // Superscript (^sup^)
  [/^\^([^^]+)\^/, "SUPERSCRIPT"],
  [/^<sup[^>]*>([\s\S]*?)<\/sup>/, "SUPERSCRIPT"],

  // Plain text
  [/^(.|[\n\r])/, "TEXT"],
] as const;

interface TToken {
  type: (typeof EntitiesReg)[number][1];
  value: any;
  length: number;
  order?: number;
  entities?: ApiFormattedText["entities"];
}

const JOINABLE_TYPES: TToken["type"][] = [
  "TEXT" /*, "TABLE", "OLIST", "ULIST"*/,
];

const ALLOW_NESTING: Map<TToken["type"], TToken["type"][]> = new Map([
  ["ITALIC", ["TEXT", "UNDERLINE"]],
  ["BOLD", ["TEXT", "ITALIC", "UNDERLINE"]],
  ["UNDERLINE", ["TEXT", "ITALIC"]],
  ["SPOILER", ["TEXT", "ITALIC", "BOLD", "UNDERLINE", "LINK"]],
]);

function trim(s: string, end = false): string {
  return s.replace(end ? /^[\s\n\r]+|[\s\n\r]+$/g : /^[\s\n\r]+/g, "");
}

export default function parseHtmlAsFormattedText(
  html: string,
  allowedTypes: TToken["type"][] | null = null,
  depth = 0
): ApiFormattedText {
  let input = html
    .replace(/&nbsp;/g, " ")
    .replace(/<br([^>]*)?>/g, "\n")
    .replace(/<div><br([^>]*)?><\/div>/g, "\n")
    .replace(/<\/div>(\s*)<div>/g, "\n")
    .replace(/<div>/g, "\n")
    .replace(/<\/div>/g, "");

  let tokens: TToken[] = [];

  while (input.length > 0) {
    let matched = false;

    for (let [regex, type] of EntitiesReg) {
      if (Array.isArray(allowedTypes) && !allowedTypes.includes(type)) {
        continue;
      }

      const match = input.match(regex);

      if (match) {
        matched = true;

        let token: TToken = {
          type,
          value: match[0],
          length: match[0].length,
        };

        input = input.slice(match[0].length);

        if (type === "PHONE") {
          tokens.push(token);
          break;
        } else if (type === "CODE_BLOCK") {
          token.value = {
            lang: trim(match[1] || "", true),
            code: trim(match[2], true),
          };
        } else if (type === "LINK") {
          token.value = { text: match[1], url: match[2] };
        } else if (type === "HTML_LINK") {
          token.type = "LINK";
          token.value = { text: match[3], url: match[2] };
        } else if (type === "HEADING") {
          token.value = match[2];
          token.order = match[1].length - 1;
          token.length = token.value.length;
        } else if (type === "HEADING_HTML") {
          token.type = "HEADING";
          token.value = match[3];
          token.order = +match[2] - 1;
          token.length = token.value.length;
        } else if (type === "SPOILER") {
          token.value = (match.length > 2 ? match[3] : match[1]) || "";
          token.length = token.value.length;
        } else if (type === "BLOCKQUOTE") {
          token.value = (match[1] === ">" ? match[2] : match[1]) || "";
          token.length = token.value.length;
        } else if (type === "CUSTOM_EMOJI") {
          token.value = {
            alt: match[1],
            documentId: match[2],
          };
          token.length = match[1].length;
        } else if (
          JOINABLE_TYPES.includes(type) &&
          tokens.length &&
          tokens[tokens.length - 1].type === type
        ) {
          token = tokens[tokens.length - 1];
          token.value.push(match[0]);
          token.length += match[0].length;
          break;
        } else {
          let v = match.length > 1 ? match[1] : match[0];
          token.value = JOINABLE_TYPES.includes(type) ? [v] : v;
        }

        if (ALLOW_NESTING.has(type)) {
          let types = ALLOW_NESTING.get(type)!;
          let res = parseHtmlAsFormattedText(token.value, types, depth + 1);
          token.value = res.text;
          token.entities = res.entities;
        }

        tokens.push(token);
        break;
      }
    }

    if (!matched) break;
  }

  let textParts: string[] = [];
  let entities: ApiFormattedText["entities"] = [];
  let offset = 0;
  let offsets = [];

  const typeMap = {
    URL: ApiMessageEntityTypes.Url,
    MENTION: ApiMessageEntityTypes.Mention,
    HASHTAG: ApiMessageEntityTypes.Hashtag,
    CASHTAG: ApiMessageEntityTypes.Cashtag,
    BANKCARD: ApiMessageEntityTypes.BankCard,
    BOLD: ApiMessageEntityTypes.Bold,
    ITALIC: ApiMessageEntityTypes.Italic,
    UNDERLINE: ApiMessageEntityTypes.Underline,
    STRIKETHROUGH: ApiMessageEntityTypes.Strike,
    SPOILER: ApiMessageEntityTypes.Spoiler,
    BLOCKQUOTE: ApiMessageEntityTypes.Blockquote,
    INLINE_CODE: ApiMessageEntityTypes.Code,
    EMAIL: ApiMessageEntityTypes.Email,
    BOTCOMMAND: ApiMessageEntityTypes.BotCommand,
    HIGHLIGHT: ApiMessageEntityTypes.Highlight,
    SUBSCRIPT: ApiMessageEntityTypes.Subscript,
    SUPERSCRIPT: ApiMessageEntityTypes.Superscript,
    PHONE: ApiMessageEntityTypes.Phone,
  } as const;

  for (let i = 0, maxi = tokens.length; i < maxi; i += 1) {
    offsets.push(offset);

    let token = tokens[i];
    let length = token.value.length;

    textParts.push(
      JOINABLE_TYPES.includes(token.type) ? token.value.join("") : token.value
    );

    if (token.type in typeMap) {
      // @ts-ignore
      let type = typeMap[token.type];

      entities.push({
        type,
        length,
        offset,
      });
    } else {
      switch (token.type) {
        case "HEADING":
          const headingType = [
            ApiMessageEntityTypes.Heading1,
            ApiMessageEntityTypes.Heading2,
            ApiMessageEntityTypes.Heading3,
            ApiMessageEntityTypes.Heading4,
            ApiMessageEntityTypes.Heading5,
            ApiMessageEntityTypes.Heading6,
          ][token.order || 0];

          // @ts-ignore
          entities.push({
            type: headingType,
            length,
            offset,
          });
          break;
        case "CODE_BLOCK":
          textParts.pop();

          length = token.value.code.length;
          textParts.push(token.value.code);

          entities.push({
            type: ApiMessageEntityTypes.Pre,
            length,
            offset,
            language: token.value.lang,
          });
          break;
        case "LINK": {
          textParts.pop();
          length = token.value.text.length;
          textParts.push(token.value.text);

          entities.push({
            type: ApiMessageEntityTypes.TextUrl,
            length,
            offset,
            url: token.value.url,
          });
          break;
        }
        case "CUSTOM_EMOJI": {
          textParts.pop();

          length = token.value.alt.length;
          textParts.push(token.value.alt);

          entities.push({
            type: ApiMessageEntityTypes.CustomEmoji,
            length,
            offset,
            documentId: token.value.documentId,
          });
          break;
        }

        // case "OLIST":
        // case "ULIST":
        //   entities.push({
        //     type: ApiMessageEntityTypes.Code,
        //     length,
        //     offset,
        //   });

        //   // let elem = token.type === "ULIST" ? "ul" : "ol";
        //   // `<${elem}>${
        //   //   .map(
        //   //     (e: string) =>
        //   //       `<li>${e.match(/^([-*+]|\d+\.) (.+)/)![2].trim()}</li>`
        //   //   )
        //   //   .join("")}</${elem}>`;
        //   break;
        // case "TABLE":
        //   let rows = token.value.split("\n").filter((e: string) => e.trim());
        //   let headerSeparator = rows.filter((r: string) => /^\|(-+\|)*$/.test(r));
        //   let sPos = -1;

        //   if (headerSeparator.length) {
        //     sPos = rows.indexOf(headerSeparator[0]);
        //   }

        //   `<table>${rows
        //     .map((r: string, p: number) =>
        //       p === sPos - 1
        //         ? `<thead><tr>${r
        //             .split("|")
        //             .map((e) => `<th>${e.trim()}</th>`)
        //             .join("")}</tr></thead>`
        //         : p > sPos
        //         ? `${p === sPos + 1 ? "<tbody>" : ""}<tr>${r
        //             .split("|")
        //             .map((e) => `<td>${e.trim()}</td>`)
        //             .join("")}</tr>${p === sPos + 1 ? "<tbody>" : ""}`
        //         : ""
        //     )
        //     .join("")}</table>`;
        //   break;
        default:
          break;
      }
    }

    if (token.entities) {
      token.entities.forEach((e) => {
        let ne = { ...e };
        ne.offset += offset;
        entities.push(ne);
      });
    }

    offset += length;
  }

  return {
    text: textParts.join(""),
    entities,
  };
}

export function fixImageContent(fragment: HTMLDivElement) {
  fragment.querySelectorAll("img").forEach((node) => {
    if (node.dataset.documentId) {
      // Custom Emoji
      node.textContent = (node as HTMLImageElement).alt || "";
    } else {
      // Regular emoji with image fallback
      node.replaceWith(node.alt || "");
    }
  });
}
