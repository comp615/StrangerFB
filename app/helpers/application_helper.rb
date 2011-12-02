module ApplicationHelper

	def date_from_string(s)
		if s =~ %r{(\d+)/(\d+)/(\d+)}
		  return Date::civil($3.to_i, $2.to_i, $1.to_i)
		end
		return nil
	end
	
	def age_from_bday_string(s)
		bdate = date_from_string(s)
		return nil if bdate.nil?
		return ((Date.today - bdate) / 365).to_i
	end
end
