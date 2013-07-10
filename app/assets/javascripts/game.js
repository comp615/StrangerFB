// Code for Game Controller

//This Global Array will hold all friend objects
var Friends = [];
var CurrFriend = null; //currenlty show friend
var requestActive = false;
var game_end_ts = null;
var timeout;
var old_ids = [];
var numAnswered = 0;

//CONSTANTS FOR LOADING
var initial_load = 15;
var load_increment = 8;
var load_threshold = 16; //higher than initial load so it immediately triggers another set

/* 
friend = {
:uid
:name
:big_path
:pictures[]
}

*/
function picSort(a,b)
{
  return b["photos"].length - a["photos"].length;
}

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
  existing_friends = old_ids;
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

      //Reorder the array so people without pics come last
      Friends.sort(picSort);

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

      if(Friends.length < load_threshold)
      ajaxLoadFriends(load_increment);

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
    $('<img/>').attr("src",arrayOfImages);   
  }
}

/*----------------------------------------------------------------------------------------
Splash Page
------------------------------------------------------------------------------------------*/
$(document).ready( function() {

  //Bind the crsf
  var csrf_token = $("meta[name=csrf-token]").attr("content");
  $.ajaxSetup({
  headers: {
    'X-CSRF-Token': csrf_token
    }
  });

  // Be ready for the session token to time out at any time
  $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
    var originalSuccess = options.success;

    options.success = function (data) {
        if (data && data.redirect) {
          // data.redirect contains the string URL to redirect to
          alert("Sorry there was a problem with your FB authentication, we'll send you back home and you can give it another try!");
          window.location.href = data.redirect;
        } else {
            if (originalSuccess != null) {
                originalSuccess(data);
            }
        }   
    };
});

  //Facebook Login Code
  fb_connect($("#fb_login"), loginSuccess);

});

function loginSuccess() { 
  $('#instructions').show();
  var h = $('#splash').outerHeight();
  $('#splash').animate({ marginTop: h*-1 }, 800, function(){
    $('#splash').hide();
    ajaxLoadFriends(initial_load, true); //preload during instructions view
  });
}


function fb_connect(obj, success_function) {
  var click_fn = function() {
    $(this).find("span.button-text").html("Logging you in...");

    FB.login( function(response){
        console.log(response);
        if (response.status === "connected") {
            success_function.call(obj);
        } else {
          // user is not logged in
          $(this).find("span").html("Connect with Facebook");
          alert('Facebook login failed, please try again!');
        }
      }, {scope:'user_birthday, friends_birthday, friends_photos'}
    );
  }
  $(obj).click(click_fn);
}
/*----------------------------------------------------------------------------------------
Instructions Page
------------------------------------------------------------------------------------------*/
$(document).ready( function() {

  $('#start_button').click(function(){
    numAnswered = 0;
    $('#game').show();
    showNextFriend();
    var h = $('#instructions').outerHeight();
    startResizeInterval();
    $('#instructions').animate({ marginTop: h*-1 }, 800, function(){
      $('#instructions').hide();
      startTimer();
      $('#guess').focus();
      startPauseFade();
    });
  });  

  $('#left_block').delegate('img.small','hover',function(event) {
    if( event.type === 'mouseenter' ) {
      var w = $(this).offset().left - 45;
      $("#hover_img img").css("max-width",w);
      var t = Math.round($(this).offset().top - 300);
      $("#hover_img").css("top",Math.max(t,5));
      $("#hover_img img")[0].src = $(this).attr('src');
      timeout = setTimeout(addRedBox(this),200);
    } else {
      clearTimeout(timeout);
      $("#hover_img").hide();
    }
  });
});

//called once 15 friends are loaded
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

  $('#pause').click( togglePause );

});

//every 400ms check for resize of container due to new photos
var resizeIntervalHandle;
function startResizeInterval(){
  resizeIntervalHandle = setInterval(function(){
    if ( $('#game').outerHeight() === $('#container').height() )
    return;
    var h = $('#game').outerHeight();
    h = ( h < 400 ) ? 400 : h;
    $('#container').animate({'height' : h + 'px'}, 300);
    }, 400);
  }

  //15 seconds into the game, fade in the pause button!
  function startPauseFade(){
    setTimeout(function(){
      $('#pause_block').fadeIn();
      }, 15000);
    }

    //show the next friend, after guess/skip
    function showNextFriend(){

      //reset 
      $("#hover_img").hide();
      $('#guess').val("").removeClass('invalid').focus();
      $('#ibig').attr('src', "/images/large_blank_placeholder.png");
      $('#left_block img.small').remove();

      //get next friend
      CurrFriend = Friends.shift();
      if(CurrFriend)
      old_ids.push(CurrFriend["id"]);

      //preload the second to next
      if(Friends.length > 1) {
        preload(Friends[1].photos);
        preload(Friends[1]['big_path']);
      }

      //check if we need more friends
      if(Friends.length < load_threshold)
      ajaxLoadFriends(load_increment); //may have to fudge this in production

      //if no friends, wait 1sec and try again (ajax will return)
      if ( CurrFriend === undefined ){
        $('#ibig').attr('src', "/images/loading_prof_pic.png");
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

    }   

    //show red boxes around the tagged face
    function addRedBox(data_obj) {
      return function() {
        $("#hover_img").css("left", 5);
        $("#hover_img").show();

        var w = $("#hover_img img").width();
        var h = $("#hover_img img").height();
        var wh = Math.max(w/8,h/8);

				var x = w * $(data_obj).data("x") / 100 - wh/2;
				var y = h * $(data_obj).data("y") / 100 - wh/2;
				
        $("#hover_img .tag_box").css("left", x);
        $("#hover_img .tag_box").css("top", y);
        $("#hover_img .tag_box").width(wh).height(wh);
					
      };	
    }

    //verify guess against answer
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

          numAnswered += 1;

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
        var PauseGameFlag = false;
        function startTimer(){
          //delay timer start by 1.5 seconds
          setTimeout(function(){
            $("#timer").text('90');
            var timerHandle = window.setInterval("dropTime()",1000);
            }, 1500);

          }
          function dropTime(){
            if ( PauseGameFlag )
            return;

            t = Number( $("#timer").text() );
            t = t -1;
            $("#timer").text( t );

            if ( t===0 )
            gameOver();
          }
          function togglePause(){
            PauseGameFlag = !PauseGameFlag;
          }

          //called by timer when game is up
          function gameOver(){
            $("#game").css('paddingTop', '40px');
            $('#results').show();
            var h = $('#game').outerHeight();
            clearInterval( resizeIntervalHandle );
            $('#game').animate({ 'marginTop': h*-1}, 800, function(){
              $('#game').hide();
            });
            $('#container').animate({'height' : '400px'}, 800);
          }
          /*----------------------------------------------------------------------------------------
          Results Page
          ------------------------------------------------------------------------------------------*/
          $(document).ready( function() {

            $('#results_button').click(function(){
              document.location.href= "/results?recent=" + numAnswered;
            });

            $('#share_on_facebook').click(function(){
              var score = $('.score').last().text();
              var msg = "I know " + String(score) + " of my FB friends! Time for some unfriendin'... Think you can do better!?"
              FB.ui({ 
                method: 'feed',
                name: 'Whatsherface',
                link: 'http://www.whatsherface-book.com',
                picture: 'http://whatsherface-book.com/images/fb_logo.png',
                caption: 'Whatsherface-book.com',
                description: msg
              });
            });

          });