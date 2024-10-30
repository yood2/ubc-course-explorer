import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import { clearDisk, getContentFromArchives, loadTestQuery } from "../TestUtil";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

export interface ITestQuery {
	title?: string;
	input: unknown;
	errorExpected: boolean;
	expected: any;
}

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	describe("addDataset - General", function () {
		let smallSections: string;
		let smallRooms: string;

		before(async function () {
			smallSections = await getContentFromArchives("sections/one_section.zip");
			smallRooms = await getContentFromArchives("rooms/one_building.zip");
		});

		beforeEach(async function () {
			await clearDisk();
			facade = new InsightFacade();
		});

		after(async function () {
			await clearDisk();
		});

		/**
		 * ACCEPTANCE TESTS
		 * - accept empty required fields
		 * - accept valid dataset
		 * - accept dataset with forbidden chars
		 * - accept dataset with single forbidden char
		 * - accept multiple valid datasets
		 * - accept same dataset after removed
		 */

		it("should accept dataset add with required fields with empty values", async function () {
			try {
				const emptyValues = await getContentFromArchives("sections/required_fields_empty_values.zip");
				const result = await facade.addDataset("sections", emptyValues, InsightDatasetKind.Sections);
				expect(result).to.include("sections");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("should successfuly add a dataset with a forbidden character", async function () {
			try {
				const result: string[] = await facade.addDataset("sections<?", smallSections, InsightDatasetKind.Sections);
				expect(result).to.include("sections<?");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("should successfuly add a dataset with a single forbidden character", async function () {
			try {
				const result: string[] = await facade.addDataset("?", smallSections, InsightDatasetKind.Sections);
				expect(result).to.include("?");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("should successfully add multiple datasets", async function () {
			try {
				const result1: string[] = await facade.addDataset("sections", smallSections, InsightDatasetKind.Sections);
				const result2: string[] = await facade.addDataset("rooms", smallRooms, InsightDatasetKind.Rooms);

				expect(result1).to.deep.equal(["sections"]);
				expect(result2).to.deep.equal(["sections", "rooms"]);
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("should successfully add the same dataset after it is removed", async function () {
			try {
				// first add
				let result: string[] = await facade.addDataset("sections", smallSections, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["sections"]);

				// second add
				result = await facade.addDataset("rooms", smallRooms, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["sections", "rooms"]);

				// remove and add again
				await facade.removeDataset("sections");
				result = await facade.addDataset("sections", smallSections, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["rooms", "sections"]);
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		/**
		 * REJECTION TESTS
		 * - reject empty dataset id
		 * - reject id with only whitespace
		 * - reject id with only underscore
		 * - reject id containing underscores
		 * - reject id containing single underscore
		 * - reject id containing underscore at end
		 * - reject id containing underscore at beginning
		 * - reject invalid id after valid add
		 * - reject content not base64
		 * - reject same dataset added twice
		 * - reject dataset with same id
		 * - reject adding existing dataset id after removal
		 * - reject invalid dataset id after removal
		 * - reject same dataset between adds
		 */
		it("should reject dataset add with empty dataset id", async function () {
			try {
				await facade.addDataset("", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}

			try {
				await facade.addDataset("", smallRooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with id containing only whitespace", async function () {
			try {
				await facade.addDataset("    ", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}

			try {
				await facade.addDataset("    ", smallRooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with an id containing only an underscore", async function () {
			try {
				await facade.addDataset("_", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}

			try {
				await facade.addDataset("_", smallRooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with an id containing underscores", async function () {
			try {
				await facade.addDataset("This_should_fail", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}

			try {
				await facade.addDataset("This_should_fail", smallRooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with an id containing single underscore", async function () {
			try {
				await facade.addDataset("ThisShould_Fail", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}

			try {
				await facade.addDataset("ThisShould_Fail", smallRooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with an id containing underscore at end", async function () {
			try {
				await facade.addDataset("ThisShouldFail_", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}

			try {
				await facade.addDataset("ThisShouldFail_", smallRooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with an id containing underscore at beginning", async function () {
			try {
				await facade.addDataset("_ThisShouldFail", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}

			try {
				await facade.addDataset("_ThisShouldFail", smallRooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with invalid id after a valid dataset add", async function () {
			try {
				await facade.addDataset("sections", smallSections, InsightDatasetKind.Sections);
				await facade.addDataset("rooms_", smallRooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}

			try {
				await facade.addDataset("rooms", smallRooms, InsightDatasetKind.Rooms);
				await facade.addDataset("sections_", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with content not structured as a base64 string", async function () {
			try {
				await facade.addDataset("sections", "This is not base64 string of a zip file", InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}

			try {
				await facade.addDataset("sections", "This is not base64 string of a zip file", InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Should reject same dataset added consecutively", async function () {
			try {
				const result: string[] = await facade.addDataset("sections", smallSections, InsightDatasetKind.Sections);
				expect(result).to.include("sections");
				await facade.addDataset("sections", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}

			try {
				const result: string[] = await facade.addDataset("rooms", smallRooms, InsightDatasetKind.Rooms);
				expect(result).to.include("rooms");
				await facade.addDataset("rooms", smallRooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Should reject dataset with same id", async function () {
			try {
				const result: string[] = await facade.addDataset("sections", smallSections, InsightDatasetKind.Sections);
				expect(result).to.include("sections");
				await facade.addDataset("sections", smallRooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject adding existing dataset id after remove", async function () {
			try {
				await facade.addDataset("sections", smallSections, InsightDatasetKind.Sections);
				await facade.addDataset("rooms", smallRooms, InsightDatasetKind.Rooms);
				await facade.removeDataset("sections");
				await facade.addDataset("rooms", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject invalid dataset id added after remove", async function () {
			try {
				await facade.addDataset("sections", smallSections, InsightDatasetKind.Sections);
				await facade.addDataset("rooms", smallRooms, InsightDatasetKind.Rooms);
				await facade.removeDataset("sections");
				await facade.addDataset("sections_0", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject same dataset between datasets", async function () {
			try {
				// first dataset
				let result: string[] = await facade.addDataset("sections", smallSections, InsightDatasetKind.Sections);
				expect(result).to.include("sections");

				// second dataset
				result = await facade.addDataset("rooms", smallRooms, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["sections", "rooms"]);

				// duplicate dataset
				await facade.addDataset("sections", smallSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
	});

	describe("addDataset - Rooms", function () {
		let rooms: string;
		let smallRooms: string;

		before(async function () {
			rooms = await getContentFromArchives("rooms/campus.zip");
			smallRooms = await getContentFromArchives("rooms/small_campus.zip");
		});

		beforeEach(async function () {
			await clearDisk();
			facade = new InsightFacade();
		});

		after(async function () {
			// await clearDisk();
		});

		/**
		 * ACCEPTANCE TESTS
		 *
		 */
		it("Should accept small, valid rooms dataset", async function () {
			try {
				const result = await facade.addDataset("small", smallRooms, InsightDatasetKind.Rooms);
				expect(result).to.include("small");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should accept large, valid rooms dataset", async function () {
			try {
				const result = await facade.addDataset("campus", rooms, InsightDatasetKind.Rooms);
				expect(result).to.include("campus");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should add multiple rooms datasets", async function () {
			try {
				let result = await facade.addDataset("small", smallRooms, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["small"]);
				result = await facade.addDataset("campus", rooms, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["small", "campus"]);
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should add index.htm with multiple tables", async function () {
			try {
				const multiTable = await getContentFromArchives("rooms/index_multi_table.zip");
				const result = await facade.addDataset("indexMultiTable", multiTable, InsightDatasetKind.Rooms);
				expect(result).to.include("indexMultiTable");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should skip broken building links", async function () {
			try {
				const brokenLink = await getContentFromArchives("rooms/broken_link.zip");
				const result = await facade.addDataset("brokenLink", brokenLink, InsightDatasetKind.Rooms);
				expect(result).to.include("brokenLink");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should add building files with multiple tables", async function () {
			try {
				const multiTable = await getContentFromArchives("rooms/building_multi_table.zip");
				const result = await facade.addDataset("buildingMultiTable", multiTable, InsightDatasetKind.Rooms);
				expect(result).to.include("buildingMultiTable");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should skip building files with no tables", async function () {
			try {
				const buildingNoTable = await getContentFromArchives("rooms/building_no_table.zip");
				const result = await facade.addDataset("buildingNoTable", buildingNoTable, InsightDatasetKind.Rooms);
				expect(result).to.include("buildingNoTable");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should add room data with empty optional fields", async function () {
			try {
				const emptyValues = await getContentFromArchives("rooms/building_empty_values.zip");
				const result = await facade.addDataset("emptyValues", emptyValues, InsightDatasetKind.Rooms);
				expect(result).to.include("emptyValues");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should add valid building file with no room data", async function () {
			try {
				const noRoomData = await getContentFromArchives("rooms/building_no_room_data.zip");
				const result = await facade.addDataset("noRoomData", noRoomData, InsightDatasetKind.Rooms);
				expect(result).to.include("noRoomData");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should accept room table with missing capacity", async function () {
			try {
				const missingCapacity = await getContentFromArchives("rooms/table_missing_capacity.zip");
				const result = await facade.addDataset("missingCapacity", missingCapacity, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["missingCapacity"]);
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should accept room table with missing furniture", async function () {
			try {
				const missingFurniture = await getContentFromArchives("rooms/table_missing_furniture.zip");
				const result = await facade.addDataset("missingFurniture", missingFurniture, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["missingFurniture"]);
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should accept room table with missing type", async function () {
			try {
				const missingType = await getContentFromArchives("rooms/table_missing_type.zip");
				const result = await facade.addDataset("missingType", missingType, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["missingType"]);
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("Should accept dataset with one building invalid address", async function () {
			try {
				const geoOneInvalidAddress = await getContentFromArchives("rooms/geo_one_invalid_address.zip");
				const result = await facade.addDataset("geoOneInvalidAddress", geoOneInvalidAddress, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["geoOneInvalidAddress"]);
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it.only("Should accept dataset with one valid and two invalid geo responses", async function () {
			try {
				const geoOneInvalidAddress = await getContentFromArchives("rooms/geo_2_invalid_1_valid.zip");
				const result = await facade.addDataset("geoOneInvalidAddress", geoOneInvalidAddress, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["geoOneInvalidAddress"]);
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		// REJECT
		it("Should reject dataset with only invalid georesponses", async function () {
			try {
				const geoInvalidResponse = await getContentFromArchives("rooms/geo_invalid_response.zip");
				await facade.addDataset("geoInvalidResponse", geoInvalidResponse, InsightDatasetKind.Rooms);
				expect.fail(`Should have rejected`);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Should reject dataset with only invalid addresses", async function () {
			try {
				const geoAllInvalidAddress = await getContentFromArchives("rooms/geo_all_invalid_address.zip");
				await facade.addDataset("geoAllInvalidAddress", geoAllInvalidAddress, InsightDatasetKind.Rooms);
				expect.fail(`Should have rejected`);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Should reject rooms dataset with no index", async function () {
			try {
				const noIndex = await getContentFromArchives("rooms/no_index.zip");
				await facade.addDataset("noIndex", noIndex, InsightDatasetKind.Rooms);
				expect.fail(`Should have rejected`);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Should reject dataset where index not html", async function () {
			try {
				const indexNotHtml = await getContentFromArchives("rooms/index_not_html.zip");
				await facade.addDataset("indexNotHtml", indexNotHtml, InsightDatasetKind.Rooms);
				expect.fail(`Should have rejected`);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Should reject index.htm with no tables", async function () {
			try {
				const indexNoTable = await getContentFromArchives("rooms/index_no_table.zip");
				await facade.addDataset("indexNoTable", indexNoTable, InsightDatasetKind.Rooms);
				expect.fail(`Should have rejected`);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Should reject index.htm with no building files", async function () {
			try {
				const indexNoBuildings = await getContentFromArchives("rooms/index_no_buildings.zip");
				await facade.addDataset("indexNoBuildings", indexNoBuildings, InsightDatasetKind.Rooms);
				expect.fail(`Should have rejected`);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Should reject table with missing capacity tag", async function () {
			try {
				const tableNoCapacityTag = await getContentFromArchives("rooms/table_missing_capacity_tag.zip");
				await facade.addDataset("tableNoCapacityTag", tableNoCapacityTag, InsightDatasetKind.Rooms);
				expect.fail(`Should have rejected`);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Should reject table with missing furniture tag", async function () {
			try {
				const tableNoFurnitureTag = await getContentFromArchives("rooms/table_missing_furniture_tag.zip");
				await facade.addDataset("tableNoFurnitureTag", tableNoFurnitureTag, InsightDatasetKind.Rooms);
				expect.fail(`Should have rejected`);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Should reject table with missing number tag", async function () {
			try {
				const tableNoNumberTag = await getContentFromArchives("rooms/table_missing_number_tag.zip");
				await facade.addDataset("tableNoNumberTag", tableNoNumberTag, InsightDatasetKind.Rooms);
				expect.fail(`Should have rejected`);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Should reject table with missing type tag", async function () {
			try {
				const tableNoTypeTag = await getContentFromArchives("rooms/table_missing_type_tag.zip");
				await facade.addDataset("tableNoTypeTag", tableNoTypeTag, InsightDatasetKind.Rooms);
				expect.fail(`Should have rejected`);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// MIGHT BE WRONG
		// it("Should reject invalid folder structure but correct links", async function () {
		// 	try {
		// 		const invalidFolder1 = await getContentFromArchives("rooms/invalid_folder_correct_link.zip");
		// 		await facade.addDataset("invalidFolder1", invalidFolder1, InsightDatasetKind.Rooms);
		// 		expect.fail(`Should have rejected`);
		// 	} catch (err) {
		// 		expect(err).to.be.instanceOf(InsightError);
		// 	}
		// });

		// it("Should reject invalid folder structure and incorrect links", async function () {
		// 	try {
		// 		const invalidFolder2 = await getContentFromArchives("rooms/invalid_folder_incorrect_link.zip");
		// 		await facade.addDataset("invalidFolder2", invalidFolder2, InsightDatasetKind.Rooms);
		// 		expect.fail(`Should have rejected`);
		// 	} catch (err) {
		// 		expect(err).to.be.instanceOf(InsightError);
		// 	}
		// });
	});

	describe("addDataset - Sections", function () {
		let sections: string;

		before(async function () {
			sections = await getContentFromArchives("sections/three_courses.zip");
		});

		beforeEach(async function () {
			await clearDisk();
			facade = new InsightFacade();
		});

		after(async function () {
			await clearDisk();
		});

		/**
		 * ACCEPTANCE TESTS
		 */
		it("should accept a large valid dataset", async function () {
			try {
				const result: string[] = await facade.addDataset("section", sections, InsightDatasetKind.Sections);
				expect(result).to.include("section");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		/**
		 * REJECTION TESTS
		 */

		it("should reject a dataset add with invalid folder structure", async function () {
			try {
				const invalidStructure = await getContentFromArchives("sections/invalid_folder_structure.zip");
				await facade.addDataset("sections", invalidStructure, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add without any courses", async function () {
			try {
				const noCourses = await getContentFromArchives("sections/no_courses.zip");
				await facade.addDataset("sections", noCourses, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add without a courses folder", async function () {
			try {
				const noCourses = await getContentFromArchives("sections/no_courses_folder.zip");
				await facade.addDataset("sections", noCourses, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add where sections isn't stored under result", async function () {
			try {
				const Results = await getContentFromArchives("sections/not_stored_in_result.zip");
				await facade.addDataset("sections", Results, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add where the folder is coursing instead of courses", async function () {
			try {
				const Results = await getContentFromArchives("sections/coursing.zip");
				await facade.addDataset("sections", Results, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add where the course is not in the proper json format", async function () {
			try {
				const Results = await getContentFromArchives("sections/improper_json.zip");
				await facade.addDataset("sections", Results, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with course not containing a results object", async function () {
			try {
				const invalidCourse = await getContentFromArchives("sections/invalid_course.zip");
				await facade.addDataset("sections", invalidCourse, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with content not containing any sections", async function () {
			try {
				const noSections = await getContentFromArchives("sections/no_sections.zip");
				await facade.addDataset("sections", noSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with content not containing any valid sections", async function () {
			try {
				const noValidSections = await getContentFromArchives("sections/no_valid_sections.zip");
				await facade.addDataset("sections", noValidSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with empty courses folder", async function () {
			try {
				const noValidSections = await getContentFromArchives("sections/empty_courses_folder.zip");
				await facade.addDataset("sections", noValidSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
	});

	// ================= removing dataset tests ==========================
	describe("removeDataset", function () {
		let sections: string;
		let section1: string;
		let section2: string;

		before(async function () {
			sections = await getContentFromArchives("sections/three_courses.zip");
			section1 = await getContentFromArchives("sections/one_course.zip");
			section2 = await getContentFromArchives("sections/two_courses.zip");
		});

		beforeEach(async function () {
			await clearDisk();
			facade = new InsightFacade();
		});

		after(async function () {
			await clearDisk();
		});

		it("should reject dataset remove with an empty dataset id", async function () {
			try {
				await facade.removeDataset("");
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset remove with an id containing only whitespace", async function () {
			try {
				await facade.removeDataset("    ");
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset remove with an id containing only an underscore", async function () {
			try {
				await facade.removeDataset("_");
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset remove with an id containing underscores", async function () {
			try {
				await facade.removeDataset("This_should_fail");
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject dataset remove if valid id hasn't been added yet", async function () {
			try {
				await facade.removeDataset("sections");
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		it("should reject dataset remove if valid id is removed twice", async function () {
			try {
				// first add the dataset
				const result: string[] = await facade.addDataset("section", sections, InsightDatasetKind.Sections);
				expect(result).to.include("section");

				// remove once
				const remove1: string = await facade.removeDataset("section");
				expect(remove1).to.equal("section");

				// remove twice
				await facade.removeDataset("section");
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		// successful removes
		it("should successfully add and remove a dataset", async function () {
			try {
				const result: string[] = await facade.addDataset("section", sections, InsightDatasetKind.Sections);
				expect(result).to.include("section");

				const remove1: string = await facade.removeDataset("section");
				expect(remove1).to.equal("section");
			} catch (e) {
				expect.fail(`Unexpected error: ${(e as Error).message}`);
			}
		});

		it("should successfully add and remove multiple datasets", async function () {
			try {
				const result1: string[] = await facade.addDataset("section0", sections, InsightDatasetKind.Sections);
				const result2: string[] = await facade.addDataset("section1", section1, InsightDatasetKind.Sections);
				const result3: string[] = await facade.addDataset("section2", section2, InsightDatasetKind.Sections);

				expect(result1).to.include("section0");

				expect(result2).to.include("section0");
				expect(result2).to.include("section1");

				expect(result3).to.include("section0");
				expect(result3).to.include("section1");
				expect(result3).to.include("section2");

				const remove1: string = await facade.removeDataset("section0");
				const remove2: string = await facade.removeDataset("section1");
				const remove3: string = await facade.removeDataset("section2");

				expect(remove1).to.equal("section0");

				expect(remove2).to.equal("section1");

				expect(remove3).to.equal("section2");
			} catch (_) {
				expect.fail("Should not throw an error");
			}
		});
	});

	// ================= list dataset tests ==========================
	describe("listDataset", function () {
		let section1: string;
		let section2: string;
		let section3: string;

		before(async function () {
			section1 = await getContentFromArchives("sections/one_course.zip");
			section2 = await getContentFromArchives("sections/two_courses.zip");
			section3 = await getContentFromArchives("sections/three_courses.zip");
		});

		beforeEach(async function () {
			await clearDisk();
			facade = new InsightFacade();
		});

		after(async function () {
			await clearDisk();
		});

		it("should successfully list one dataset", async function () {
			try {
				let listResults: InsightDataset[];

				listResults = await facade.listDatasets();
				expect(listResults.length).to.equal(0);

				const result: string[] = await facade.addDataset("section", section1, InsightDatasetKind.Sections);
				expect(result).to.include("section");

				listResults = await facade.listDatasets();

				const ds1 = {
					id: "section",
					kind: InsightDatasetKind.Sections,
				};

				expect(listResults.length).to.be.equal(1);

				const dResult: InsightDataset = listResults[0];

				expect(dResult.id).to.equal(ds1.id);
				expect(dResult.kind).to.equal(ds1.kind);

				const remove1: string = await facade.removeDataset("section");
				expect(remove1).to.equal("section");

				listResults = await facade.listDatasets();
				expect(listResults.length).to.be.equal(0);
				expect(listResults).to.not.deep.include(ds1);
			} catch (err) {
				expect.fail(`Unexpected error: ${(err as Error).message}`);
			}
		});

		it("should successfully list multiple datasets", async function () {
			try {
				let listResults: InsightDataset[];

				listResults = await facade.listDatasets();
				expect(listResults.length).to.equal(0);

				const result1: string[] = await facade.addDataset("section1", section1, InsightDatasetKind.Sections);

				listResults = await facade.listDatasets();
				expect(listResults.length).to.equal(1);

				expect(listResults[0].id).to.equal("section1");
				expect(listResults[0].kind).to.equal(InsightDatasetKind.Sections);

				const result2: string[] = await facade.addDataset("section2", section2, InsightDatasetKind.Sections);

				const testArr2 = ["1", "2"];

				listResults = await facade.listDatasets();
				expect(listResults.length).to.equal(testArr2.length);

				expect(listResults[0].id).to.equal("section1");
				expect(listResults[0].kind).to.equal(InsightDatasetKind.Sections);

				expect(listResults[1].id).to.equal("section2");
				expect(listResults[1].kind).to.equal(InsightDatasetKind.Sections);

				const result3: string[] = await facade.addDataset("section3", section3, InsightDatasetKind.Sections);

				const testArr3 = ["1", "2", "3"];

				listResults = await facade.listDatasets();
				expect(listResults.length).to.equal(testArr3.length);

				expect(listResults[0].id).to.equal("section1");
				expect(listResults[0].kind).to.equal(InsightDatasetKind.Sections);

				expect(listResults[1].id).to.equal("section2");
				expect(listResults[1].kind).to.equal(InsightDatasetKind.Sections);

				expect(listResults[testArr2.length].id).to.equal("section3");
				expect(listResults[testArr2.length].kind).to.equal(InsightDatasetKind.Sections);

				expect(result1).to.include("section1");

				expect(result2).to.include("section1");
				expect(result2).to.include("section2");

				expect(result3).to.include("section1");
				expect(result3).to.include("section2");
				expect(result3).to.include("section3");

				const remove2: string = await facade.removeDataset("section2");

				listResults = await facade.listDatasets();
				expect(listResults.length).to.equal(testArr2.length);

				expect(listResults[0].id).to.equal("section1");
				expect(listResults[0].kind).to.equal(InsightDatasetKind.Sections);

				expect(listResults[1].id).to.equal("section3");
				expect(listResults[1].kind).to.equal(InsightDatasetKind.Sections);

				const remove1: string = await facade.removeDataset("section1");

				listResults = await facade.listDatasets();
				expect(listResults.length).to.equal(1);

				expect(listResults[0].id).to.equal("section3");
				expect(listResults[0].kind).to.equal(InsightDatasetKind.Sections);

				const remove3: string = await facade.removeDataset("section3");

				listResults = await facade.listDatasets();
				expect(listResults.length).to.equal(0);

				expect(remove1).to.equal("section1");

				expect(remove2).to.equal("section2");

				expect(remove3).to.equal("section3");
			} catch (_) {
				expect.fail("Should not throw an error");
			}
		});
	});

	// ================= perform query tests ==========================
	describe("PerformQuery", function () {
		/**
		 * Loads the TestQuery specified in the test name and asserts the behaviour of performQuery.
		 *
		 * Note: the 'this' parameter is automatically set by Mocha and contains information about the test.
		 */
		let sections: string;

		before(async function () {
			// Add the datasets to InsightFacade once.
			// Will *fail* if there is a problem reading ANY dataset.
			sections = await getContentFromArchives("sections/pair.zip");
			const section1: string = await getContentFromArchives("sections/one_course.zip");
			const section2: string = await getContentFromArchives("sections/two_courses.zip");
			const section3: string = await getContentFromArchives("sections/one_section.zip");
			const rooms = await getContentFromArchives("rooms/campus.zip");
			facade = new InsightFacade();

			// const loadDatasetPromises: Promise<string[]>[] = [
			// 	facade.addDataset("sections", sections, InsightDatasetKind.Sections),
			// 	facade.addDataset("section1", section1, InsightDatasetKind.Sections),
			// 	facade.addDataset("section2", section2, InsightDatasetKind.Sections),
			// 	facade.addDataset("section3", section3, InsightDatasetKind.Sections),
			// ];

			// try {
			// 	await Promise.all(loadDatasetPromises);
			// } catch (err) {
			// 	throw new Error(`In PerformQuery Before hook, dataset(s) failed to be added. \n${err}`);
			// }

			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			await facade.addDataset("section1", section1, InsightDatasetKind.Sections);
			await facade.addDataset("section2", section2, InsightDatasetKind.Sections);
			await facade.addDataset("section3", section3, InsightDatasetKind.Sections);
			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
		});

		after(async function () {
			await clearDisk();
		});

		async function checkQuery(this: Mocha.Context): Promise<void> {
			if (!this.test) {
				throw new Error(
					"Invalid call to checkQuery." +
						"Usage: 'checkQuery' must be passed as the second parameter of Mocha's it(..) function." +
						"Do not invoke the function directly."
				);
			}
			// Destructuring assignment to reduce property accesses
			const { input, expected, errorExpected } = await loadTestQuery(this.test.title);

			try {
				const result: InsightResult[] = await facade.performQuery(input);

				let orderFlag = false;
				let keys: string[] = [];

				if (input !== null && typeof input === "object") {
					// only need OPTIONS in object as we're just checking if order exists in this block of code
					const hasOptions = input as { OPTIONS: { ORDER?: any } };

					// Check if the ORDER key exists in OPTIONS
					if (hasOptions.OPTIONS && "ORDER" in hasOptions.OPTIONS) {
						orderFlag = true; // Set flag to true if ORDER exists
						const orderOption = hasOptions.OPTIONS.ORDER;
						if (typeof orderOption === "string") {
							keys[0] = orderOption;
						} else {
							keys = orderOption.keys;
						}
					}
				}

				if (!errorExpected) {
					expect(result.length).to.equal(expected.length);
					if (orderFlag === true) {
						expect(result).to.deep.members(expected);
						for (let i = 0; i < result.length; i++) {
							for (const order of keys) {
								expect(result[i][order]).to.equal(expected[i][order]);
							}
						}
					} else {
						expect(result).to.deep.members(expected);
					}
				} else {
					expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
				}
			} catch (err) {
				if (!errorExpected) {
					expect.fail(`performQuery threw unexpected error: ${err}`);
				}

				if (expected === "InsightError") {
					expect(err).to.be.instanceOf(InsightError);
				} else if (expected === "ResultTooLargeError") {
					expect(err).to.be.instanceOf(ResultTooLargeError);
				} else {
					expect.fail(`Should be one of the provided error types`);
				}
			}
		}

		// ROOM TESTS
		//	- valid room tests
		it("[C2/rooms/valid/no_groupby.json] Simple rooms example without group by", checkQuery);
		it("[C2/rooms/valid/website_example.json] Simple rooms example with group by", checkQuery);
		it("[C2/rooms/valid/simple_example.json] example from specifications", checkQuery);

		//	- invalid room tests
		it("[C2/rooms/invalid/mixed_keys.json] Simple rooms example but contains keys from section", checkQuery);
		it("[C2/rooms/invalid/lowercase_key.json] Simple rooms example but apply key is lower case", checkQuery);

		// SORT TESTS
		// - valid sort tests
		it("[C2/sort/valid/sort_down.json] simple sort down", checkQuery);
		it("[C2/sort/valid/sort_up.json] simple sort up", checkQuery);

		// TRANSFORMATION TESTS
		//	- invalid transformation tests
		it("[C2/transformation/invalid/apply_underscore.json] max token takes in sfield", checkQuery);
		it("[C2/transformation/invalid/max_string.json] apply has underscore", checkQuery);
		it("[C2/transformation/invalid/columns_key.json] columns has key that isn't in transformations", checkQuery);

		it("[C2/transformation/invalid/different_dataset.json] apply references different dataset", checkQuery);
		it("[C2/transformation/invalid/duplicate_keys.json] apply contains duplicate keys", checkQuery);
		it("[C2/transformation/invalid/empty_key.json] apply key is empty", checkQuery);
		it("[C2/transformation/invalid/invalid_apply_field.json] invalid apply field", checkQuery);
		it("[C2/transformation/invalid/mixed_apply_keys.json] apply keys references wrong mfield", checkQuery);

		//	- all tokens applied
		it("[C2/transformation/valid/all_tokens/empty_query.json] empty query with all tokens", checkQuery);
		it("[C2/transformation/valid/all_tokens/one_row.json] query containing all tokens but only one row", checkQuery);
		it("[C2/transformation/valid/all_tokens/simple.json] simple query containing all tokens", checkQuery);
		it("[C2/transformation/valid/all_tokens/only_apply_keys.json] simple query containing only apply keys", checkQuery);

		//	- valid transformation tests
		it("[C2/transformation/valid/basic_transformations.json] basic transformations", checkQuery);
		it("[C2/transformation/valid/basic_group.json] basic groups", checkQuery);
		it("[C2/transformation/valid/multi_apply_tokens.json] transformation with multiple apply tokens", checkQuery);
		it("[C2/transformation/valid/count.json] transformations with count", checkQuery);
		it("[C2/transformation/valid/max.json] transformations with max", checkQuery);
		it("[C2/transformation/valid/min.json] transformations with min", checkQuery);
		it("[C2/transformation/valid/min2.json] transformations with min 2", checkQuery);
		it("[C2/transformation/valid/max2.json] transformations with max 2", checkQuery);
		it("[C2/transformation/valid/max_with_min.json] transformations with max and min", checkQuery);
		it("[C2/transformation/valid/empty_max.json] transformations with max and empty results", checkQuery);
		it("[C2/transformation/valid/count2.json] transformations with count 2", checkQuery);
		it("[C2/transformation/valid/empty_apply.json] transformations with empty apply", checkQuery);
		it("[C2/transformation/valid/group_multi_keys.json] group has multiple keys", checkQuery);
		it("[C2/transformation/valid/min_avg.json] transformations with min and avg", checkQuery);
		it("[C2/transformation/valid/sum_avg.json] transformations with sum and avg", checkQuery);

		it("[Daniel/empty_nested_filters.json] Nested filters have empty value", checkQuery);
		it("[Daniel/deeply_nested_filters.json] Query with deeply nested filters", checkQuery);
		it("[Daniel/empty_not_filter.json] NOT filter empty", checkQuery);
		it("[Daniel/empty_comparison.json] Comparison is empty", checkQuery);
		it("[Daniel/query_every_column.json] Query with all columns in options", checkQuery);
		it("[Daniel/field_with_duplicates.json] Query with many duplicate values", checkQuery);
		it("[Daniel/wildcard_with_no_match.json] Wildcard with no matches", checkQuery);
		it("[Daniel/case_in_field.json] Case sensitivity with fields", checkQuery);
		it("[Daniel/invalid_comparison_operator.json] Invalid comparison operator", checkQuery);
		it("[Daniel/and_or_same_level.json] And or same level", checkQuery);
		it("[Daniel/valid_nesting_not.json] valid nesting of not", checkQuery);
		it("[Daniel/invalid_numeric_comparison_value.json] invalid numeric comparison value", checkQuery);
		it("[Daniel/invalid_string_comparison_value.json] invalid string comparison value", checkQuery);
		it("[Daniel/empty_array_comparison.json] empty array in logical comparison", checkQuery);
		it("[Daniel/invalid_key_where.json] invalid key in WHERE", checkQuery);
		it("[Daniel/missing_id_query.json] missing id in query keyE", checkQuery);

		// valid queries
		it("[valid/match_all.json] Match all entries", checkQuery);
		it("[valid/simple.json] SELECT dept, avg WHERE avg > 97", checkQuery);
		it("[valid/complex_example.json] Query containing all the filters", checkQuery);
		it("[valid/simple_unordered.json] Same as simple but unordered", checkQuery);
		it("[valid/order_string.json] Same as simple but order by string (dept)", checkQuery);

		it("[valid/second_dataset.json] references second dataset", checkQuery);
		it("[valid/exactly_4999.json] Contains exactly 4999 results", checkQuery);
		it("[valid/exactly_5000.json] Contains exactly 5000 results", checkQuery);

		it("[valid/only_asterix.json] Wild card containing just one asterix", checkQuery);
		it("[valid/two_asterixes.json] Just 2 asterixes", checkQuery);

		// invalid queries
		it("[invalid/missing_columns.json] query missing COLUMNS", checkQuery);
		it("[invalid/missing_options.json] query missing OPTIONS", checkQuery);
		it("[invalid/missing_where.json] Query missing WHERE", checkQuery);
		it("[invalid/missing_keys.json] query missing keys in COLUMNS", checkQuery);
		it("[invalid/query_too_big.json] Contains over 5000 results", checkQuery);
		it("[invalid/exactly_5001.json] Contains exactly 5001 results", checkQuery);
		it("[invalid/multi_datasets.json] query references multiple datasets", checkQuery);
		it("[invalid/order_not_in_columns.json] order is not in columns", checkQuery);

		// invalid logic operators
		it("[invalid/logic_and.json] AND is used incorrectly", checkQuery);
		it("[invalid/logic_negation.json] NOT is used incorrectly", checkQuery);
		it("[invalid/logic_nothing_and.json] AND doesn't have any filters", checkQuery);
		it("[invalid/logic_nothing_or.json] OR doesn't have any filters", checkQuery);
		it("[invalid/logic_or.json] OR is used incorrectly", checkQuery);

		// invalid comparisons
		it("[invalid/comparison_eq.json] EQ is taking a wrong type", checkQuery);
		it("[invalid/comparison_gt.json] GT is taking a wrong type", checkQuery);
		it("[invalid/comparison_is.json] IS is taking a wrong type", checkQuery);
		it("[invalid/comparison_lt.json] LT is taking a wrong type", checkQuery);

		// invalid fields
		it("[invalid/field_wrong.json] COMPARISON using invalid field", checkQuery);
		it("[invalid/comparison_wrong.json] COMPARISON has typo", checkQuery);

		// invalid mfields
		it("[invalid/mfield_audit.json] audit taking wrong type", checkQuery);
		it("[invalid/mfield_avg.json] avg taking wrong type", checkQuery);
		it("[invalid/mfield_fail.json] fail taking wrong type", checkQuery);
		it("[invalid/mfield_pass.json] pass taking wrong type", checkQuery);
		it("[invalid/mfield_year.json] year taking wrong type", checkQuery);

		// invalid sfields
		it("[invalid/sfield_dept.json] dept taking wrong type", checkQuery);
		it("[invalid/sfield_id.json] id taking wrong type", checkQuery);
		it("[invalid/sfield_instructor.json] instructor taking wrong type", checkQuery);
		it("[invalid/sfield_title.json] title taking wrong type", checkQuery);
		it("[invalid/sfield_uuid.json] uuid taking wrong type", checkQuery);

		// wildcard errors
		it("[invalid/only_asterixes.json] Wild card containing just asterixes", checkQuery);
		it("[invalid/too_many_asterixes.json] Wild card containing too many asterixes", checkQuery);
		it("[invalid/asterix_in_middle.json] Wild card containing asterix in the middle", checkQuery);
		it("[invalid/asterix_in_front_and_middle.json] Wild card containing asterix in the front and middle", checkQuery);
		it("[invalid/just_three_asterixes.json] Wild card containing just 3 asterixes", checkQuery);

		// not an object error
		it("[invalid/not_an_object.json] This is not an object", async function () {
			try {
				await facade.performQuery("This is not an object");
				expect.fail("Should have failed!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// column errors
		it("[Alex/blank_dataset_id_columns.json] Wild card containing just asterixes", checkQuery);
		it("[Alex/dataset_id_underscores_columns.json] Dataset ID contains multiple underscores in columns", checkQuery);
		it("[Alex/invalid_field_columns.json] Invalid field in columns", checkQuery);

		// order errors
		it("[Alex/order_not_a_string.json] order is not a string", checkQuery);
		it("[Alex/order_multiple_underscores.json] order contains multiple underscores", checkQuery);
		it("[Alex/order_second_dataset.json] order references another dataset", checkQuery);
		it("[Alex/order_invalid_field.json] order contains an invalid field", checkQuery);

		it("[Alex/invalid_mfield_comparison.json] invalid mfield comparison", checkQuery);
		it("[Alex/second_dataset_key.json] mfield references second dataset", checkQuery);
		it("[Alex/where_multiple_outer.json] WHERE contains multiple outer objects", checkQuery);
		it("[Alex/no_valid_list_filters.json] no valid list filters", checkQuery);

		it("[Alex/multiple_filters.json] Sfield should only have 1 filter", checkQuery);
		it("[Alex/query_three_objects.json] query has three objects", checkQuery);
		it("[Alex/where_array.json] where is an array", checkQuery);
		it("[Alex/where_null.json] where is null", checkQuery);
		it("[Alex/options_three_objects.json] OPTIONS contains three objects", checkQuery);
		it("[Alex/options_two_objects.json] OPTIONS contains two objects but no order", checkQuery);
		it("[Alex/field_not_object.json] field not an object", checkQuery);
	});
});
