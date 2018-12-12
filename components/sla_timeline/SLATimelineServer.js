var PageComponent = require("ds.base/PageComponent");
var moment = require("ds.base/Moment");

var SLATimelineServer = PageComponent.create({
	data: function(attributes, vars, containerList) {
		this.slaArray = [];
		var bucketName = this.getBucketName(attributes, vars, containerList);
		var parentRecord = this._getParentRecord(bucketName, vars);
		var parentRecordID = parentRecord.getIntId();
		//var topLevelID = '0c205c3813654bc88c6b80451bc9a0b3';

		var sla = new FRecord('sla');
		sla.addSearch("record", parentRecordID);
		sla.search();
		while (sla.next()) {
			let newSLA = {};
			newSLA.name = sla.definition.name;
			newSLA.status = sla.status;
			var totalSLAMS = sla.breach_time - sla.sla_start;
			console.log("totalSLAMS: " + totalSLAMS);
			var nowMS = new Date().getTime();
            console.log("nowMS: " + nowMS);
			var elapsedSLAMS = nowMS - sla.sla_start;
            console.log("elapsedSLAMS: " + elapsedSLAMS);
			var elapsedPercentage = elapsedSLAMS / totalSLAMS * 100;
			if (elapsedPercentage < 1) {
                elapsedPercentage = 1;
			}
            console.log("elapsedPercentage: " + elapsedPercentage);
            var remainingSLAMS = totalSLAMS - elapsedSLAMS;
            console.log("remainingSLAMS: " + remainingSLAMS);
            newSLA.breached = sla.breached;
            console.log("sla.breached: " + sla.breached);

            //var moment = new Moment();
            //moment.duration(durationSeconds, "seconds").humanize();
			var timeLeftString = "no time";
			if (remainingSLAMS > 0) {
                timeLeftString = moment.duration(remainingSLAMS).humanize();
            }
            newSLA.timeLeftString = timeLeftString;
            console.log("timeLeftString: " + timeLeftString);

            newSLA.elapsedPercentage = elapsedPercentage.toFixed(2);
            this.slaArray.push(newSLA);
		}

		return new StatusResponse('good', {
            data: {
                slaArray: this.slaArray
            }

		});
	},
	
	_getParentRecord: function(bucketName, vars) {
		var query = vars.parms['q'];
		var newRecord = Object.isTrue(vars.parms['new']);
		
		var record = new FRecord(bucketName);
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
	
	type: "SLATimelineServer"
});

module.exports = SLATimelineServer;