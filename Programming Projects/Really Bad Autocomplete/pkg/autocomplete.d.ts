/* tslint:disable */
/* eslint-disable */
/**
 * @param {string} filename
 * @param {string} column_name
 * @returns {WASMTrie}
 */
export function create_trie(filename: string, column_name: string): WASMTrie;
/**
 * @param {string} csv_text
 * @param {string} column_name
 * @returns {WASMTrie}
 */
export function create_trie_from_csv_text(csv_text: string, column_name: string): WASMTrie;
/**
 * @returns {WASMAutoCompleteMemory}
 */
export function create_memory(): WASMAutoCompleteMemory;
/**
 * @param {string} word
 * @returns {WASMAutoCompleteMemory}
 */
export function create_memory_from_word(word: string): WASMAutoCompleteMemory;
/**
 * @param {WASMAutoCompleteMemory} memory
 * @param {string} word
 */
export function update_word(memory: WASMAutoCompleteMemory, word: string): void;
/**
 * @param {WASMAutoCompleteMemory} memory
 * @param {string} word
 */
export function update_and_reset_word(memory: WASMAutoCompleteMemory, word: string): void;
/**
 * @param {WASMTrie} trie
 * @param {WASMAutoCompleteMemory} memory
 * @param {number} amount
 * @returns {any}
 */
export function get_suggested_words(trie: WASMTrie, memory: WASMAutoCompleteMemory, amount: number): any;
export class WASMAutoCompleteMemory {
  free(): void;
}
export class WASMTrie {
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasmtrie_free: (a: number, b: number) => void;
  readonly __wbg_wasmautocompletememory_free: (a: number, b: number) => void;
  readonly create_trie: (a: number, b: number, c: number, d: number) => number;
  readonly create_trie_from_csv_text: (a: number, b: number, c: number, d: number) => number;
  readonly create_memory: () => number;
  readonly create_memory_from_word: (a: number, b: number) => number;
  readonly update_word: (a: number, b: number, c: number) => void;
  readonly update_and_reset_word: (a: number, b: number, c: number) => void;
  readonly get_suggested_words: (a: number, b: number, c: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
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
