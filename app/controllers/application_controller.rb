class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :set_local_vars
  before_filter :load_user

  def render_optional_error_file(status_code)
     status = interpret_status(status_code)
     render :template => "/errors/#{status[0,3]}.html.erb", :status => status, :layout => 'pages'
   end    
  
  def load_user
  	@fb_oauth = Koala::Facebook::OAuth.new  	
    @fb_graph = Koala::Facebook::GraphAndRestAPI.new  # can only access public datam, temporary.
    session[:fb_id] = @fb_oauth.get_user_from_cookies(cookies)
    if session[:fb_id]
    	#user is logged in
    	
    	#Grab their access token, and upgrade the graph object
    	if @fb_oauth.get_user_info_from_cookies(cookies)
		   @fb_graph = Koala::Facebook::GraphAndRestAPI.new(@fb_oauth.get_user_info_from_cookies(cookies)["access_token"])
		end
    	
		#load the existing stuff and current user's FB data object
		@fb_user = @fb_graph.get_object(session[:fb_id])
		@current_user = User.find_by_facebook_id(session[:fb_id])
		
		#check if we need to create a user
		@current_user = User.newFromFB(@fb_user) if !@current_user
    end
  end
  
  protected
  def set_local_vars
      @current_action = action_name
      @current_controller = controller_name
  end
  
end
