var flash = false;
var camera = document.getElementById("camera");
var hover_button = document.getElementsByClassName("photography-background")[0];
var timeout_id;

hover_button.addEventListener("mouseover", function() {
    flash = true;
    var images_array = [1, 2, 3];

    timeout_id = setTimeout(function() {
        (function flash_loop(i) {
            setTimeout(function() {
                if (flash) {
                    var random_elem_ind = Math.floor(Math.random() * images_array.length);
                    document.getElementById("flash").style.backgroundImage = "url(./images/flash_" + images_array[random_elem_ind] + ".png)";
                    images_array.splice(random_elem_ind, 1);
                }

                if (--i) flash_loop(i);
            }, 150)
        }) (3);

        setTimeout(function() {
            document.getElementById("flash").style.backgroundImage = "";
        }, 600);
    }, 600);
});

hover_button.addEventListener("mouseout", function() {
    flash = false;
    document.getElementById("flash").style.backgroundImage = "";
    if (timeout_id) {
        clearTimeout(timeout_id);
    }
})