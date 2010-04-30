#!/usr/bin/env ruby
require 'rubygems'
require 'sinatra'

get '/' do
  redirect 'index.html'
end

# error handler
get /^\/(\d{3})$/ do
  content_type "application/json"
  error params['captures'].first.to_i, '{message: "error handling test"}'
end

# static assets
get /^\/js\/(.*)/ do
  filename =  File.join("..","js",params['captures'])
  content_type File.extname(filename)
  read_relative_file filename
end

get /^\/vendor\/(.*)/ do
  filename =  File.join("..","vendor",params['captures'])
  content_type File.extname(filename)
  read_relative_file filename
end

def read_relative_file(*args)
  File.read(File.join(File.expand_path(File.dirname(__FILE__)), *args))
end
