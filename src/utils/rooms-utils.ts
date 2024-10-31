import JSZip = require("jszip");
import * as http from "node:http";
import { parse } from "parse5";
import { BuildingRow, GeoResponse, IndexRow, ProcessResult, Room } from "../controller/InsightFacade.types";

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

	if (indexRows.length === 0) {
		throw new Error("parseRooms: index has no valid rows");
	}

	const buildingData = await parseBuildingData(indexRows, zip);

	if (Object.keys(buildingData).length === 0) {
		throw new Error("parseRooms: Dataset has no valid rooms.");
	}

	return { indexRows, buildingData };
}

/**
 * Validates the parsed room data to ensure all necessary components are present.
 *
 * @param indexRows Parsed index rows.
 * @param buildingData Parsed building data.
 */
export function validateRooms(indexRows: IndexRow[], buildingData: Record<string, BuildingRow[]>): void {
	const validatedIndexRows = new Set<IndexRow>();
	indexRows.forEach((row) => {
		if (!validatedIndexRows.has(row)) {
			validateIndexRow(row);
			validatedIndexRows.add(row);
		}
	});

	Object.values(buildingData).forEach((rows) => rows.forEach(validateBuildingRow));
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

	if (trows.length === 0) {
		throw new Error(`readIndex: no tr tags`);
	}

	const indexRows: IndexRow[] = (
		await Promise.all(
			trows.map(async (row) => {
				const td = findByClass(row, "views-field views-field-title")[0];

				if (!td || !(td.nodeName === "td")) {
					return null;
				}

				const aTag = findByTag(td, "a")[0];

				// make sure address is in td tag with specific class
				const addressElement = findByClass(row, "views-field views-field-field-building-address")[0];

				const geo: GeoResponse = await fetchData(getText(addressElement));
				if (geo.error || !(geo.lat && geo.lon)) {
					return null;
				}

				return {
					fullname: getText(aTag),
					shortname: getText(findByClass(row, "views-field views-field-field-building-code")[0]),
					address: getText(addressElement),
					href: aTag.attrs[0].value,
					lat: Number(geo.lat),
					lon: Number(geo.lon),
				};
			})
		)
	).filter((row) => row !== null) as IndexRow[]; // Filter out nulls

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
		const number = findByTag(findByTag(findByClass(row, "views-field views-field-field-room-number")[0], "td")[0], "a");
		const seats = findByTag(findByClass(row, "views-field views-field-field-room-capacity")[0], "td");
		const furniture = findByTag(findByClass(row, "views-field views-field-field-room-furniture")[0], "td");
		const type = findByTag(findByClass(row, "views-field views-field-field-room-type")[0], "td");

		if (!number.length || !seats.length || !furniture.length || !type.length) {
			continue;
		}

		const room: BuildingRow = {
			number: getText(number[0]),
			seats: Number(getText(seats[0])),
			furniture: getText(furniture[0]),
			type: getText(type[0]),
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

async function fetchData(address: string): Promise<GeoResponse> {
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
							const jsonData: GeoResponse = JSON.parse(data);
							resolve(jsonData);
						} catch (_) {
							reject(new Error("fetchData: Failed to parse JSON into GeoResponse"));
						}
					});
				}
			)
			.on("error", (error) => {
				reject(error);
			});
	});
}

async function parseBuildingData(indexRows: IndexRow[], zip: JSZip): Promise<Record<string, BuildingRow[]>> {
	const buildingData: Record<string, BuildingRow[]> = {};

	// Use a map for faster file path lookup
	const zipFileMap = new Map(Object.keys(zip.files).map((key) => [key, zip.files[key]]));

	await Promise.all(
		indexRows.map(async (indexRow) => {
			const length = 2;
			const formattedLink = zipFileMap.get(indexRow.href.slice(length));
			if (!formattedLink) {
				return;
			}
			const buildingRows = await readBuilding(formattedLink);
			buildingData[indexRow.shortname] = buildingRows;
		})
	);

	return buildingData;
}

function validateIndexRow(row: IndexRow): void {
	if (typeof row.fullname !== "string") {
		throw new Error("IndexRow fullname must be a string.");
	}
	if (typeof row.shortname !== "string") {
		throw new Error("IndexRow shortname must be a string.");
	}
	if (typeof row.address !== "string") {
		throw new Error("IndexRow address must be a string.");
	}
	if (typeof row.href !== "string") {
		throw new Error("IndexRow href must be a string.");
	}
	if (typeof row.lat !== "number") {
		throw new Error("IndexRow lat must be a number.");
	}
	if (typeof row.lon !== "number") {
		throw new Error("IndexRow lon must be a number.");
	}
}

function validateBuildingRow(row: BuildingRow): void {
	if (typeof row.number !== "string") {
		throw new Error("BuildingRow number must be a string.");
	}
	if (typeof row.seats !== "number") {
		throw new Error("BuildingRow seats must be a number.");
	}
	if (typeof row.type !== "string") {
		throw new Error("BuildingRow type must be a string.");
	}
	if (typeof row.furniture !== "string") {
		throw new Error("BuildingRow furniture must be a string.");
	}
}
