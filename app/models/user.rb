class User < ActiveRecord::Base
    has_many :attempts, :dependent => :destroy

    # Attempt Relations
    def guesses
        self.attempts.count
    end
    def correct_guesses
        self.attempts.where(:correct => true).count
    end
    def incorrect_guesses
        self.attempts.where(:correct => false).count
    end
    def score
        self.correct_guesses / self.guesses
    end
    
    
    def grab_friends(n)
    	#Get the data on all the friends and remove any we've already done
    	done_friends = self.attempts.collect{|a| a.target_facebook_id}
    	friends = @fb_graph.fql_query("SELECT uid,name,sex,birthday FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me())")
        friends.reject! {|f| done_friends.include? f["uid"].to_i}
        
        if(friends.length == 0)
            puts "No friends left!"
            return nil
        end
        
        friends = friends.sample(n)
        
        #Load photos onto each user
        fql_query_hash = { "query1" => "SELECT pid,subject FROM photo_tag WHERE subject IN (" \
                                    + friends.collect{|f| f["uid"]}.join(",") + ")", 
                           "query2" => "select src_big from photo where pid in (select pid from #query1)" }.to_json
                           
        results = @fb_graph.fql_multiquery(fql_query_hash) # convenience method
        
        #TODO: NO idea what is in results lol
        puts results
        
        #puts "Photos: " + photos.length
        #friends.each{|f| f["photos"] = photos.select{|p| p.subject.to_i == f["uid"].to_i}}
        
        return friends
    end
    
    def self.newFromFB(fb_user)
		user = User.new
		user.facebook_id = fb_user["id"]
		user.name = fb_user["first_name"] + " " + fb_user["last_name"]
		user.age = age_from_bday_string(fb_user["birthday"])
		user.gender = fb_user["gender"]
		user.save
		user
	end
end
