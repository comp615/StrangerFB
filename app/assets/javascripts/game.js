// Code for Game Controller

//This Global Array will hold all friend objects
var Friends = [];
var CurrFriend = null; //currenlty show friend
var requestActive = false;
var game_end_ts = null;
/* 
    friend = {
        :uid
        :name
        :big_path
        :pictures[]
    }
   
*/

//batch load friends
function ajaxLoadFriends(count, newRound){
	if(newRound === undefined)
		newRound = false;
	
	if(count === undefined)
		count = 10;
	
	if(requestActive)
		return;
    requestActive = true;
    //collect current friend list
    existing_friends = [];
    $.each(Friends, function(i, f){
       existing_friends.push(f.fb_id); 
    });

    //request new batch of friends
    $.ajax({
      url: "/grab_friends",
      type : 'post',
      data: { limit : count, avoid :  existing_friends, new_round: newRound},
      success: function(resp){
         $.each(resp, function(i, f){
             Friends.push(f);
         });
         
         //load play button
         if ( CurrFriend === null )
            showPlayButton();
        
        requestActive = false;
        //repeat ajax call in batches
         if ( Friends.length < 6 )
             ajaxLoadFriends();
             
         if(newRound) {
	      	preload(Friends[0].photos);
	      	preload(Friends[0]['big_path']);
	      	preload(Friends[1].photos);   
	      	preload(Friends[1]['big_path']);
         }
         
      }, 
      // problem with ajax, just show a nice error message and hide the game
      error: function(){
	      requestActive = false;
          if ( Friends.length < 5 ){
              $('#loading_wait').append('FAILED! Sorry, try again later?');
              return;
          }
      }
    });

}

function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
        // Alternatively you could use:
        // (new Image()).src = this;
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
        ajaxLoadFriends(10, true); //preload during instructions view
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
       showNextFriend();
       $('#instructions').animate({ marginTop: h*-1 }, 800, function(){
           $('#instructions').hide();
           startTimer();
       });
   });  
});

//called once ten friends are loaded
function showPlayButton(){
    $("#loading_wait").hide();
    $('#start_button').show(); 
}
/*----------------------------------------------------------------------------------------
Game Page
------------------------------------------------------------------------------------------*/
$(document).ready( function() {
    
 $('#guess').keyup( checkName );
 
 $('#idk').click( giveUp );
      
});


function showNextFriend(){

    //reset 
    $('#guess').val("").removeClass('invalid');
    $('#left_block img.small').remove();
    $('#ibig').attr('src', "/images/loading_prof_pic.png");
    
    //get next friend
    CurrFriend = Friends.shift();
    
    //preload the second to next
    if(Friends.length > 1) {
    	preload(Friends[1].photos);
    	preload(Friends[1]['big_path']);
	}

    //check if we need more friends
    if(Friends.length < 6)
    	ajaxLoadFriends();
    
    //if no friends, wait 1sec and try again (ajax will return)
    if ( CurrFriend === undefined ){
        setTimeout(showNextFriend, 1000);
        return
    }
        
    //add new pictures    
    $('#ibig').attr('src', CurrFriend['big_path']);
    $.each( CurrFriend.photos, function(i,p){
        $('#ibig').after('<img class="small" src="' + p + '" />');
        
        //on last photo set resize hook
        if (i === CurrFriend.photos.length-1 )
            var itotal = $('#game img').length;
            var icount=0;
            $('#game img').load(function(){
                
                icount+=1;      
                if ( icount !== itotal )
                    return;
                
                icount = 1;    
                //smooth resize container if necessary
                var h = $('#game').outerHeight();
                h = ( h < 400 ) ? 400 : h;
                $('#container').animate({'height' : h + 'px'}, 300);
            });
    });
    



}   

function checkName(){
    var guess = $('#guess').val();
    
    //return if CurrFriend undefined (waiting for ajax)
    if ( CurrFriend === undefined )
        return;
        
    //check if correct!
    if ( match_names(guess, CurrFriend.name) ){
        showAnswer( CurrFriend.name );
        sendAnswer( guess, true );
        return;
    } 
    
    //mark guess as wrong (red)
    if ( guess.length > 2 )
        $('#guess').addClass('invalid');
    
}

function showAnswer(name){
    $('#answer').text(name + "!").show();
    setTimeout(function(){
        $('#answer').fadeOut(800);
    }, 600);
}

function giveUp(){ sendAnswer('', false); }

function sendAnswer(guess, success){
    
    if ( CurrFriend === undefined )
        return;
        
    $.ajax({
      url: "/answer",
      data: {fb_id : CurrFriend.fb_id, name : guess, success : success},
      complete: function(){
         //nothing, run immediately!
      }
    });
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
    
    if ( t===0 )
        gameOver();
}

//called by timer when game is up
function gameOver(){
    $("#game").css('paddingTop', '40px');
    $('#results').show();
     var h = $('#game').outerHeight();
	   $('#game').animate({ marginTop: h*-1 }, 800, function(){
	       $('#game').hide();
	   });
	 game_end_ts = new Date().getTime();
}
/*----------------------------------------------------------------------------------------
Results Page
------------------------------------------------------------------------------------------*/
$(document).ready( function() {
    
    $('#results_button').click(function(){
        document.location.href= "/results?ts=" + game_end_ts;
    });
    
});