// // JoditEditorConfig.tsx
// import Swal from "sweetalert2";

// export const getEditorConfig = () => ({
// 	readonly: false,
// 	iframe: false,
// 	allowTags: ["div", "h2", "button", "a", "p", "span"],
// 	allowAttributes: {
// 		"*": [
// 			"id",
// 			"class",
// 			"style",
// 			"role",
// 			"data-bs-toggle",
// 			"data-bs-target",
// 			"aria-expanded",
// 			"aria-controls",
// 			"aria-labelledby",
// 			"data-bs-parent",
// 			"href",
// 		],
// 	},
// 	uploader: {
// 		insertImageAsBase64URI: true,
// 		files: (files: FileList | File[]) => {
// 			const allowedTypes = ["image/jpeg", "image/png"];
// 			const maxSize = 100 * 1024;

// 			const validFiles = Array.from(files).filter((file: File) => {
// 				if (!allowedTypes.includes(file.type)) {
// 					Swal.fire({
// 						icon: "error",
// 						title: "Invalid File Type",
// 						text: "Only JPG and PNG files are allowed.",
// 					});
// 					return false;
// 				}

// 				if (file.size > maxSize) {
// 					Swal.fire({
// 						icon: "error",
// 						title: "File Too Large",
// 						text: "Image must be under 100KB.",
// 					});
// 					return false;
// 				}

// 				return true;
// 			});

// 			return validFiles;
// 		},
// 	},
// 	buttons: [
// 		"bold",
// 		"italic",
// 		"underline",
// 		"strikethrough",
// 		"|",
// 		"font",
// 		"brush",
// 		"ul",
// 		"ol",
// 		"|",
// 		"image",
// 		"link",
// 		"|",
// 		"undo",
// 		"redo",
// 		"|",
// 		"hr",
// 		"eraser",
// 		"source",
// 		"superscript",
// 		"subscript",
// 		"font",
// 		"copy",
// 		"paste",
// 		"fontsize",
// 		"paragraph",
// 		"align",
// 		"indent",
// 		"outdent",
// 		"copyformat",
// 	],
// 	style: {
// 		font: [
// 			"Arial",
// 			"Georgia",
// 			"Impact",
// 			"Tahoma",
// 			"Times New Roman",
// 			"Verdana",
// 			"Courier New",
// 			"Comic Sans MS",
// 			"Lucida Console",
// 			"Trebuchet MS",
// 		],
// 		background: [
// 			"#ffffff",
// 			"#000000",
// 			"#f44336",
// 			"#e91e63",
// 			"#9c27b0",
// 			"#673ab7",
// 			"#3f51b5",
// 			"#2196f3",
// 			"#03a9f4",
// 			"#00bcd4",
// 			"#009688",
// 			"#4caf50",
// 			"#8bc34a",
// 			"#cddc39",
// 			"#ffeb3b",
// 			"#ffc107",
// 			"#ff9800",
// 			"#ff5722",
// 		],
// 		color: [
// 			"#000000",
// 			"#ffffff",
// 			"#f44336",
// 			"#e91e63",
// 			"#9c27b0",
// 			"#673ab7",
// 			"#3f51b5",
// 			"#2196f3",
// 			"#03a9f4",
// 			"#00bcd4",
// 			"#009688",
// 			"#4caf50",
// 			"#8bc34a",
// 			"#cddc39",
// 			"#ffeb3b",
// 			"#ffc107",
// 			"#ff9800",
// 			"#ff5722",
// 		],
// 	},

// 	events: {
// 		afterInsertImage: (node: HTMLImageElement) => {
// 			if (!node) {
// 				console.warn("Node Not Found");
// 			}
// 		},
// 		error: (error: { message?: string }) => {
// 			Swal.fire({
// 				icon: "error",
// 				title: "Editor Error",
// 				text: error?.message || "An error occurred in the editor",
// 			});
// 		},
// 	},
// });
// JoditEditorConfig.tsx
import Swal from "sweetalert2";

export const getEditorConfig = () => ({
	readonly: false,
	iframe: false,

	/* =====================================================
     ALLOWED TAGS (🔥 FIX IS HERE)
  ===================================================== */
	allowTags: [
		"div",
		"p",
		"span",

		// ✅ HEADINGS
		"h1",
		"h2",
		"h3",
		"h4",

		// TEXT
		"strong",
		"b",
		"em",
		"i",
		"u",
		"mark",

		// LISTS
		"ul",
		"ol",
		"li",

		// LINKS & MEDIA
		"a",
		"img",

		// TABLES
		"table",
		"thead",
		"tbody",
		"tr",
		"th",
		"td",

		// OTHERS
		"hr",
		"blockquote",
		"code",
		"pre",
		"button",
	],

	/* =====================================================
     ALLOWED ATTRIBUTES (SAFE)
  ===================================================== */
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
		],
		a: ["href", "target", "rel"],
		img: ["src", "alt", "width", "height"],
	},

	/* =====================================================
     PARAGRAPH / HEADING DROPDOWN (CRITICAL)
  ===================================================== */
	controls: {
		paragraph: {
			list: {
				p: "Paragraph",
				h1: "Heading 1",
				h2: "Heading 2",
				h3: "Heading 3",
				h4: "Heading 4",
			},
		},
	},

	/* =====================================================
     PREVENT AUTO-DOWNGRADING HEADINGS
  ===================================================== */
	enter: "DIV",
	cleanHTML: {
		removeEmptyElements: false,
		fillEmptyParagraph: false,
	},

	/* =====================================================
     UPLOADER (UNCHANGED, SAFE)
  ===================================================== */
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

	/* =====================================================
     TOOLBAR
  ===================================================== */
	buttons: [
		"bold",
		"italic",
		"underline",
		"strikethrough",
		"|",
		"font",
		"fontsize",
		"brush",
		"|",
		"ul",
		"ol",
		"|",
		"paragraph",
		"|",
		"align",
		"indent",
		"outdent",
		"|",
		"image",
		"link",
		"|",
		"hr",
		"superscript",
		"subscript",
		"|",
		"undo",
		"redo",
		"|",
		"eraser",
		"copyformat",
		"source",
	],

	/* =====================================================
     STYLES (UNCHANGED)
  ===================================================== */
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
	},

	/* =====================================================
     EVENTS
  ===================================================== */
	events: {
		afterInsertImage: (node: HTMLImageElement) => {
			if (!node) {
				console.warn("Image node not found");
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
