const { createUploadthing } = require("uploadthing/server");
const crypto = require("crypto");
globalThis.crypto = crypto;

const f = createUploadthing();

const uploadRouter = {
	Images: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 10,
		},
	})
	.onUploadComplete((data) => console.log("Upload complete", data))
};

module.exports = { uploadRouter };