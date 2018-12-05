var PageComponent = require("ds.base/PageComponent");

var KanbanBoardServer = PageComponent.create({
	data: function(attributes, vars, containerList) {
		var realJSON = [];
		this.boards = [];
		//var bucketName = this.getBucketName(attributes, vars, containerList);
		//var parentRecord = this._getParentRecord(bucketName, vars);
		//var parentRecordID = parentRecord.getIntId();
		//var topLevelID = '0c205c3813654bc88c6b80451bc9a0b3';

		return new StatusResponse('good', {
			boards: this.boards,
		});
	},

	_createBoards: function() {
		var i = new FRecord('incident');
		i.search();
		if (i.next()) {
			i.state.getChoices();
		}

		this.boards.push(this._createBoard());
	},

	_createBoard: function(id, title) {
		var board = {};
		board.id = id;
		board.title = title;
		//board.class = "info";
        board.dragTo = ['_working'];
        var itemsArray = [];
        itemsArray.push(this._createItem());


        board.item = itemsArray;

        return board;



		/*
        {
            "id": "_todo",
            "title": "To Do",
            "class": "info,good",
            "dragTo": ['_working'],
            "item": [
            {
                "id": "_test_delete",
                "title": "Try drag this (Look the console)",
                "drag": function (el, source) {
                    console.log("START DRAG: " + el.dataset.eid);
                },
                "dragend": function (el) {
                    console.log("END DRAG: " + el.dataset.eid);
                },
                "drop": function(el, target, source, sibling){
                    console.log('DROPPED: ' + el.dataset.eid );
                    console.log(target);
                    console.log('SOURCE: ' + source);
                    console.log('SIBLING: ' + sibling);
                }
            },
            {
                "title": "Try Click This!",
                "click": function (el) {
                    alert("click");
                },
            }
        ]
        },

        */
	},

	_createItem: function(id, title) {
		var item = {};
		item.id = id;
		item.title = title;

		return item;

		/*
		{
                "id": "_test_delete",
                "title": "Try drag this (Look the console)",
                "drag": function (el, source) {
                    console.log("START DRAG: " + el.dataset.eid);
                },
                "dragend": function (el) {
                    console.log("END DRAG: " + el.dataset.eid);
                },
                "drop": function(el, target, source, sibling){
                    console.log('DROPPED: ' + el.dataset.eid );
                    console.log(target);
                    console.log('SOURCE: ' + source);
                    console.log('SIBLING: ' + sibling);
                }
            },
		 */

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
	
	type: "KanbanBoardServer"
});

module.exports = KanbanBoardServer;