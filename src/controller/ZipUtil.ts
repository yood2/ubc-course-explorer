import JSZip = require("jszip");

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

interface ProcessedSection {
	id: string;
	title: string;
	instructor: string;
	dept: string;
	year: string;
	avg: string;
	pass: string;
	fail: string;
	audit: string;
}

interface ProcessResult {
	results: Record<string, ProcessedSection>;
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
	if (Object.keys(folder.files).length < 2) {
		throw new Error("'courses' folder is empty");
	}
}

function getCourseFiles(folder: JSZip): JSZip.JSZipObject[] {
	return Object.values(folder.files).filter((file) => file.name.startsWith("courses/") && file.name !== "courses/");
}

async function processCoursesData(courseFiles: JSZip.JSZipObject[]): Promise<ProcessResult> {
	const results: Record<string, ProcessedSection> = {};
	let totalRows = 0;

	for (const file of courseFiles) {
		try {
			const fileContent = await file.async("string");
			const sections: PreProcessedSection[] = JSON.parse(fileContent).result;

			for (const section of sections) {
				if (isValidCourseSection(section)) {
					results[section.id] = processCourseSection(section);
					totalRows++;
				}
			}
		} catch (error) {
			console.error(`Failed to process file ${file.name}:`, error);
		}
	}

	return { results, totalRows };
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

function processCourseSection(section: PreProcessedSection): ProcessedSection {
	return {
		id: section.Course,
		title: section.Title,
		instructor: section.Professor,
		dept: section.Subject,
		year: section.Year,
		avg: section.Avg,
		pass: section.Pass,
		fail: section.Fail,
		audit: section.Audit,
	};
}
