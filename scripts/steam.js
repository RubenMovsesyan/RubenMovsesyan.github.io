(function() {
    "use strict";

    var i = 0;
    for(; i < 10; i++) {
        setTimeout(function addSmoke() {
            var smoke_classes = ['smoke1', 'smoke2', 'smoke3'];

            var
                time = Math.random() * 1000 + 3000,
                smoke = $('<div />', {
                    class: smoke_classes[~~(Math.random() * smoke_classes.length)],
                    css: {
                        opacity: 0,
                        left: Math.random() * ($('#steam').width() - $('.smoke1').width())
                    }
                });
            
            $(smoke).appendTo('#steam')

            $.when(
                $(smoke).animate({
                    opacity: 1
                }, {
                    duration: time / 2,
                    easing: 'linear',
                    queue: false,

                    complete: function() {
                        $(smoke).animate({
                            opacity: 0
                        }, {
                            duration: time / 2,
                            easing: 'linear',
                            queue: false
                        });
                    }
                }),

                $(smoke).animate({
                    bottom: $('#steam').height()
                }, {
                    duration: time,
                    easing: 'linear',
                    queue: false
                })
            ).then(function() {
                $(smoke).remove();
                addSmoke();
            });
        }, Math.random() * 10000);
    }
}());