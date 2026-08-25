"use client";

import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    newsVideo: {
      setNewsVideo: (options: { src: string; type?: string }) => ReturnType;
    };
  }
}

/** Nodo TipTap para `<video>` embebido (MP4 / WebM). */
export const NewsVideo = Node.create({
  name: "newsVideo",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      type: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video",
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const source = el.querySelector("source");
          const src = el.getAttribute("src") || source?.getAttribute("src");
          if (!src) return false;
          return {
            src,
            type: el.getAttribute("type") || source?.getAttribute("type") || null,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src as string | null;
    const type = HTMLAttributes.type as string | null;
    const videoAttrs = mergeAttributes({
      controls: "true",
      playsinline: "true",
      preload: "metadata",
      class: "news-inline-video my-4 w-full max-w-full rounded-lg bg-black",
    });

    if (type && src) {
      return ["video", videoAttrs, ["source", { src, type }]];
    }
    return ["video", mergeAttributes(videoAttrs, { src })];
  },

  addNodeView() {
    return ({ node }) => {
      const video = document.createElement("video");
      video.controls = true;
      video.setAttribute("playsinline", "true");
      video.preload = "metadata";
      video.className = "news-inline-video my-4 w-full max-w-full rounded-lg bg-black";
      const src = node.attrs.src as string | null;
      const type = node.attrs.type as string | null;
      if (src && type) {
        const source = document.createElement("source");
        source.src = src;
        source.type = type;
        video.appendChild(source);
      } else if (src) {
        video.src = src;
      }
      return { dom: video };
    };
  },

  addCommands() {
    return {
      setNewsVideo:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { src: options.src, type: options.type ?? null },
          }),
    };
  },
});
