StrangerFB::Application.routes.draw do
 
# Public Routes
  match 'about' => "public#about" 
  match 'privacy' => "public#privacy"


# map the root
  root :to => "game#splash"
      
      
end
