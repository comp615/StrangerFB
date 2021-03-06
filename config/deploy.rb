# config valid only for current version of Capistrano
lock "3.13.0"

set :application, "StrangerFB"
set :repo_url, "https://github.com/comp615/StrangerFB.git"

ask :branch, proc { `git rev-parse --abbrev-ref HEAD`.chomp }.call

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, '/rails/strangerFB'

set :git_shallow_clone, 1

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
set :linked_files, fetch(:linked_files, []).push('config/database.yml').push('config/facebook.yml')

# Default value for linked_dirs is []
# set :linked_dirs, fetch(:linked_dirs, []).push('bin', 'log', 'tmp/pids', 'tmp/cache', 'tmp/sockets', 'vendor/bundle', 'public/system')

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

namespace :deploy do
  after 'deploy:publishing', 'linked_files:upload_files' # Do before we restart unicorn
  # after :publishing, 'unicorn:restart'
  # after 'deploy:publishing', 'unicorn:reload'    # app IS NOT preloaded
  after 'deploy:publishing', 'deploy:restart'
  after 'deploy:publishing', 'unicorn:restart'   # app preloaded
  # after 'deploy:publishing', 'unicorn:duplicate' # before_fork hook implemented (zero downtime deployments)
end

