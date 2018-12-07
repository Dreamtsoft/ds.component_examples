var PageComponent = require('ds.base/PageComponent');

var WorkBoardServer = PageComponent.create({
	data: function(attributes, vars, containerList) {
	    console.log("TESTING!!!");
		var realJSON = [];
		this.boards = [];
		this.condition = attributes.condition;
		this.groupBy = attributes.group_by;
		this.bucketName = attributes.bucket;

		this._createBoards();

		return new StatusResponse('good', {
			boards: this.boards
		});
	},

	_createBoards: function() {
		//Find the group by values for the boards
		console.log('GROUPBY ' + this.groupBy);
		var boardsObject = {};
		var bc = new FRecord(this.bucketName);
		var sd = bc.getSlotDefinition(this.groupBy);
		var none_opt = sd.attributes.none_option;
		var choices = JSON.stringify(sd.attributes.choices);
		console.log('SLOT DEFINITION' + JSON.stringify(sd));
		console.log("NONE OPTION "+ sd.attributes.none_option);
		if (sd.type == 'choice' && Object.isNil(sd.attributes.bucket_name)) {
			if(none_opt === true){
			boardsObject[0] = "No Value";
			}
			console.log(boardsObject[0]);
			for (var i = 0; i < sd.attributes.choices.length; i++) {
				var len = i +1;
				var choice = sd.attributes.choices[i];
				console.log("CHOICE LABEL" + choice.label + " CHOICE VALUE " + choice.value);
				boardsObject[len] = choice.label;
			}
		} else {
			if (this.condition) {
				bc.addEncodedSearch(this.condition);
			}
			bc.search();
			while (bc.next()) {
				var boardValue = bc.getValue(this.groupBy);
				console.log('BOARDVALUE: ' + boardValue);
				var boardName = 'No Value';
				if (!Object.isNil(boardValue)) {
					var boardName = bc.getDisplayValue(this.groupBy);
				}
				if (boardsObject[boardValue] === undefined) {
					boardsObject[boardValue] = boardName;
				}
			}
		}
		//Now iterate through the values and create boards
		console.log("JSON STIRINGIFY BOBJECT" + JSON.stringify(boardsObject));
		for (var board in boardsObject) {
			console.log(board + ' - ' + boardsObject[board]);
			this.boards.push(this._createBoard(board, boardsObject[board]));
		}
	},

	_createBoard: function(id, title) {
		console.log("STARTING CREATE BOARD");
		console.log("CREATE BOARD ID = " + id + " LABEL/TITLE " + title);
		var board = {};
		board.id = id;
		board.title = title;
		board.class = 'info';
		//board.dragTo = ['_working'];

		//Now go get the items
		var itemsArray = [];
		var ic = new FRecord(this.bucketName);
		if (this.condition) {
			ic.addEncodedSearch(this.condition);
		}
		ic.addSearch(this.groupBy, id);
		ic.search();
		while (ic.next()) {
			itemsArray.push(
				this._createItem(
					ic.id,
					ic.getRecordDisplayValue() + ': ' + ic.title
				)
			);
		}

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

    ajax_updateRecord: function(vars) {
	    console.log('AJAX UPDATING RECORD: ' + JSON.stringify(vars));
        var recordId = vars.id;
        var recordBucket = vars.bucket;
        var newValue = vars.newValue;
        var groupBy = vars.groupBy;

        //Update the record
        var r = new FRecord(recordBucket);
        r.getRecord(recordId);
        r[groupBy] = newValue;
        r.update();

        var returnObject = {};

        return new StatusResponse('good', {
            returnObject: returnObject
        });
    },
	
	type: "WorkBoardServer"
});

module.exports = WorkBoardServer;
