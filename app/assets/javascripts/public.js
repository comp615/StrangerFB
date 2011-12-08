$(document).ready( function() {
	adjustContainer();
	$("#mit-click").click(function() {
		//TODO: This could be a lot prettier :)
		$("#mit").toggle();
		adjustContainer();
	});
});

function adjustContainer() {
	var h = $('#static_page').outerHeight();
	h = ( h < 400 ) ? 400 : h;
	$('#container').animate({'height' : h + 'px'}, 300);
}