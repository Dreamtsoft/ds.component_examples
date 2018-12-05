//
// calendar component class
//

var CalendarServer = ServerComponent.create({
	data: function(attributes, vars) {
		//Set variables
		console.log("DRS URL " + Configuration.getSiteURL() + "/ds.crm/home/details.default.sales_activity?q=%5b\"id\",\"eq\",\"" + "6b43d5f5a978496dabafc5097f14f94e\"");
		var url = (Configuration.getSiteURL() + "/ds.crm/home/details.default.sales_activity?q=%5b\"id\",\"eq\",\"" + "6b43d5f5a978496dabafc5097f14f94e\"");
		var bucketName = attributes.bucket;
		var startSlot = attributes.start_slot;
		var endSlot = attributes.end_slot;
		var titleSlot = attributes.title_slot;
		var condition = attributes.condition;
		var initialView = attributes.initial_view;
		var resourceSlot = attributes.resource_slot;
		var resourceBucketName = '';
		var showUnscheduledEvents = attributes.show_unscheduled_events;
		var unscheduledEventsCondition = attributes.unscheduled_event_condition;

		console.log('bucketName: ' + bucketName);
        console.log('condition: ' + condition);
        console.log('startSlot: ' + startSlot);
        console.log('endSlot: ' + endSlot);
        console.log('titleSlot: ' + titleSlot);
        console.log('unscheduledEventsCondition: ' + unscheduledEventsCondition);


        //Create the eventArray that will be passed to the client
		var eventArray = [];
		//Now go look for the event(s)
		var eventRecord = new FRecord(bucketName);
		if (condition) {
			eventRecord.addEncodedSearch(condition);
		}
		eventRecord.search();
		while (eventRecord.next()) {
			console.log('eventRecord: ' + eventRecord.getRecordDisplayValue());
			//Create the object for this event
			var eventObject = {};
			var startDateMS = parseInt(eventRecord[startSlot]);
			var endDateMS = parseInt(eventRecord[endSlot]);
			//var title = eventRecord[titleSlot].getDisplayValue();
            var title = eventRecord[titleSlot];
            var id = eventRecord.id;
			
			//Make sure you have an appropriate start and end date
			console.log(title);
			console.log('START DATE - ' + startDateMS);
			console.log('END DATE - ' + endDateMS);
			if (startDateMS > 0 && endDateMS > 0) {
				console.log('SOLID');
				eventObject.title = title;
				eventObject.id = id;
				eventObject.start = new Date(startDateMS).toISOString();
				eventObject.end = new Date(endDateMS).toISOString();
				if (!Object.isNil(resourceSlot)) {
					eventObject.resourceId = eventRecord[resourceSlot];
					if (!Object.isNil(eventObject.resourceId)) {
						resourceBucketName = eventRecord[resourceSlot].getFRecord().getBucketName();
					}
				}
				
				//Now add this object to the event array
				eventArray.push(eventObject);
			}
		}
				
		//Now iterate through the events and get the resource information
		var eventResourceArray = [];
		if (!Object.isNil(resourceSlot)) {
			eventArray.forEach( function (eventItem) {
			    var resourceId = eventItem.resourceId;
			    if (!Object.isNil(resourceId)) {
			    	eventResourceArray.push(resourceId);
			    }
			});
						
			var resourceArray = [];
			var resourceRecord = new FRecord(resourceBucketName);
			resourceRecord.addSearch("id", eventResourceArray);
			resourceRecord.search();
			while (resourceRecord.next()) {
				var resourceObject = {};
				resourceObject.id = resourceRecord.id;
				resourceObject.title = resourceRecord.getRecordDisplayValue();
				resourceObject.eventColor = resourceRecord.color;				
				resourceArray.push(resourceObject);
			}
		}
		
		//Process unscheduled events
		if (Object.isTrue(showUnscheduledEvents)) {
			console.log('LOOKING FOR UNSCHEDULED STUFF');
			//Create the eventArray that will be passed to the client
			var unscheduledEventArray = [];
			//Now go look for the event(s)
			var unscheduledEventRecord = new FRecord(bucketName);
			if (unscheduledEventsCondition) {
				unscheduledEventRecord.addEncodedSearch(unscheduledEventsCondition);
			}
			unscheduledEventRecord.search();
			while (unscheduledEventRecord.next()) {
				console.log("unscheduledEventRecord: " + unscheduledEventRecord.getRecordDisplayValue());
				//Create the object for this event
				var unscheduledEventObject = {};
				var title = unscheduledEventRecord[titleSlot].getDisplayValue();
				var id = unscheduledEventRecord.id;
								
				//Make sure you have an appropriate start and end date
				if (id) {
					unscheduledEventObject.title = title;
					unscheduledEventObject.id = id;
					
					//Now add this object to the event array
					unscheduledEventArray.push(unscheduledEventObject);
				}
			}
		}
		
		
		return new StatusResponse('good', {
			data: {
				events: eventArray,
				unscheduled_events: unscheduledEventArray,
				resources: resourceArray,
				initial_view: initialView,
				link_url: url
			 }	
		});
	},
	
	ajax_modifyEvent: function(vars) {
		var id = vars.id;
		var bucketName = vars.bucket;
		var startMS = vars.startMS;
		var endMS = vars.endMS;
		var startSlot = vars.startSlot;
		var endSlot = vars.endSlot;
		
		console.log('MODIFYING EVENT - ' + id);
		
		//If you've got everything you need
		if (id && bucketName && startMS && endMS && startSlot && endSlot) {
			console.log('UPDATING RECORD');
			//Update the record
			var r = new FRecord(bucketName);
			r.addSearch('id', id);
			r.search();
			if (r.next()) {
				console.log('FOUND RECORD - ' + r.getRecordDisplayValue());
				r[startSlot] = startMS;
				r[endSlot] = endMS;
				r.update();
			}
		}
		

		var returnObject = {};

		return new StatusResponse('good', {
			returnObject: returnObject
		});
	},
	
	ajax_createEvent: function(vars) {
		var title = vars.title;
		var bucketName = vars.bucket;
		var startMS = vars.startMS;
		var endMS = vars.endMS;
		var startSlot = vars.startSlot;
		var endSlot = vars.endSlot;
		var titleSlot = vars.titleSlot;
		
		//Create the record
		var r = new FRecord(bucketName);
		r[titleSlot] = title;
		r[startSlot] = startMS;
		r[endSlot] = endMS;
		r.insert();

		var returnObject = {};

		return new StatusResponse('good', {
			returnObject: returnObject
		});
	},
	
	className: "CalendarServer"
});

module.exports = CalendarServer;
