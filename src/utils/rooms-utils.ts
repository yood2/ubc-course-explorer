import JSZip = require("jszip");
import { PreProcessedSection, Section, ProcessResult } from "../controller/InsightFacade.types";
import { readIndex } from "../utils/html-utils";
import { parse } from "parse5";

/**
 * Valid dataset:
 * - zip file
 * - contains at least one valid room
 *
 * Valid index.htm:
 * - index.htm exists
 * - contains table that lists/links to building data files (only one valid building list table)
 * - Each row in table represents building and contains column that links to buildings data file within zip (file may or may not exist or contain no valid rooms)
 * - Link will be contained in cell element with class 'views-field-title'
 *
 * Valid building file:
 * - HTML
 * - linked from index.htm
 * - contains table with valid rooms (can have many tables but only one will be valid room table)
 * - no room table or table with no room == building has no rooms
 *
 * Valid room:
 * - contains every field use in rooms query
 * - if field is present but is empty, still valid
 * - requested rooms geolocation request returns successfully
 */
export async function validateRooms(zip: JSZip): Promise<void> {
	// check there is index file
	const index = Object.values(zip.files).find((file) => file.name.endsWith("index.htm"));

	if (!index) {
		throw new Error("validateRooms: No index.htm file");
	}

	// check for table with rows (key tags are <table>, <a>)
	const rows = await readIndex(index);

	throw new Error("validateRooms: Not implemented yet");
}

export function parseRooms(folder: JSZip): JSZip.JSZipObject[] {
	throw new Error("Not implemented yet");
}

export async function processRooms(files: JSZip.JSZipObject[]): Promise<ProcessResult> {
	throw new Error("not implemented yet");
}
