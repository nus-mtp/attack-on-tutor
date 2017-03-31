var tutorials = [];

var logoutConfirmation = "Would You Like to Log Out?";
	
$("#logout").on
(
	"click",
	function(event)
	{
		Cookies.remove('token');
		location.reload();
	}
);

function syncIVLE() {
    $.ajax({
        method:'POST',
        url:'/api/dashboard/forceSyncIVLE',
        dataType:'json',
        success: function(data){
            if (data.success){
                console.log("Successful Sync");
                getTutorials();
            }
            else {  
                console.log('Failed Sync, Error: ' + data.message);
            }

        }
    });
}

function getTutorials() {
    $.ajax({
        type: 'POST',
        url: '/api/dashboard/getTutorials',
        data: { },
        dataType: 'json',
        success: function(data) {
            showTutorials(data.data);
        }
    });
}

function showTutorials(tuts) {
    for (i = 0; i < tuts.count; i++) {
        var tut = tuts.rows[i];
        tutorials.push(tut);
        $('#tutorials').append(tut.coursecode + " " + tut.coursename + " <button class='btn btn-primary' id='lobby-button' data-id='" + i + "' value='' name='tut-id'> Join Class </button><br><br>");
    }
}


$(document).on('click', '#lobby-button', function () {
    var index = $(this).attr('data-id');
    var tut = tutorials[index];
    $(this).attr('value', tut.id);
    $('#form').attr('action', 'lobby/'+tut.coursecode+'/'+tut.name);
});

syncIVLE();