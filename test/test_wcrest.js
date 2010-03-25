function runTests() {
	with(QUnit) {

		module('webCenter.init');

		test('should get resourceIndex', function() {
			isType(webCenter.resourceIndex, "Object");
		});

		test('should get links with 11 items', function() {
			equals(webCenter.resourceIndex.links.length, 11, "resourceIndex should have 11 services available");
		});

		test('should setup currentUser', function() {
			isType(currentUser, "Object");
		});

		module('webCenter.init => currentUser');

		test('should have proper resourceType', function() {
			equals(currentUser.resourceType, 'urn:oracle:webcenter:people:person');
		});

		test('should have the query based activity stream link', function() {
			// this tests makes sure Don Hayler's on PS2 is available
			var nodes = $.grep(currentUser.links, function(n) {
				if (n.rel == "urn:oracle:webcenter:activities:stream" && n.resourceType == "urn:oracle:webcenter:activities:stream") return true;
			});
			equals(nodes.length, 1);
		});

		test('should have a status object', function() {
			equals(currentUser.status.resourceType, "urn:oracle:webcenter:people:person:status");
		});

    test('description',function(){
      
    });
	}
};

webCenter.init({},
function() {
	start();
	runTests();
});

