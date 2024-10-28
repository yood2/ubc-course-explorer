import JSZip = require("jszip");
import { checkKind } from "../utils/validation-utils";
import { InsightDatasetKind } from "./IInsightFacade";
import { ParsedData, ProcessResult } from "./InsightFacade.types";
import { validateSections, parseSections, processSections } from "../utils/sections-utils";
import { validateRooms, parseRooms, processRooms } from "../utils/rooms-utils";

export class DatasetProcessor {
	constructor() {
		// default constructor
	}

	public async parse(content: string, kind: InsightDatasetKind): Promise<ParsedData> {
		const zip = new JSZip();
		const folder = await zip.loadAsync(content, { base64: true });

		// Declare a variable to hold the parsed data
		const parsedData: ParsedData = {};

		if (checkKind(kind) === "sections") {
			parsedData.sections = parseSections(folder);
		} else if (checkKind(kind) === "rooms") {
			parsedData.rooms = await parseRooms(folder);
		}

		return parsedData;
	}

	public async validate(parsedData: ParsedData, kind: InsightDatasetKind): Promise<void> {
		if (checkKind(kind) === "sections") {
			if (!parsedData.sections?.folder) {
				throw new Error("validate: No sections files parsed");
			}
			validateSections(parsedData.sections.folder);
		} else if (checkKind(kind) === "rooms") {
			if (!parsedData.rooms) {
				throw new Error("validate: No rooms data parsed");
			}
			validateRooms(parsedData.rooms.indexRows, parsedData.rooms.buildingData);
		}
	}

	public async process(parsedData: ParsedData, kind: InsightDatasetKind): Promise<ProcessResult> {
		if (checkKind(kind) === "sections" && parsedData.sections) {
			return await processSections(parsedData.sections.values);
		} else if (checkKind(kind) === "rooms" && parsedData.rooms) {
			return processRooms(parsedData.rooms.indexRows, parsedData.rooms.buildingData);
		}

		throw new Error("process: Invalid or missing parsed data for the given kind");
	}
}
