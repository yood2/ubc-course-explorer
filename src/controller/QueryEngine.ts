import { InsightError } from "./IInsightFacade";
import { Query, Row, Where } from "./InsightFacade.types";
import { getKey, ValidateQuery } from "../utils/query-utils";

export const sectionFields = {
	mfields: ["avg", "pass", "fail", "audit", "year"],
	sfields: ["dept", "id", "instructor", "title", "uuid"],
};

export const roomsFields = {
	mfields: ["lat", "lon", "seats"],
	sfields: ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"],
};

export function parseTransformations(query: Query): any {
	if (!Object.hasOwn(query, "TRANSFORMATIONS")) {
		return {};
	}
	return query.TRANSFORMATIONS;
}

export function parseOptions(options: any): Record<string, any> {
	const columns = options.COLUMNS as string[];
	let order: string | { dir: string; keys: string[] } = "";

	if ("ORDER" in options) {
		order = options.ORDER;
	}

	return {
		order: order,
		columns: columns,
		datasetID: columns[0].split("_")[0],
	};
}

export class QueryEngine {
	private mfields: string[] = [];
	private sfields: string[] = [];
	private datasetID = "";
	private ValidateQuery = new ValidateQuery();

	/**
	 * Constructor for validateQuery
	 *
	 * @param query refers to given query
	 * @throws Error if query is not valid
	 */
	constructor(query: any) {
		this.ValidateQuery.validateQueryStructure(query);
		this.initializeMembers(query);
		this.ValidateQuery.initializeMembers(this.mfields, this.sfields, this.datasetID);
		this.ValidateQuery.validateQueryKeys(query);
	}

	/**
	 * Initializes class members for ValidateQuery
	 *
	 * @param input refers to given query
	 * @throws Error if query is not valid
	 */
	private initializeMembers(input: any): void {
		// take the first key of columns to initialize members
		const columns = input.OPTIONS.COLUMNS;
		const colParts = columns[0].split("_");

		// get datasetID
		this.datasetID = colParts[0];

		// set m and s fields according to dataset type
		const key: string = colParts[1];
		if (sectionFields.mfields.includes(key) || sectionFields.sfields.includes(key)) {
			this.mfields = sectionFields.mfields;
			this.sfields = sectionFields.sfields;
		} else if (roomsFields.mfields.includes(key) || roomsFields.sfields.includes(key)) {
			this.mfields = roomsFields.mfields;
			this.sfields = roomsFields.sfields;
		} else {
			throw new InsightError("Columns must contain valid fields.");
		}
	}

	private MComparison(where: Where, row: Row, datasetID: string): boolean {
		const filterKey = Object.keys(where)[0];
		const filter = where[filterKey];

		const key = getKey(Object.keys(filter)[0], datasetID);
		if (!this.mfields.includes(key)) {
			throw new InsightError("MComparison contains an invalid sfield");
		}

		const sectionValue = row[key as keyof Row];
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

	private wildCardComparison(filterValue: string, sectionValue: string): boolean {
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

	private SComparison(where: Where, row: Row, datasetID: string): boolean {
		const filterKey = Object.keys(where)[0];
		const filter = where[filterKey];

		const key = getKey(Object.keys(filter)[0], datasetID);
		if (!this.sfields.includes(key)) {
			throw new InsightError("SComparison contains an invalid sfield");
		}

		const filterValue = filter[Object.keys(filter)[0]];
		const sectionValue = row[key as keyof Row];

		if (typeof filterValue !== "string") {
			throw new InsightError(`${filterKey} must be a string!`);
		}

		if (!filterValue.includes("*")) {
			return filterValue === sectionValue;
		}

		if (typeof sectionValue === "string" && typeof filterValue === "string") {
			return this.wildCardComparison(filterValue, sectionValue);
		}
		throw new InsightError("section value has to be a string!");
	}

	/*
	- Helper function for matchQuery
	- Run this when where contains an object and not an array
*/
	private matchSingleObject(where: Where, row: Row): boolean {
		const filterKey = Object.keys(where)[0];
		const filter = where[filterKey];
		const datasetID = this.datasetID;

		if (Object.keys(filter).length !== 1) {
			throw new InsightError("filter can only have one outer filter");
		}

		// If Negation, call matchQuery
		if (filterKey === "NOT") {
			return !this.matchQuery(filter, row);
		}

		// check if filter is SComparison
		if (filterKey === "IS") {
			return this.SComparison(where, row, datasetID);
		}

		// must be mcomparison, if not, will throw an error
		return this.MComparison(where, row, datasetID);
	}

	public matchQuery(where: Where, row: Row): boolean {
		const filterKey = Object.keys(where)[0];
		const filter = where[filterKey];

		// Base Case: Check if where is a M or S Comparison
		// If M or S Comparison, compare and return boolean
		// if negation, call matchQuery on filter
		if (!Array.isArray(filter)) {
			return this.matchSingleObject(where, row);
		}

		// Check if 'where' is an And
		if (filterKey === "AND") {
			if (filter.length === 0) {
				throw new InsightError("And has to have a filter!");
			}
			for (const subFilter of filter) {
				if (!this.matchQuery(subFilter, row)) {
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
				if (this.matchQuery(subFilter, row)) {
					return true;
				}
			}
			return false;
		}

		// Doesn't belong to any valid filter, return insightError
		throw new InsightError("where does not contain any valid filters");
	}
}
