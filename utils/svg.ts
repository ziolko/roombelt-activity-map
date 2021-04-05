import { Dimensions, getMapPoints } from "./map";
import { createReadStream, writeFileSync } from "fs";

export function streamSvgHeader(
  dimensions: Dimensions,
  marker: number[][],
  output: NodeJS.WritableStream
) {
  output.write(`
        <svg viewBox="0 0 ${dimensions.width} ${
    dimensions.height
  }" xmlns="http://www.w3.org/2000/svg" style="background-color: #111">
            <defs>
                <polyline id="p" class="point" points="${marker
                  .map((point) => point.join(" "))
                  .join(" ")}" fill="#777" />
                <g id="a">
                    <circle cx="0" cy="0" r="0.4" fill="#7F7"/>
                    <circle class="pulse" cx="0" cy="0" r="0.9" fill="#7F7"/>
                </g>
            </defs>
            <style>
                @keyframes pulse {
                  0% { opacity: 0; }
                  100% { opacity: 0.6; }
                }
                @keyframes fade-in {
                  0% { opacity: 0; }
                  100% { opacity: 1; }
                }
                .pulse {
                    animation-duration: 1.2s ; 
                    animation-iteration-count: infinite;
                    animation-name: pulse;
                    animation-direction: alternate;
                    animation-timing-function: ease;
                    animation-delay: var(--start, 0);
                }
            </style>`);
}

export function streamPointsFile(
  pointsFile: string,
  output: NodeJS.WritableStream
) {
  return new Promise<void>((resolve) => {
    const readStream = createReadStream(pointsFile);
    readStream.pipe(output, { end: false });
    readStream.on("end", resolve);
  });
}

export function streamSvgFooter(output: NodeJS.WritableStream) {
  output.end(`</svg>`);
}

export function streamActivityPoint(
  { x, y }: { x: number; y: number },
  output: NodeJS.WritableStream
) {
  const start = Math.round(Math.random() * 50) / 10;
  output.write(
    `<use href="#a" x="${x}" y="${y}" style="will-change: opacity; opacity: 0; animation: fade-in 0.5s ease-in ${start}s forwards; --start: ${start}s"/>`
  );
}

export function generatePointsFile(pointsFile: string, dimensions: Dimensions) {
  const mapPoints = getMapPoints(dimensions);

  const dist = (point) =>
    Math.pow(point.x - dimensions.width / 2, 2) +
    Math.pow(point.y - dimensions.height / 2, 2);

  mapPoints.sort((a, b) => dist(a) - dist(b));

  writeFileSync(
    pointsFile,
    mapPoints.map(({ x, y }) => `<use href="#p" x="${x}" y="${y}" />`).join("")
  );
}
