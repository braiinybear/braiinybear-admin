"use client";

import { ReactNode } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

type Props = {
  editor: Editor;
};

export default function Toolbar({ editor }: Props) {
  if (!editor) return null;

  const Button = ({
    icon,
    onClick,
    isActive,
  }: {
    icon: ReactNode;
    onClick: () => void;
    isActive?: boolean;
  }) => (
    <button
      onClick={() => {
        onClick();
        // Ensure editor is focused before running commands
        editor.chain().focus().run();
      }}
      className={`p-1 hover:bg-gray-100 rounded ${isActive ? "bg-gray-200" : ""}`}
      type="button"
    >
      {icon}
    </button>
  );

  return (
    <div className="flex gap-1 border-b pb-1 mb-2 text-gray-700">
      <Button
        icon={<Bold size={16} />}
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
      />
      <Button
        icon={<Italic size={16} />}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
      />
      <Button
        icon={<Strikethrough size={16} />}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
      />
      <Button
        icon={<Heading1 size={16} />}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
      />
      <Button
        icon={<Heading2 size={16} />}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
      />
      <Button
        icon={<Heading3 size={16} />}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
      />
      <Button
        icon={<List size={16} />}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
      />
      <Button
        icon={<ListOrdered size={16} />}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
      />
      <Button
        icon={<Undo size={16} />}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <Button
        icon={<Redo size={16} />}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}
