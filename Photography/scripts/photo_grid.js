const NUM_COLUMNS = 3;
var photos_array = [];

async function fetch_photo_data() {
    await fetch('./res/photos.json')
        .then((response) => response.json())
        .then((json) => {
            photos_array = json.photos;
        });
}

// This needs to be both here and in the document ready function to work :'(
fetch_photo_data();

$(document).ready(async function() {
    await fetch_photo_data();
    var num_rows = photos_array.length / NUM_COLUMNS;

    for(var i = 0; i < num_rows; i++) {
        $('#photo-grid').append("<div class='photo-row'></div>");
    }

    $('.photo-row').each(function(i) {
        var curr_photo = photos_array[0];
        for (var j = 0; j < NUM_COLUMNS; j++) {
            curr_photo = photos_array[(NUM_COLUMNS * i) + j];
            if ((NUM_COLUMNS * i) + j >= photos_array.length) {
                break;
            }
            $(this).append(
                `<a class='photo-square' href='${curr_photo.href}'>
                    <img src='${curr_photo.image}'/>
                </a>`);
        }
    });

    $('photo-square').each(function(i) {
        console.log(photos_array[i]);
        $(this).append('${photos_array[i]}');
    });
});