var PageComponent = require("ds.base/PageComponent");
var Moment = require("ds.base/moment");

var GanttChartServer = PageComponent.create({
	data: function(attributes, vars, containerList) {

        var bucketName = this.getBucketName(attributes, vars, containerList);
        console.log('BUCKETNAME - ' + bucketName);
        var parentRecord = this._getParentRecord(bucketName, vars);

        console.log('PARENT RECORD - ' + parentRecord.id);

		//var bucketName = attributes.bucket;
		var startSlot = attributes.start_slot;
		var endSlot = attributes.end_slot;
		var titleSlot = attributes.title_slot;
		var condition = attributes.condition;
		
		var items = [];



		//Project
		var project = new FRecord('it_initiative');
		//project.addSearch('top_parent', parentRecord.id);
		project.search();
		if (project.next()) {
            console.log('ADDING PROJECT - ' + project.name);
            var type = "project";
            var open = true;
            var startMS = project.start_date;
            var endMS = project.end_date;
            var durationMS = endMS - startMS;
            var durationInDays = parseInt(durationMS) / 60 / 60 / 24 / 1000;
            console.log('DAYS - ' + durationInDays);
            var startDate = new Date(parseInt(project.start_date));
            var endDate = new Date(parseInt(project.end_date));
            console.log('START DATE - ' + startDate);
            console.log('END DATE - ' + endDate);
            var day = (("0" + (startDate.getDate())).slice(-2));
            var month = (("0" + (startDate.getMonth() + 1)).slice(-2));
            var year = startDate.getFullYear();
            var formattedDate = day + '-' + month + '-' + year;
            console.log('DATE - ' + formattedDate);

            items.push({
                id:project.id,
                type: "project",
                text:project.name,
                start_date: formattedDate,
                duration: durationInDays,
                parent: project.parent,
                open: true
            });
		}

		//Tasks
		var workItem = new FRecord('it_initiative_work');
		console.log('CONDITION - ' + condition);
		//if (condition) {
		//	workItem.addEncodedSearch(condition);
		//}
		workItem.addSearch('it_initiative', parentRecord.id);
		workItem.addSort("planned_start_date");
		workItem.search();
		console.log("******************ITEMS START****************");
		while (workItem.next()) {
            console.log("******************ITEM****************");
            console.log('Title - ' + workItem.title);
			var type = '';
			var open = true;
			console.log('HAS CHILD = ' + workItem.has_child);
			if (workItem.has_child == 1) {
				console.log('SETTING TYPE TO PROJECT');
				type = "project";
				type = type.replace(/"/g,"")
				open = true;
			}
			console.log('ADDING - ' + workItem.title);
			var startMS = workItem.planned_start_date;
			var endMS = workItem.planned_end_date;
			var durationMS = endMS - startMS;
			var durationInDays = parseInt(durationMS) / 60 / 60 / 24 / 1000;
			console.log('DAYS - ' + durationInDays);
			var startDate = new Date(parseInt(workItem.planned_start_date));
			console.log('START DATE - ' + startDate);
			var day = (("0" + (startDate.getDate())).slice(-2));
			var month = (("0" + (startDate.getMonth() + 1)).slice(-2));
			var year = startDate.getFullYear();
			var formattedDate = day + '-' + month + '-' + year;
			console.log('DATE - ' + formattedDate);

			items.push({
				id:workItem.id, 
				type: "task",
				text:workItem.title,
				start_date: formattedDate, 
				duration: durationInDays,
			    parent: workItem.parent,
			    open: open
			});


			
			//Now process the dependencies
			var links = [];
			var workDependency = new FRecord('relationship');
			workDependency.search();
			while (workDependency.next()) {

			    /*
				links.push({
					id:workDependency.id, 
					source:workDependency.predecessor.toString(),
					target: workDependency.successor.toString(),
					type: "0"
				});
				*/

                links.push({
                    id:"id",
                    source:"source",
                    target: "target",
                    type: "0"
                });
			}





		}
        console.log("******************ITEMS END****************");


        console.log('ITEMS JSON - ' + JSON.stringify(items));
        for (var itemskey in items) {
            var singleItem = items[itemskey];
            for (var itemskey2 in singleItem) {
                console.log(itemskey2 + ' - ' + singleItem[itemskey2]);
            }
        }

		console.log('LINKS - ' + links);
        for (var key in links) {
        	var singleLink = links[key];
            for (var key2 in singleLink) {
                console.log(key2 + ' - ' + singleLink[key2]);
            }
        }
		

		return new StatusResponse('good', {
			records: items,
			links: links
		});
	},

    _getParentRecord: function(bucketName, vars) {
        var query = vars.parms['q'];
        var newRecord = Object.isTrue(vars.parms['new']);

        var record = new FRecord(bucketName);
        record.setResolveReferences(false);
        record.addEncodedSearch(query);
        record.setSecurityChecks(true);

        if (newRecord) {
            record.newRecord();

            if (!Object.isNil(query))
                record.setValues(query);
        } else if (!Object.isNil(query)) {
            record.addEncodedSearch(query);
            record.search();
            record.next();
        }

        return record;
    },

    "/ajax/createNewTask": function(data) {
	    console.log('SERVER - ADDING NEW TASK');
        console.log('DATA - ' + JSON.stringify(data));
        var oldId = data.id;
        var startDate = data.startDate;
        var durationDays = data.duration;
        var parent = data.parent;
        var type = data.type;
        var title = data.text;
        var critical = data.critical;

        var startDateMS = new Date(startDate).getTime();
        var duration = durationDays * 86400;
        var durationMS = durationDays * 86400 * 1000;
        var endDateMS = startDateMS + durationMS;


        var fr = new FRecord('neo_project_task');
        fr.planned_start_date = parseInt(startDateMS);
        fr.duration = parseInt(duration * 86400);
        fr.planned_end_date = parseInt(endDateMS);
        fr.parent = parent;
        fr.title = title;
        fr.task_type = type;
        fr.critical = critical;

        var newId = fr.insert();

        console.log('CREATED TASK - ' + newId);

        return new StatusResponse('good', {
            newId: newId
        });
    },


    "/ajax/updateTask": function(data) {
        console.log('SERVER - MODIFYING  TASK - ' + data.oldId);
        console.log(('START DATE STRING - ' + data.startDate));
        console.log('DATA - ' + JSON.stringify(data));
        var id = data.oldId;
        var startDate = data.startDate;
        var durationDays = data.duration;
        var parent = data.parent;
        var type = data.type;
        var critical = data.critical;

        var startDateString = "2018-05-12T07:00:00.000Z";


        var fr = new FRecord('neo_project_task');
        fr.addSearch('id', id);
        fr.search();
        if (fr.next()) {
            //Start date
            //var startDateMS = Moment(startDate);
            //var startDateMS = Moment(startDate).unix() * 1000;
            var startDateMS = new Date(startDate).getTime();
            var duration = durationDays * 86400;
            var durationMS = durationDays * 86400 * 1000;
            var endDateMS = startDateMS + durationMS;
            fr.critical = critical;

            fr.planned_start_date = parseInt(startDateMS);
            fr.duration = parseInt(duration * 86400);
            fr.planned_end_date = parseInt(endDateMS);
            fr.parent = parent;
            fr.task_type = type;

            fr.update();

            console.log('MODIFIED TASK - ' + id);
        }

        return new StatusResponse('good', {
            //newId: newId
        });
    },

    "/ajax/deleteTask": function(data) {
        console.log('SERVER - DELETING  TASK - ' + data.oldId);

        var id = data.oldId;

        var fr = new FRecord('neo_project_task');
        fr.addSearch('id', id);
        fr.search();
        if (fr.next()) {
            fr.del();

            console.log('DELETED TASK - ' + id);
        }

        return new StatusResponse('good', {
            //newId: newId
        });
    },

    "/ajax/createNewLink": function(data) {
        console.log('SERVER - ADDING NEW LINK');
        console.log('DATA - ' + JSON.stringify(data));
        var source = data.source;
        var target = data.target;
        var type = data.type;
        console.log('SOURCE - ' + source);
        console.log('TARGET - ' + target);
        console.log('TYPE - ' + type);


        //Finish-to-start (FS)=fs
        // Finish-to-finish (FF)=ff
        // Start-to-start (SS)=ss
        // Start-to-finish (SF)=sf

        /*
        if (data.type == 0) {
            type = "fs";
        } else if (data.type == 1) {
            type = "ss";
        } else if (data.type == 2) {
            type = "ff";
        } else if (data.type == 3) {
            type = "sf";
        }
        */



        var fr = new FRecord('neo_project_task_relationship');
        fr.predecessor = source;
        fr.successor = target;
        fr.type = type;

        var newId = fr.insert();

        console.log('CREATED LINK - ' + newId);

        return new StatusResponse('good', {
            newId: newId
        });
    },
	
	type: "GanttChartServer"
});

module.exports = GanttChartServer;