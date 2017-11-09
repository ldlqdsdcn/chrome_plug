var keyinput = null;
Baidusearch = function (key) {
    var keyword = key.target.value;
    keyinput = key.target;
    var url = "http://suggestion.baidu.com/su?wd=" + keyword;
    getsearchsg(keyword);
}
function getsearchsg(q) {
    var dataObj = null;
    var Lang = navigator.language;
    $.ajax({
        url: "http://suggestion.baidu.com/su?wd=" + encodeURIComponent(q) + "&p=3&t=" + new Date().getTime() + "&cb=cbackc",
        dataType: 'text',
        error: function () {
            $("#baidusearch").children().remove();
        },
        success: function (data) {
            try {
                data = data.match(/cbackc\((.*)\);/)[1];
                data = data.replace("q:", "\"q\":");
                data = data.replace("p:", "\"p\":");
                data = data.replace("s:", "\"s\":");
                data = JSON.parse(data);
                var sg = data.s.length;
                if (sg > 0) {
                    $("#baidusearch").children().remove();
                    for (var i = 0; i < sg; i++) {
                        if (i == 8) {
                            break;
                        }
                        $("#baidusearch").append('<a class="dummy-media-object" target="_blank" href="http://www.baidu.com/s?wd=' + data.s[i] + '" class="thesearchsg"><h3>' + data.s[i] + '</h3></a>');
                    }
                    ;
                } else {
                    $("#baidusearch").children().remove();
                }
            } catch (err) {
            }
        }
    });
}