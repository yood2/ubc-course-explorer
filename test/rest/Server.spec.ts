import { expect } from "chai";
import request, { Response } from "supertest";
import { StatusCodes } from "http-status-codes";
import Log from "@ubccpsc310/folder-test/build/Log";
import { clearDisk, loadTestQuery } from "../TestUtil";
import * as fs from "fs-extra";

describe.only("Facade C3", function () {
	before(async function () {
		// const smallSections = await getContentFromArchives("sections/one_section.zip");
		// const smallRooms = await getContentFromArchives("rooms/one_building.zip");
	});

	after(async function () {
		await clearDisk();
	});

	beforeEach(async function () {
		await clearDisk();
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	// Sample on how to format PUT requests
	it("PUT test for courses dataset", async function () {
		const SERVER_URL = "http://localhost:4321/";
		const ENDPOINT_URL = "dataset/mysections/sections";
		const ZIP_FILE_DATA = await fs.readFile("test/resources/archives/sections/one_section.zip");

		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					Log.info(res.text);
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function (err: Error) {
					Log.error(err.message);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
			// and some more logging here!
		}
	});

	it("Fail PUT test for courses dataset", async function () {
		const SERVER_URL = "http://localhost:4321/";
		const ENDPOINT_URL = "dataset/mysections/section";
		const ZIP_FILE_DATA = await fs.readFile("test/resources/archives/sections/one_section.zip");

		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					Log.info(res.text);
					expect(res.status).to.be.equal(StatusCodes.BAD_REQUEST);
				})
				.catch(function (err: Error) {
					Log.error(err.message);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
			// and some more logging here!
		}
	});

	it("DELETE test for courses dataset", async function () {
		const SERVER_URL = "http://localhost:4321/";
		const PUT_ENDPOINT_URL = "dataset/mysections/sections";
		const DELETE_ENDPOINT_URL = "dataset/mysections";
		const ZIP_FILE_DATA = await fs.readFile("test/resources/archives/sections/one_section.zip");

		try {
			await request(SERVER_URL)
				.put(PUT_ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					Log.info(res.text);
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function (err: Error) {
					Log.error(err.message);
					// some logging here please!
					expect.fail();
				});

			return request(SERVER_URL)
				.delete(DELETE_ENDPOINT_URL)
				.then(function (res: Response) {
					// some logging here please!
					Log.info(res.text);
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function (err: Error) {
					Log.error(err.message);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
			// and some more logging here!
		}
	});

	it("GET test for courses dataset", async function () {
		const SERVER_URL = "http://localhost:4321/";
		const PUT_ENDPOINT_URL = "dataset/mysections/sections";
		const GET_ENDPOINT_URL = "datasets";
		const ZIP_FILE_DATA = await fs.readFile("test/resources/archives/sections/one_section.zip");

		try {
			await request(SERVER_URL)
				.put(PUT_ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					Log.info(res.text);
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function (err: Error) {
					Log.error(err.message);
					// some logging here please!
					expect.fail();
				});

			return request(SERVER_URL)
				.get(GET_ENDPOINT_URL)
				.then(function (res: Response) {
					// some logging here please!
					Log.info(res.text);
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function (err: Error) {
					Log.error(err.message);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
			// and some more logging here!
		}
	});

	it("POST test for courses dataset", async function () {
		const SERVER_URL = "http://localhost:4321/";
		const PUT_ENDPOINT_URL = "dataset/sections/sections";
		const POST_ENDPOINT_URL = "query";
		const ZIP_FILE_DATA = await fs.readFile("test/resources/archives/sections/pair.zip");
		const { input } = await loadTestQuery("[valid/simple.json]");
		const QUERY = input as JSON;

		try {
			await request(SERVER_URL)
				.put(PUT_ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					Log.info(res.text);
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function (err: Error) {
					Log.error(err.message);
					// some logging here please!
					expect.fail();
				});

			return request(SERVER_URL)
				.post(POST_ENDPOINT_URL)
				.send(QUERY)
				.set("Content-Type", "application/json")
				.then(function (res: Response) {
					// some logging here please!
					// Log.info(res.text);
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function (err: Error) {
					Log.error(err.message);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
			// and some more logging here!
		}
	});

	// The other endpoints work similarly. You should be able to find all instructions in the supertest documentation
});
