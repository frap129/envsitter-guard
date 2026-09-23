import assert from "node:assert/strict";
import test from "node:test";

import EnvSitterGuard from "../index.js";

import type { ToolExecuteBeforeHook } from "./helpers.js";

import { createFakeContext, createTmpDir } from "./helpers.js";

async function getBeforeHook(params: { directory: string; worktree: string }): Promise<{ hook: ToolExecuteBeforeHook }> {
    const fake = createFakeContext(params);
    await EnvSitterGuard.setup(fake.ctx);
    return { hook: fake.getBeforeHook() };
}

test("blocks reading .env", async () => {
    const worktree = await createTmpDir();
    const { hook } = await getBeforeHook({ directory: worktree, worktree });

    await assert.rejects(
        () => hook({ tool: "read", sessionID: "s", agent: "a", messageID: "m", id: "c", input: { path: ".env" } }),
        (err: unknown) => err instanceof Error && err.message.includes("Reading `.env*` is blocked"),
    );
});

test("allows reading .env.example", async () => {
    const worktree = await createTmpDir();
    const { hook } = await getBeforeHook({ directory: worktree, worktree });

    await hook({ tool: "read", sessionID: "s", agent: "a", messageID: "m", id: "c", input: { path: ".env.example" } });
});

test("blocks editing .env", async () => {
    const worktree = await createTmpDir();
    const { hook } = await getBeforeHook({ directory: worktree, worktree });

    await assert.rejects(
        () => hook({ tool: "edit", sessionID: "s", agent: "a", messageID: "m", id: "c", input: { path: ".env" } }),
        (err: unknown) => err instanceof Error && err.message.includes("Editing `.env*"),
    );
});

test("blocks .envsitter/pepper", async () => {
    const worktree = await createTmpDir();
    const { hook } = await getBeforeHook({ directory: worktree, worktree });

    await assert.rejects(
        () =>
            hook({
                tool: "read",
                sessionID: "s",
                agent: "a",
                messageID: "m",
                id: "c",
                input: { path: ".envsitter/pepper" },
            }),
        (err: unknown) => err instanceof Error && err.message.includes("blocked"),
    );
});

test("strips @ prefix in filePath", async () => {
    const worktree = await createTmpDir();
    const { hook } = await getBeforeHook({ directory: worktree, worktree });

    await assert.rejects(
        () => hook({ tool: "read", sessionID: "s", agent: "a", messageID: "m", id: "c", input: { path: "@.env" } }),
        (err: unknown) => err instanceof Error && err.message.includes("Reading `.env*` is blocked"),
    );
});

test("blocking is silent (no toasts)", async () => {
    const worktree = await createTmpDir();
    const { hook } = await getBeforeHook({ directory: worktree, worktree });

    await assert.rejects(() =>
        hook({ tool: "read", sessionID: "s", agent: "a", messageID: "m", id: "c", input: { path: ".env" } }),
    );
    await assert.rejects(() =>
        hook({ tool: "read", sessionID: "s", agent: "a", messageID: "m", id: "c", input: { path: ".env" } }),
    );
});

test("blocks grep targeting .env", async () => {
    const worktree = await createTmpDir();
    const { hook } = await getBeforeHook({ directory: worktree, worktree });

    await assert.rejects(
        () =>
            hook({
                tool: "grep",
                input: { pattern: "KEY", path: ".env" },
            }),
        (err: unknown) => err instanceof Error && err.message.includes("blocked"),
    );
});

test("blocks grep with env-matching include pattern", async () => {
    const worktree = await createTmpDir();
    const { hook } = await getBeforeHook({ directory: worktree, worktree });

    await assert.rejects(
        () =>
            hook({
                tool: "grep",
                input: { pattern: "KEY", include: ".env*" },
            }),
        (err: unknown) => err instanceof Error && err.message.includes("blocked"),
    );
});

test("allows ordinary grep", async () => {
    const worktree = await createTmpDir();
    const { hook } = await getBeforeHook({ directory: worktree, worktree });

    await hook({ tool: "grep", input: { pattern: "KEY", include: "*.ts" } });
});

test("blocks patch targeting .env via patchText", async () => {
    const worktree = await createTmpDir();
    const { hook } = await getBeforeHook({ directory: worktree, worktree });

    await assert.rejects(
        () =>
            hook({
                tool: "patch",
                input: {
                    patchText: "*** Update File: .env\n@@\n-OLD=1\n+NEW=2\n",
                },
            }),
        (err: unknown) => err instanceof Error && err.message.includes("blocked"),
    );
});

test("blocks patch moving .env to a non-env name", async () => {
    const worktree = await createTmpDir();
    const { hook } = await getBeforeHook({ directory: worktree, worktree });

    await assert.rejects(
        () =>
            hook({
                tool: "patch",
                input: {
                    patchText: "*** Move File: .env -> env-backup.txt\n",
                },
            }),
        (err: unknown) => err instanceof Error && err.message.includes("blocked"),
    );
});
