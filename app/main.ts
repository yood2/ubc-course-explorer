import * as fs from "fs-extra";

async function main(name: string): Promise<string> {
	try {
		const filePath = `../test/resources/archives/${name}`;
		const buffer = await fs.readFile(filePath);
		return buffer.toString("base64");
	} catch (err) {
		throw err;
	}
}

// Usage
main("small_comm.zip")
	.then((result) => console.log(result))
	.catch((err) => console.error("Unexpected Error:", err));
