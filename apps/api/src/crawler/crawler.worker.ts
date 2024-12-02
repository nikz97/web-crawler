import { CALL_STATUS, ExtractionJob, INetworkCall, NetworkCall } from "@repo/mongoose-schema";
import { WorkerResult } from "../services/bullmq";
import logger from "../utils/logger";
import { extractionRunner } from "@repo/web-interactor";
import CONFIG from "../config";
import mongoose from "mongoose";

export const initiateCrawlerJob = async (job: any): Promise<WorkerResult> => {
    logger.info(
        `initiateCrawlerJob: Worker started job ${job.id} with data:`,
        { jobData: job.data }
      );

    try {
      const jobId = job.data.id;
      // const extractionJob = await ExtractionJob.findById(jobId);

      // extractionJob.status = CALL_STATUS.ONGOING;
      // await extractionJob.save();
      const userName = job.data.userName;
      const password = CONFIG.INSTAGRAM_PASSWORD;
      const url = job.data.url;
      const authRequired = job.data.authRequired;
      const result = await extractionRunner(userName, password, url, authRequired);
      
      const db = mongoose.connection.db;
      if(!db) {
        throw new Error('No database connection');
      }

      const testCollection = db.collection('netwroCalls');
      await testCollection.insertMany(
        result.map((call: any) => {
          return {
            url: call.url,
            method: call.method,
            headers: call.headers,
            resourceType: call.resourceType,
            postData: call.postData,
            response: call.response,
          };
        })
      );

      logger.info(`initiatelExtractionJob: Job ${job.id} completed with result:`);
      return {

      } as WorkerResult;
    } catch (error: any) {
      logger.error(
        `initiatelExtractionJob: Job ${job.id} failed with error:`,
        { error: error.message, stack: error.stack }
      );
      return {
        error: {
          message: error.message,
          type: "InternalError",
        },
      } as WorkerResult;
    }
};
