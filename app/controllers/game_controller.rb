class GameController < ApplicationController

    def splash
        #run animation on splash page
        @animatePhotosFlag = true
    end
    
    def answer
        # post an answer via AJAX
        # params :fb_id, :name => guess, :success
    	    
    	#get user data	
		result = @fb_graph.fql_query("SELECT uid,name,sex,birthday_date,affiliations FROM user WHERE uid = " + params[:fb_id].to_s)   		
	
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
										:age => User.age_from_bday_string( result[0]["birthday_date"] )
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
        	fql_query_hash[f["uid"]] = "SELECT xcoord,ycoord,pid from photo_tag where subject =" + f["uid"].to_s + " order by rand()  limit 5"
        end 
        s = Time.now
        results = @fb_graph.fql_multiquery(fql_query_hash)
        puts ((Time.now - s) / 5 ).to_s
        
        #Get the photo URLs
        pids = results.map{|uid,data| data.map{|pt| pt["pid"].to_i}}
        s = Time.now
        src_results = @fb_graph.fql_query("SELECT pid,src_big from photo where pid IN (" + pids.flatten.join(",") + ")")
        puts (Time.now - s).to_s
        
        #Attach URLs to tags
        results.each do |uid,data|
        	data.each do |p|
        		pic = src_results.detect{|r| r["pid"].to_i == p["pid"].to_i}
        		p["src"] = pic["src_big"] if(pic)
        	end
        end
        
 		#Finally attach them to the friends object to be sent back
        friends.each{|f| f["photos"] = results[f["uid"].to_i]}

        #format friend objects for javascript
        friends = friends.map{|f| 
            {
                :fb_id => f['uid'],
                :name => f['name'],
                :big_path => "http://graph.facebook.com/" + f['uid'].to_s + "/picture?type=large",
                :photos => f['photos']
            }
        }
        
        #if we can limit to just friends with good photos easily, do so
        friends_with_pics = friends.select{ |f| f[:photos].count > 1 }
        if friends_with_pics.count > params[:limit]*0.75
            friends = friends_with_pics
        end
            
        
        #Update play count if needed
        if(params[:new_round])
        	@current_user.play_count += 1
        	@current_user.save!
        end
        
        render :json => friends
    end
    
    def results
        #render a full page container in layout
        @fullPageFlag = true
        
        #calculate aggregate stats
    	@overall_correct_pct = Attempt.connection.select_value("SELECT AVG(`correct`) FROM `attempts`")
        
    	#break it down by age and genders
    	@breakdown = Attempt.connection.select_all("SELECT AVG(`correct`) as `pct`,COUNT(*) as `count`,`gender`,`age` FROM `attempts` GROUP BY `gender`,`age` ORDER BY `age` ASC, `gender`;")
        
        #return here if not signed in
        return if !@current_user || @current_user.attempts.blank?
            
        
        #Expect a ts if coming from a game, otherwise use all
        if(params[:ts])
        	time = Time.at(params[:ts].to_i / 1000) #comes in in milliseconds, to seconds
        	time_range = (time - 95.seconds)..Time.now
			@curr_attempts = @current_user.attempts.where(:created_at => time_range)
        else
			@curr_attempts = @current_user.attempts
        end
    	@correct_attempts = @curr_attempts.select{|a| a.correct}
		@incorrect_attempts = @curr_attempts.select{|a| !a.correct}		
		@attempts = @current_user.attempts #aggregate 
    		
    	# add friend count if missing
    	@current_user.friend_count ||=  @fb_graph.fql_query("SELECT friend_count FROM user WHERE uid = me()")
    	
    	#computer user scores
    	@my_score = @correct_attempts.length.to_f / (@correct_attempts.length + @incorrect_attempts.length) rescue 0
    	@my_agg_score = @attempts.select{|a| a.correct}.length.to_f / (@attempts.length)
        @fof_count =  (@current_user.friend_count * 130 * 0.5).round
        
    	#grab affiliations
    	@my_affiliations = @fb_graph.fql_query("SELECT affiliations FROM user WHERE uid = me()").first["affiliations"]
    	@my_affiliations.map!{ |affil|
    	    affil_attempts = @attempts.select{ |att| att.affils.include?( affil["nid"].to_i ) }
    	    affil_correct = affil_attempts.select{|att| att.correct}
    	    affil_accuracy = (affil_correct.length.to_f / affil_attempts.length ) rescue 0
    	    {
    	        :name => affil['name'],
    	        :attempts => affil_attempts.length.to_s,
    	        :correct => affil_correct.length.to_s,
    	        :accuracy => affil_accuracy.to_s
    	    }
        }
      

        
        
    end
end
