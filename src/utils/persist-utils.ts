import { InsightDataset } from "../controller/IInsightFacade";
import { removeForbiddenCharacters } from "../utils/insight-utils";
import * as fs from "fs-extra";
import * as path from "path";

const dataDir = "data/meta";

// async function ensureDataDirectoryExists(): Promise<void> {
// 	await fs.ensureDir(dataDir);
// }

export async function readMetadata(): Promise<InsightDataset[]> {
	await fs.ensureDir(dataDir);

	const datasets: InsightDataset[] = [];
	const files = fs.readdirSync(dataDir);

	for (const file of files) {
		if (file.endsWith(".json")) {
			const filePath = path.join(dataDir, file);
			const content = fs.readFileSync(filePath, "utf-8");
			datasets.push(JSON.parse(content) as InsightDataset);
		}
	}

	return datasets;
}

// export async function readMetadata(): Promise<InsightDataset[]> {
// 	try {
// 		await ensureDataDirectoryExists();

// 		if (await fs.pathExists(metaFilePath)) {
// 			const data = await fs.readFile(metaFilePath, "utf8");
// 			const json = JSON.parse(data);
// 			return json.meta;
// 		} else {
// 			return [];
// 		}
// 	} catch (e) {
// 		throw new Error(`readMetadata: ${(e as Error).message}`);
// 	}
// }

// export async function addMetadata(newData: InsightDataset): Promise<boolean> {
// 	try {
// 		const data = await readMetadata();
// 		data.push(newData);
// 		await writeMetadata(data);
// 		return true;
// 	} catch (e) {
// 		throw new Error(`addMetadata: ${(e as Error).message}`);
// 	}
// }

export async function writeMetadata(dataset: InsightDataset): Promise<void> {
	const filePath = path.join(dataDir, `${removeForbiddenCharacters(dataset.id)}.json`);
	const length = 2;
	fs.writeFileSync(filePath, JSON.stringify(dataset, null, length), "utf-8");
}

// export async function writeMetadata(data: InsightDataset): Promise<void> {
// 	try {
// 		await ensureDataDirectoryExists();
// 		const space = 2;
// 		const metaFilePath = path.join(dataDir, `${removeForbiddenCharacters(data.id)}.json`);
// 		await fs.writeFile(metaFilePath, JSON.stringify({ meta: data }, null, space));
// 	} catch (e) {
// 		throw new Error(`writeMetadata: ${(e as Error).message}`);
// 	}
// }

export async function removeMetadata(datasetId: string): Promise<void> {
	const filePath = path.join(dataDir, `${datasetId}.json`);
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}
}

// export async function removeMetadata(id: string): Promise<boolean> {
// 	try {
// 		let data = await readMetadata();

// 		data = data.filter((item) => item.id !== id);

// 		await writeMetadata(data);
// 		return true;
// 	} catch (e) {
// 		throw new Error(`removeMetadata: ${(e as Error).message}`);
// 	}
// }

export async function getIds(): Promise<string[]> {
	const datasets = await readMetadata();
	return datasets.map((dataset) => dataset.id);
}

// export async function getIds(): Promise<string[]> {
// 	try {
// 		const data = await readMetadata();
// 		const result: string[] = [];
// 		for (const d of data) {
// 			result.push(d.id);
// 		}
// 		return result;
// 	} catch (e) {
// 		throw new Error(`getIds: ${(e as Error).message}`);
// 	}
// }
