StrangerFB::Application.routes.draw do
 
# Public Routes
  match 'about' => "public#about" 
  match 'privacy' => "public#privacy"

# Game Routes
    match 'test' => "game#test"
    match 'answer' => "game#answer"
    
# Misc
    match 'logout' => "facebook#logout"

# map the root
  root :to => "game#splash"
      
      
end
