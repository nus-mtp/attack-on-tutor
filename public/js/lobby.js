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