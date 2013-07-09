# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
StrangerFB::Application.initialize!

#Configure for emailing
ActionMailer::Base.raise_delivery_errors = true
ActionMailer::Base.smtp_settings = {
  :address => "smtp.sendgrid.net",
  :port => 587,
  :domain => "<<YOUR DOMAIN>>",
  :authentication => :plain,
  :user_name => "<<YOUR EMAIL>>",
  :password => "<<YOUR PASSWORD>>",
  :enable_starttls_auto => true
}
