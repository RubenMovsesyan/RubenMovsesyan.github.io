/* tslint:disable */
/* eslint-disable */
/**
 * @param {number} input
 * @param {number} ratio
 * @param {number} coffee_type
 * @returns {WASMOutput}
 */
export function calculate_coffee(input: number, ratio: number, coffee_type: number): WASMOutput;
/**
 * @param {number} input
 * @returns {number}
 */
export function oz_to_g(input: number): number;
/**
 * @param {number} input
 * @returns {number}
 */
export function g_to_oz(input: number): number;
export class WASMOutput {
  free(): void;
  output: number;
  output_with_grounds: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasmoutput_free: (a: number, b: number) => void;
  readonly __wbg_get_wasmoutput_output: (a: number) => number;
  readonly __wbg_set_wasmoutput_output: (a: number, b: number) => void;
  readonly __wbg_get_wasmoutput_output_with_grounds: (a: number) => number;
  readonly __wbg_set_wasmoutput_output_with_grounds: (a: number, b: number) => void;
  readonly calculate_coffee: (a: number, b: number, c: number) => number;
  readonly oz_to_g: (a: number) => number;
  readonly g_to_oz: (a: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
