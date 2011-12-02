# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20111202163851) do

  create_table "attempts", :force => true do |t|
    t.integer  "user_id"
    t.integer  "target_facebook_id", :limit => 8
    t.string   "actual_name"
    t.string   "guessed_name"
    t.boolean  "correct"
    t.string   "gender"
    t.integer  "age",                :limit => 1
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "attempts", ["user_id"], :name => "index_attempts_on_user_id"

  create_table "users", :force => true do |t|
    t.string   "name"
    t.integer  "facebook_id", :limit => 8
    t.string   "gender"
    t.integer  "age",         :limit => 1
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
