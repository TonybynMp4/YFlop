import {
	generateUploadButton,
	generateUploadDropzone,
	generateVueHelpers,
	type GenerateTypedHelpersOptions,
} from "@uploadthing/vue";

import BACKEND_URL from "./baseUrl";

const initOpts = {
	url: BACKEND_URL ?? '/',
} satisfies GenerateTypedHelpersOptions;

export const UploadButton = generateUploadButton(initOpts);
export const UploadDropzone = generateUploadDropzone(initOpts);

export const { useUploadThing } = generateVueHelpers(initOpts);