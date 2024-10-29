import { InsightError } from "../controller/IInsightFacade";
import { Query } from "../controller/InsightFacade.types";

// gets key for the Comparisons
// throws error if key is invalid
export function getKey(baseKey: string, datasetID: string): string {
	const keyParts = baseKey.split("_");
	const two = 2;

	// make sure key has exactly one underscore
	if (keyParts.length !== two) {
		throw new InsightError("invalid key in comparison, contains more than one underscore");
	}

	// check if key references a different dataset
	if (datasetID !== keyParts[0]) {
		throw new InsightError("key referenced a different dataset!");
	}

	return keyParts[1];
}

// validates query functions
export class ValidateQuery {
	private mfields: string[] = [];
	private sfields: string[] = [];
	private datasetID = "";
	public transformationKeys: string[] = [];

	public initializeMembers(mfields: string[], sfields: string[], datasetID: string): void {
		this.mfields = mfields;
		this.sfields = sfields;
		this.datasetID = datasetID;
	}

	/**
	 * Checks if query is valid
	 *
	 * @param query refers to given query
	 * @throws Error if query is not valid
	 */
	public validateQueryStructure(query: any): void {
		// check if query exists:
		if (query === null || typeof query !== "object") {
			throw new InsightError("Query has to be an object!");
		}

		const input = query as Query;
		// validate size of query
		this.validateQuerySize(input);
		this.validateTransformationStructure(input);
		this.validateWhereStructure(input);
		this.validateOptionStructure(input);
		this.validateColumnStructure(input);
	}

	public validateQueryKeys(input: any): void {
		this.validateTransformationKeys(input);
		this.validateColumnKeys(input.OPTIONS.COLUMNS);
		this.validateSortKeys(input);
	}

	private validateQuerySize(input: Query): void {
		const two = 2;
		const three = 3;

		if (Object.hasOwn(input, "TRANSFORMATIONS")) {
			if (Object.keys(input).length > three) {
				throw new InsightError("Query should only contain WHERE, OPTIONS, and TRANSFORMATIONS!");
			}
		} else {
			if (Object.keys(input).length !== two) {
				throw new InsightError("Query should only contain WHERE, OPTIONS, and TRANSFORMATIONS!");
			}
		}
	}

	/**
	 * Checks if columns is valid
	 *
	 * @param columns refers to columns field in given query
	 * @throws Error if columns is not valid
	 */
	private validateColumnStructure(input: any): void {
		if (!Object.hasOwn(input.OPTIONS, "COLUMNS")) {
			throw new InsightError("OPTIONS is missing required field 'COLUMNS'.");
		}

		const columns = input.OPTIONS.COLUMNS;

		if (!Array.isArray(columns) || columns.some((col) => typeof col !== "string") || columns.length === 0) {
			throw new InsightError("COLUMNS must be an array of strings and not empty.");
		}
	}

	/**
	 * Checks if where is valid
	 *
	 * @param where refers to where field in given query
	 * @throws Error if where is not valid
	 */
	private validateWhereStructure(input: Query): void {
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
	private validateOptionStructure(input: Query): void {
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
	 * Checks if transformations is valid
	 *
	 * @param transformations refers to transformations field in given query
	 * @throws Error if transforamtions is not valid
	 */
	private validateTransformationStructure(input: any): void {
		if (!Object.hasOwn(input, "TRANSFORMATIONS")) {
			return;
		}

		const transformations = input.TRANSFORMATIONS;

		if (!Object.hasOwn(transformations, "GROUP") || !Object.hasOwn(transformations, "APPLY")) {
			throw new InsightError("TRANSFORMATIONS must have 'GROUP' and 'APPLY' fields.");
		}

		// Validate GROUP
		const group = transformations.GROUP;
		if (!Array.isArray(group) || group.some((key) => typeof key !== "string") || group.length === 0) {
			throw new InsightError("GROUP must be a non-empty array of strings.");
		}

		// Validate APPLY
		const apply = transformations.APPLY;
		if (!Array.isArray(apply)) {
			throw new InsightError("APPLY must be an array.");
		}

		apply.forEach((applyRule) => {
			if (typeof applyRule !== "object" || Object.keys(applyRule).length !== 1) {
				throw new InsightError("Each APPLY rule must be a single object with one applykey.");
			}

			const applyKey = Object.keys(applyRule)[0];
			const ruleDefinition = applyRule[applyKey];

			if (typeof ruleDefinition !== "object" || Object.keys(ruleDefinition).length !== 1) {
				throw new InsightError("Each applykey must map to an object with one APPLYTOKEN and KEY.");
			}

			const token = Object.keys(ruleDefinition)[0];
			if (!["MAX", "MIN", "AVG", "COUNT", "SUM"].includes(token)) {
				throw new InsightError("Invalid APPLYTOKEN. Must be one of 'MAX', 'MIN', 'AVG', 'COUNT', or 'SUM'.");
			}

			const key = ruleDefinition[token];
			if (typeof key !== "string") {
				throw new InsightError("KEY in APPLY rule must be a string.");
			}
		});
	}

	private validateApplyKeys(apply: any[]): void {
		const two = 2;
		apply.forEach((applyRule) => {
			const applyKey = Object.keys(applyRule)[0];
			if (applyKey in this.transformationKeys) {
				throw new InsightError("Apply key must be unique!");
			}
			this.transformationKeys.push(applyKey);

			// validate apply key
			if (applyKey.includes("_")) {
				throw new InsightError("Apply key cannot contain any underscores!");
			}

			const ruleDefinition = applyRule[applyKey];
			const key = ruleDefinition[Object.keys(ruleDefinition)[0]];

			const keyParts = key.split("_");
			if (keyParts.length !== two) {
				throw new InsightError("APPLY keys must be in the format 'datasetID_field'.");
			}

			const [curDatasetID, fieldKey] = keyParts;
			if (this.datasetID !== curDatasetID) {
				throw new InsightError("APPLY keys references another dataset");
			}

			const token = Object.keys(ruleDefinition)[0];
			if (["MAX", "MIN", "AVG", "SUM"].includes(token)) {
				if (!this.mfields.includes(fieldKey)) {
					throw new InsightError(`APPLY keys must be a valid mfield for ${token}.`);
				}
			} else {
				if (!this.mfields.includes(fieldKey) && !this.sfields.includes(fieldKey)) {
					throw new InsightError(`APPLY keys must be valid mfield or sfield for ${token}.`);
				}
			}
		});
	}

	private validateGroupKeys(group: string[]): void {
		const two = 2;
		group.forEach((key) => {
			this.transformationKeys.push(key);
			const keyParts = key.split("_");

			if (keyParts.length !== two) {
				throw new InsightError("GROUP keys must be in the format 'datasetID_field'.");
			}

			const [curDatasetID, fieldKey] = keyParts;
			if (this.datasetID !== curDatasetID) {
				throw new InsightError("GROUP can only reference one dataset.");
			}

			if (!this.mfields.includes(fieldKey) && !this.sfields.includes(fieldKey)) {
				throw new InsightError("GROUP keys must be valid mfield or sfield keys.");
			}
		});
	}

	private validateTransformationKeys(input: any): void {
		if (!Object.hasOwn(input, "TRANSFORMATIONS")) {
			return;
		}
		const group: string[] = input.TRANSFORMATIONS.GROUP;
		const apply: any[] = input.TRANSFORMATIONS.APPLY;

		// Validate GROUP keys
		this.validateGroupKeys(group);

		// Validate APPLY keys
		this.validateApplyKeys(apply);
	}

	private validateSortKey(order: string, columns: string[]): void {
		const two = 2;

		if (!columns.includes(order)) {
			throw new InsightError("ORDER must be in columns!");
		}

		const orderParts = order.split("_");

		if (this.transformationKeys.length === 0) {
			// make sure order has exactly one underscore
			if (orderParts.length !== two) {
				throw new InsightError("Dataset ID can only have one underscore");
			}
			const orderKey: string = orderParts[1];

			// check if order references a different dataset
			if (this.datasetID !== orderParts[0]) {
				throw new InsightError("ORDER referenced a different dataset!");
			}

			// check if order is a valid field
			if (!this.mfields.includes(orderKey) && !this.sfields.includes(orderKey)) {
				throw new InsightError("ORDER must be a valid field.");
			}
		} else {
			// order has to be part of group/apply
			if (!this.transformationKeys.includes(order)) {
				throw new InsightError("ORDER must only contain keys from group and apply");
			}
		}
	}

	private validateSortKeys(input: any): void {
		// Check if ORDER exists, and if it does, check if it is a string
		if ("ORDER" in input.OPTIONS) {
			const columns = input.OPTIONS.COLUMNS as string[];
			const orderOption = input.OPTIONS.ORDER;

			// check if orderOption is a string or SORT object
			if (typeof orderOption === "string") {
				this.validateSortKey(orderOption, columns);
			} else if (typeof orderOption === "object" && "dir" in orderOption && "keys" in orderOption) {
				const { dir, keys } = orderOption;

				if (dir !== "UP" && dir !== "DOWN") {
					throw new InsightError("Invalid direction in ORDER!");
				}

				keys.forEach((key: string) => {
					this.validateSortKey(key, columns);
				});
			} else {
				throw new InsightError("ORDER must be a string or valid SORT object.");
			}
		}
	}

	private validateColumnKeys(columns: string[]): void {
		// make sure datasetID exists
		const datasetID: string = columns[0].split("_")[0];
		if (datasetID === "") {
			throw new InsightError("Dataset ID must exist in columns");
		}

		// check if COLUMNS only contains valid keys
		columns.forEach((col) => {
			const colParts = col.split("_");
			const two = 2;
			if (this.transformationKeys.length === 0) {
				// make sure dataset id has exactly one underscore
				if (colParts.length !== two) {
					throw new InsightError("Dataset ID can only have one underscore");
				}

				const curDatasetID: string = colParts[0];

				if (datasetID !== curDatasetID) {
					throw new InsightError("Query can only reference one dataset");
				}

				const key: string = colParts[1];

				// columns has to be part of m/sfield for room/section
				if (!this.mfields.includes(key) && !this.sfields.includes(key)) {
					throw new InsightError("COLUMNS must only contain valid mfield or sfield keys");
				}
			} else {
				// columns has to be part of group/apply
				if (!this.transformationKeys.includes(col)) {
					throw new InsightError("COLUMNS must only contain keys from group and apply");
				}
			}
		});
	}
}
