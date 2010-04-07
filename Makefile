all: clean-js clean-css compile-as-js compile-as-css compile-ir-js compile-ir-css

all-js: clean-js compile-as-js compile-ir-js

all-css: clean-css compile-as-css compile-ir-css

clean-js:
	rm -rf js/base-as.js
	rm -rf js/base-ir.js

clean-css:
	rm -rf css/base-as.css
	rm -rf css/base-ir.css

compile-as-js:
	java -jar lib/compiler.jar\
	  --js=js/curvy.js\
	  --js=js/timeago.js\
	  --js=js/jquery.json-2.2.js\
	  --js=js/jstorage.js\
	  --js=js/sammy-latest.min.js\
	  --js=js/autoresize.js\
	  --js=js/slideviewpro.js\
	  --js=js/html-sanitizer-minified.js\
	  --js=js/wcutils.js\
	  --js=js/wcrest.js\
	  --js=js/application.js\
	  --js_output_file=js/base-as.js

compile-as-css:
	cat css/screen.css css/style.css > css/base-as.css
	java -jar lib/yuicompressor-2.4.2.jar\
	  --type css -o css/base-as.css\
	  css/base-as.css

compile-ir-js:
	java -jar lib/compiler.jar\
	  --js=js/ir.js\
	  --js_output_file=js/base-ir.js

compile-ir-css:
	java -jar lib/yuicompressor-2.4.2.jar\
	  --type css -o css/base-ir.css\
	  css/ir.css
