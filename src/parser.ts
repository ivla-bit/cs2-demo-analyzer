import { RawDeathEvent, RawPlayerTickState } from "./types";
import { parseEvents, parseTicks } from "@laihoe/demoparser2";
export class DemoParser {
  private demopath: string;

  constructor(demopath: string) {
    this.demopath = demopath;
  }

  public getDeathEvents(): RawDeathEvent[] {
    try {
      console.log(`[Parser] Reading player_death events from ${this.demopath}`);

      const events = parseEvents(
        this.demopath,
        ["player_death"],
        [
          "user_steamid",
          "attacker_steamid",
          "weapon",
          "total_rounds_played",
          "user_name",
          "attacker_name",
        ],
      );

      console.log(
        `[Parser] Found ${events.length} player_death events in ${this.demopath}`,
      );

      return events as unknown as RawDeathEvent[];
    } catch (error) {
      console.error(`[Parser] Error parsing ${this.demopath}:`, error);
      throw error;
    }
  }

  public getPlayerStates(ticks: number[]): RawPlayerTickState[] {
    if (ticks.length === 0) {
      console.warn(
        `[Parser] No ticks provided for getPlayerStates in ${this.demopath}`,
      );
      return [];
    }

    try {
      console.log(
        `[Parser] Reading player tick states for ticks ${ticks.join(", ")} from ${this.demopath}`,
      );

      const uniqueTicks = Array.from(new Set(ticks));

      const states = parseTicks(
        this.demopath,
        ["X", "Y", "Z", "pitch", "yaw", "health", "is_alive"],
        uniqueTicks,
      );

      console.log(
        `[Parser] Found ${states.length} player tick states for ticks ${ticks.join(", ")} in ${this.demopath}`,
      );

      return states as unknown as RawPlayerTickState[];
    } catch (error) {
      console.error(
        `[Parser] Error parsing player states for ticks ${ticks.join(", ")} in ${this.demopath}:`,
        error,
      );
      throw error;
    }
  }
}
