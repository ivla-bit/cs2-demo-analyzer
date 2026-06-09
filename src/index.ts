import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { DemoParser } from "./parser";
import { DemoAnalyzer } from "./analyzer";
import { Renderer } from "./renderer";

async function main() {
  const demoName = "g2-vs-big-m1-inferno.dem";
  const demopath = path.join(__dirname, "../demos/", demoName);

  if (!fs.existsSync(demopath)) {
    console.error(`Demo file not found at path: ${demopath}`);
    process.exit(1);
  }

  console.log(`Starting analysis for demo: ${demoName}`);

  const parser = new DemoParser(demopath);
  const analyzer = new DemoAnalyzer();
  const renderer = new Renderer();

  const deathEvents = parser.getDeathEvents();

  if (deathEvents.length === 0) {
    console.log(`No death events found in demo: ${demoName}`);
    return;
  }

  const deathTicks = deathEvents.map((event) => event.tick);

  const playerStates = parser.getPlayerStates(deathTicks);

  const results = analyzer.analyze(deathEvents, playerStates);

  if (results.length === 0) {
    console.log(`No highlight moments detected in demo: ${demoName}`);
    return;
  }

  results.sort((a, b) => b.angleDifference - a.angleDifference);

  console.log(`\n Top highlight moments for demo: ${demoName}`);
  results.slice(0, 3).forEach((moment, idx) => {
    const type = moment.isStrictlyBack ? "Strict Backstab" : "Not Strict";
    console.log(
      `Highlight #${idx + 1}: ${moment.attacker.name} -> ${moment.victim.name} (${moment.angleDifference} degrees, ${type}) at tick ${moment.tick}`,
    );
  });

  const jsonPath = path.join(__dirname, "../output_highlights.json");
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`Full analysis results saved to: ${jsonPath}`);

  const cfgPath = path.join(__dirname, "../highlights.cfg");
  renderer.generateCFG(results, cfgPath);

  console.log(`CFG file generated at: ${cfgPath}`);

  renderer.mergeClips();

  console.log(`Analysis and rendering process completed for demo: ${demoName}`);
}

main().catch((error) => {
  console.error("An error occurred during analysis:", error);
  process.exit(1);
});
