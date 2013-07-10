class ApplicationController < ActionController::Base
  protect_from_forgery
  skip_filter :verify_authenticity_token # TODO: FIX THIS SHIZZZZ
  before_filter :set_local_vars
  before_filter :load_user
  rescue_from Koala::Facebook::AuthenticationError, :with => :handle_auth_error

  def render_optional_error_file(status_code)
    status = interpret_status(status_code)
    render :template => "/errors/#{status[0,3]}.html.erb", :status => status, :layout => 'pages'
  end

  def handle_auth_error
    reset_session
    redirect_to root_path
  end

  protected

  def set_local_vars
    @current_action = action_name
    @current_controller = controller_name
  end

  def load_user  

    #load fb_oauth object
    @fb_oauth = Koala::Facebook::OAuth.new(Facebook::APP_ID, Facebook::SECRET, Facebook::CALLBACK_URL) 

    #if user is already logged in, just load graph object from session
    if session[:fb_id] && session[:fb_token]
      logger.error "Recreating graph object from session token"
      @fb_graph = Koala::Facebook::API.new( session[:fb_token] )
      @current_user = User.find_by_facebook_id( session[:fb_id] )
      return
    end


    #otherwise generate from cookies
    logger.error "Grabbing new graph token from login cookies"

    #debug cookies first
    logger.error  "******* COOKIES ************" 
    logger.error cookies.to_json

    #and get user info from cookies
    # NOTE: we can only do this once now, so we need to store the good stuff
    if !session[:fb_id] || !session[:token]
      fbdata = @fb_oauth.get_user_info_from_cookies(cookies)
      logger.error "******* FB Object ************"
      logger.error fbdata

      #if no user or user info, something failed!
      if !fbdata
        @fb_graph = Koala::Facebook::API.new
        logger.error  "No FB cookies found. Generating public (unprivlidged) graph object."
        return
      end

      session[:fb_id] = fbdata["user_id"]
      session[:fb_token] = fbdata["access_token"]
      token = session[:fb_token]
      logger.error "Token found: " + token
    end
    
    logger.error "Using old session data"

    #and upgrade the graph object
    @fb_graph = Koala::Facebook::API.new( session[:fb_token] )
    logger.error "Just upgraded graph object with token"

    #check for user in DB 
    logger.error "Moving on to DB"
    @current_user = User.find_by_facebook_id( session[:fb_id] )

    #create new user in DB if necessary
    if !@current_user
      fb_obj = @fb_graph.get_object( session[:fb_id] )
      @current_user = User.newFromFB( fb_obj )
    end

    #Update the last use time just for reporting purposes
    @current_user.touch
  end


end
