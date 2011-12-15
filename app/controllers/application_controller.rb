class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :set_local_vars
  before_filter :load_user

  def render_optional_error_file(status_code)
     status = interpret_status(status_code)
     render :template => "/errors/#{status[0,3]}.html.erb", :status => status, :layout => 'pages'
  end    
  
  
  protected
  
  def set_local_vars
      @current_action = action_name
      @current_controller = controller_name
  end
  
  def load_user  
    puts "***************************" 
    puts cookies.to_json
    puts "***************************"
    
    #set facebook + session vars
  	@fb_oauth = Koala::Facebook::OAuth.new  	
    @fb_graph = Koala::Facebook::API.new  # can only access public datam, temporary.
    session[:fb_id] ||= @fb_oauth.get_user_from_cookies(cookies)
    
	begin
	    #if user is logged in
	    if session[:fb_id]
	    	
	    	#Grab their access token, and upgrade the graph object
	    	begin
		    	if @fb_oauth.get_user_info_from_cookies(cookies)
		    	    token = @fb_oauth.get_user_info_from_cookies(cookies)["access_token"]
				    @fb_graph = Koala::Facebook::API.new( token )
				end
	    	
				#load existing user from DB if possible
				@current_user = User.find_by_facebook_id( session[:fb_id] )
				
				#otherwise create new user
				if !@current_user
				    fb_obj = @fb_graph.get_object( session[:fb_id] )
				    @current_user = User.newFromFB( fb_obj )
				end
				
				#Update the last use time just for reporting purposes
				@current_user.touch
	    end
    
    rescue Koala::Facebook::APIError
		#User cookie is stale, so don't act like they are logged in
		#session.clear
	end
    
  end
  
  
end
