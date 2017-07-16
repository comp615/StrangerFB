StrangerFB::Application.routes.draw do

# Public Routes
  get 'about' => "public#about"
  get 'privacy' => "public#privacy"


# Game Routes
    get 'grab_friends' => "game#grab_friends"
    get 'answer' => "game#answer"
    get 'results' => "game#results"


# Misc
    get 'logout' => "facebook#logout"
    get 'get_social_media' => 'public#get_social_media'

# map the root
  root :to => "game#splash"


end
