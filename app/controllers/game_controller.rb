class GameController < ApplicationController

    def splash
        #run animation on splash page
        @animatePhotosFlag = true
    end
    
    def answer
        # post an answer via AJAX
        # params :fb_id, :name => guess, :success
    	    
    	#get user data	
		result = @fb_graph.fql_query("SELECT uid,name,sex,birthday FROM user WHERE uid = " + params[:fb_id].to_s)   		
	
		#fail if bad user
		if !result[0]["uid"]
		    render :json => {}, :status => :bad_request
		    return
	    end
	
		# save attempt to DB 
		@current_user.attempts.create({ :target_facebook_id => result[0]["uid"],
										:correct => params[:success],
										:guessed_name => params[:name], 
										:actual_name => result[0]["name"],
										:gender => result[0]["sex"], 
										:age => User.age_from_bday_string( result[0]["birthday"] )
									 })
        #return success
    	render :json => {}, :status => :ok
    end
    
    def grab_friends

        #set defaults (if necessary) and convert to ints
		params[:limit] = params[:limit].to_i || 10
		params[:avoid] = params[:avoid].map{|v| v.to_i} rescue [] 
		
		#Get the data on all the friends and remove any we've already done
    	done_friends = @current_user.attempts.collect{|a| a.target_facebook_id}
    	friends = @fb_graph.fql_query("SELECT uid,name FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me())")
        friends.reject! {|f| params[:avoid].include?(f["uid"].to_i) || done_friends.include?(f["uid"].to_i)}
        
        if(friends.length == 0)
            puts "No friends left!"
            return nil
        end
        
        #reduce down to the number we want
        friends = friends.sample( params[:limit] )
        
        #Load photos onto each user
        fql_query_hash = {}
        friends.each do |f|
        	fql_query_hash[f["uid"]] = "SELECT src_small from photo where pid in (SELECT pid from photo_tag where subject =" + f["uid"].to_s + " order by rand() limit 3)"
        end 
        results = @fb_graph.fql_multiquery(fql_query_hash)
        
 		#Finally attach them to the friends object to be sent back
        friends.each{|f| f["photos"] = results[f["uid"].to_i].map{|p| p["src_small"]}}

        #format friend objects for javascript
        friends = friends.map{|f| 
            {
                :fb_id => f['uid'],
                :name => f['name'],
                :big_path => "http://graph.facebook.com/" + f['uid'].to_s + "/picture?type=large",
                :photos => f['photos']
            }
        }
        render :json => friends
    end
    
    def results
        @fullPageFlag = true
        
        
        
    end
end
