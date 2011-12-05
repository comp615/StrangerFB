class GameController < ApplicationController

    def splash
        #run animation on splash page
        @animatePhotosFlag = true
    end
    
    def answer
        # post an answer via AJAX
        # params :fb_id, :name => guess, :success
    	    
    	#get user data	
		result = @fb_graph.fql_query("SELECT uid,name,sex,birthday,affiliations FROM user WHERE uid = " + params[:fb_id].to_s)   		
	
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
										:affiliations => ActiveSupport::JSON.encode(result[0]["affiliations"].map{|a| a["nid"].to_i}),
										:gender => result[0]["sex"], 
										:age => User.age_from_bday_string( result[0]["birthday"] )
									 })
        #return success
    	render :json => {}, :status => :ok
    end
    
    def grab_friends

        #set defaults (if necessary) and convert to ints
		params[:limit] = params[:limit].to_i || 10
		params[:limit] = 10 if(params[:limit] > 15)
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
        	fql_query_hash[f["uid"]] = "SELECT src_big from photo where pid in (SELECT pid from photo_tag where subject =" + f["uid"].to_s + " order by rand() limit 3)"
        end 
        results = @fb_graph.fql_multiquery(fql_query_hash)
        
 		#Finally attach them to the friends object to be sent back
        friends.each{|f| f["photos"] = results[f["uid"].to_i].map{|p| p["src_big"]}}

        #format friend objects for javascript
        friends = friends.map{|f| 
            {
                :fb_id => f['uid'],
                :name => f['name'],
                :big_path => "http://graph.facebook.com/" + f['uid'].to_s + "/picture?type=large",
                :photos => f['photos']
            }
        }
        
        #Update play count if needed
        if(params[:new_round])
        	@current_user.play_count += 1
        	@current_user.save!
        end
        
        render :json => friends
    end
    
    def results
        @fullPageFlag = true
        
        #Expect a ts if coming from a game, otherwise use all
        if(params[:ts])
        	time = Time.at(params[:ts].to_i / 1000) #comes in in milliseconds, to seconds
        	time_range = (time - 90.seconds)..(time + 10.seconds)
			@attempts = @current_user.attempts.where(:created_at => time_range)
			@correct_attempts = @attempts.select{|a| a.correct}
			@incorrect_attempts = @attempts.select{|a| !a.correct}
			@attempts = @current_user.attempts
        else
			@attempts = @current_user.attempts
			@correct_attempts = @attempts.select{|a| a.correct}
			@incorrect_attempts = @attempts.select{|a| !a.correct}
        end
        
    	
    	#Update their friend count if inaccurate (also affiliations for reporting that)
    	friends = @fb_graph.fql_query("SELECT uid2 FROM friend WHERE uid1 = me()")
    	if (@current_user.friend_count != friends.length)
    		@current_user.friend_count = friends.length
    		@current_user.save! 
    	end
       
    	#additional user data needed to process everything
    	@my_affiliations = @fb_graph.fql_query("SELECT affiliations FROM user WHERE uid = me()").first["affiliations"]
    	
    	#Aggregate stuff
    	@overall_correct_pct = ((Attempt.where(:correct => true).count.to_f  / Attempt.count.to_f) * 1000.0).round / 10.0
        @avg_friend_count = User.connection.select_value("SELECT AVG(`friend_count`) FROM `StrangerFB_development`.`users`")
        
        @attempts.each{|a|  puts a.affils.include?(33572843)}
    end
end
