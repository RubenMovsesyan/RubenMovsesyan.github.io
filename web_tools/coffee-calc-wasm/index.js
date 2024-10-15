import init, { calculate_coffee, g_to_oz, oz_to_g } from "./pkg/coffee_calc_wasm.js"

const CoffeeType = Object.freeze({
    Espresso: 0,
    PourOver: 1,
    FrenchPress: 2,
    Jazzve: 3
});

const Unit = Object.freeze({
    Gram: 0,
    Ounce: 1
});

let current_coffee_type = CoffeeType.Espresso;

let input_unit = Unit.Gram;
let output_unit = Unit.Gram;

async function run() {
    await init();
    function calc_coffee() {
        let input_grams = parseInt(document.getElementById("input-weight").value);
        const ratio = parseInt(document.getElementById("ratio").value);

        if (input_unit == Unit.Ounce) {
            input_grams = Math.floor(oz_to_g(input_grams));
        }

        let {output, output_with_grounds} = calculate_coffee(input_grams, ratio, current_coffee_type);

        if (output_unit == Unit.Ounce) {
            output = g_to_oz(output).toFixed(2);
            output_with_grounds = g_to_oz(output_with_grounds).toFixed(2);
        }

        document.getElementById('output-weight').innerText = `Output weight: ${output}`;
        if (current_coffee_type != CoffeeType.Espresso) {
            document.getElementById('output-weight-with-grounds').innerText = `With grounds: ${output_with_grounds}`;
        } else {
            document.getElementById('output-weight-with-grounds').innerText = ``;
        }
    }

    let label = document.getElementById('input-label');

    function change_calculator(e) {
        let ratio = document.getElementById('ratio');
        switch (e.target.value) {
            case 'espresso':
                current_coffee_type = CoffeeType.Espresso;
                label.innerHTML = `
                    Espresso Ratio
                `;
                ratio.outerHTML = `
                    <input type="number" id="ratio" value="2">
                `;
                break;
            case 'pour-over':
                current_coffee_type = CoffeeType.PourOver;
                label.innerHTML = `
                    Pour Over Ratio
                `;
                ratio.outerHTML = `
                    <input type="number" id="ratio" value="15">
                `;
                break;
            case 'french-press':
                current_coffee_type = CoffeeType.FrenchPress;
                label.innerHTML = `
                    French Press Ratio
                `;
                ratio.outerHTML = `
                    <input type="number" id="ratio" value="15">
                `;
                break;
            case 'jazzve':
                current_coffee_type = CoffeeType.Jazzve;
                label.innerHTML = `
                    Jazzve Ratio
                `;
                ratio.outerHTML = `
                    <input type="number" id="ratio" value="10">
                `;
                break;
        }
    }

    function change_input_unit(e) {
        switch (e.target.value) {
            case 'g':
                input_unit = Unit.Gram;
                break;
            case 'oz':
                input_unit = Unit.Ounce;
                break;
        }
    }

    function change_output_unit(e) {
        switch (e.target.value) {
            case 'g':
                output_unit = Unit.Gram;
                break;
            case 'oz':
                output_unit = Unit.Ounce;
                break;
        }
    }

    let calculator_selector = document.getElementById('coffee-types');

    let input_unit_selector = document.getElementById('input-unit-selector');
    let output_unit_selector = document.getElementById('output-unit-selector');

    
    calculator_selector.addEventListener('change', change_calculator);
    input_unit_selector.addEventListener('change', change_input_unit);
    output_unit_selector.addEventListener('change', change_output_unit);

    document.getElementById('calculate-button').addEventListener('click', calc_coffee);
}

run();