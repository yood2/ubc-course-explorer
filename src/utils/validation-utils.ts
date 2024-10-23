import { InsightError, InsightDatasetKind } from "../controller/IInsightFacade";

/**
 * Check InsightDatasetKind of dataset
 *
 * @param kind - DatasetKind
 */
export function checkKind(kind: InsightDatasetKind): void {
	if (kind === "rooms") {
		throw new InsightError("Incorrect InsightDatasetKind");
	}
}

/**
 * Checks id string to see if valid
 *
 * @param id - id for a dataset
 * @returns - boolean value true if valid, else throws Error
 */
export function checkId(id: string): boolean {
	if (id.length === 0) {
		throw new Error("Empty id");
	}
	if (id.includes("_")) {
		throw new Error("Underscore in id");
	}
	if (/^\s*$/.test(id)) {
		throw new Error("Only whitespace in id");
	}
	return true;
}

/**
 * Checks content to see if it is base64
 *
 * @param content - content of the zip file
 * @returns - true if content is in base64, else throw error
 */
export function checkBase64(content: string): boolean {
	if (content === "" || content.trim() === "") {
		throw new Error("Content not base64");
	}
	return /^[A-Za-z0-9+/]*={0,2}$/.test(content) && btoa(atob(content)) === content;
}
