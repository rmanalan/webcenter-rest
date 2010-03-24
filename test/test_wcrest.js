(function($) {

	function runTests() {
		with(QUnit) {
      context('webCenter','init')
        .should('get resourceIndex', function() {
          isType(webCenter.resourceIndex, "Object");
        })
        .should('get links with 10 items', function(){
          equals(webCenter.resourceIndex.links.length,10, "resourceIndex should have 10 services available");
        })
        .should('setup currentUser', function(){
          isType(currentUser, "Object");
        });

      context('webCenter','currentUser')
        .should('have proper resourceType',function(){
          equals(currentUser.resourceType, 'urn:oracle:webcenter:people:person');
        })
        .should('have the query based activity stream link',function(){
          // this tests makes sure Don Hayler's on PS2 is available
          var nodes = $.grep(currentUser.links, function(n) {
            if(n.rel == "urn:oracle:webcenter:activities:stream" && 
               n.resourceType == "urn:oracle:webcenter:activities:stream") return true;
          });
          equals(nodes.length, 1);
        })
        .should('have a status object',function(){
          equals(currentUser.status.resourceType, "urn:oracle:webcenter:people:person:status");
        })
        .should('',function(){
        })


		}
	};

	webCenter.init({},function() {
		start();
		runTests();
	});
})(jQuery);

