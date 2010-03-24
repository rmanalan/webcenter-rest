function runTests() {
	with(QUnit) {

		module('webCenter.init');

		test('get resourceIndex', function() {
			isType(webCenter.resourceIndex, "Object");
		});

		test('get links with 10 items', function() {
			equals(webCenter.resourceIndex.links.length, 10, "resourceIndex should have 10 services available");
		});

		test('setup currentUser', function() {
			isType(currentUser, "Object");
		});

		module('webCenter.init => currentUser');

		test('have proper resourceType', function() {
			equals(currentUser.resourceType, 'urn:oracle:webcenter:people:person');
		});

		test('have the query based activity stream link', function() {
			// this tests makes sure Don Hayler's on PS2 is available
			var nodes = $.grep(currentUser.links, function(n) {
				if (n.rel == "urn:oracle:webcenter:activities:stream" && n.resourceType == "urn:oracle:webcenter:activities:stream") return true;
			});
			equals(nodes.length, 1);
		});

		test('have a status object', function() {
			equals(currentUser.status.resourceType, "urn:oracle:webcenter:people:person:status");
		});
	}
};

webCenter.init({},
function() {
	start();
	runTests();
});

