StrangerFB::Application.routes.draw do
 
# Public Routes
  match 'about' => "public#about" 
  match 'privacy' => "public#privacy"

# Game Routes
    match 'test' => "game#test"
    
# Misc
    match 'logout' => "facebook#logout"

# map the root
  root :to => "game#splash"
      
      
end
