"use client";

import ImageExtension from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit, ImageExtension],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-56 px-5 py-4 text-sm leading-7 text-[#2d433a] outline-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:border-[#c4943c] [&_blockquote]:pl-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const controls = [
    { label: "Bold", Icon: Bold, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", Icon: Italic, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Heading", Icon: Heading2, active: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Bullet list", Icon: List, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", Icon: ListOrdered, active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", Icon: Quote, active: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
  ];

  function addImage() {
    const url = window.prompt("Paste an approved Media Library image URL");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#17362b]/12 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#17362b]/8 bg-[#f4f4ef] p-2">
        {controls.map(({ label, Icon, active, run }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={run}
            className={cn(
              "grid size-9 place-items-center rounded-lg transition",
              active
                ? "bg-[#123429] text-[#e1bd71]"
                : "text-[#496057] hover:bg-white hover:text-[#a67a30]"
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-[#17362b]/10" />
        <button type="button" onClick={addImage} aria-label="Insert image" className="grid size-9 place-items-center rounded-lg text-[#496057] transition hover:bg-white hover:text-[#a67a30]">
          <ImagePlus className="size-4" />
        </button>
        <div className="ml-auto flex gap-1">
          <button type="button" onClick={() => editor.chain().focus().undo().run()} aria-label="Undo" className="grid size-9 place-items-center rounded-lg text-[#496057] hover:bg-white">
            <Undo2 className="size-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} aria-label="Redo" className="grid size-9 place-items-center rounded-lg text-[#496057] hover:bg-white">
            <Redo2 className="size-4" />
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
