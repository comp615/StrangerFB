// Code for Game Controller

//This Global Array will hold all friend objects
var Friends = [];
var CurrFriend = null; //currenlty show friend
/* 
    friend = {
        :fb_id
        :name
        :big_path
        :small_path1
        :small_path2
    }
*/

//batch load friends
function ajaxLoadFriends(){
    
    //collect current friend list
    existing_friends = [];
    $.each(Friends, function(i, f){
       existing_friends.push(f.fb_id); 
    });

    //request new batch of friends
    $.ajax({
      url: "/grab_friends",
      data: { limit : 50, avoid :  existing_friends},
      success: function(resp){
         $.each(resp, function(i, f){
             f.big_path = "http://graph.facebook.com/" + f.fb_id + "/picture?type=large";
             Friends.push(f);
         });
         
         //load first friend
         if ( CurrFriend === null )
            showNextFriend();
            
        //repeat ajax call in batches
         if ( Friends.length < 50 )
             ajaxLoadFriends();
         
      }, 
      // problem with ajax, just show a nice error message and hide the game
      error: function(){
          $('#game >div').hide();
          $('#game').append('<h2>Sorry, but there was an error loading friends for your game.</h2>Try again later?');
          return;
      }
    });

}



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
        ajaxLoadFriends(); //preload during instructions view
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
		}, {perms:' user_birthday, friends_birthday, user_photos, friends_photos'}
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
    
 $('#guess').keyup( checkName );
 
 $('#idk').click( giveUp );
      
});

var tenSecLimit = null; 

function showNextFriend(){
    $('#guess').val("").removeClass('invalid');
    tenSecLimit = setTimeout(giveUp, 10000);
    CurrFriend = Friends.pop();
    
    //What happens when no more friends?
    if ( CurrFriend == undefined )
        gameOver();
        
    $('#ibig').attr('src', CurrFriend['big_path']);
    $('#ismall1').attr('src', CurrFriend['small_path1']);
    $('#ismall2').attr('src', CurrFriend['small_path2']);
}

function checkName(){
    var guess = $('#guess').val();
    
    if ( match_names(guess, CurrFriend.name) )
        sendAnswer(guess, true);
    else
        $('#guess').addClass('invalid');
    
}

function giveUp(){ sendAnswer('', false); }

function sendAnswer(guess, success){
    clearTimeout(tenSecLimit);
    $.ajax({
      url: "/answer",
      data: {fb_id : CurrFriend.fb_id, name : guess, success : success},
      complete: function(){
         showNextFriend();
      }
    });
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