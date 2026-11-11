import { describe, expect, it } from "vitest";
import { hashPassword, passwordProblem, sha256Hex, verifyPassword } from "./password";
import { DEMO_PASSWORD } from "../db/seed";

describe("passwords", () => {
  it("hashes with a random salt and verifies only the right password", async () => {
    const a = await hashPassword("correct horse battery");
    const b = await hashPassword("correct horse battery");
    expect(a).not.toBe(b);
    expect(a.startsWith("pbkdf2-sha256$100000$")).toBe(true);
    expect(await verifyPassword("correct horse battery", a)).toBe(true);
    expect(await verifyPassword("correct horse batterY", a)).toBe(false);
    expect(await verifyPassword("anything", "garbage")).toBe(false);
  });

  it("the precomputed demo hash matches the demo password", async () => {
    const seed = await import("../db/seed");
    const stmt = seed.buildSeedStatements("2026-11-12").find((s) => s.startsWith("INSERT INTO credentials"))!;
    const hash = stmt.match(/'(pbkdf2-sha256\$[^']+)'/)![1]!;
    expect(await verifyPassword(DEMO_PASSWORD, hash)).toBe(true);
  });

  it("explains weak passwords in plain words", () => {
    expect(passwordProblem("short")).toMatch(/10 characters/);
    expect(passwordProblem("aaaaaaaaaaaa")).toMatch(/repeated/);
    expect(passwordProblem("1234567890")).toMatch(/common/);
    expect(passwordProblem("mango season in udupi")).toBeNull();
  });

  it("fingerprints tokens with SHA-256", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});
