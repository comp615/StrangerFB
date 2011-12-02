class GameController < ApplicationController

    def splash
    end
    
    def test
        session[:fb_id] = @fb_oauth.get_user_from_cookies(cookies)	
        session[:fb_access_token]=@fb_oauth.get_user_info_from_cookies(cookies)["access_token"] rescue nil
        @fb_graph =Koala::Facebook::GraphAndRestAPI.new( session[:fb_access_token] )
        
        render :json => @fb_graph.get_object('me')  
    end
end
