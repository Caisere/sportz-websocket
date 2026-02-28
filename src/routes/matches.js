import express from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validations/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";


const matchRoute = express.Router();

const MAX_LIMIT = 100;

matchRoute.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      status: "fail",
      error: "Invalid limit parsed",
      details: parsed.error.issues,
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.created_at))
      .limit(limit);
    res.status(200).json({
      status: "success",
      message: "Successfully fetch matches",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

matchRoute.post("/", async (req, res) => {
  const parsedBody = createMatchSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      status: "fail",
      error: "Invalid Body",
      details: parsedBody.error.issues,
    });
  }

  const {
    data: { startTime, endTime, homeScore, awayScore },
  } = parsedBody;

  try {
    const match = await db
      .insert(matches)
      .values({
        ...parsedBody.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore || 0,
        awayScore: awayScore || 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();

    if (typeof req.app.locals.broadcastMatchCreated === "function") {
      try {
        req.app.locals.broadcastMatchCreated(match);
      } catch (broadcastError) {
        console.error("broadcastMatchCreated failed:", broadcastError.message);
      }
    }

    return res.status(201).json({
      message: "Event Created",
      data: match,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

export default matchRoute;
