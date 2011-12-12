class TrackFriendLoss < ActiveRecord::Migration
  def change
  	add_column :users, :friend_change, :integer, :limit => 2, :default => 0
  end
end
