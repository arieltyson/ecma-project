// Project: Chat Log Parser
// https://arieltyson.github.io/ecma-project/lessons/javascript/project-chat-parser/
//
// The types below are the specification the tests check against. Read
// them first, then implement parseLog and stats.

export type ChatEvent =
  | {
      readonly kind: "message";
      readonly at: Date;
      readonly login: string;
      readonly text: string;
      readonly mentions: readonly string[];
      readonly emotes: readonly string[];
    }
  | {
      readonly kind: "raid";
      readonly at: Date;
      readonly from: string;
      readonly viewers: number;
    }
  | { readonly kind: "follow"; readonly at: Date; readonly login: string }
  | {
      readonly kind: "timeout";
      readonly at: Date;
      readonly login: string;
      readonly seconds: number;
      readonly reason: string | null;
    }
  | {
      readonly kind: "ban";
      readonly at: Date;
      readonly login: string;
      readonly reason: string | null;
    }
  | { readonly kind: "delete"; readonly at: Date; readonly messageId: string };

export type ErrorReason =
  | "bad-timestamp"
  | "bad-login"
  | "unknown-command"
  | "missing-argument"
  | "bad-number"
  | "unrecognised";

export interface ParseError {
  /** 1-based line number in the input. */
  readonly line: number;
  readonly raw: string;
  readonly reason: ErrorReason;
}

export interface ParseResult {
  readonly events: readonly ChatEvent[];
  readonly errors: readonly ParseError[];
}

export interface Stats {
  /** Sorted by count descending, then login ascending. */
  readonly messagesByLogin: readonly (readonly [
    login: string,
    count: number,
  ])[];
  /** At most five, sorted by count descending, then name ascending. */
  readonly topEmotes: readonly (readonly [emote: string, count: number])[];
  readonly uniqueChatters: number;
  readonly raidViewers: number;
  /** "HH:MM" in UTC with the most messages, the earliest on ties, or null. */
  readonly busiestMinute: string | null;
}

export function parseLog(text: string): ParseResult {
  void text;
  throw new Error("Not implemented");
}

export function stats(events: readonly ChatEvent[]): Stats {
  void events;
  throw new Error("Not implemented");
}
