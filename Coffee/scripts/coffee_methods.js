window.onload = function() {
    console.log('Hello');

    var coffee_methods_container = document.getElementById('coffee-methods-container');
    var porta = document.getElementById('porta-box');
    var pour = document.getElementById('pour-box');
    var french = document.getElementById('french-box');
    var jazzve = document.getElementById('jazzve-box');
    var coffee_methods_text = document.getElementById('coffee-method-text');

    // coffee_methods_container.addEventListener('mouseenter', function() {
    //     console.log("Hello");
    //     coffee_methods_text.innerHTML = "Inside";
    // });

    porta.addEventListener('mouseenter', function() {
        coffee_methods_text.innerHTML = "Espresso";
    });

    pour.addEventListener('mouseenter', function() {
        coffee_methods_text.innerHTML = "Pour Over";
    });

    french.addEventListener('mouseenter', function() {
        coffee_methods_text.innerHTML = "French Press";
    });

    jazzve.addEventListener('mouseenter', function() {
        coffee_methods_text.innerHTML = "Jazzve";
    });



    coffee_methods_container.addEventListener('mouseleave', function() {
        coffee_methods_text.innerHTML = "";
    });
}