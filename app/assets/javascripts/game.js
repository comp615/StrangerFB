// Code for Game Controller


/*----------------------------------------------------------------------------------------
Splash Page
------------------------------------------------------------------------------------------*/
$(document).ready( function() {
    
    //Document Hooks
    

    //Facebook Login Code
    fb_connect($("#fb_login"), loginSuccess);
    function loginSuccess() { 
        $('#splash').hide();
        $('#instructions').show();
    }
    
   
});

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
		      alert('BlueFusion needs some more permissions to proceed!');
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