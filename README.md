WebCenter REST API Examples
===========================

Do you have WebCenter Spaces?  If you do, did you know about it's REST APIs?  It's got a full feature set of REST APIs that cover most of the application.  This project contains a sample application that you can use to try the API a bit.  The main example utilizes the Activity Stream and User Profile APIs to build a Twitter-like app entirely built with JavaScript.  The example uses jQuery, PURE (js templating), and Sammy (event based javascript controllers).

In order to run these, these samples need to run on the same hostname as you WebCenter Spaces instance.  There are several ways you can do that:

1. Run a local Apache (with mod_proxy) or Nginx (with the HTTP upstream module) to proxy your WebCenter instance' /rest services.
2. Package up the files in this project as a war and deploy it on your app server.
3. Use the HTTP proxy servlet that's included in this project... make sure to update the host in WEB-INF/web.xml and the absolute javascript references in index.html

These are provided strictly as sample code.  Do with it what you want. 

