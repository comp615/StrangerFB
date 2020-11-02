source 'https://rubygems.org'
ruby "2.7.2"

gem 'rails', '~>4'

# Bundle edge Rails instead:
# gem 'rails',     :git => 'git://github.com/rails/rails.git'

gem 'mysql2'

gem 'koala'
gem 'annotate'

# Fix Ruby 2.7 incompatibility
gem 'bigdecimal', '~>1.4.2'


# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails'
  gem 'coffee-rails'
  gem 'uglifier'
  gem 'compass'
end

gem 'actionpack-page_caching'

gem 'jquery-rails'

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# Use unicorn as the web server
# gem 'unicorn'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'

group :test do
  # Pretty printed test output
  gem 'turn', :require => false
end

group :development do
  gem 'capistrano', '3.13.0'
  gem 'capistrano-rails', '~> 1.3'
  gem 'capistrano-bundler'
  gem 'capistrano-rvm'
  # Unmaintained https://github.com/kfit-dev/cap-ec2/commits/v1.1.2-fave
  # Updates dependency on aws-sdk, and fixes issue with parsing
  # https://github.com/forward3d/cap-ec2/issues/80
  gem 'cap-ec2', :github => "kfit-dev/cap-ec2", :branch => "v1.1.2-fave"
  gem 'capistrano-linked-files'
  gem 'capistrano-unicorn-nginx'
  # gem 'slackistrano', :require => nil
end

#Add a JS Runtime for the servers
group :production do
  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # Relies on NodeJS being present on the server
	#gem 'therubyracer'
  #gem 'execjs'
  gem 'unicorn'
  # gem 'exception_notification', '~>3.0.1'
end
