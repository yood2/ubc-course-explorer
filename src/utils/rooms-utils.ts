import JSZip = require("jszip");
import { ProcessResult } from "../controller/InsightFacade.types";
import { readIndex, readBuilding } from "../utils/html-utils";
import { Room } from "../controller/InsightFacade.types";

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
export async function validateRooms(zip: JSZip): Promise<Room[]> {
	// check there is index file
	const index = Object.values(zip.files).find((file) => file.name.endsWith("index.htm"));

	if (!index) {
		throw new Error("validateRooms: No index.htm file");
	}

	// check for table with rows (key tags are <table>, <a>)
	const indexRows = await readIndex(index);

	// const rooms: Room[] = [];

	// for (const row of indexRows) {
	// 	const link = row.href;
	// 	const remove = 2;
	// 	const modifiedLink = `campus/${link.substring(remove)}`;
	// 	const building = zip.file(modifiedLink);
	// 	const buildingRooms = readBuilding(building);
	// }

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

	console.log(rooms);

	return rooms;
}

export function parseRooms(folder: JSZip): JSZip.JSZipObject[] {
	throw new Error("Not implemented yet");
}

export async function processRooms(files: JSZip.JSZipObject[]): Promise<ProcessResult> {
	throw new Error("not implemented yet");
}
