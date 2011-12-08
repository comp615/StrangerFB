module ApplicationHelper
	def tally_data(copy,gender)		
		data = copy.select{|d| d["gender"] == gender || gender == "all"}
		
		total_count = 0
		sum = 0
		
		data.each do |d| 
			total_count += d["count"]
			sum += d["count"] * d["pct"]
		end
		
		if(total_count == 0)
			pct = "N/A"
		else
			pct = sum / total_count
		end
		return to_pct_with_places(pct,1)		
	end
	
	def to_pct_with_places(val,places)
		return val.to_s if(places < 0 || (!val.is_a?(Numeric) && val =~ /^[\d]+(\.[\d]+){0,1}$/))
		return ((val.to_f * 10 ** (places.to_i + 2)).round / (10 ** (places.to_i).to_f)).to_s + "%"
	end
end
