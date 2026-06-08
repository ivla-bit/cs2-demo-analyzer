import {
  RawDeathEvent,
  RawPlayerTickState,
  HighlightMoment,
  Vector3D,
} from "./types";

export class DemoAnalyzer {
  public analyze(
    deaths: RawDeathEvent[],
    states: RawPlayerTickState[],
  ): HighlightMoment[] {
    console.log(`[Analyzer] Beggining analysis of death geometry...`);

    const statesByTick = this.groupStatesByTick(states);
    const highlights: HighlightMoment[] = [];

    for (const death of deaths) {
      if (
        !death.attacker_steamid ||
        !death.user_steamid ||
        death.attacker_steamid === death.user_steamid
      ) {
        continue;
      }

      const tickData = statesByTick.get(death.tick);
      if (!tickData) continue;

      const victimState = tickData.get(death.user_steamid);
      const attackerState = tickData.get(death.attacker_steamid);

      if (!victimState || !attackerState) continue;

      const mathResult = this.calculateAngleDifference(
        { x: victimState.X, y: victimState.Y, z: victimState.Z },
        { x: attackerState.X, y: attackerState.Y, z: attackerState.Z },
        victimState.yaw,
      );

      if (mathResult.angleDifference > 70) {
        highlights.push({
          tick: death.tick,
          roundNumber: death.total_rounds_played,
          formattedTime: `Round ${death.total_rounds_played} (Tick: ${death.tick})`,
          victim: {
            steamid: death.user_steamid,
            name: death.user_name || "Unknown",
            position: { x: victimState.X, y: victimState.Y, z: victimState.Z },
            yaw: victimState.yaw,
            pitch: victimState.pitch,
          },
          attacker: {
            steamid: death.attacker_steamid,
            name: death.attacker_name || "Unknown",
            position: {
              x: attackerState.X,
              y: attackerState.Y,
              z: attackerState.Z,
            },
            yaw: attackerState.yaw,
            pitch: attackerState.pitch,
          },
          angleDifference: Math.round(mathResult.angleDifference),
          isStrictlyBack: mathResult.angleDifference > 135,
          checkHistorySeconds: 0,
        });
      }
    }
    console.log(
      `[Analyzer] Analysis complete. Found ${highlights.length} highlight moments.`,
    );
    return highlights;
  }

  private groupStatesByTick(
    states: RawPlayerTickState[],
  ): Map<number, Map<string, RawPlayerTickState>> {
    const map = new Map<number, Map<string, RawPlayerTickState>>();

    for (const state of states) {
      if (!map.has(state.tick)) {
        map.set(state.tick, new Map<string, RawPlayerTickState>());
      }
      map.get(state.tick)!.set(state.steamid, state);
    }
    return map;
  }

  private calculateAngleDifference(
    victimPos: Vector3D,
    attackerPos: Vector3D,
    victimYaw: number,
  ) {
    const dirX = attackerPos.x - victimPos.x;
    const dirY = attackerPos.y - victimPos.y;

    const yawRad = (victimYaw * Math.PI) / 180;

    const lookX = Math.cos(yawRad);
    const lookY = Math.sin(yawRad);

    const distance = Math.hypot(dirX, dirY);
    if (distance === 0) return { angleDifference: 0 };

    const normDirX = dirX / distance;
    const normDirY = dirY / distance;

    const dotProduct = lookX * normDirX + lookY * normDirY;

    const clampedDot = Math.max(-1, Math.min(1, dotProduct));

    const angleDifference = (Math.acos(clampedDot) * 180) / Math.PI;

    return { angleDifference };
  }
}
