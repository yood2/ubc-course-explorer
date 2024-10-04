import JSZip = require("jszip");
import { Section } from "./InsightFacade";

interface PreProcessedSection {
	id: string;
	Course: string;
	Title: string;
	Professor: string;
	Subject: string;
	Year: string;
	Avg: string;
	Pass: string;
	Fail: string;
	Audit: string;
}

interface ProcessResult {
	sections: Section[];
	totalRows: number;
}

export async function processZipContent(content: string): Promise<ProcessResult> {
	const zip = new JSZip();
	const folder = await zip.loadAsync(content, { base64: true });

	validateZipStructure(folder);

	const courseFiles = getCourseFiles(folder);
	return processCoursesData(courseFiles);
}

function validateZipStructure(zip: JSZip): void {
	const hasCourseFolder = Object.keys(zip.files).some((filename) => filename.startsWith("courses/"));
	if (!hasCourseFolder) {
		throw new Error("Zip file does not contain a 'courses' folder");
	}

	const coursesContent = Object.keys(zip.files).filter(
		(filename) => filename.startsWith("courses/") && filename !== "courses/"
	);
	if (coursesContent.length === 0) {
		throw new Error("'courses' folder is empty");
	}
}

function getCourseFiles(folder: JSZip): JSZip.JSZipObject[] {
	return Object.values(folder.files).filter((file) => file.name.startsWith("courses/") && file.name !== "courses/");
}

async function processCoursesData(courseFiles: JSZip.JSZipObject[]): Promise<ProcessResult> {
	const fileProcessingPromises = courseFiles.map(async (file) => {
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
	const sections: Section[] = processedSections.flat();
	const totalRows = sections.length;

	return { sections, totalRows };
}

function isValidCourseSection(section: PreProcessedSection): boolean {
	const requiredFields = ["id", "Course", "Title", "Professor", "Subject", "Year", "Avg", "Pass", "Fail", "Audit"];

	const sectionKeys = Object.keys(section);
	return requiredFields.every((field) => sectionKeys.includes(field));
}

function processCourseSection(section: PreProcessedSection): Section {
	return {
		uuid: section.id.toString(),
		id: section.Course,
		title: section.Title,
		instructor: section.Professor,
		dept: section.Subject,
		year: parseInt(section.Year, 10),
		avg: parseFloat(section.Avg),
		pass: parseInt(section.Pass, 10),
		fail: parseInt(section.Fail, 10),
		audit: parseInt(section.Audit, 10),
	};
}
