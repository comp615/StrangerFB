class SetupTables < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :name
      t.integer :facebook_id, :limit => 8
      t.string :gender
      t.integer :age, :limit => 1
      t.timestamps
    end
    
    create_table :attempts do |t|
      t.references :user
      t.integer :target_facebook_id, :limit => 8
      t.string :actual_name
      t.string :guessed_name
      t.boolean :correct
      t.string :gender
      t.integer :age, :limit => 1
      t.timestamps
    end
    add_index :attempts, :user_id
    
  end
end
