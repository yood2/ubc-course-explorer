import JSZip = require("jszip");
import { ProcessResult } from "../controller/InsightFacade.types";
import { readIndex, readBuilding } from "../utils/html-utils";
import { Room } from "../controller/InsightFacade.types";

/**
 *
 * @param zip
 * @returns
 */
export async function validateRooms(zip: JSZip): Promise<Room[]> {
	/**
	 * Check for Valid Dataset
	 * 1. index.htm exists
	 * 2. contains table that lists/links to building file
	 * 3. each row links to valid building file
	 * 4. links are contained in <a> tag with class "view-field-title"
	 */
	const index = Object.values(zip.files).find((file) => file.name.endsWith("index.htm"));

	if (!index) {
		throw new Error("validateRooms: No index.htm file");
	}

	const indexRows = await readIndex(index);

	/**
	 * Check for Valid Building
	 * 1. Linked from index.htm
	 * 2. Contains table with valid rooms (might have many tables, only one will be valid room table)
	 * 3. No room table or table with no room == building has no rooms
	 */

	const rooms: Room[] = [];

	const buildingPromises = indexRows.map(async (indexRow) => {
		const link = indexRow.href;
		const remove = 2;
		const modifiedLink = `campus/${link.substring(remove)}`;
		const building = zip.file(modifiedLink);

		if (building) {
			const buildingRows = await readBuilding(building);
			return buildingRows.map((buildingRow) => ({
				fullname: indexRow.fullname,
				shortname: indexRow.shortname,
				number: buildingRow.number,
				name: `${indexRow.shortname}_${buildingRow.number}`,
				address: indexRow.address,
				lat: 0,
				lon: 0,
				seats: Number(buildingRow.capacity),
				type: buildingRow.type,
				furniture: buildingRow.furniture,
				href: indexRow.href,
			}));
		}

		return []; // If the building is not found, return an empty array
	});

	// Wait for all building promises to resolve
	const resolvedBuildings = await Promise.all(buildingPromises);

	// Flatten the array of arrays and add to rooms
	resolvedBuildings.forEach((buildingArray) => {
		rooms.push(...buildingArray);
	});

	/**
	 * Check for Valid Room
	 * - Contains every field used in query
	 * - If field is present but empty, still valid
	 * - Requested rooms geolocation request returns successfully
	 */

	return rooms;
}

export function parseRooms(folder: JSZip): JSZip.JSZipObject[] {
	throw new Error("Not implemented yet");
}

export async function processRooms(files: JSZip.JSZipObject[]): Promise<ProcessResult> {
	throw new Error("not implemented yet");
}
