"use client";

import { useCallback, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

type Props = {
  onChange: (html: string) => void;
};

export function NewsRichEditor({ onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
            class: "text-[var(--feg-green-2)] underline underline-offset-2",
          },
        },
      }),
      ImageExtension.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "my-4 max-h-[480px] w-auto max-w-full rounded-lg object-contain",
        },
      }),
      Placeholder.configure({
        placeholder:
          "Escribí el cuerpo de la noticia: párrafos, títulos, listas e imágenes con el botón Imagen.",
      }),
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[280px] px-3 py-2 text-[var(--feg-green)] prose-headings:font-heading prose-headings:text-[var(--feg-ink)] prose-a:text-[var(--feg-green-2)] focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChangeRef.current(ed.getHTML());
    },
  });

  const pickImage = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const onFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !editor) return;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/news/upload-image", { method: "POST", body: fd });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (data.ok && data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        window.alert(data.error ?? "No se pudo subir la imagen");
      }
    },
    [editor]
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace", prev ?? "https://");
    if (url === null) return;
    const t = url.trim();
    if (t === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: t }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[320px] animate-pulse rounded-2xl border border-[var(--feg-green)]/12 bg-[var(--feg-bg)]" />
    );
  }

  return (
    <div className="news-editor rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-sm">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFile}
      />
      <div className="flex flex-wrap gap-1 border-b border-[var(--feg-green)]/12 bg-[var(--feg-bg)] p-2">
        <ToolbarBtn
          label="Negrita"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarBtn>
        <ToolbarBtn
          label="Cursiva"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </ToolbarBtn>
        <span className="mx-1 w-px self-stretch bg-[var(--feg-green)]/15" aria-hidden />
        <ToolbarBtn
          label="Título 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarBtn>
        <ToolbarBtn
          label="Título 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarBtn>
        <span className="mx-1 w-px self-stretch bg-[var(--feg-green)]/15" aria-hidden />
        <ToolbarBtn
          label="Lista"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Lista
        </ToolbarBtn>
        <ToolbarBtn
          label="Numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Lista
        </ToolbarBtn>
        <ToolbarBtn
          label="Cita"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          “ ”
        </ToolbarBtn>
        <span className="mx-1 w-px self-stretch bg-[var(--feg-green)]/15" aria-hidden />
        <ToolbarBtn label="Enlace" onClick={setLink}>
          Enlace
        </ToolbarBtn>
        <ToolbarBtn label="Insertar imagen" onClick={pickImage}>
          Imagen
        </ToolbarBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarBtn({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-[var(--feg-yellow)] text-[var(--feg-ink)]"
          : "bg-white text-[var(--feg-green)] hover:bg-[var(--feg-bg)]"
      }`}
    >
      {children}
    </button>
  );
}
