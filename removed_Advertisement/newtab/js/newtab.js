(function () {
    var morphSearch = $(".search").context;
    input = morphSearch.querySelector('input.search-input');
    isOpen = isAnimating = false;
    input.focus();
    input.addEventListener('blur', function (ev) {
    });
    input.addEventListener('input', Baidusearch, false);
    input.addEventListener('keydown', function (ev) {
        var keyCode = ev.keyCode || ev.which;
        if (keyCode == 13) {
            $("#baidusearch").children().remove();
        }
        ;
        if (keyCode == 40) {
            var select = $("#baidusearch").children();
            var noselect = true;
            for (var i = 0; i != select.length; i++) {
                if (select[i].id == "selected") {
                    select[i].id = "";
                    if (i + 1 == select.length) {
                        select[0].id = "selected";
                        input.value = select[0].text;
                        noselect = false;
                    } else {
                        select[i + 1].id = "selected";
                        input.value = select[i + 1].text;
                        noselect = false;
                    }
                    break;
                }
            }
            ;
            if (noselect) {
                select[0].id = "selected";
                input.value = select[0].text;
            }
            ;
        }
        if (keyCode == 38) {
            var select = $("#baidusearch").children();
            for (var i = select.length - 1; i >= 0; i--) {
                if (select[i].id == "selected") {
                    select[i].id = "";
                    if (i - 1 < 0) {
                        select[select.length - 1].id = "selected";
                        input.value = select[select.length - 1].text;
                    } else {
                        select[i - 1].id = "selected";
                        input.value = select[i - 1].text;
                    }
                    break;
                }
                ;
            }
            ;
        }
        ;
    });
})();