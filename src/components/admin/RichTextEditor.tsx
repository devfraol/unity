import { useEffect, useRef, type ClipboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { plainTextToRichHtml, sanitizeRichHtml } from "@/lib/sanitize-html";

const commands = [
  ["Bold", "bold"],
  ["Italic", "italic"],
  ["H2", "formatBlock", "h2"],
  ["H3", "formatBlock", "h3"],
  ["• List", "insertUnorderedList"],
  ["1. List", "insertOrderedList"],
  ["Quote", "formatBlock", "blockquote"],
] as const;

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value;
  }, [value]);
  const apply = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editor.current?.focus();
    onChange(editor.current?.innerHTML || "");
  };
  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    const pastedHtml = html
      ? sanitizeRichHtml(html, { allowImages: false })
      : plainTextToRichHtml(text);
    if (!pastedHtml) return;

    event.preventDefault();
    const editable = editor.current;
    const selection = window.getSelection();
    if (!editable || !selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!editable.contains(range.commonAncestorContainer)) return;

    range.deleteContents();
    const fragment = range.createContextualFragment(pastedHtml);
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    onChange(editable.innerHTML);
  };
  return (
    <div className="rounded-md border border-input bg-background">
      <div className="flex flex-wrap gap-1 border-b p-2">
        {commands.map(([label, command, arg]) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              apply(command, arg);
            }}
          >
            {label}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = window.prompt("Link URL (https://...)");
            if (url && /^(https?:|mailto:)/i.test(url.trim())) apply("createLink", url.trim());
          }}
        >
          Link
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = window.prompt("Image URL");
            if (url?.startsWith("http")) apply("insertImage", url);
          }}
        >
          Image
        </Button>
      </div>
      <div
        ref={editor}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Post content editor"
        aria-multiline="true"
        onInput={() => onChange(editor.current?.innerHTML || "")}
        onPaste={handlePaste}
        className="min-h-72 p-4 outline-none prose prose-sm max-w-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
