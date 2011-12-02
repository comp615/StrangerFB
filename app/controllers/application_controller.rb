class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :set_local_vars

  def render_optional_error_file(status_code)
     status = interpret_status(status_code)
     render :template => "/errors/#{status[0,3]}.html.erb", :status => status, :layout => 'pages'
   end    
  
  
  protected
  def set_local_vars
      @current_action = action_name
      @current_controller = controller_name
  end
  
end
