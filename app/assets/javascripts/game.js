// Code for Game Controller


/*----------------------------------------------------------------------------------------
Splash Page
------------------------------------------------------------------------------------------*/
$(document).ready( function() {
    
    //Facebook Login Code
    fb_connect($("#fb_login"), loginSuccess);
      
});

function loginSuccess() { 
    $('#instructions').show();
    var h = $('#splash').outerHeight();
    $('#splash').animate({ marginTop: h*-1 }, 800, function(){
        $('#splash').hide();
    });
}


function fb_connect(obj, success_function) {
	var click_fn = function() {
		$(this).find("span.button-text").html("Logging you in...");
    	
		FB.login(function(response){
		  if (response.session) {
		    if (response.perms) {
		      // user is logged in and granted some permissions.
		      // perms is a comma separated list of granted permissions
		      success_function.call(obj);
		    } else {
		      // user is logged in, but did not grant any permissions
  			  $(this).find("span.button-text").html("Connect with Facebook");
		      alert('We need some more permissions to proceed!');
		    }
		  } else {
		    // user is not logged in
		     $(this).find("span").html("Connect with Facebook");
		     alert('Facebook login failed, please try again!');
		  }
		}, {perms:' user_birthday, user_education_history, user_hometown, user_location, \
		            friends_birthday, friends_education_history, friends_hometown, friends_location, \
		            friends_work_history, offline_access'}
		);
	}
	$(obj).click(click_fn);
}
/*----------------------------------------------------------------------------------------
Instructions Page
------------------------------------------------------------------------------------------*/
$(document).ready( function() {
    
   $('#start_button').click(function(){
       $('#game').show();
       //showNextFriend();
       var h = $('#instructions').outerHeight();
       $('#instructions').animate({ marginTop: h*-1 }, 800, function(){
           $('#instructions').hide();
           startTimer();
       });
   });
      
});
/*----------------------------------------------------------------------------------------
Game Page
------------------------------------------------------------------------------------------*/
$(document).ready( function() {
    
 //$('#guess').keyUp( checkName );
 
// $('#idk').click( giveUp );
      
});

var tenSecLimit = null; 
function showNextFriend(){
    $('#guess').value("");
    tenSecLimit = setTimeout(giveUp, 10000);
    //TODO:  show the next friend from queue
}

function checkName(){
    //TODO: this logic...
    //if guess == name then answerRight();
}

function giveUp(){
    clearTimeout(tenSecLimit);
    //TODO:  post failed attempt
    showNextFriend();
}

function answerRight(){
    clearTimeout(tenSecLimit);
    //TODO:  post successful attempt
    showNextFriend();
}

//Timer Code
function startTimer(){
    //delay timer start by 1.5 seconds
    setTimeout(function(){
        $("#timer").text('90');
        var timerHandle = window.setInterval("dropTime()",1000);
    }, 1500);
    
}
function dropTime(){
    t = Number( $("#timer").text() );
    t = t -1;
    $("#timer").text( t );
    
    if ( t==0 )
        gameOver();
}

//called by timer when game is up
function gameOver(){
    $('#results').show();
    $('#game').animate({marginTop:'-400px'}, 800, function(){
        $('#game').hide();
    });
}
/*----------------------------------------------------------------------------------------
Results Page
------------------------------------------------------------------------------------------*/
$(document).ready( function() {
    
    $('#results_button').click(function(){
        document.location.href="/results";
    });
    
});