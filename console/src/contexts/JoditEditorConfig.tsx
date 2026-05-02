import Swal from "sweetalert2";

export const getEditorConfig = () => ({
  readonly: false,
  iframe: false,
  controls: {
    paragraph: {
      list: {
        p: "Paragraph",
        h1: "Heading 1",
        h2: "Heading 2",
        h3: "Heading 3",
        h4: "Heading 4",
        h5: "Heading 5",
        h6: "Heading 6",
      },
    },
  },
  cleanHTML: {
    removeEmptyElements: true,
    fillEmptyParagraph: false,
  },
  allowTags: [
    "div",
    "p",
    "span",
    "h1",
    "h2",
    "h3",
    "h4",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "mark",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "hr",
    "blockquote",
    "code",
    "pre",
    "button",
  ],
  allowAttributes: {
    "*": [
      "id",
      "class",
      "style",
      "role",
      "aria-expanded",
      "aria-controls",
      "aria-labelledby",
      "data-bs-toggle",
      "data-bs-target",
      "data-bs-parent",
      "href",
    ],
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  uploader: {
    insertImageAsBase64URI: true,
    files: (files: FileList | File[]) => {
      const allowedTypes = ["image/jpeg", "image/png"];
      const maxSize = 100 * 1024;

      const validFiles = Array.from(files).filter((file: File) => {
        if (!allowedTypes.includes(file.type)) {
          Swal.fire({
            icon: "error",
            title: "Invalid File Type",
            text: "Only JPG and PNG files are allowed.",
          });
          return false;
        }

        if (file.size > maxSize) {
          Swal.fire({
            icon: "error",
            title: "File Too Large",
            text: "Image must be under 100KB.",
          });
          return false;
        }

        return true;
      });

      return validFiles;
    },
  },
  buttons: [
    "source",
    "|",
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "|",
    "font",
    "fontsize",
    "paragraph",
    "|",
    "brush",
    "eraser",
    "|",
    "ul",
    "ol",
    "align",
    "|",
    "undo",
    "redo",
    "|",
    "image",
    "video",
    "table",
    "link",
    "hr",
    "|",
    "superscript",
    "subscript",
    "symbols",
    "|",
    "indent",
    "outdent",
    "|",
    "copy",
    "cut",
    "paste",
    "selectall",
    "copyformat",
    "|",
    "find",
    "fullsize",
    "preview",
    "print",
  ],
  events: {
    afterInsertImage: (node: HTMLImageElement) => {
      if (!node) {
        console.warn("Node Not Found");
      }
    },
    error: (error: { message?: string }) => {
      Swal.fire({
        icon: "error",
        title: "Editor Error",
        text: error?.message || "An error occurred in the editor",
      });
    },
  },
});
