require 'rubygems'
require 'sinatra'
require 'dm-core'
require 'dm-validations'
require 'dm-timestamps'
require 'dm-paperclip'

DataMapper::Logger.new(STDOUT, :debug) if 'irb' == $0
DataMapper.setup(:default, "sqlite3://#{Dir.pwd}/cmis.sqlite3")

class FileAttachment
  include DataMapper::Resource
  include Paperclip::Resource

  property :id, Serial
  property :created_at, DateTime
  has_attached_file :file,
    :path => "#{Dir.pwd}/public/files/:basename-:style.:extension",
    :url => "/files/:basename-:style.:extension",
    :styles => { :medium => "300x300>",
                 :thumb => "100x100" }
end
DataMapper.auto_migrate!

class UploadService < Sinatra::Default
  get '/' do
    "nothing here... scram!"
  end

  post '/' do
    attachment = FileAttachment.create(:file => params[:file])
    redirect attachment.file.url(:medium)
  end
end

run UploadService.new
