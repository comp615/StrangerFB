class AddMoreUserData < ActiveRecord::Migration
  def change
  	add_column :users, :play_count, :integer, :limit => 2, :default => 0
  	add_column :users, :friend_count, :integer, :limit => 2, :default => nil
  	add_column :attempts, :affiliations, :string
  end
end
