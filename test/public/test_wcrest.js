function resetWC(){
	$.jStorage.flush();
	wc.resourceIndex = null;
}
function isObject(o) {
  return is('Object',o);
}
function isFunction(f) {
  return is('Function',f);
}

var wc = webCenter;

module('webCenter pre-init', 'State of webCenter object prior to initialization');

test('webCenter should have default set of objects', 3, function(){
  ok(isObject(wc.userProfile), 'should have userProfile object');
  ok(isObject(wc.activityStream), 'should have activityStream object');
  ok(isObject(wc.messageBoard), 'should have messageBoard object');
});

test('webCenter should have default set of functions', 7, function(){
  defined(wc,'init');
  defined(wc,'getResourceURL');
  defined(wc,'getTemplateItem');
  defined(wc,'resolveBindItems');
  defined(wc,'getCmisFolderUrl');
  defined(wc,'getCmisObjectByPathUrl');
  defined(wc,'getCmisResource');
});

test('userProfile should have default set of functions', 4, function(){
  var user = wc.userProfile;
  defined(user,'avatarLarge');
  defined(user,'avatarOriginal');
  defined(user,'avatarSmall');
  defined(user,'getCurrentUser');
});

test('activityStream should have default set of functions',3,function(){
  var stream = wc.activityStream;
  defined(stream,'currentActivityId');
  defined(stream,'getActivities');
  defined(stream,'nextActivityId');
});

test('messageBoard should have default set of functions', 1, function(){
  defined(wc.messageBoard,'postMessage');
});

module('Init','Main webCenter object initialization');

asyncTest('Should initialize webCenter and currentUser', function() {
	resetWC();
	wc.init({},
	function(d) {
		ok(isObject(wc.resourceIndex), "resourceIndex should be an object");

		equals(wc.resourceIndex.links.length, 11, "resourceIndex should have 11 services available");

		ok(isObject(wc.currentUser), "currentUser should be initialized");

	  equals(wc.currentUser.resourceType, 'urn:oracle:webcenter:people:person', "currentUser should be a person type");

		// this tests makes sure Don Hayler's on PS2 is available
		var nodes = $.grep(wc.currentUser.links, function(n) {
			if (n.rel == "urn:oracle:webcenter:activities:stream" && n.resourceType == "urn:oracle:webcenter:activities:stream") return true;
		});
		equals(nodes.length, 1, 'currentUser should have the query based activity stream link');

		equals(wc.currentUser.status.resourceType, "urn:oracle:webcenter:people:person:status", "currentUser should have a status object");

    var streamUrl = wc.getResourceURL(wc.resourceIndex.links, 'urn:oracle:webcenter:activities:stream', true);


		start();
	});
});

asyncTest('should throw error on 403', function() {
  resetWC();
	wc.init({
		'resourceIndexPath': '/403'
	},
	function(d) {
    equals(d.error, true, "error should be thrown")
		equals(d.xhr.status, 403, "response should be a 403");
		start();
	});
});

