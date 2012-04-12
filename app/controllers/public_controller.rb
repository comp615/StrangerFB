class PublicController < ApplicationController
		caches_page :privacy
		caches_page :about
		
    def privacy
    end
    
    def about
        render 'privacy'
    end
    
    def get_social_media
        render :partial=> '/shared/social_links'
    end
    
end
