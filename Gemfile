source 'http://rubygems.org'

gem 'rails', '~>3.2.3'

# Bundle edge Rails instead:
# gem 'rails',     :git => 'git://github.com/rails/rails.git'

gem 'mysql2'

gem 'koala'
gem 'annotate'


# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'
  gem 'uglifier', '>= 1.0.3'
  gem 'compass',      '~> 0.11.0'
end

gem 'jquery-rails'

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# Use unicorn as the web server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'

group :test do
  # Pretty printed test output
  gem 'turn', :require => false
end

#Add a JS Runtime for the servers
group :production do
  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  gem 'libv8', '3.11.8.3'
	gem 'therubyracer', '0.11.0beta8'
	gem 'pg'
  gem 'execjs'
#  gem 'exception_notification_rails3', :require => 'exception_notifier' 
end