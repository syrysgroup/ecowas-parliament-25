import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Quote,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from "lucide-react";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type ToolbarBtn = {
  icon: React.ReactNode;
  title: string;
  action: (editor: ReturnType<typeof useEditor>) => void;
  isActive?: (editor: ReturnType<typeof useEditor>) => boolean;
};

const TOOLBAR: (ToolbarBtn | "divider")[] = [
  {
    icon: <Bold size={13} />, title: "Bold",
    action: e => e?.chain().focus().toggleBold().run(),
    isActive: e => !!e?.isActive("bold"),
  },
  {
    icon: <Italic size={13} />, title: "Italic",
    action: e => e?.chain().focus().toggleItalic().run(),
    isActive: e => !!e?.isActive("italic"),
  },
  {
    icon: <UnderlineIcon size={13} />, title: "Underline",
    action: e => e?.chain().focus().toggleUnderline().run(),
    isActive: e => !!e?.isActive("underline"),
  },
  "divider",
  {
    icon: <Heading2 size={13} />, title: "Heading 2",
    action: e => e?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: e => !!e?.isActive("heading", { level: 2 }),
  },
  {
    icon: <Quote size={13} />, title: "Blockquote",
    action: e => e?.chain().focus().toggleBlockquote().run(),
    isActive: e => !!e?.isActive("blockquote"),
  },
  {
    icon: <List size={13} />, title: "Bullet List",
    action: e => e?.chain().focus().toggleBulletList().run(),
    isActive: e => !!e?.isActive("bulletList"),
  },
  {
    icon: <ListOrdered size={13} />, title: "Ordered List",
    action: e => e?.chain().focus().toggleOrderedList().run(),
    isActive: e => !!e?.isActive("orderedList"),
  },
  "divider",
  {
    icon: <AlignLeft size={13} />, title: "Align Left",
    action: e => e?.chain().focus().setTextAlign("left").run(),
    isActive: e => !!e?.isActive({ textAlign: "left" }),
  },
  {
    icon: <AlignCenter size={13} />, title: "Align Center",
    action: e => e?.chain().focus().setTextAlign("center").run(),
    isActive: e => !!e?.isActive({ textAlign: "center" }),
  },
  {
    icon: <AlignRight size={13} />, title: "Align Right",
    action: e => e?.chain().focus().setTextAlign("right").run(),
    isActive: e => !!e?.isActive({ textAlign: "right" }),
  },
  {
    icon: <AlignJustify size={13} />, title: "Justify",
    action: e => e?.chain().focus().setTextAlign("justify").run(),
    isActive: e => !!e?.isActive({ textAlign: "justify" }),
  },
];

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Placeholder.configure({ placeholder: placeholder ?? "Write article content…" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external value changes (e.g. when editing an existing article)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div className="border border-crm-border rounded-lg overflow-hidden bg-crm-surface">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-crm-border bg-crm-card">
        {TOOLBAR.map((item, i) => {
          if (item === "divider") {
            return <div key={`div-${i}`} className="w-px h-4 bg-crm-border mx-1" />;
          }
          const active = editor ? item.isActive?.(editor) : false;
          return (
            <button
              key={item.title}
              type="button"
              title={item.title}
              onMouseDown={e => { e.preventDefault(); item.action(editor); }}
              className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                active
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "text-crm-text-dim hover:text-crm-text hover:bg-crm-surface"
              }`}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="min-h-[200px] text-xs text-crm-text px-3 py-2 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror_h2]:text-sm [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-emerald-400 [&_.ProseMirror_h2]:mt-3 [&_.ProseMirror_h2]:mb-1 [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-crm-border [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-crm-text-muted [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-4 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-4 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-crm-text-dim [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p]:mb-2"
      />
    </div>
  );
}
