import init, { 
    create_trie_from_csv_text,
    create_memory,
    update_word,
    get_suggested_words
} from "./pkg/autocomplete.js";

import csv_text from './csv.js';
// I know this is bad but I need to see if this works first before making it better


let trie = undefined;

async function define_trie() {
    trie = create_trie_from_csv_text(
        csv_text,
         "word"
        );
    console.log("Trie generated... Start Typing now");
}

async function run() {
    await init();

    // let trie = create_trie_from_csv_text(
    //     csv_text,
    //      "word"
    //     );
    // console.log("Trie generated... Start Typing");

    let mem = create_memory();

    function update_output(e) {
        if (e.target.value.at(-1) == '\n') {
            e.target.value = e.target.value.slice(0, -1);
        }

        let words = e.target.value.split(" ");
        let word_to_update = words.at(-1);
        let l = word_to_update.length;
        update_word(mem, word_to_update);

        let suggestions = get_suggested_words(trie, mem, 5).word_vector;

        if (e.keyCode == 9) {// tab was pressed
            e.preventDefault();
            e.target.value += suggestions[0].substring(l);
            document.getElementById("autocomplete-text-show").innerText = "";
            return;
        }

        let output = "";

        
        // Replaces all the words with spaces
        output += ' '.repeat(e.target.value.length);

        if (!(suggestions[0] === undefined)) {
            // output += ' '.repeat(l);
            output += suggestions[0].substring(l);
        }

        while (output.length > 30) {
            output = output.substring(1);
            e.target.value = e.target.value.substring(1);
        }

        document.getElementById("autocomplete-text-show").innerText = output;
    }

    define_trie().then(() => {
        document.getElementById("autocomplete-input").addEventListener("input", update_output);
        document.getElementById("autocomplete-input").addEventListener("keydown", update_output);
    });
}

run()