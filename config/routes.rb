StrangerFB::Application.routes.draw do
 
# Public Routes
  match 'about' => "public#about" 
  match 'privacy' => "public#privacy"


# Game Routes
    match 'grab_friends' => "game#grab_friends"
    match 'answer' => "game#answer"
    match 'results' => "game#results"


# Misc
    match 'logout' => "facebook#logout"


# map the root
  root :to => "game#splash"
      
      
end
