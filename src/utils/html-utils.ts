import { parse } from "parse5";
import { BuildingRow, IndexRow } from "../controller/InsightFacade.types";

// export interface Room {
// 	fullname: string; >
// 	shortname: string;
// 	number: string;
// 	name: string;
// 	address: string;
// 	lat: number;
// 	lon: number;
// 	seats: number;
// 	type: string;
// 	furniture: string;
// 	href: string;
// }

export async function readIndex(index: any): Promise<IndexRow[]> {
	const file = await index.async("string");
	const document = parse(file);

	const table = findByTag(document, "table")[0];
	const tbody = findByTag(table, "tbody")[0];
	const trows = findByTag(tbody, "tr");

	const indexRows: IndexRow[] = [];

	for (const row of trows) {
		const td = findByClass(row, "views-field views-field-title")[0];
		const aTag = findByTag(td, "a")[0];

		const room: IndexRow = {
			fullname: getText(aTag),
			shortname: getText(findByClass(row, "views-field views-field-field-building-code")[0]),
			address: getText(findByClass(row, "views-field views-field-field-building-address")[0]),
			href: aTag.attrs[0].value,
		};

		indexRows.push(room);
	}

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
			capacity: getText(findByClass(row, "views-field views-field-field-room-capacity")[0]),
			furniture: getText(findByClass(row, "views-field views-field-field-room-furniture")[0]),
			type: getText(findByClass(row, "views-field views-field-field-room-type")[0]),
		};

		buildingRows.push(room);
	}

	return buildingRows;
}

function findByTag(node: any, tag: string): any[] {
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
}
