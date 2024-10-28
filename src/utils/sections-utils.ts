import JSZip = require("jszip");
import { PreProcessedSection, Section, ProcessResult } from "../controller/InsightFacade.types";

/**
 * Parses the zip file to extract section files without validation.
 *
 * @param folder The zip file containing section data.
 * @returns An array of JSZip objects representing course files.
 */
export function parseSections(folder: JSZip): { folder: JSZip; values: JSZip.JSZipObject[] } {
	return {
		folder: folder,
		values: Object.values(folder.files).filter((file) => file.name.startsWith("courses/") && file.name !== "courses/"),
	};
}

/**
 * Validates the parsed section files to ensure the zip structure meets criteria.
 *
 * @param zip The zip file containing section data.
 */
export function validateSections(zip: JSZip): void {
	const hasCourseFolder = Object.keys(zip.files).some((filename) => filename.startsWith("courses/"));
	if (!hasCourseFolder) {
		throw new Error("validateSections: Zip file does not contain a 'courses' folder");
	}

	const coursesContent = Object.keys(zip.files).filter(
		(filename) => filename.startsWith("courses/") && filename !== "courses/"
	);
	if (coursesContent.length === 0) {
		throw new Error("validateSections: 'courses' folder is empty");
	}
}

/**
 * Processes the validated files into structured Section objects.
 *
 * @param files An array of validated JSZip objects representing course files.
 * @returns A promise that resolves to a ProcessResult containing sections and total rows.
 */
export async function processSections(files: JSZip.JSZipObject[]): Promise<ProcessResult> {
	const fileProcessingPromises = files.map(async (file) => {
		try {
			const fileContent = await file.async("string");
			if (!("result" in JSON.parse(fileContent))) {
				throw new Error("No results array");
			}
			const preSections: PreProcessedSection[] = JSON.parse(fileContent).result;
			const processedSections: Section[] = [];

			for (const section of preSections) {
				if (!isValidCourseSection(section)) {
					throw new Error(`Invalid course section in file ${file.name}`);
				}
				processedSections.push(processCourseSection(section));
			}
			return processedSections;
		} catch (err) {
			throw new Error(`Error processing file ${file.name}: ${(err as Error).message}`);
		}
	});

	const processedSections = await Promise.all(fileProcessingPromises);
	const rows: Section[] = processedSections.flat();
	const totalRows = rows.length;

	return { rows, totalRows };
}

/**
 * Checks if a course section contains all required fields.
 *
 * @param section The pre-processed section to validate.
 * @returns True if valid, otherwise false.
 */
function isValidCourseSection(section: PreProcessedSection): boolean {
	const requiredFields = ["id", "Course", "Title", "Professor", "Subject", "Year", "Avg", "Pass", "Fail", "Audit"];
	return requiredFields.every((field) => field in section);
}

/**
 * Processes a pre-processed section into a structured Section object.
 *
 * @param section The pre-processed section.
 * @returns The processed Section object.
 */
function processCourseSection(section: PreProcessedSection): Section {
	const isOverall = section.Section === "overall";
	const defaultYear = 1900;
	return {
		uuid: section.id.toString(),
		id: section.Course || "",
		title: section.Title || "",
		instructor: section.Professor || "",
		dept: section.Subject || "",
		year: isOverall ? defaultYear : parseYear(section.Year),
		avg: parseFloat(section.Avg) || 0,
		pass: parseInt(section.Pass, 10) || 0,
		fail: parseInt(section.Fail, 10) || 0,
		audit: parseInt(section.Audit, 10) || 0,
	};
}

/**
 * Parses the year from the string. Defaults to 1900 if invalid.
 *
 * @param year The year string.
 * @returns The parsed year as a number.
 */
function parseYear(year: string): number {
	const defaultYear = 1900;
	if (year === "" || isNaN(parseInt(year, 10))) {
		return defaultYear;
	}
	return parseInt(year, 10);
}
