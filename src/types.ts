export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface HighlightMoment {
  tick: number;
  roundNumber: number;
  formattedTime: string;

  victim: PlayerSnapshot;
  attacker: PlayerSnapshot;

  angleDifference: number;
  isStrictlyBack: boolean;
  checkHistorySeconds: number;
}

export interface RawDeathEvent {
  tick: number;
  event_name: "player_death";
  total_rounds_played: number;

  user_id?: string;
  attacker_steamid?: string;
  user_steamid?: string;
  user_name?: string;

  attacker_name?: string;
  attacker_user_id?: string;

  weapon: string;
  headshot: boolean;
  thrusmoke: boolean;
}

export interface RawPlayerTickState {
  tick: number;
  steamid: string;
  name: string;

  X: number;
  Y: number;
  Z: number;

  pitch: number;
  yaw: number;

  health: number;
  is_alive: boolean;
}

export interface PlayerSnapshot {
  steamid: string;
  name: string;
  position: Vector3D;
  yaw: number;
  pitch: number;
}
