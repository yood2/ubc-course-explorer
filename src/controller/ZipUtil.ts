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

function validateZipStructure(folder: JSZip): void {
	if (!("courses/" in folder.files)) {
		throw new Error("Zip file does not contain a 'courses' folder");
	}
	const minFiles = 2;
	if (Object.keys(folder.files).length < minFiles) {
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
			const preSections: PreProcessedSection[] = JSON.parse(fileContent).result;
			return preSections.filter(isValidCourseSection).map(processCourseSection);
		} catch (error) {
			console.error(`Failed to process file ${file.name}:`, error);
			return [];
		}
	});

	const processedSections = await Promise.all(fileProcessingPromises);
	const sections: Section[] = processedSections.flat();
	const totalRows = sections.length;

	return { sections, totalRows };
}

function isValidCourseSection(section: PreProcessedSection): boolean {
	return !!(
		section.id &&
		section.Course &&
		section.Title &&
		section.Professor &&
		section.Subject &&
		section.Year &&
		section.Avg &&
		section.Pass &&
		section.Fail &&
		section.Audit
	);
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
