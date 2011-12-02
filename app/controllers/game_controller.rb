class GameController < ApplicationController

    def splash
    end
    
    def answer
        # post an answer via AJAX
        # params :fb_id, :name => guess, :success
  
        #force ajax post
    	if !request.post?
    	    render :json => {}, :status => :bad_request
		    return
	    end
    	    
    	#get user data	
		result = @fb_graph.fql_query("SELECT uid,name,sex,birthday FROM user WHERE uid = " + params[:fb_id].to_s)   		
	
		#fail if bad user
		if !result["uid"] #Probably a hacking attempt
		    render :json => {}, :status => :bad_request
		    return
	    end
	
		# save attempt to DB 
		@current_user.attempts.create({ :target_facebook_id => result["uid"],
										:correct => :params[:success],
										:guessed_name => params[:name], 
										:actual_name => result["name"],
										:gender => result["sex"], 
										:age => age_from_bday_string(result["birthday"])})
        #return success
    	render :json => {}, :status => :ok
    end
    
    
    def test
        session[:fb_id] = @fb_oauth.get_user_from_cookies(cookies)	
        session[:fb_access_token]=@fb_oauth.get_user_info_from_cookies(cookies)["access_token"] rescue nil
        @fb_graph =Koala::Facebook::GraphAndRestAPI.new( session[:fb_access_token] )
        
        render :json => @fb_graph.get_object('me')  
    end
end
