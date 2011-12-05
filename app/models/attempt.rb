class Attempt < ActiveRecord::Base
    belongs_to :user
    
    def affils
    	return [] if(self.affiliations.nil?)
    	return ActiveSupport::JSON.decode(self.affiliations)
    end
end
