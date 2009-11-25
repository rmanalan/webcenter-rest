require 'rubygems'
require 'sinatra/base'
require 'net/http'

class ProxyApp < Sinatra::Default

  REQUEST_HEADERS = %w[ ACCEPT
                        ACCEPT_LANGUAGE
                        ACCEPT_ENCODING
                        ACCEPT_CHARSET
                        CACHE_CONTROL
                        CONTENT_LENGTH
                        CONTENT_TYPE
                        CONNECTION
                        COOKIE
                        HOST
                        IF_NONE_MATCH
                        KEEP_ALIVE
                        PROXY_CONNECTION
                        REFERER
                        USER_AGENT ].freeze


  def initialize
    @uri = URI('http://www.google.com')
  end

  get "/env" do
    content_type 'text/plain'
    env.sort.map{|k,v| "#{k}: #{v}"}.join("\n")
  end

  get "*" do
    set_response Net::HTTP.start(host, port) { |http| http.get2(request_uri, req_headers) }
  end

  post "*" do
    set_response Net::HTTP.start(host, port) { |http| http.post(request_uri, data, req_headers) }
  end

  put "*" do
    set_response Net::HTTP.start(host, port) { |http| http.put(request_uri, data, req_headers) }
  end
 
  delete "*" do
    set_response Net::HTTP.start(host, port) { |http| http.delete(request_uri, req_headers) }
  end
 
  head "*" do
    set_response Net::HTTP.start(host, port) { |http| http.head(request_uri, req_headers) }
  end

  def set_response(response)
    status(response.code)
    headers response.each{|k,v|}
    response.body
  end

  def host
    @uri.host
  end
  
  def port
    @uri.port
  end
  
  def request_uri
    env["REQUEST_URI"]
  end
  
  def request_method
    env["REQUEST_METHOD"].downcase
  end
  
  def data
    env["rack.input"].read
  end
  
  def req_headers
    Hash[ env.select { |k,v| REQUEST_HEADERS.include?(k.gsub(/^HTTP_/, "")) }.map { |pair| [ pair.first.gsub(/^HTTP_/, "").gsub(/\_/,"-"), pair.last ] } ]
  end
  
end

run ProxyApp.new
