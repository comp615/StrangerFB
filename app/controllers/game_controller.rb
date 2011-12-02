class GameController < ApplicationController

    def splash
    end
    
    def answer
    	if(request.post?)
    		params[:fb_id]
    		params[:name] #This is guessed name
    		params[:success]
    		
    		result = @fb_graph.fql_query("SELECT uid,name,sex,birthday FROM user WHERE uid = " + params[:fb_id].to_i + ")   		
    		return if(!result["uid"]) #Probably a hacking attempt
    		
    		@current_user.attempts.create({ :target_facebook_id => result["uid"],
    										:correct => :params[:success],
    										:guessed_name => params[:name], 
    										:actual_name => result["name"],
    										:gender => result["sex"], 
    										:age => age_from_bday_string(result["birthday"])})
    		
    	end
    	render :nothing => true
    end
    
end
