"use client";

import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Code2,
  FileCode2,
  ImagePlus,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Maximize2,
  Minus,
  Play,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function AdminArticleEditor({ value, onChange, className }: { value: string; onChange: (html: string) => void; className?: string }) {
  const [source, setSource] = useState(false);
  const [note, setNote] = useState(false);
  const [raw, setRaw] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false, content: value,
    extensions: [StarterKit, Underline, TextStyle, FontSize, Color, Highlight.configure({ multicolor: true }), FontFamily, Image.configure({ allowBase64: false }), Link.configure({ openOnClick: false }), Placeholder.configure({ placeholder: "Write the story…" }), TextAlign.configure({ types: ["heading", "paragraph"] }), Table.configure({ resizable: true }), TableRow, TableHeader, TableCell, Youtube, TaskList, TaskItem.configure({ nested: true }), CharacterCount],
    editorProps: { attributes: { class: "min-h-80 p-5 text-[15px] leading-8 text-cream-100 outline-none [&_h1]:text-4xl [&_h1]:font-display [&_h2]:mt-9 [&_h2]:text-3xl [&_h2]:font-display [&_h3]:mt-7 [&_h3]:text-2xl [&_a]:text-[#D9B46B] [&_blockquote]:border-l-2 [&_blockquote]:border-[#D9B46B] [&_blockquote]:pl-5 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_table]:my-5 [&_td]:border [&_td]:border-white/20 [&_td]:p-2 [&_th]:border [&_th]:border-white/20 [&_th]:bg-white/10 [&_th]:p-2" } },
    onUpdate: ({ editor: instance }) => { const html = instance.getHTML(); setRaw(html); onChange(html); },
  });
  useEffect(() => { if (editor && value !== editor.getHTML() && !source) editor.commands.setContent(value || "", { emitUpdate: false }); }, [editor, value, source]);
  if (!editor) return null;
  const command = (run: () => void) => () => run();
  const addLink = () => { const url = window.prompt("Link URL"); if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run(); };
  const addYoutube = () => { const src = window.prompt("YouTube URL"); if (src) editor.commands.setYoutubeVideo({ src }); };
  const addEmbed = () => { const src = window.prompt("Vimeo or map embed URL"); if (src) editor.commands.insertContent(`<iframe src="${src.replace(/"/g, "")}" loading="lazy" allowfullscreen></iframe>`); };
  const upload = async (file?: File) => {
    if (!file) return; const form = new FormData(); form.append("file", file); form.append("alt", file.name);
    const response = await fetch("/api/admin/articles/media", { method: "POST", body: form }); const json = await response.json();
    if (response.ok && json.asset?.url) editor.chain().focus().setImage({ src: json.asset.url, alt: json.asset.alt || file.name }).run();
  };
  const buttons = [
    ["B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")], ["I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
    ["U", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"), UnderlineIcon], ["S", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"), Strikethrough],
    ["•", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), List], ["1.", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"), ListOrdered],
    ["Task", () => editor.chain().focus().toggleTaskList().run(), editor.isActive("taskList"), ListChecks], ["Quote", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"), Quote],
  ] as const;
  return <div className={cn("overflow-hidden rounded-xl border border-white/15 bg-[#08130f]", className)}>
    <div className="flex flex-wrap gap-1 border-b border-white/10 bg-white/[0.04] p-2">
      {[1,2,3,4,5,6].map(level => <button key={level} type="button" onClick={command(() => editor.chain().focus().toggleHeading({ level: level as 1|2|3|4|5|6 }).run())} className={tool(editor.isActive("heading",{level}))}>H{level}</button>)}
      <button type="button" onClick={command(() => editor.chain().focus().setParagraph().run())} className={tool(editor.isActive("paragraph"))}>P</button>
      {buttons.map(([label, run, active, Icon]) => <button key={label} type="button" title={label} onClick={command(run)} className={tool(active)}>{Icon ? <Icon className="size-3.5" /> : label}</button>)}
      <input aria-label="Text color" type="color" onChange={e => editor.chain().focus().setColor(e.target.value).run()} className="size-8 rounded bg-transparent p-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleHighlight({ color: "#D9B46B" }).run()} className={tool(editor.isActive("highlight"))}>HL</button>
      <select aria-label="Font size" onChange={e => { if (e.target.value) editor.chain().focus().setFontSize(e.target.value).run(); }} className="h-8 rounded bg-white/10 px-1 text-[10px] text-cream-100"><option value="">Size</option><option value="14px">14</option><option value="16px">16</option><option value="18px">18</option><option value="22px">22</option></select>
      <select aria-label="Font family" onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()} className="h-8 rounded bg-white/10 px-1 text-[10px] text-cream-100"><option value="">Font</option><option value="serif">Serif</option><option value="sans-serif">Sans</option></select>
      {(["left","center","right"] as const).map(a => <button key={a} type="button" onClick={() => editor.chain().focus().setTextAlign(a).run()} className={tool(editor.isActive({ textAlign:a }))}>{a[0].toUpperCase()}</button>)}
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={tool(false)}><Minus className="size-4"/></button><button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={tool(editor.isActive("codeBlock"))}><Code2 className="size-4"/></button>
      <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={tool(false)}><Table2 className="size-4"/></button><button type="button" onClick={addLink} className={tool(editor.isActive("link"))}><Link2 className="size-4"/></button><button type="button" onClick={addYoutube} className={tool(false)}><Play className="size-4"/></button><button type="button" onClick={addEmbed} className={tool(false)}>Embed</button>
      <button type="button" onClick={() => inputRef.current?.click()} className={tool(false)}><ImagePlus className="size-4"/></button><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => void upload(e.target.files?.[0])}/>
      <span className="flex-1"/><button type="button" onClick={() => editor.chain().focus().undo().run()} className={tool(false)}><Undo2 className="size-4"/></button><button type="button" onClick={() => editor.chain().focus().redo().run()} className={tool(false)}><Redo2 className="size-4"/></button><button type="button" onClick={() => setSource(!source)} className={tool(source)}><FileCode2 className="size-4"/></button><button type="button" onClick={() => document.fullscreenElement ? document.exitFullscreen() : editor.view.dom.parentElement?.requestFullscreen()} className={tool(false)}><Maximize2 className="size-4"/></button>
    </div>
    {source ? <textarea value={raw} onChange={e => { setRaw(e.target.value); onChange(e.target.value); editor.commands.setContent(e.target.value, { emitUpdate: false }); }} className="min-h-80 w-full bg-transparent p-5 font-mono text-xs text-cream-100 outline-none"/> : <EditorContent editor={editor} onDrop={e => { const file=e.dataTransfer.files?.[0]; if(file){ e.preventDefault(); void upload(file); }}} />}
    <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] text-cream-200/55"><span>{editor.storage.characterCount.words()} words · {editor.storage.characterCount.characters()} characters · {Math.max(1, Math.ceil(editor.storage.characterCount.words()/200))} min read</span><button type="button" onClick={() => setNote(!note)} className="text-[#D9B46B]">{note ? "Hide markdown note" : "Add markdown note"}</button></div>
    {note ? <textarea aria-label="Markdown note" placeholder="Private markdown / editorial note (saved separately by the article form)" className="w-full border-t border-white/10 bg-white/[0.03] p-4 text-sm text-cream-100 outline-none"/> : null}
  </div>;
}
function tool(active: boolean) { return cn("grid h-8 min-w-8 place-items-center rounded px-1 text-[10px] text-cream-200/70 hover:bg-white/10 hover:text-[#D9B46B]", active && "bg-[#D9B46B] text-[#0B1713]"); }
