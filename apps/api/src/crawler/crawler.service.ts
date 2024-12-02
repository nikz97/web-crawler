import { CALL_STATUS, ExtractionJob } from "@repo/mongoose-schema";
import { scheduleExtractionJob } from "./crawler.scheduler";
import mongoose from "mongoose";

export async function initializeCrawlerJob(
    url: string,
    usernName: string,
    password: string,
    authRequired: boolean
  ) {
  
    const db = mongoose.connection.db;
    if(!db) {
      throw new Error('No database connection');
    }
    const testCollection = db.collection('extractionjob');
    await testCollection.insertOne({ 
      username: usernName, 
      password: password,
      url: url, 
      status: CALL_STATUS.SCHEDULED, 
    });

    await scheduleExtractionJob({
      userName: usernName,
      password: password,
      url: url,
      authRequired: authRequired,
    });

    return ;
  }