var PageComponent = require("ds.base/PageComponent");

var KanbanBoardServer = PageComponent.create({
	data: function(attributes, vars, containerList) {
		var realJSON = [];
		this.boards = [];
		this.condition = attributes.condition;
        this.groupBy = attributes.group_by;
        this.bucketName = attributes.bucket;

        this._createBoards();

		return new StatusResponse('good', {
			boards: this.boards,
		});
	},

	_createBoards: function() {
		//Find the group by values for the boards
		var boardsObject = {};
		var bc = new FRecord(this.bucketName);
        if (this.condition) {
            bc.addEncodedSearch(this.condition);
        }
		bc.search();
		while (bc.next()) {
            var boardValue = bc.getValue(this.groupBy);
            console.log('BOARDVALUE: ' + boardValue);
            var boardName = bc.getDisplayValue(this.groupBy);
            if (boardsObject[boardValue] === undefined) {
                boardsObject[boardValue] = boardName;
            }


        }

        //Now iterate through the values and create boards
        for (var board in boardsObject) {
            console.log(board + " - " + boardsObject[board]);
            this.boards.push(this._createBoard(board, boardsObject[board]));

        }
	},

	_createBoard: function(id, title) {
		var board = {};
		board.id = id;
		board.title = title;
		//board.class = "info";
        //board.dragTo = ['_working'];
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
	
	type: "KanbanBoardServer"
});

module.exports = KanbanBoardServer;