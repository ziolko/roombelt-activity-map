import proj4 from "proj4";
import inside from "@turf/boolean-point-in-polygon";
import world from "./countries.geo.json";

export interface Dimensions {
  width: number;
  height: number;
  xRange: number;
  yRange: number;
  xMin: number;
  yMax: number;
  yStep: number;
}

export function getMapDimensions(height, boundaries): Dimensions {
  const [xMin, yMin] = proj4(proj4.defs("GOOGLE"), [
    boundaries.lng.min,
    boundaries.lat.min,
  ]);
  const [xMax, yMax] = proj4(proj4.defs("GOOGLE"), [
    boundaries.lng.max,
    boundaries.lat.max,
  ]);
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const width = Math.round((height * xRange) / yRange);
  const yStep = Math.sqrt(3) / 2;

  return { width, height, xRange, yRange, xMin, yMax, yStep };
}

export function isOnLand(lat, lng) {
  const [googleX, googleY] = proj4(proj4.defs("GOOGLE"), [lng, lat]);
  const wgs84Point = proj4(proj4.defs("GOOGLE"), proj4.defs("WGS84"), [
    googleX,
    googleY,
  ]);
  // @ts-ignore
  return world.features.some((country) => inside(wgs84Point, country));
}

export function getMapPoints(mapDimensions) {
  const { width, height, xRange, yRange, xMin, yMax, yStep } = mapDimensions;

  const result = [];
  for (let y = 0; y * yStep < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const localx = y % 2 === 0 ? x + 0.5 : x;
      const localy = y * yStep;

      const latlng = [
        (localx / width) * xRange + xMin,
        yMax - (localy / height) * yRange,
      ];
      const wgs84Point = proj4(
        proj4.defs("GOOGLE"),
        proj4.defs("WGS84"),
        latlng
      );

      // @ts-ignore
      if (world.features.some((country) => inside(wgs84Point, country))) {
        result.push({ x: localx, y: localy });
      }
    }
  }
  return result;
}

export function getMapPosition(lat, lng, mapDimensions) {
  const { width, height, xRange, yRange, xMin, yMax, yStep } = mapDimensions;

  const [googleX, googleY] = proj4(proj4.defs("GOOGLE"), [lng, lat]);
  let [rawX, rawY] = [
    (width * (googleX - xMin)) / xRange,
    (height * (yMax - googleY)) / yRange,
  ];
  const y = Math.round(rawY / yStep);
  if (y % 2 === 0) {
    rawX -= 0.5;
  }

  const x = Math.round(rawX);
  let [localx, localy] = [x, Math.round(y) * yStep];
  if (y % 2 === 0) {
    localx += 0.5;
  }

  return { x: localx, y: localy };
}

export function getHexagon(radius) {
  const sqrt3radius = Math.sqrt(3) * radius;
  return [
    [sqrt3radius, -radius],
    [sqrt3radius, radius],
    [0, 2 * radius],
    [-sqrt3radius, radius],
    [-sqrt3radius, -radius],
    [0, -2 * radius],
  ];
}
