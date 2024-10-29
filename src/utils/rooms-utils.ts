import JSZip = require("jszip");
import * as http from "node:http";
import { parse } from "parse5";
import { BuildingRow, GeoData, IndexRow, ProcessResult, Room } from "../controller/InsightFacade.types";

/**
 * Parses the zip file and extracts room and building data.
 *
 * @param zip The zip file containing room data.
 * @returns Parsed index and building rows.
 */
export async function parseRooms(
	zip: JSZip
): Promise<{ indexRows: IndexRow[]; buildingData: Record<string, BuildingRow[]> }> {
	const indexFile = Object.values(zip.files).find((file) => file.name.endsWith("index.htm"));

	if (!indexFile) {
		throw new Error("parseRooms: No index.htm file found.");
	}

	const indexRows = await readIndex(indexFile);

	// Gather building data based on the parsed index rows
	const buildingData: Record<string, BuildingRow[]> = {};
	await Promise.all(
		indexRows.map(async (indexRow) => {
			const link = indexRow.href;

			// Look for the corresponding file in zip by stripping the first 2 characters
			const length = 2;
			const formattedLink = Object.keys(zip.files).find((path) => path.endsWith(link.slice(length)));

			if (!formattedLink) {
				// Skip if the file does not exist or does not end in .htm
				return;
			}

			const buildingFile = zip.file(formattedLink);

			if (buildingFile) {
				const buildingRows = await readBuilding(buildingFile);
				buildingData[indexRow.shortname] = buildingRows;
			} else {
				buildingData[indexRow.shortname] = []; // No rooms found
			}
		})
	);

	return { indexRows, buildingData };
}

/**
 * Validates the parsed room data to ensure all necessary components are present.
 *
 * @param indexRows Parsed index rows.
 * @param buildingData Parsed building data.
 */
export function validateRooms(indexRows: IndexRow[], buildingData: Record<string, BuildingRow[]>): void {
	if (indexRows.length === 0) {
		throw new Error("validateRooms: No valid index rows found.");
	}

	for (const indexRow of indexRows) {
		if (!buildingData[indexRow.shortname] || buildingData[indexRow.shortname].length === 0) {
			// console.warn(`validateRooms: No rooms found for building ${indexRow.shortname}.`);
		}
	}
}

/**
 * Processes the validated data into structured Room objects.
 *
 * @param indexRows Validated index rows.
 * @param buildingData Validated building data.
 * @returns An array of Room objects.
 */
export function processRooms(indexRows: IndexRow[], buildingData: Record<string, BuildingRow[]>): ProcessResult {
	const rooms: Room[] = [];

	for (const indexRow of indexRows) {
		const buildingRows = buildingData[indexRow.shortname] || [];

		for (const buildingRow of buildingRows) {
			rooms.push({
				fullname: indexRow.fullname,
				shortname: indexRow.shortname,
				number: buildingRow.number,
				name: `${indexRow.shortname}_${buildingRow.number}`,
				address: indexRow.address,
				lat: indexRow.lat,
				lon: indexRow.lon,
				seats: Number(buildingRow.seats),
				type: buildingRow.type,
				furniture: buildingRow.furniture,
				href: indexRow.href,
			});
		}
	}

	return { rows: rooms, totalRows: rooms.length };
}

export async function readIndex(index: any): Promise<IndexRow[]> {
	const file = await index.async("string");
	const document = parse(file);

	const table = findByClass(document, "views-table cols-5 table")[0];
	const tbody = findByTag(table, "tbody")[0];
	const trows = findByTag(tbody, "tr");

	const indexRows: IndexRow[] = await Promise.all(
		trows.map(async (row) => {
			const td = findByClass(row, "views-field views-field-title")[0];
			const aTag = findByTag(td, "a")[0];
			const addressElement = findByClass(row, "views-field views-field-field-building-address")[0];
			const geo = await fetchData(getText(addressElement));

			return {
				fullname: getText(aTag),
				shortname: getText(findByClass(row, "views-field views-field-field-building-code")[0]),
				address: getText(addressElement),
				href: aTag.attrs[0].value,
				lat: geo.lat,
				lon: geo.lon,
			};
		})
	);

	return indexRows;
}

export async function readBuilding(building: any): Promise<BuildingRow[]> {
	const file = await building.async("string");
	const document = parse(file);

	const table = findByClass(document, "views-table cols-5 table")[0];
	const tbody = findByTag(table, "tbody")[0];
	const trows = findByTag(tbody, "tr");

	const buildingRows: BuildingRow[] = [];

	for (const row of trows) {
		const room: BuildingRow = {
			number: getText(findByTag(findByClass(row, "views-field views-field-field-room-number")[0], "a")[0]),
			seats: getText(findByClass(row, "views-field views-field-field-room-capacity")[0]),
			furniture: getText(findByClass(row, "views-field views-field-field-room-furniture")[0]),
			type: getText(findByClass(row, "views-field views-field-field-room-type")[0]),
		};
		buildingRows.push(room);
	}

	return buildingRows;
}

function findByTag(node: any, tag: string): any[] {
	try {
		if (!node) {
			return [];
		}

		const result: any[] = [];
		const queue: any[] = [node];

		while (queue.length > 0) {
			const curr = queue.shift();
			if (curr.tagName === tag) {
				result.push(curr);
			}

			if (curr.childNodes) {
				queue.push(...curr.childNodes);
			}
		}
		return result;
	} catch (e) {
		throw new Error(`findByTag: Unexpected error at ${node}, message: ${(e as Error).message}`);
	}
}

function findByClass(node: any, targetClass: string): any {
	const result: any[] = [];
	const queue: any[] = [node];

	while (queue.length > 0) {
		const currentNode = queue.shift(); // Dequeue the next node

		// Check if the current node has the target class in its attributes
		if (currentNode.attrs) {
			const classAttr = currentNode.attrs.find((attr: any) => attr.name === "class");
			if (classAttr?.value.includes(targetClass)) {
				result.push(currentNode);
			}
		}

		// Add all child nodes to the queue for further exploration
		if (currentNode.childNodes) {
			queue.push(...currentNode.childNodes);
		}
	}

	return result;
}

function getText(node: any): string {
	try {
		if (!node) {
			return "";
		}

		let text = "";

		if (node.nodeName === "#text") {
			text += node.value;
		}

		if (node.childNodes) {
			for (const child of node.childNodes) {
				text += getText(child);
			}
		}

		return text.trim();
	} catch (e) {
		throw new Error(`getText: Unexpected error for ${node} ${(e as Error).message}`);
	}
}

async function fetchData(address: string): Promise<GeoData> {
	return new Promise((resolve, reject) => {
		http
			.get(
				{
					hostname: "cs310.students.cs.ubc.ca",
					port: 11316,
					path: `/api/v1/project_team034/${encodeURIComponent(address)}`,
				},
				(res) => {
					let data = "";

					res.on("data", (chunk) => {
						data += chunk;
					});

					// parse to json and resolve
					res.on("end", () => {
						try {
							const jsonData = JSON.parse(data);
							resolve(jsonData);
						} catch (_) {
							reject(new Error("fetchData: Failed to parse JSON"));
						}
					});
				}
			)
			.on("error", (error) => {
				reject(error);
			});
	});
}
