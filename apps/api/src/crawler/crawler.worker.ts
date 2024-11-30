import { CALL_STATUS, ExtractionJob } from "@repo/mongoose-schema";
import { WorkerResult } from "../services/bullmq";
import logger from "../utils/logger";
import { extractionRunner } from "@repo/web-interactor";

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
      const password = job.data.password;
      const url = job.data.url;
      const authRequired = job.data.authRequired;
      const result = await extractionRunner(userName, password, url, authRequired);
    //   const referralDataList = result.map((referral: any) => {
    //     return {
    //       updateOne: {
    //         filter: { referralId: referral.referralId },
    //         update: {
    //           $set: {
    //             referralObject: referral.referralMessage,
    //             referralFiles: referral.referralFiles,
    //           },
    //         },
    //         upsert: true, // If no document matches, insert a new one
    //       },
    //     };
    //   });

    //   await Referral.bulkWrite(referralDataList);
      // scheduleOCRExtractionJob(referralDataList);
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
