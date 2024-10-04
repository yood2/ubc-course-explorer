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
	let sections: string;
	let facade: IInsightFacade;

	// ========== Adding to dataset tests ===================
	describe("addDataset", function () {
		let section1: string;
		let section2: string;

		before(async function () {
			sections = await getContentFromArchives("three_courses.zip");
			section1 = await getContentFromArchives("one_course.zip");
			section2 = await getContentFromArchives("two_courses.zip");
		});

		beforeEach(async function () {
			await clearDisk();
			facade = new InsightFacade();
		});

		after(async function () {
			await clearDisk();
		});

		it("should accept dataset add with required fields with empty values", async function () {
			try {
				const validStructure = await getContentFromArchives("required_fields_empty_values.zip");
				const result = await facade.addDataset("sections", validStructure, InsightDatasetKind.Sections);
				expect(result).to.include("sections");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("should reject dataset add with an empty dataset id", async function () {
			try {
				await facade.addDataset("", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with an id containing only whitespace", async function () {
			try {
				await facade.addDataset("    ", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with an id containing only an underscore", async function () {
			try {
				await facade.addDataset("_", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with an id containing underscores", async function () {
			try {
				await facade.addDataset("This_should_fail", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with an id containing underscore", async function () {
			try {
				await facade.addDataset("ThisShould_Fail", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with an id containing underscore at end", async function () {
			try {
				await facade.addDataset("ThisShouldFail_", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with an id containing underscore at beginning", async function () {
			try {
				await facade.addDataset("_ThisShouldFail", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with invalid id after a valid dataset add", async function () {
			try {
				await facade.addDataset("section", sections, InsightDatasetKind.Sections);
				await facade.addDataset("section_", section1, InsightDatasetKind.Sections);
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
		});

		it("should reject a dataset add with invalid folder structure", async function () {
			try {
				const invalidStructure = await getContentFromArchives("invalid_folder_structure.zip");
				await facade.addDataset("sections", invalidStructure, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add without any courses", async function () {
			try {
				const noCourses = await getContentFromArchives("no_courses.zip");
				await facade.addDataset("sections", noCourses, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add without a courses folder", async function () {
			try {
				const noCourses = await getContentFromArchives("no_courses_folder.zip");
				await facade.addDataset("sections", noCourses, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add where sections isn't stored under result", async function () {
			try {
				const Results = await getContentFromArchives("not_stored_in_result.zip");
				await facade.addDataset("sections", Results, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add where the folder is coursing instead of courses", async function () {
			try {
				const Results = await getContentFromArchives("coursing.zip");
				await facade.addDataset("sections", Results, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add where the course is not in the proper json format", async function () {
			try {
				const Results = await getContentFromArchives("improper_json.zip");
				await facade.addDataset("sections", Results, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add when kind isn't sections", async function () {
			try {
				await facade.addDataset("section", sections, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with course not containing a results object", async function () {
			try {
				const invalidCourse = await getContentFromArchives("invalid_course.zip");
				await facade.addDataset("sections", invalidCourse, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with content not containing any sections", async function () {
			try {
				const noSections = await getContentFromArchives("no_sections.zip");
				await facade.addDataset("sections", noSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with content not containing any valid sections", async function () {
			try {
				const noValidSections = await getContentFromArchives("no_valid_sections.zip");
				await facade.addDataset("sections", noValidSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject a dataset add with empty courses folder", async function () {
			try {
				const noValidSections = await getContentFromArchives("empty_courses_folder.zip");
				await facade.addDataset("sections", noValidSections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Add same dataset consecutively", async function () {
			try {
				const result: string[] = await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
				expect(result).to.include("sections");
				await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Add dataset with same id", async function () {
			try {
				const result: string[] = await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
				expect(result).to.include("sections");
				await facade.addDataset("sections", section1, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Add existing dataset id after remove", async function () {
			try {
				await facade.addDataset("section0", sections, InsightDatasetKind.Sections);
				await facade.addDataset("section1", section1, InsightDatasetKind.Sections);
				await facade.addDataset("section2", section2, InsightDatasetKind.Sections);
				await facade.removeDataset("section2");
				await facade.addDataset("section0", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("invalid dataset id added after remove", async function () {
			try {
				await facade.addDataset("section0", sections, InsightDatasetKind.Sections);
				await facade.addDataset("section2", section2, InsightDatasetKind.Sections);
				await facade.removeDataset("section2");
				await facade.addDataset("section_0", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("Add same dataset between datasets", async function () {
			try {
				// first dataset
				const result: string[] = await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
				expect(result).to.include("sections");

				// second dataset
				const result2: string[] = await facade.addDataset("section1", section1, InsightDatasetKind.Sections);
				expect(result2).to.include("section1");

				// duplicate dataset
				await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown an error.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// faulty datasets (missing info, etc.)

		// should be valid test
		it("should successfully add a dataset", async function () {
			try {
				const result: string[] = await facade.addDataset("section", sections, InsightDatasetKind.Sections);
				expect(result).to.include("section");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("should successfuly add a dataset with a forbidden character", async function () {
			try {
				const result: string[] = await facade.addDataset("section<", sections, InsightDatasetKind.Sections);
				expect(result).to.include("section<");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("should successfuly add a dataset with a single forbidden character", async function () {
			try {
				const result: string[] = await facade.addDataset("?", sections, InsightDatasetKind.Sections);
				expect(result).to.include("?");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("should successfully add multiple datasets", async function () {
			try {
				const result1: string[] = await facade.addDataset("section0", sections, InsightDatasetKind.Sections);
				const result2: string[] = await facade.addDataset("section1", section1, InsightDatasetKind.Sections);
				const result3: string[] = await facade.addDataset("section2", section2, InsightDatasetKind.Sections);
				const result4: string[] = await facade.addDataset("section3", section2, InsightDatasetKind.Sections);

				expect(result1).to.include("section0");

				expect(result2).to.include("section0");
				expect(result2).to.include("section1");

				expect(result3).to.include("section0");
				expect(result3).to.include("section1");
				expect(result3).to.include("section2");

				expect(result4).to.include("section0");
				expect(result4).to.include("section1");
				expect(result4).to.include("section2");
				expect(result4).to.include("section3");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});

		it("should successfully add the same dataset after it is removed", async function () {
			try {
				const sizeTwo = 2;
				const sizeThree = 3;

				const result1: string[] = await facade.addDataset("section0", sections, InsightDatasetKind.Sections);
				expect(result1.length).to.equal(1);
				expect(result1).to.include("section0");

				const result2: string[] = await facade.addDataset("section1", section1, InsightDatasetKind.Sections);
				expect(result2.length).to.equal(sizeTwo);
				expect(result2).to.include("section0");
				expect(result2).to.include("section1");

				const result3: string[] = await facade.addDataset("section2", section2, InsightDatasetKind.Sections);
				expect(result3.length).to.equal(sizeThree);
				expect(result3).to.include("section0");
				expect(result3).to.include("section1");
				expect(result3).to.include("section2");

				await facade.removeDataset("section0");
				await facade.removeDataset("section2");

				const result4: string[] = await facade.addDataset("section2", section2, InsightDatasetKind.Sections);
				expect(result4.length).to.equal(sizeTwo);
				expect(result4).to.include("section1");
				expect(result4).to.include("section2");
				expect(result4).to.not.include("section0");

				const result5: string[] = await facade.addDataset("section5", sections, InsightDatasetKind.Sections);
				expect(result5.length).to.equal(sizeThree);
				expect(result5).to.include("section5");
				expect(result5).to.include("section1");
				expect(result5).to.include("section2");
			} catch (err) {
				expect.fail(`Unexpected Error: ${(err as Error).message}`);
			}
		});
	});

	// ================= removing dataset tests ==========================
	describe("removeDataset", function () {
		let section1: string;
		let section2: string;

		before(async function () {
			sections = await getContentFromArchives("three_courses.zip");
			section1 = await getContentFromArchives("one_course.zip");
			section2 = await getContentFromArchives("two_courses.zip");
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
			} catch (_) {
				expect.fail("Should not throw an error");
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
			section1 = await getContentFromArchives("one_course.zip");
			section2 = await getContentFromArchives("two_courses.zip");
			section3 = await getContentFromArchives("three_courses.zip");
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

		before(async function () {
			// Add the datasets to InsightFacade once.
			// Will *fail* if there is a problem reading ANY dataset.
			sections = await getContentFromArchives("pair.zip");
			const section1: string = await getContentFromArchives("one_course.zip");
			const section2: string = await getContentFromArchives("two_courses.zip");
			const section3: string = await getContentFromArchives("one_section.zip");
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

			let orderFlag = false;
			let order = "";

			if (input !== null && typeof input === "object") {
				// only need OPTIONS in object as we're just checking if order exists in this block of code
				const hasOptions = input as { OPTIONS: { ORDER?: any } };

				// Check if the ORDER key exists in OPTIONS
				if (hasOptions.OPTIONS && "ORDER" in hasOptions.OPTIONS) {
					orderFlag = true; // Set flag to true if ORDER exists
					order = hasOptions.OPTIONS.ORDER as string;
				}
			}

			try {
				const result: InsightResult[] = await facade.performQuery(input);

				if (!errorExpected) {
					expect(result.length).to.equal(expected.length);
					if (orderFlag === true) {
						expect(result).to.deep.members(expected);
						for (let i = 0; i < result.length; i++) {
							expect(result[i][order]).to.equal(expected[i][order]);
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

		/**
		 * ADD CASES FOR:
		 * - performQuery() that has empty nested filters (should be invalid)
		 * - performQuery() that has empty NOT filter (should be invalid)
		 * - performQuery() has empty GT comparison (should be invalid)
		 */
		it("[Daniel/empty_nested_filters.json] Match all entries", checkQuery);
		it("[Daniel/empty_not_filter.json] Match all entries", checkQuery);
		it("[Daniel/empty_comparison.json] Match all entries", checkQuery);

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
