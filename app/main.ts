import { InsightError } from "../src/controller/IInsightFacade";
import * as fs from "fs-extra";
import JSZip = require("jszip");

async function main(name: string): Promise<string> {
	try {
		const filePath = `../test/resources/archives/${name}`;
		const buffer = await fs.readFile(filePath);

		const zip = new JSZip();
		const folder = await zip.loadAsync(buffer);

		if (!folder.folder("courses")) {
			throw new InsightError("Zip file does not contain a 'courses' folder");
		}

		const files = Object.keys(folder.files).filter((path) => !path.endsWith("/"));

		if (files.length === 0) {
			throw new InsightError("Folder is empty");
		}

		return buffer.toString("base64");
	} catch (err) {
		throw err;
	}
}

// // should work
// main("small_comm.zip")
// 	.then((output) => {
// 		console.log(output);
// 	})
// 	.catch((err) => console.error("Unexpected Error:", err));

// // no courses
// main("no_courses_folder.zip")
// 	.then((output) => {
// 		console.log(output);
// 	})
// 	.catch((err) => console.error("Unexpected Error:", err));

// no courses
main("empty_courses_folder.zip")
	.then((output) => {
		console.log(output);
	})
	.catch((err) => console.error("Unexpected Error:", err));
