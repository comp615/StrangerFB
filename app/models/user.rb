class User < ActiveRecord::Base
    has_many :attempts, :dependent => :destroy

    # Attempt Relations

    def correct_guesses
        self.attempts.where(:correct => true)
    end
    def incorrect_guesses
        self.attempts.where(:correct => false)
    end
    def score
        self.correct_guesses.count / self.attempts.count
    end
    
    
    def self.newFromFB(fb_user)
		user = User.new
		user.facebook_id = fb_user["id"]
		user.name = fb_user["first_name"] + " " + fb_user["last_name"]
		user.age = self.age_from_bday_string(fb_user["birthday"])
		user.gender = fb_user["gender"]
		user.save
		user
	end
	
	private
	#Helper functions to convert a birthdate to an age
	def self.date_from_string(s)
		puts s
		if s =~ %r{(\d+)/(\d+)/(\d+)}
		  return Date::civil($3.to_i, $1.to_i, $2.to_i)
		end
		return nil
	end
	
	def self.age_from_bday_string(s)
		bdate = self.date_from_string(s)
		return nil if bdate.nil?
		return ((Date.today - bdate) / 365).to_i
	end
end
