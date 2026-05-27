// Pyodide loaded from CDN — not bundled
const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

export interface DebugState {
  line: number;
  variables: Record<string, any>;
  callStack: CallFrame[];
  output: string;
  error?: string;
}

export interface CallFrame {
  name: string;
  line: number;
  locals: Record<string, any>;
}

async function ensurePyodideScript(): Promise<void> {
  if (typeof (window as any).loadPyodide !== 'undefined') return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `${PYODIDE_CDN}pyodide.js`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Pyodide script'));
    document.head.appendChild(s);
  });
}

export class PythonDebugger {
  private pyodide: any = null;
  private breakpoints: Set<number> = new Set();
  private states: DebugState[] = [];
  private currentStateIndex: number = -1;

  async initialize() {
    if (!this.pyodide) {
      await ensurePyodideScript();
      this.pyodide = await (window as any).loadPyodide({ indexURL: PYODIDE_CDN });
    }
  }

  setBreakpoints(lines: number[]) {
    this.breakpoints = new Set(lines);
  }

  async instrumentAndRun(code: string): Promise<void> {
    await this.initialize();
    this.states = [];
    this.currentStateIndex = -1;

    const lines = code.split('\n');
    const instrumented: string[] = [
      'import sys',
      'import io',
      'import json',
      '_debug_states = []',
      '_output = io.StringIO()',
      'sys.stdout = _output',
      '',
    ];

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      if (line.trim() && !line.trim().startsWith('#')) {
        instrumented.push(
          `_debug_states.append({"line": ${lineNum}, "vars": {k: str(v) for k, v in locals().items() if not k.startswith("_")}})`
        );
      }
      instrumented.push(line);
    });

    instrumented.push('');
    instrumented.push('sys.stdout = sys.__stdout__');
    instrumented.push('_result = {"states": _debug_states, "output": _output.getvalue()}');

    try {
      await this.pyodide.runPythonAsync(instrumented.join('\n'));
      const result = this.pyodide.globals.get('_result').toJs();

      const output = result.get('output') || '';
      const statesArray = result.get('states');

      if (statesArray) {
        for (let i = 0; i < statesArray.length; i++) {
          const state = statesArray[i].toJs();
          const vars: Record<string, any> = {};
          const varsMap = state.get('vars');
          if (varsMap) {
            for (const [key, value] of varsMap.entries()) {
              vars[key] = value;
            }
          }
          this.states.push({
            line: state.get('line'),
            variables: vars,
            callStack: [],
            output,
          });
        }
      }
    } catch (error: any) {
      this.states.push({
        line: 0,
        variables: {},
        callStack: [],
        output: '',
        error: error.message,
      });
    }
  }

  getCurrentState(): DebugState | null {
    return this.states[this.currentStateIndex] || null;
  }

  canStepForward(): boolean {
    return this.currentStateIndex < this.states.length - 1;
  }

  canStepBackward(): boolean {
    return this.currentStateIndex > 0;
  }

  stepForward(): DebugState | null {
    if (this.canStepForward()) {
      this.currentStateIndex++;
      return this.getCurrentState();
    }
    return null;
  }

  stepBackward(): DebugState | null {
    if (this.canStepBackward()) {
      this.currentStateIndex--;
      return this.getCurrentState();
    }
    return null;
  }

  reset() {
    this.currentStateIndex = -1;
  }
}
