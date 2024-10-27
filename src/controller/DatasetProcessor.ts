import JSZip = require("jszip");

import { checkKind } from "../utils/validation-utils";
import { InsightDatasetKind } from "./IInsightFacade";
import { ProcessResult } from "./InsightFacade.types";
import { validateSections, parseSections, processSections } from "../utils/sections-utils";
import { validateRooms, parseRooms, processRooms } from "../utils/rooms-utils";

export class DatasetProcessor {
	constructor() {
		// default constructor
	}

	public async validate(content: string, kind: InsightDatasetKind): Promise<JSZip> {
		const zip = new JSZip();
		const folder = await zip.loadAsync(content, { base64: true });

		switch (checkKind(kind)) {
			case "sections":
				validateSections(folder);
				break;
			case "rooms":
				await validateRooms(folder);
				break;
			default:
				throw new Error("validate: Invalid InsightdatasetKind");
		}

		return folder;
	}

	public async parse(folder: JSZip, kind: InsightDatasetKind): Promise<JSZip.JSZipObject[]> {
		let res: JSZip.JSZipObject[] = [];

		if (checkKind(kind) === "sections") {
			res = parseSections(folder);
		} else if (checkKind(kind) === "rooms") {
			res = parseRooms(folder);
		}

		return res;
	}

	public async process(files: JSZip.JSZipObject[], kind: InsightDatasetKind): Promise<ProcessResult> {
		let res;

		if (checkKind(kind) === "sections") {
			res = processSections(files);
			return res;
		}

		res = processRooms(files);
		return res;
	}
}
