class GameController < ApplicationController

    def splash
    end
    
    def answer
        # post an answer via AJAX
        # params :fb_id, :name => guess, :success
    	    
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
										:age => User.age_from_bday_string(result["birthday"])})
        #return success
    	render :json => {}, :status => :ok
    end
    
    def grab_friends
		
		params[:limit] ||= 15
		params[:avoid] ||= []
    	params[:limit] = 15 if params[:limit].to_i > 15
		params[:avoid] = params[:avoid].map{|v| v.to_i} #safety!
		
		#Get the data on all the friends and remove any we've already done
    	done_friends = @current_user.attempts.collect{|a| a.target_facebook_id}
    	friends = @fb_graph.fql_query("SELECT uid,name FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me())")
        friends.reject! {|f| params[:avoid].include?(f["uid"].to_i) || done_friends.include?(f["uid"].to_i)}
        
        if(friends.length == 0)
            puts "No friends left!"
            return nil
        end
        
        #reduce down to the number we want
        friends = friends.sample(params[:limit])
        
        #Load photos onto each user
        fql_query_hash = {}
        friends.each do |f|
        	fql_query_hash[f["uid"]] = "SELECT src_small from photo where pid in (SELECT pid from photo_tag where subject =" + f["uid"].to_s + " order by rand() limit 3)"
        end 
        results = @fb_graph.fql_multiquery(fql_query_hash)
        
 		#Finally attach them to the friends object to be sent back
        friends.each{|f| f["photos"] = results[f["uid"].to_i].map{|p| p["src_small"]}}

        friends = friends.map{|f| 
            {
                :fb_id => f['uid'],
                :name => f['name'],
                :big_path => "http://graph.facebook.com/" + f['uid'].to_s + "/picture?type=large",
                :small_path1 => f["photos"][0],
                :small_path2 => f["photos"][1]
            }
        }
        render :json => friends
    end
end
