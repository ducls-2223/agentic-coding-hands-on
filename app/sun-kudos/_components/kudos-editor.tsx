"use client";

import { EditorContent, ReactRenderer, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { useEffect, useImperativeHandle, forwardRef } from "react";

import { useTranslation } from "@/app/_components/use-translation";
import { searchSunners } from "../_actions/search-sunners";
import { MentionList, type MentionListHandle } from "./mention-list";
import { EditorToolbar } from "./editor-toolbar";

import "tippy.js/dist/tippy.css";

export interface KudosEditorHandle {
  /** Get the current HTML (serialized by Tiptap, ready for the server action). */
  getHtml: () => string;
  /** Reset the editor to empty (used after submit success). */
  clear: () => void;
}

interface KudosEditorProps {
  disabled?: boolean;
  hasError?: boolean;
  /** Fired on every editor change so the parent can keep submit-disabled state. */
  onChange?: (plainTextLength: number) => void;
}

export const KudosEditor = forwardRef<KudosEditorHandle, KudosEditorProps>(
  function KudosEditor({ disabled, hasError, onChange }, ref) {
    const { t } = useTranslation();

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          // We let Tiptap own list/blockquote/strike via StarterKit defaults.
          heading: false,
          horizontalRule: false,
          codeBlock: false,
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            target: "_blank",
            rel: "noopener noreferrer",
          },
        }),
        Mention.configure({
          HTMLAttributes: {
            class:
              "rounded bg-[#FFEA9E]/60 px-1 py-0.5 font-bold text-[#00101A]",
            "data-type": "mention",
          },
          suggestion: {
            char: "@",
            items: async ({ query }) => searchSunners(query, 8),
            render: () => {
              let component: ReactRenderer<MentionListHandle> | null = null;
              let popup: TippyInstance | null = null;

              return {
                onStart: (props) => {
                  component = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor,
                  });
                  if (!props.clientRect) return;
                  popup = tippy(document.body, {
                    getReferenceClientRect: () =>
                      props.clientRect?.() ?? new DOMRect(),
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: "manual",
                    placement: "bottom-start",
                  });
                },
                onUpdate(props) {
                  component?.updateProps(props);
                  if (!props.clientRect || !popup) return;
                  popup.setProps({
                    getReferenceClientRect: () =>
                      props.clientRect?.() ?? new DOMRect(),
                  });
                },
                onKeyDown(props) {
                  if (props.event.key === "Escape") {
                    popup?.hide();
                    return true;
                  }
                  return component?.ref?.onKeyDown(props) ?? false;
                },
                onExit() {
                  popup?.destroy();
                  component?.destroy();
                },
              };
            },
          },
        }),
        Placeholder.configure({
          placeholder: t("kudos.dialog.content_placeholder"),
        }),
      ],
      content: "",
      editorProps: {
        attributes: {
          class:
            "kudos-prose font-montserrat min-h-[200px] w-full bg-transparent px-6 py-3 text-base text-[#00101A] focus:outline-none",
        },
      },
      immediatelyRender: false,
      onUpdate({ editor }) {
        onChange?.(editor.getText().trim().length);
      },
    });

    // Sync disabled prop to editor editability.
    useEffect(() => {
      if (!editor) return;
      editor.setEditable(!disabled);
    }, [editor, disabled]);

    useImperativeHandle(
      ref,
      () => ({
        getHtml: () => editor?.getHTML() ?? "",
        clear: () => editor?.commands.clearContent(true),
      }),
      [editor],
    );

    return (
      // Per design the toolbar and text field are separate bordered regions:
      // the toolbar cells round the top corners, the text field rounds the
      // bottom. `-mt-px` collapses the shared border between them into one line.
      <div className="flex flex-col">
        <EditorToolbar editor={editor} />
        <div
          className={`-mt-px rounded-b-lg border bg-white ${
            hasError ? "border-[#B72927]" : "border-[#998C5F]"
          }`}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
);
