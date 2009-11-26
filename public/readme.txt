This sample queries for the activity stream of the user
(you will be prompted for credentials by the browser) and builds a page for the response.

This sample must be hosted on a web server (eg. Apache or Oracle Web Tier) or an application server.
To avoid cross site scripting errors, you should proxy URL access to the REST service.

On Apache or Oracle Web Tier the conf commands would look like this (change host and port to suit):

ProxyPass /rest/ http://myspaceshost.example.com:8912/rest/
ProxyPassReverse /rest/ http://myspaceshost.example.com:8912/rest/
