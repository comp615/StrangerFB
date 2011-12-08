// Code for Game Controller

//This Global Array will hold all friend objects
var Friends = [];
var CurrFriend = null; //currenlty show friend
var requestActive = false;
var game_end_ts = null;
var timeout;
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
              $('#loading_wait').text('FAILED! Sorry, try again later?');
              return;
          }
      }
    });

}

function preload(arrayOfImages) {
    if (arrayOfImages instanceof Array) {
	    $(arrayOfImages).each(function(){
		    $('<img/>').attr("src",this["src"]);
	    });
    } else {
	 	$('<img/>').attr("src",this);   
    }
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
       $('#instructions').animate({ marginTop: h*-1 }, 800, function(){
           showNextFriend();
			$('#instructions').hide();
           startTimer();
           $('#guess').focus();
       });
   });  
   
   $('#left_block').delegate('img.small','hover',function(event) {
	   if( event.type === 'mouseenter' ) {
		   $("#hover_img img")[0].src = $(this).attr('src');
		   timeout = setTimeout(addRedBox(this),200);
	   } else {
		   clearTimeout(timeout);
		   $("#hover_img").hide();
	   }
   });
});

function addRedBox(data_obj) {
	return function() {
		   $("#hover_img").css("left", 5);
		   $("#hover_img").css("top", 5);
		   $("#hover_img").show();
		   
		   var w = $("#hover_img img").width();
		   var h = $("#hover_img img").height();
		   var wh = Math.max(w/8,h/8);
		   $("#hover_img .tag_box").css("left", $("#hover_img img").offset().left + w * $(data_obj).data("x") / 100 - wh/2);
		   $("#hover_img .tag_box").css("top", $("#hover_img img").offset().top + h * $(data_obj).data("y") / 100 - wh/2);
		   $("#hover_img .tag_box").width(wh).height(wh);
	   };	
}

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
 
 $('#idk, #unfair').click( giveUp );
      
});


function showNextFriend(){

    //reset 
    $("#hover_img").hide();
    $('#guess').val("").removeClass('invalid').focus();
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
    if(Friends.length < 8)
    	ajaxLoadFriends(8); //may have to fudge this in production
    
    //if no friends, wait 1sec and try again (ajax will return)
    if ( CurrFriend === undefined ){
        setTimeout(showNextFriend, 1000);
        return
    }
        
    //add new pictures    
    $('#ibig').attr('src', CurrFriend['big_path']);    
    $.each( CurrFriend.photos, function(i,p){
        $('#ibig').after('<img class="small" src="' + p["src"] + '" data-x="' + p["xcoord"] + '" data-y="' + p["ycoord"] + '"/>');
        //TODO: Add a target box?
    });
    
    //Show the unfair button if it might be, hide otherwise
    if(CurrFriend.photos.length <= 1) {
    	$("#unfair").show();
	} else {
		$("#unfair").hide();
	}
    
    
	setTimeout(function() {
		//smooth resize container if necessary
		var h = $('#game').outerHeight();
		h = ( h < 400 ) ? 400 : h;
		$('#container').animate({'height' : h + 'px'}, 300);
	}, 350);
}   

function checkName(){
    var guess = $('#guess').val();
    
    //return if CurrFriend undefined (waiting for ajax)
    if ( CurrFriend === undefined )
        return;
        
    //check if correct!
    if ( match_names(guess, CurrFriend.name) ){
        $('#guess').attr('disabled', true);
        setTimeout(function(){
           $('#guess').attr('disabled', false); 
        }, 400);
        showAnswer( CurrFriend.name );
        sendAnswer( guess, true );
        return;
    } 
    
    //mark guess as wrong (red)
    if ( guess.length > 2 )
        $('#guess').addClass('invalid');
    
}

function showAnswer(name){
    $('#answer span').text(name + "!").show();
    setTimeout(function(){
        $('#answer span').fadeOut(800);
    }, 900);
}

function giveUp(){
	//Ready for the best,literal programming ever seen?
	if($(this).is("#unfair")) {
		//Heh heh, don't worry, nothing could have prepared you for that
		sendAnswer('unfair', false); 
	} else {
		sendAnswer('', false); 
	}
}

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
    
    $('#share_on_facebook').click(function(){
        var score = $('.score').first().text();
        var msg = "I know " + String(score) + " of my FB friends! Time for some unfriendin'..."
        FB.ui({ 
            method: 'feed',
            name: 'Whatsherface',
            link: 'http://www.whatsherface-book.com',
            picture: 'http://whatsherface-book.com/fb_logo.png',
            caption: 'Whatsherface-book.com',
            description: msg
        });
    });
    
});