import { InsightError } from "./IInsightFacade";
import { Query, Section, Where } from "./InsightFacade";

const mfields: string[] = ["avg", "pass", "fail", "audit", "year"];
const sfields: string[] = ["dept", "id", "instructor", "title", "uuid"];

export function parseOptions(options: any): Record<string, any> {
	const columns = options.COLUMNS as string[];
	let order = "";

	if ("ORDER" in options) {
		order = options.ORDER as string;
		if (!columns.includes(order)) {
			throw new InsightError("ORDER must be in columns!");
		}
		order = order.split("_")[1];
	}

	return {
		order: order,
		columns: columns,
		datasetID: columns[0].split("_")[0],
	};
}

/**
 * Checks if columns is valid
 *
 * @param columns refers to columns field in given query
 * @throws Error if columns is not valid
 */
function validateColumns(input: any): void {
	if (!Object.hasOwn(input.OPTIONS, "COLUMNS")) {
		throw new InsightError("OPTIONS is missing required field 'COLUMNS'.");
	}

	const columns = input.OPTIONS.COLUMNS;

	if (!Array.isArray(columns) || columns.some((col) => typeof col !== "string") || columns.length === 0) {
		throw new InsightError("COLUMNS must be an array of strings and not empty.");
	}

	// make sure datasetID exists
	const datasetID: string = columns[0].split("_")[0];
	if (datasetID === "") {
		throw new InsightError("Dataset ID must exist in columns");
	}

	// check if COLUMNS only contains valid keys
	columns.forEach((col) => {
		const colParts = col.split("_");
		const two = 2;

		// make sure order has exactly one underscore
		if (colParts.length !== two) {
			throw new InsightError("Dataset ID can only have one underscore");
		}

		const curDatasetID: string = colParts[0];

		if (datasetID !== curDatasetID) {
			throw new InsightError("Query can only reference one dataset");
		}

		const key: string = colParts[1];
		if (!mfields.includes(key) && !sfields.includes(key)) {
			throw new InsightError("COLUMNS must only contain valid mfield or sfield keys");
		}
	});
}

/**
 * Checks if where is valid
 *
 * @param where refers to where field in given query
 * @throws Error if where is not valid
 */
function validateWhere(input: Query): void {
	if (
		!Object.hasOwn(input, "WHERE") ||
		typeof input.WHERE !== "object" ||
		Array.isArray(input.WHERE) ||
		input.WHERE === null
	) {
		throw new InsightError("'WHERE' is invalid or missing.");
	}

	// validate where has at most one outer filter
	if (Object.keys(input.WHERE).length > 1) {
		throw new InsightError("Where has more than one filter!");
	}
}

/**
 * Checks if options is valid
 *
 * @param options refers to options field in given query
 * @throws Error if options is not valid
 */
function validateOptions(input: Query): void {
	const two = 2;

	if (!Object.hasOwn(input, "OPTIONS")) {
		throw new InsightError("query is missing required field 'OPTIONS'.");
	}

	if ("ORDER" in input.OPTIONS) {
		if (Object.keys(input.OPTIONS).length !== two) {
			throw new InsightError("'OPTIONS' contains too many objects");
		}
	} else if (Object.keys(input.OPTIONS).length !== 1) {
		throw new InsightError("'OPTIONS' contains too many objects");
	}
}

/**
 * Checks if query is valid
 *
 * @param query refers to given query
 * @throws Error if query is not valid
 */
export function validateQuery(query: any): asserts query is Query {
	// check if query exists:
	const two = 2;

	if (query === null || typeof query !== "object") {
		throw new InsightError("Query has to be an object!");
	}

	if (Object.keys(query).length !== two) {
		throw new InsightError("Query should only contain WHERE and OPTIONS!");
	}

	const input = query as Query;
	validateWhere(input);
	validateOptions(input);
	validateColumns(input);

	const columns = input.OPTIONS.COLUMNS;
	const datasetID: string = columns[0].split("_")[0];

	// Check if ORDER exists, and if it does, check if it is a string
	if ("ORDER" in input.OPTIONS) {
		// check if order is a string
		if (typeof input.OPTIONS.ORDER !== "string") {
			throw new InsightError("ORDER must be a string.");
		}

		const orderParts = input.OPTIONS.ORDER.split("_");

		// make sure order has exactly one underscore
		if (orderParts.length !== two) {
			throw new InsightError("Dataset ID can only have one underscore");
		}
		const order: string = orderParts[1];

		// check if order references a different dataset
		if (datasetID !== orderParts[0]) {
			throw new InsightError("ORDER referenced a different dataset!");
		}

		// check if order is a valid field
		if (!mfields.includes(order) && !sfields.includes(order)) {
			throw new InsightError("ORDER must be a valid field.");
		}
	}
}

// gets key for the Comparisons
// throws error if key is invalid
function getKey(baseKey: string, datasetID: string): string {
	const keyParts = baseKey.split("_");
	const two = 2;

	// make sure order has exactly one underscore
	if (keyParts.length !== two) {
		throw new InsightError("invalid key in comparison, contains more than one underscore");
	}

	// check if key references a different dataset
	if (datasetID !== keyParts[0]) {
		throw new InsightError("key referenced a different dataset!");
	}

	return keyParts[1];
}

function MComparison(where: Where, section: Section, datasetID: string): boolean {
	const filterKey = Object.keys(where)[0];
	const filter = where[filterKey];

	const key = getKey(Object.keys(filter)[0], datasetID);
	if (!mfields.includes(key)) {
		throw new InsightError("MComparison contains an invalid sfield");
	}

	const sectionValue = section[key as keyof Section];
	const filterValue = filter[Object.keys(filter)[0]];

	if (typeof sectionValue !== "number") {
		throw new InsightError(`${filterKey} must be a number!`);
	}

	if (typeof filterValue !== "number") {
		throw new InsightError(`${filterKey} must be a number!`);
	}

	switch (filterKey) {
		case "LT":
			return sectionValue < filterValue;

		case "GT":
			return sectionValue > filterValue;

		case "EQ":
			return sectionValue === filterValue;

		default:
			throw new InsightError("Where contains an invalid base comparison");
	}
}

function wildCardComparison(filterValue: string, sectionValue: string): boolean {
	const wildcards = filterValue.split("*");
	const two = 2;

	const beginning = wildcards[0];
	const end = wildcards.at(-1);

	// > 2 asterixes
	if (wildcards.length - 1 > two) {
		throw new InsightError("Can only have at most 2 asterixes");
	}

	// 1 asterix
	if (wildcards.length - 1 === 1) {
		if (filterValue.length === 1) {
			// any string works
			return true;
		}

		if (beginning === "") {
			// any string before value works
			const regex = new RegExp(`${wildcards[1]}$`);
			return regex.test(sectionValue);
		}

		if (end === "") {
			// any string after value works
			const regex = new RegExp(`^${wildcards[0]}`);

			return regex.test(sectionValue);
		}

		throw new InsightError("The filter can only have an asterix at the start or end of the string");
	}

	// 2 asterixes
	if (beginning !== "" || end !== "") {
		throw new InsightError("The filter can only have an asterix at the start or end of the string");
	}

	// any string containing value works
	const regex = new RegExp(`.*${wildcards[1]}`);

	return regex.test(sectionValue);
}

function SComparison(where: Where, section: Section, datasetID: string): boolean {
	const filterKey = Object.keys(where)[0];
	const filter = where[filterKey];

	const key = getKey(Object.keys(filter)[0], datasetID);
	if (!sfields.includes(key)) {
		throw new InsightError("SComparison contains an invalid sfield");
	}

	const filterValue = filter[Object.keys(filter)[0]];
	const sectionValue = section[key as keyof Section];

	if (typeof filterValue !== "string") {
		throw new InsightError(`${filterKey} must be a string!`);
	}

	if (!filterValue.includes("*")) {
		return filterValue === sectionValue;
	}

	if (typeof sectionValue === "string" && typeof filterValue === "string") {
		return wildCardComparison(filterValue, sectionValue);
	}
	throw new InsightError("section value has to be a string!");
}

/*
	- Helper function for matchQuery
	- Run this when where contains an object and not an array
*/
function matchSingleObject(where: Where, section: Section, datasetID: string): boolean {
	const filterKey = Object.keys(where)[0];
	const filter = where[filterKey];

	if (Object.keys(filter).length !== 1) {
		throw new InsightError("filter can only have one outer filter");
	}

	// If Negation, call matchQuery
	if (filterKey === "NOT") {
		return !matchQuery(filter, section, datasetID);
	}

	// check if filter is SComparison
	if (filterKey === "IS") {
		return SComparison(where, section, datasetID);
	}

	// must be mcomparison, if not, will throw an error
	return MComparison(where, section, datasetID);
}

export function matchQuery(where: Where, section: Section, datasetID: string): boolean {
	const filterKey = Object.keys(where)[0];
	const filter = where[filterKey];

	// Base Case: Check if where is a M or S Comparison
	// If M or S Comparison, compare and return boolean
	// if negation, call matchQuery on filter
	if (!Array.isArray(filter)) {
		return matchSingleObject(where, section, datasetID);
	}

	// Check if 'where' is an And
	if (filterKey === "AND") {
		if (filter.length === 0) {
			throw new InsightError("And has to have a filter!");
		}
		for (const subFilter of filter) {
			if (!matchQuery(subFilter, section, datasetID)) {
				return false;
			}
		}
		return true;
	}

	// Check if where is an Or
	if (filterKey === "OR") {
		if (filter.length === 0) {
			throw new InsightError("OR has to have a filter!");
		}
		for (const subFilter of filter) {
			if (matchQuery(subFilter, section, datasetID)) {
				return true;
			}
		}
		return false;
	}

	// Doesn't belong to any valid filter, return insightError
	throw new InsightError("where does not contain any valid filters");
}
