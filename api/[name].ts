import { existsSync } from "fs";
import { join } from "path";

import geoip from "geoip-lite";
import { VercelRequest, VercelResponse } from "@vercel/node";

import { getHexagon, getMapDimensions, getMapPosition } from "../utils/map";
import { getLastLocations, writeLocation } from "../utils/redis";
import {
  generatePointsFile,
  streamActivityPoint,
  streamPointsFile,
  streamSvgFooter,
  streamSvgHeader,
} from "../utils/svg";

// After changing boundaries remove the file points.cache so that it gets regenerated
const mapBoundaries = {
  lat: { min: -60, max: 75 },
  lng: { min: -179, max: 179 },
};

const height = 60;

export default async function (req: VercelRequest, res: VercelResponse) {
  switch (req.method) {
    case "POST":
      return await handlePost(req, res);
    case "GET":
      return await handleGet(req, res);
    default:
      return res.status(405).end();
  }
}

async function handlePost(request: VercelRequest, response: VercelResponse) {
  if (request.headers.authorization !== `Bearer ${process.env["TOKEN"]}`) {
    response.status(401).end();
    return;
  }

  const mapName = request.query.name as string;
  const clientLocation = geoip.lookup(request.body.ip);

  if (clientLocation?.ll) {
    await writeLocation(mapName, clientLocation.ll);
  }

  response.status(204).end();
}

async function handleGet(request: VercelRequest, response: VercelResponse) {
  try {
    const mapName = request.query.name as string;

    const dimensions = getMapDimensions(height, mapBoundaries);
    const hexagon = getHexagon(0.24);

    response.writeHead(200, { "Content-Type": "image/svg+xml" });

    const pointsFilePath = join(__dirname, "./points.cache");

    if (!existsSync(pointsFilePath)) {
      generatePointsFile(pointsFilePath, dimensions);
    }

    await streamSvgHeader(dimensions, hexagon, response);
    await streamPointsFile(pointsFilePath, response);

    const items = await getLastLocations(mapName, 30, 100);

    for (const [lat, lng] of items) {
      try {
        const position = getMapPosition(lat, lng, dimensions);
        await streamActivityPoint(position, response);
      } catch {
        // skip on invalid position
      }
    }

    await streamSvgFooter(response);
  } catch (error) {
    console.error(error);
    response.status(500).end();
  }
}
