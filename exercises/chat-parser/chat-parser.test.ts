import { describe, expect, it } from "vitest";
import { parseLog, stats, type ChatEvent } from "./chat-parser.ts";

const LOG = [
  "[2026-10-06T19:22:01Z] <lumen> welcome in everyone :wave:",
  "[2026-10-06T19:22:04Z] <nova_fan> @lumen hi! :wave: :heart:",
  "[2026-10-06T19:22:09Z] * nova raided with 120 viewers",
  "[2026-10-06T19:23:10Z] /timeout spammer 600 links in chat",
  "[2026-10-06T19:23:12Z] /ban spammer2",
  "[2026-10-06T19:23:15Z] /delete m-1042",
  "[2026-10-06T19:23:20Z] * orbit followed",
].join("\n");

const at = (time: string) => new Date(`2026-10-06T${time}Z`);

describe("parseLog", () => {
  it("parses every kind of event", () => {
    const { events, errors } = parseLog(LOG);
    expect(errors).toEqual([]);
    expect(events).toEqual<ChatEvent[]>([
      {
        kind: "message",
        at: at("19:22:01"),
        login: "lumen",
        text: "welcome in everyone :wave:",
        mentions: [],
        emotes: ["wave"],
      },
      {
        kind: "message",
        at: at("19:22:04"),
        login: "nova_fan",
        text: "@lumen hi! :wave: :heart:",
        mentions: ["lumen"],
        emotes: ["wave", "heart"],
      },
      { kind: "raid", at: at("19:22:09"), from: "nova", viewers: 120 },
      {
        kind: "timeout",
        at: at("19:23:10"),
        login: "spammer",
        seconds: 600,
        reason: "links in chat",
      },
      { kind: "ban", at: at("19:23:12"), login: "spammer2", reason: null },
      { kind: "delete", at: at("19:23:15"), messageId: "m-1042" },
      { kind: "follow", at: at("19:23:20"), login: "orbit" },
    ]);
  });

  it("returns nothing for empty input and skips blank lines", () => {
    expect(parseLog("")).toEqual({ events: [], errors: [] });
    expect(parseLog("\n  \n").events).toEqual([]);
  });

  it("accepts Windows line endings, trailing spaces and repeated spaces", () => {
    const text =
      "[2026-10-06T19:22:01Z] <lumen> hi   \r\n[2026-10-06T19:22:02Z] /timeout   bot   30\r\n";
    const { events, errors } = parseLog(text);
    expect(errors).toEqual([]);
    expect(events[0]).toMatchObject({ kind: "message", text: "hi" });
    expect(events[1]).toMatchObject({
      kind: "timeout",
      login: "bot",
      seconds: 30,
      reason: null,
    });
  });

  it("reports errors with line numbers and keeps parsing", () => {
    const text = [
      "[2026-10-06T19:22:01Z] <lumen> ok",
      "no timestamp here",
      "[2026-13-06T19:22:01Z] <lumen> bad month",
      "[2026-10-06T19:22:01Z] <X> bad login",
      "[2026-10-06T19:22:01Z] /mod lumen",
      "[2026-10-06T19:22:01Z] /timeout lumen",
      "[2026-10-06T19:22:01Z] /timeout lumen -5",
      "[2026-10-06T19:22:01Z] /timeout lumen soon",
      "[2026-10-06T19:22:01Z] * nova raided with many viewers",
      "[2026-10-06T19:22:01Z] * something odd",
      "[2026-10-06T19:22:01Z] <lumen> still ok",
    ].join("\n");
    const { events, errors } = parseLog(text);
    expect(events).toHaveLength(2);
    expect(errors.map((e) => [e.line, e.reason])).toEqual([
      [2, "bad-timestamp"],
      [3, "bad-timestamp"],
      [4, "bad-login"],
      [5, "unknown-command"],
      [6, "missing-argument"],
      [7, "bad-number"],
      [8, "bad-number"],
      [9, "bad-number"],
      [10, "unrecognised"],
    ]);
    expect(errors[0]?.raw).toBe("no timestamp here");
  });
});

describe("stats", () => {
  it("summarises the log", () => {
    const extra =
      "\n[2026-10-06T19:24:00Z] <nova_fan> :heart: :heart:\n[2026-10-06T19:24:30Z] <nova_fan> gg";
    const result = stats(parseLog(LOG + extra).events);
    expect(result).toEqual({
      messagesByLogin: [
        ["nova_fan", 3],
        ["lumen", 1],
      ],
      topEmotes: [
        ["heart", 3],
        ["wave", 2],
      ],
      uniqueChatters: 2,
      raidViewers: 120,
      busiestMinute: "19:22",
    });
  });

  it("handles no events", () => {
    expect(stats([])).toEqual({
      messagesByLogin: [],
      topEmotes: [],
      uniqueChatters: 0,
      raidViewers: 0,
      busiestMinute: null,
    });
  });
});
