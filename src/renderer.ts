import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { exec } from "child_process";
import { HighlightMoment } from "./types";

export class Renderer {
  private TICKS_BEFORE_KILL = 200;

  public generateCFG(highlights: HighlightMoment[], outputPath: string): void {
    console.log(
      `[Renderer] Generating CFG for ${highlights.length} highlight moments...`,
    );

    let cfgContent = `// Auto-generated CFG for CS2 Demo Highlights\n\n`;
    cfgContent += `echo "============================================"\n`;
    cfgContent += `echo "  Highlight Moments Detected: ${highlights.length}"\n`;
    cfgContent += `echo "  Use keys [F5], [F6], [F7] and others for navigation"\n`;
    cfgContent += `echo "============================================"\n\n`;

    highlights.forEach((moment, idx) => {
      const fkey = 5 + idx;
      if (fkey > 12) return;

      const startTick = Math.max(0, moment.tick - this.TICKS_BEFORE_KILL);

      cfgContent += `// moment #${idx + 1}: ${moment.attacker.name} -> killed -> ${moment.victim.name} (${moment.angleDifference}°)\n`;

      cfgContent += `alias "moment_${idx + 1}" "demo_goto ${startTick}; spec_player ${moment.victim.name}; echo 'going to moment ${idx + 1} (POV: ${moment.victim.name})'"\n`;
      cfgContent += `bind "F${fkey}" "moment_${idx + 1}"\n\n`;
    });

    try {
      fs.writeFileSync(outputPath, cfgContent, "utf-8");
      console.log(`[Renderer] CFG successfully generated at: ${outputPath}`);
    } catch (error) {
      console.error(`[Renderer] Error writing CFG to ${outputPath}:`, error);
      throw error;
    }
  }

  public mergeClips(): void {
    const clipsDir = path.join(__dirname, "../raw_clips");
    const outputPath = path.join(__dirname, "../renderer.mp4");
    const listFilePath = path.join(__dirname, "../clips_list.txt");

    console.log(`[Renderer] Checking for clips in: ${clipsDir}`);

    if (!fs.existsSync(clipsDir)) {
      console.warn(
        `[Renderer] Clips directory not found: ${clipsDir}. Skipping merge.`,
      );
      return;
    }

    const files = fs
      .readdirSync(clipsDir)
      .filter((f) => f.endsWith(".mp4"))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      );

    if (files.length === 0) {
      console.warn(
        `[Renderer] No .mp4 clips found in ${clipsDir}. Skipping merge.`,
      );
      return;
    }

    console.log(
      `[Renderer] Found ${files.length} clips. Preparing list for ffmpeg...`,
    );

    const listContent = files
      .map((file) => `file '${path.join(clipsDir, file).replace(/\\/g, "/")}'`)
      .join("\n");
    fs.writeFileSync(listFilePath, listContent, "utf-8");

    const ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${listFilePath}" -c copy "${outputPath}" -y`;

    exec(ffmpegCmd, (error, stdout, stderr) => {
      if (fs.existsSync(listFilePath)) fs.unlinkSync(listFilePath);

      if (error) {
        console.error(
          "[Renderer] Error FFmpeg: Could not merge clips. Ensure FFmpeg is installed and in your PATH.",
          error.message,
        );
        return;
      }

      console.log(`\n=== FINAL RENDERING COMPLETE ===`);
      console.log(`Final video saved to: ${outputPath}`);
    });
  }
}
