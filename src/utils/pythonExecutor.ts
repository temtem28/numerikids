// Pyodide loaded from CDN — not bundled
declare const loadPyodide: (config: { indexURL: string }) => Promise<any>;

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

let pyodideInstance: any = null;
let loadingPromise: Promise<any> | null = null;

export interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
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

export async function initializePyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    await ensurePyodideScript();
    pyodideInstance = await (window as any).loadPyodide({ indexURL: PYODIDE_CDN });
    loadingPromise = null;
    return pyodideInstance;
  })();

  return loadingPromise;
}

export async function executePythonCode(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();

  try {
    const pyodide = await initializePyodide();

    let output = '';
    let errorOutput = '';

    pyodide.setStdout({ batched: (text: string) => { output += text + '\n'; } });
    pyodide.setStderr({ batched: (text: string) => { errorOutput += text + '\n'; } });

    await pyodide.runPythonAsync(code);

    return {
      output: output.trim() || 'Code exécuté avec succès (aucune sortie)',
      error: errorOutput.trim() || null,
      executionTime: performance.now() - startTime,
    };
  } catch (error: any) {
    return {
      output: '',
      error: error.message || 'Erreur inconnue',
      executionTime: performance.now() - startTime,
    };
  }
}

export function isPyodideLoaded(): boolean {
  return pyodideInstance !== null;
}
