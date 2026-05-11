import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

const btnBase =
  "px-2 h-7 text-[12px] font-medium rounded-[6px] hover:bg-navy-light/40 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";
const btnActive = "bg-navy-light/60 text-navy";
const btnInactive = "text-foreground/70";

const NoteEditor = ({ value, onChange, placeholder, autoFocus }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start typing — anything you'd like to remember.",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: { class: "text-navy underline" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    autofocus: autoFocus ? "end" : false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="bg-card border border-[hsl(var(--border))] rounded-[8px] p-5 min-h-[400px]" />
    );
  }

  const cls = (active: boolean) => `${btnBase} ${active ? btnActive : btnInactive}`;

  const promptForLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL:", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[hsl(var(--border))] bg-card rounded-t-[8px]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cls(editor.isActive("bold"))}
          aria-label="Bold"
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cls(editor.isActive("italic"))}
          aria-label="Italic"
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cls(editor.isActive("heading", { level: 1 }))}
          aria-label="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cls(editor.isActive("heading", { level: 2 }))}
          aria-label="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cls(editor.isActive("bulletList"))}
          aria-label="Bullet list"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cls(editor.isActive("orderedList"))}
          aria-label="Ordered list"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cls(editor.isActive("taskList"))}
          aria-label="Task list"
        >
          ☐
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cls(editor.isActive("blockquote"))}
          aria-label="Blockquote"
        >
          ❝
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cls(editor.isActive("codeBlock"))}
          aria-label="Code block"
        >
          {"{ }"}
        </button>
        <button
          type="button"
          onClick={promptForLink}
          className={cls(editor.isActive("link"))}
          aria-label="Link"
        >
          🔗
        </button>
      </div>
      <div className="bg-card border-x border-b border-[hsl(var(--border))] rounded-b-[8px] p-5 min-h-[400px] max-h-[calc(100vh-280px)] overflow-y-auto">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none [&_p]:my-2 [&_h1]:text-[24px] [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-2 [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-l-navy [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-foreground/75 [&_code]:bg-navy-light/40 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_code]:font-mono [&_pre]:bg-navy/[0.05] [&_pre]:p-4 [&_pre]:rounded-[8px] [&_pre]:my-3 [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-navy [&_a]:underline [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[360px] [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-foreground/40 [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0 [&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0 [&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:gap-2 [&_ul[data-type=taskList]_li>label]:mt-1"
        />
      </div>
    </div>
  );
};

export default NoteEditor;
