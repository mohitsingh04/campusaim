// JoditEditorConfig.tsx
import Swal from "sweetalert2";

export const getEditorConfig = () => ({
  readonly: false,
  iframe: false,
  allowTags: ["div", "h2", "button", "a", "p", "span"],
  allowAttributes: {
    "*": [
      "id",
      "class",
      "style",
      "role",
      "data-bs-toggle",
      "data-bs-target",
      "aria-expanded",
      "aria-controls",
      "aria-labelledby",
      "data-bs-parent",
      "href",
    ],
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
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "|",
    "font",
    "brush",
    "ul",
    "ol",
    "|",
    "image",
    "link",
    "|",
    "undo",
    "redo",
    "|",
    "hr",
    "eraser",
    "source",
    "superscript",
    "subscript",
    "font",
    "copy",
    "paste",
    "fontsize",
    "paragraph",
    "align",
    "indent",
    "outdent",
    "copyformat",
  ],
  style: {
    font: [
      "Arial",
      "Georgia",
      "Impact",
      "Tahoma",
      "Times New Roman",
      "Verdana",
      "Courier New",
      "Comic Sans MS",
      "Lucida Console",
      "Trebuchet MS",
    ],
    background: [
      "#ffffff",
      "#000000",
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4caf50",
      "#8bc34a",
      "#cddc39",
      "#ffeb3b",
      "#ffc107",
      "#ff9800",
      "#ff5722",
    ],
    color: [
      "#000000",
      "#ffffff",
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4caf50",
      "#8bc34a",
      "#cddc39",
      "#ffeb3b",
      "#ffc107",
      "#ff9800",
      "#ff5722",
    ],
  },

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
