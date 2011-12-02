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
end
