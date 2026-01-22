"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface EditorProps {
  value: string;
  onChange: (text: string) => void; // plain text now
}

export default function Editor({ value, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getText()); // ⬅ return plain text
    },
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getText()) {
   editor.commands.setContent(value, { emitUpdate: false });

    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="border rounded-md shadow-sm p-2 bg-white">
      <EditorContent editor={editor} className="min-h-[200px] px-2 py-1 prose" />
    </div>
  );
}
