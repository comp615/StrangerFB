# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
StrangerFB::Application.initialize!

# ActionMailer::Base.raise_delivery_errors = true
# ActionMailer::Base.smtp_settings = {
#   :address => "smtp.sendgrid.net",
#   :port => '25',
#   :domain => "whatsherface-book.com",
#   :authentication => :plain,
#   :user_name => "",
#   :password => ""
# }
