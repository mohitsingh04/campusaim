import Swal from "sweetalert2";

export type EditorConfig = {
	readonly: boolean;
	iframe: boolean;
	height: string | number;
	minHeight: string | number;
	maxHeight: string | number;
	placeholder: string;
	showCharsCounter: boolean;
	showWordsCounter: boolean;
	showStatusbar: boolean;
	toolbarAdaptive: boolean;
	toolbarSticky: boolean;
	theme: string;
	buttons: string[];
	uploader: {
		insertImageAsBase64URI: boolean;
		files: (files: FileList | File[]) => File[];
	};
	events: {
		afterInsertImage: (node: HTMLElement | null) => void;
		error: (error: unknown) => void;
	};
};

export const getEditorConfig = (): EditorConfig => ({
	readonly: false,
	iframe: false,
	height: 220,
	minHeight: 120,
	maxHeight: 400,
	placeholder: "Type your answer here...",
	showCharsCounter: false,
	showWordsCounter: false,
	showStatusbar: false,
	toolbarAdaptive: true,
	toolbarSticky: false,
	theme: "default", // or "light"
	buttons: [
		"bold",
		"italic",
		"underline",
		"ul",
		"ol",
		"outdent",
		"indent",
		"|",
		"font",
		"fontsize",
		"brush",
		"paragraph",
		"|",
		"image",
		"link",
		"|",
		"align",
		"undo",
		"redo",
		"hr",
		"eraser",
		"source",
	],
	uploader: {
		insertImageAsBase64URI: true,
		files: (files: FileList | File[]) => {
			const allowedTypes = ["image/jpeg", "image/png"];
			const maxSize = 5 * 1024 * 1024; // 5 MB
			const list = Array.isArray(files) ? files : Array.from(files);
			const errors: string[] = [];
			const validFiles = list.filter((file) => {
				if (!allowedTypes.includes(file.type)) {
					errors.push(`${file.name}: Invalid file type`);
					return false;
				}
				if (file.size > maxSize) {
					errors.push(`${file.name}: File too large (max 5 MB)`);
					return false;
				}
				return true;
			});
			if (errors.length) {
				setTimeout(() => {
					Swal.fire({
						icon: "error",
						title: "Upload Error",
						html: errors.join("<br>"),
					});
				}, 5);
			}
			return validFiles;
		},
	},
	events: {
		afterInsertImage: (node: HTMLElement | null) => {
			if (!node) {
				console.warn("Node Not Found");
			}
		},
		error: (error: unknown) => {
			const message =
				typeof error === "object" && error !== null && "message" in error
					? String((error as { message: unknown }).message)
					: "An error occurred in the editor";
			Swal.fire({
				icon: "error",
				title: "Editor Error",
				text: message,
			});
		},
	},
});
