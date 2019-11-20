/*eslint-env browser*/

//
// ROOM CODE 
// FOR GMTK GAME JAM 2019
// copyright 2019 dangraphics
//



function Room(difficulty, grd) {
    this.map = [];
    this.corners = {};
    this.isFlipped = false;
    
    //set up the room
    switch(difficulty){
        case 0:
            this.map = easyRoom;
            this.corners = easyCorners;
            break;
        case 1:
            this.map = easyRoom;
            this.corners = easyCorners;
            break;
        case 2:
            this.map = medRoom;
            this.corners = medCorners;
            break;
        case 3:
            this.map = hardRoom;
            this.corners = hardCorners;
            break;
        default:
            this.map = hardRoom;
            this.corners = hardCorners;
            break;
    }
    
    this.generated = [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0]
    ];
    
    this.getPlayerStartPos = function() {
        var pos = {};
        for (var y = 0; y < this.generated.length; y++) {
            for (var x = 0; x < this.generated[y].length; x++) {
                if (this.generated[y][x] == 'player') {
                    pos.x = x;
                    pos.y = y;
                }
            }
        }
        return pos;
    }
    
    this.drawRoom = function() {
        for (var y = 0; y < this.generated.length; y++) {
            for (var x = 0; x < this.generated[y].length; x++) {
                if (this.generated[y][x] != 0 && this.generated[y][x] != 'player') {
                    drawObject(this.generated[y][x]);
                }
            }
        }
    }
    
    //draws the object that go behind the player
    this.drawWallUnder = function() {
        for (var y = 0; y < this.generated.length; y++) {
            for (var x = 0; x < this.generated[y].length; x++) {
                if (this.generated[y][x].type == 'wall') {
                    drawObjectSecondImage(this.generated[y][x]);
                }
            }
        }
    }
    
    //draws the objects that go over the player
    this.drawWallOver = function() {
        for (var y = 0; y < this.generated.length; y++) {
            for (var x = 0; x < this.generated[y].length; x++) {
                if (this.generated[y][x].type == 'key') {
                    drawObject(this.generated[y][x]);
                }
                if (this.generated[y][x].type == 'wall') {
                    drawObject(this.generated[y][x]);
                }
                if (this.generated[y][x].type == 'spikeBall') {
                    drawObject(this.generated[y][x]);
                }
            }
        }
    }
    
    this.createKeyAtCoords = function(x,y) {
        var key = new BasicObject('images/key.png');
        var pos = grd.calcPosFromCoords(x,y);
        key.x = pos.x;
        key.y = pos.y;
        key.width = 16;
        key.height = 16;
        key.hitboxHeight = 16;
        key.hitboxWidth = 16;
        key.type = 'key';
        this.generated[y][x] = key;
    }
    
    this.createSpikeBallAtCoords = function(x,y) {
        var ball = new BasicObject('images/spike-ball.png');
        var pos = grd.calcPosFromCoords(x,y);
        ball.x = pos.x;
        ball.y = pos.y;
        ball.width = 16;
        ball.height = 16;
        ball.hitboxHeight = 10;
        ball.hitboxWidth = 10;
        ball.type = 'spikeBall';
        this.generated[y][x] = ball;
    }
    
    this.createExitAtCoords = function(x,y) {
        var exit = new BasicObject('images/exit.png');
        var pos = grd.calcPosFromCoords(x,y);
        exit.x = pos.x;
        exit.y = pos.y;
        exit.hitboxWidth = 25;
        exit.hitboxHeight = 25;
        exit.type = 'exit';
        this.generated[y][x] = exit;
    }
    
    this.createRandTileAtCoords = function(x,y) {
        var exit = new BasicObject('images/randTile.png');
        var pos = grd.calcPosFromCoords(x,y);
        exit.x = pos.x;
        exit.y = pos.y;
        exit.hitboxWidth = 32;
        exit.hitboxHeight = 32;
        exit.type = 'rand';
        this.generated[y][x] = exit;
    }
    
    //
    //
    //generate random room
    this.generateRoom = function(difficulty) {
        var spikeNum = 2;
        var randNum = 0;

        switch(difficulty){
            case 0:
                spikeNum = 0;
                randNum = 0;
                break;
            case 1:
                spikeNum = 2;
                randNum = 0;
                break;
            case 2:
                spikeNum = 5;
                randNum = 1;
                break;
            case 3:
                spikeNum = 8;
                randNum = 3;
                break;
            default:
                spikeNum = 8;
                break;
        }
        
        //generate walls in the room
        for (var y = 0; y < this.map.length; y++) {
            for (var x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] == 3) {
                    this.generated[y][x] = new BasicObject('images/Wall-Front.png');
                    var pos = grd.calcPosFromCoords(x,y);
                    this.generated[y][x].x = pos.x;
                    this.generated[y][x].y = pos.y;
                    this.generated[y][x].height = 40;
                    this.generated[y][x].yoffset = 4;
                    this.generated[y][x].hitboxWidth = 32;
                    this.generated[y][x].hitboxHeight = 32;
                    this.generated[y][x].hitoffsety = -4;
                    this.generated[y][x].image2.src = 'images/Wall-Back.png';
                    this.generated[y][x].type = 'wall';
                }
            }
        }
        
        if (difficulty == 0) {
            this.createStartingArea();
            return;
        }
        
        //generate start, key, and end positions first
        var whichSide = Math.random();
        if (whichSide > 0.5) {
            
            var pUpOrDown = Math.random();
            if (pUpOrDown > 0.5) {
                //set player
                this.generated[this.corners.TL.y][this.corners.TL.x] = 'player';

                //set door
                this.createExitAtCoords(this.corners.BL.x,this.corners.BL.y);
            } else {
                //set player
                this.generated[this.corners.BL.y][this.corners.BL.x] = 'player';

                //set door
                this.createExitAtCoords(this.corners.TL.x,this.corners.TL.y);
            }
            
            
            //set key and spike ball
            var upOrDown = Math.random();
            if (upOrDown > 0.5) {
                this.createKeyAtCoords(this.corners.BR.x,this.corners.BR.y);
                if (difficulty > 1)
                    this.createSpikeBallAtCoords(this.corners.TR.x,this.corners.TR.y);
            } else {
                this.createKeyAtCoords(this.corners.TR.x,this.corners.TR.y);
                if (difficulty > 1)
                    this.createSpikeBallAtCoords(this.corners.BR.x,this.corners.BR.y);
            }
        } else {
            var pUpOrDown = Math.random();
            if (pUpOrDown > 0.5) {
                //set player
                this.generated[this.corners.TR.y][this.corners.TR.x] = 'player';

                //set door
                this.createExitAtCoords(this.corners.BR.x,this.corners.BR.y);
            } else {
                //set player
                this.generated[this.corners.BR.y][this.corners.BR.x] = 'player';

                //set door
                this.createExitAtCoords(this.corners.TR.x,this.corners.TR.y);
            }
            
            //set key and spike ball
            var upOrDown = Math.random();
            if (upOrDown > 0.5) {
                this.createKeyAtCoords(this.corners.BL.x,this.corners.BL.y);
                if (difficulty > 1)
                    this.createSpikeBallAtCoords(this.corners.TL.x,this.corners.TL.y);
            } else {
                this.createKeyAtCoords(this.corners.TL.x,this.corners.TL.y);
                if (difficulty > 1)
                    this.createSpikeBallAtCoords(this.corners.BL.x,this.corners.BL.y);
            }
        }
        
        //generate randomized room
        
        //make spikes
        while(spikeNum > 0) {
            var y = Math.floor(5*Math.random()) + 1;
            var x = Math.floor(8*Math.random()) + 1;
            if (this.generated[y][x] == 0) {
                //don't generate spikes diagonal from each other
                if (this.generated[y+1][x+1].type != 'spikes' && this.generated[y+1][x-1].type != 'spikes' &&
                   this.generated[y-1][x+1].type != 'spikes' && this.generated[y-1][x-1].type != 'spikes') {
                    this.generated[y][x] = new BasicObject('images/spikes.png');
                    var pos = grd.calcPosFromCoords(x,y);
                    this.generated[y][x].x = pos.x;
                    this.generated[y][x].y = pos.y;
                    this.generated[y][x].hitboxWidth = 32;
                    this.generated[y][x].hitboxHeight = 32;
                    this.generated[y][x].type = 'spikes';
                    spikeNum -= 1;
                    //console.log("created spikes at: " + x + ":" + y);
                }
            }
        }
        
        //make random squares
        while(randNum > 0) {
            var y = Math.floor(5*Math.random()) + 1;
            var x = Math.floor(8*Math.random()) + 1;
            if (this.generated[y][x] == 0) {
                if (this.generated[y+1][x+1].type != 'spikes' && this.generated[y+1][x-1].type != 'spikes' &&
                   this.generated[y-1][x+1].type != 'spikes' && this.generated[y-1][x-1].type != 'spikes') {
                    if (this.generated[y+1][x+1].type != 'rand' && this.generated[y+1][x-1].type != 'rand' &&
                   this.generated[y-1][x+1].type != 'rand' && this.generated[y-1][x-1].type != 'rand') {
                        this.createRandTileAtCoords(x,y);
                        randNum -= 1;
                    }
                }
            }
        }
    }
    //
    //
    
    this.createStartingArea = function() {
        //make player
        this.generated[3][3] = 'player';
        
        //make spike trap
        var trap = new BasicObject('images/spikes.png');
        var pos = grd.calcPosFromCoords(4,3);
        trap.x = pos.x;
        trap.y = pos.y;
        trap.hitboxWidth = 32;
        trap.hitboxHeight = 32;
        trap.type = 'spikes';
        this.generated[3][4] = trap;
        
        //make difficulty selection doors
        var easyDoor = new BasicObject('images/easy.png');
        var epos = grd.calcPosFromCoords(6,2);
        easyDoor.x = epos.x;
        easyDoor.y = epos.y;
        easyDoor.type = 'easy';
        this.generated[2][6] = easyDoor;
        
        var medDoor = new BasicObject('images/medium.png');
        var mpos = grd.calcPosFromCoords(6,3);
        medDoor.x = mpos.x;
        medDoor.y = mpos.y;
        medDoor.type = 'medium';
        this.generated[3][6] = medDoor;
        
        var hardDoor = new BasicObject('images/hard.png');
        var hpos = grd.calcPosFromCoords(6,4);
        hardDoor.x = hpos.x;
        hardDoor.y = hpos.y;
        hardDoor.type = 'hard';
        this.generated[4][6] = hardDoor;
    }
    
    //generate assets in the room
    this.generateRoom(difficulty);
}


// ROOMS (if not randomly generated which would be easier)

// 0 = nothing
// 3 = wall

var hardRoom = [
    [3,3,3,3,3,3,3,3,3,3],
    [3,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,3],
    [3,3,3,3,3,3,3,3,3,3]
]
var hardCorners = { 
        TL: {x:1,y:1},
        TR: {x:8,y:1},
        BL: {x:1,y:5},
        BR: {x:8,y:5}
    };

var medRoom = [
    [3,3,3,3,3,3,3,3,3,3],
    [3,3,0,0,0,0,0,0,3,3],
    [3,3,0,0,0,0,0,0,3,3],
    [3,3,0,0,0,0,0,0,3,3],
    [3,3,0,0,0,0,0,0,3,3],
    [3,3,0,0,0,0,0,0,3,3],
    [3,3,3,3,3,3,3,3,3,3]
]
var medCorners = { 
        TL: {x:2,y:1},
        TR: {x:7,y:1},
        BL: {x:2,y:5},
        BR: {x:7,y:5}
    };

var easyRoom = [
    [3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3],
    [3,3,3,0,0,0,0,3,3,3],
    [3,3,3,0,0,0,0,3,3,3],
    [3,3,3,0,0,0,0,3,3,3],
    [3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3]
]
var easyCorners = { 
        TL: {x:3,y:2},
        TR: {x:6,y:2},
        BL: {x:3,y:4},
        BR: {x:6,y:4}
    };