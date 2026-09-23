import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { Plugin } from "@opencode/plugin";

export type ToolInfo = {
    name: string;
    description: string;
    input: unknown;
    execute: (input: unknown) => Promise<{ content: string }>;
};

type ToolExecuteBeforeEvent = {
    tool: string;
    input: unknown;
    sessionID?: string;
    agent?: string;
    messageID?: string;
    id?: string;
};

export type ToolExecuteBeforeHook = (event: ToolExecuteBeforeEvent) => Promise<void>;

type FakePluginContext = {
    ctx: Parameters<Plugin.Plugin["setup"]>[0];
    tools: Record<string, ToolInfo>;
    getBeforeHook: () => ToolExecuteBeforeHook;
};

export async function createTmpDir(): Promise<string> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "envsitter-guard-"));
    return dir;
}

export function createFakeContext(params: { directory: string; worktree: string }): FakePluginContext {
    const tools: Record<string, ToolInfo> = {};
    let beforeHook: ToolExecuteBeforeHook | undefined;

    const ctx = {
        location: {
            directory: params.directory,
            project: { directory: params.worktree, canonical: params.worktree },
        },
        tool: {
            transform: async (callback: (editor: { add: (tool: ToolInfo) => void }) => void) => {
                callback({
                    add: (tool: ToolInfo) => {
                        tools[tool.name] = tool;
                    },
                });
            },
            hook: async (name: string, callback: ToolExecuteBeforeHook) => {
                if (name === "execute.before") {
                    beforeHook = callback;
                }
                return { dispose: async () => undefined };
            },
        },
    } as unknown as Parameters<Plugin.Plugin["setup"]>[0]; // fake Context: only location/tool are exercised by these tests; the remaining domains are intentionally omitted

    return {
        ctx,
        tools,
        getBeforeHook() {
            if (!beforeHook) throw new Error("plugin did not register execute.before hook");
            return beforeHook;
        },
    };
}
