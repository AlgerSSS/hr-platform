import { spawn } from "child_process";
import path from "path";

const BRIDGE_SCRIPT = path.resolve(
  process.cwd(),
  "../../packages/boss-bridge/boss_bridge.py"
);

const UV_PYTHON = path.resolve(
  process.cwd(),
  "../../../boss-cli/.venv/bin/python3"
);

export async function execBridge(args: string[]): Promise<{ ok: boolean; data?: unknown; error?: string; total?: number }> {
  return new Promise((resolve) => {
    const proc = spawn(UV_PYTHON, [BRIDGE_SCRIPT, ...args], {
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    proc.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

    proc.on("close", (code) => {
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch {
        resolve({
          ok: false,
          error: stderr || `Process exited with code ${code}. stdout: ${stdout}`,
        });
      }
    });

    proc.on("error", (err) => {
      resolve({ ok: false, error: err.message });
    });
  });
}
