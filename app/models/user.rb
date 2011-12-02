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
    	done_friends = self.attempts.collect{|a| a.target_facebook_id}
    end
    
    def self.newFromFB(fb_user)
		user = User.new
		user.facebook_id = fb_user["id"]
		user.name = fb_user["first_name"] + " " + fb_user["last_name"]
		#user.age = age_from_bday_string(fb_user["birthday"])
		user.gender = fb_user["gender"]
		user.save
		user
	end
end
