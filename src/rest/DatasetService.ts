import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Log from "@ubccpsc310/folder-test/build/Log";
import InsightFacade from "../controller/InsightFacade";
import { InsightDatasetKind, InsightError, NotFoundError } from "../controller/IInsightFacade";

export default class DatasetsService {
	public static async addDataset(req: Request, res: Response): Promise<void> {
		try {
			if (!req.body || !(req.body instanceof Buffer) || req.body.length === 0) {
				res.status(StatusCodes.BAD_REQUEST).json({ error: "Request body is empty or invalid" });
				return;
			}

			const content = req.body.toString("base64");
			const datasetId = req.params.id;
			const kind = req.params.kind;

			if (typeof kind !== "string" || !Object.values(InsightDatasetKind).includes(kind as InsightDatasetKind)) {
				res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing or invalid dataset kind!" });
				return;
			}

			Log.info(`Server::DatasetsService(..) - dataset id: ${datasetId}, kind: ${kind}`);
			const insightFacade = new InsightFacade();
			const response = await insightFacade.addDataset(datasetId, content, kind as InsightDatasetKind);
			res.status(StatusCodes.OK).json({ result: response });
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
			res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
		}
	}

	public static async removeDataset(req: Request, res: Response): Promise<void> {
		try {
			const datasetId = req.params.id;

			Log.info(`Server::DatasetsService(..) - dataset id: ${datasetId}`);
			const insightFacade = new InsightFacade();
			const response = await insightFacade.removeDataset(datasetId);
			res.status(StatusCodes.OK).json({ result: response });
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
			if (err instanceof InsightError) {
				res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
			} else if (err instanceof NotFoundError) {
				res.status(StatusCodes.NOT_FOUND).json({ error: errorMessage });
			}
		}
	}

	public static async listDatasets(__req: Request, res: Response): Promise<void> {
		try {
			Log.info(`Server::DatasetsService(..) list datasets`);
			const insightFacade = new InsightFacade();
			const response = await insightFacade.listDatasets();
			res.status(StatusCodes.OK).json({ result: response });
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
			res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
		}
	}

	public static async queryDataset(req: Request, res: Response): Promise<void> {
		try {
			if (!req.body || typeof req.body !== "object" || req.body.length === 0) {
				res.status(StatusCodes.BAD_REQUEST).json({ error: "Request body is empty or invalid" });
				return;
			}
			Log.info(`Server::DatasetsService(..) - querying dataset`);
			const insightFacade = new InsightFacade();
			const response = await insightFacade.performQuery(req.body);
			res.status(StatusCodes.OK).json({ result: response });
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
			res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
		}
	}
}
