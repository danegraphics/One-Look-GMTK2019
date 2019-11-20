/*eslint-env browser*/

//
// CODE FOR GMTK GAME JAM 2019
// copyright 2019 dangraphics
//

//create camera
var camera = new Camera(0,0);

//create grid
var grid = new Grid(7, 10, 32, 32);

//set difficulty
var gameDifficulty = 0;

//create room
var room = new Room(gameDifficulty, grid);

//prepare player
var player;

//prepare other global elements
var bg;
var fog;
var fogVisibile = false;
var randApplied = false;

//just a check mark
var victoryText = new BasicObject('images/victory.png');
victoryText.y = -1*canvas.height-100;
victoryText.width = 250;
victoryText.height = 128;
var victorious = false;

//just an X
var failureText = new BasicObject('images/failure.png');
failureText.y = -1*canvas.height-100;
failureText.width = 250;
failureText.height = 128;

//title card and instructions
var card = new BasicObject('images/title.png');
card.x = 0;
card.y = 88;
card.width = 250;
card.height = 128;

var inst = new BasicObject('images/instructions.png');
inst.x = 0;
inst.y = -68;
inst.width = 250;
inst.height = 128;

var contl = new BasicObject('images/controlsL.png');
contl.x = -112;
contl.y = 8;
contl.width = 128;
contl.height = 128;

var contr = new BasicObject('images/controlsR.png');
contr.x = 112;
contr.y = 8;
contr.width = 128;
contr.height = 128;

//sign indicating flipped room
var flipSign = new BasicObject('images/flipSign.png');
flipSign.width = 250;
flipSign.height = 128;
flipSign.opacity = 0;

//sounds
var walkSound = new sound('sounds/slimeWalk.mp3');
var deathSound = new sound('sounds/explode.mp3');
var winSound = new sound('sounds/win.mp3');
var click = new sound('sounds/click.mp3');
var ting = new sound('sounds/ting.mp3');
var teleSound = new sound('sounds/teleport.mp3');
var wonkSound = new sound('sounds/wonky.mp3');
var flipSound = new sound('sounds/flip.mp3');

//init function
function init() {
    //create player
    player = new Player();
    
    //create background
    bg = new Background('images/floor.png');
    bg.x = -1*(canvas.width/2);
    bg.y = 1*(canvas.height/2);
    //bg.parallax = 0.5;
    
    //create fog
    fog = new Background('images/fog.png');
    fog.x = -1*(canvas.width/2);
    fog.y = 1*(canvas.height/2);
    fog.width = canvas.width*1.5;
    fog.height = canvas.height*1.5;
    fog.parallax = 0.4;
    fog.opacity = 0;
    
    startNewRoom();
    
    //start the main loop
    window.requestAnimationFrame(main_loop);
}

//main loop
function main_loop() {
    //clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    //MAIN LOOP CODE
    
    //for going back to the main menu
    if (spacePressed && player.alive) {
        gameDifficulty = 0;
        killPlayer();
    }
    
    //update player and player objects
    player.update();
    
    //update camera
    camera.update(player);
    
    //update fog
    if (gameDifficulty != 0) {
            fog.x -= 0.2;
        if (fog.x < -1*(canvas.width/2)-126) {
            fog.x = -1*(canvas.width/2);
        }
        if (fogVisibile && fog.opacity <= 1) {
            fog.opacity += 0.05;
            if (fog.opacity > 1) {
                fog.opacity = 1;
            }
        } else if (!fogVisibile && fog.opacity > 0) {
            fog.opacity -= 0.05;
            if (fog.opacity < 0) {
                fog.opacity = 0;
            }
        }
    }
    
    //update the sign indicating that the room was flipped
    if (flipSign.opacity > 0) {
        flipSign.opacity -= 0.05;
    }
    
    //loop through and update room objects and check for wall collisions
    for (var y = 0; y < room.generated.length; y++) {
        for (var x = 0; x < room.generated[y].length; x++) {
            if(player.alive) {
                if (room.generated[y][x].type == 'wall') {
                    collisionWithWall(player, room.generated[y][x]);
                }
                
                if (room.generated[y][x].type == 'key' && player.key == null) {
                    var collides = checkBoxCollision(player, room.generated[y][x]);
                    if (collides) {
                        player.key = room.generated[y][x];
                        console.log('grabbed key');
                        ting.play();
                    }
                }
                if (room.generated[y][x].type == 'exit' && player.key != null && !victorious) {
                    var collides = checkBoxCollision(player, room.generated[y][x]);
                    if (collides) {
                        showVictory();
                        winSound.play();
                    }
                }
                
                if (room.generated[y][x].type == 'rand') {
                    var collides = checkBoxCollision(player, room.generated[y][x]);
                    if (collides) {
                        if (!randApplied) {
                            randomEffect();
                            randApplied = true;
                            setTimeout(function(){
                                randApplied = false;
                            }, 2000);
                        }
                    }
                }
                
                //difficultySelection
                if (room.generated[y][x].type == 'easy' && !victorious) {
                    var collides = checkBoxCollision(player, room.generated[y][x]);
                    if (collides) {
                        room.generated[y][x].adds = true;
                        gameDifficulty = 1;
                        showVictory();
                        click.play();
                    }
                }
                if (room.generated[y][x].type == 'medium' && !victorious) {
                    var collides = checkBoxCollision(player, room.generated[y][x]);
                    if (collides) {
                        room.generated[y][x].adds = true;
                        gameDifficulty = 2;
                        showVictory();
                        click.play();
                    }
                }
                if (room.generated[y][x].type == 'hard' && !victorious) {
                    var collides = checkBoxCollision(player, room.generated[y][x]);
                    if (collides) {
                        room.generated[y][x].adds = true;
                        gameDifficulty = 3;
                        showVictory();
                        click.play();
                    }
                }
                
                //deadly detection comes last because otherwise it will continue to look for collisions
                
                if (room.generated[y][x].type == 'spikes') {
                    var collides = checkBoxCollision(player, room.generated[y][x]);
                    if (collides) {
                        killPlayer();
                    }
                }
                
                if (room.generated[y][x].type == 'spikeBall') {
                    var distx = player.x-room.generated[y][x].x;
                    var disty = player.y-room.generated[y][x].y;
                    var dist = Math.sqrt(Math.pow(distx,2) + Math.pow(disty,2));
                    room.generated[y][x].x += (0.1*(gameDifficulty+1))*(distx/Math.abs(dist));
                    room.generated[y][x].y += (0.1*(gameDifficulty+1))*(disty/Math.abs(dist));
                    var collides = checkBoxCollision(player, room.generated[y][x]);
                    if (collides) {
                        killPlayer();
                    }
                }
            }
        }
    }

    
    //draw objects
    drawBackground(bg);
    room.drawRoom();
    
    //draw fog
    ctx.save();
    ctx.beginPath();
    ctx.rect(Math.ceil(-1*camera.x), Math.floor(camera.y), canvas.width, canvas.height);
    ctx.clip();
    drawBackground(fog);
    ctx.restore();
    
    //draw wall that goes behind everything
    room.drawWallUnder();
    
    //Draw splats
    player.drawSplats();
    
    //draw player
    if(player.alive) {
        drawSpriteObject(player);
    }
    
    //draw wall that goes in front of everything
    room.drawWallOver();
    
    //draw death blobs if there are any
    player.drawBlobs();
    
    //draw victory text if victorious and failure text if dead
    if(victorious) {
        victoryText.y = 0.9*victoryText.y;
        drawObject(victoryText);
    }
    if (!player.alive && gameDifficulty != 0) {
        failureText.y = 0.9*failureText.y;
        drawObject(failureText);
    }
    
    //draw the flipped room sign
    if (flipSign.opacity > 0) {
        drawObject(flipSign);
    }
    
    //draw titlecard
    if (gameDifficulty == 0 && player.alive) {
        drawObject(card);
        drawObject(inst);
        drawObject(contl);
        drawObject(contr);
    }
    
    //start animation frame over
    window.requestAnimationFrame(main_loop);
}

//create a new room
function startNewRoom() {
    //reset all of the necessary values
    victorious = false;
    victoryText.y = -1*canvas.height-100;
    failureText.y = -1*canvas.height-100;
    
    room = new Room(gameDifficulty, grid);
    
    //set the starting position of the player
    var playerSquare = room.getPlayerStartPos();
    var startPos = grid.calcPosFromCoords(playerSquare.x,playerSquare.y);
    player.x = startPos.x;
    player.y = startPos.y+4;
    
    fog.opacity = 0;
    
    camera.x = 0;
    camera.y = 0;
    
    camera.following = false;
    player.controllable = false;
    player.invertedControls = false;
    
    if(gameDifficulty == 0) {
        player.controllable = true;
        setTimeout(function() {
            camera.following = true;
        }, 3000);
    } else {
        setTimeout(function() {
            camera.following = true;
            player.controllable = true;
            fogVisibile = true;
        }, 700);
    }   
}

function showVictory() {
    victorious = true;
    fogVisibile = false;
    
    //set timer to start over
    setTimeout(function() {
        player.reset();
        player.alive = true;
        startNewRoom();
    }, 3000);
}

function killPlayer() {
    console.log('dead');
    player.die();
    fogVisibile = false;
    deathSound.play();
    
    //ressurrect player after 2 seconds
    if (!victorious) {
        setTimeout(function() {
            player.alive = true;
            startNewRoom();
        }, 2000);
    }
}

function randomEffect() {
    //when a random tile is hit, one of three random effects will take place here
    var roll = Math.random();
    if (roll < 0.33) {
        //do teleport
        var teleported = false;
        while(!teleported) {
            var xrand = Math.floor(7*Math.random() + 1);
            var yrand = Math.floor(4*Math.random() + 1);
            if (room.generated[yrand][xrand] == 0) {
                var pos = grid.calcPosFromCoords(xrand,yrand);
                player.x = pos.x;
                player.y = pos.y;
                teleSound.play();
                teleported = true;
            }
        }
    } else if (roll < 0.66) {
        //invert controls
        if (!player.invertedControls) {
            player.invertedControls = true;
            wonkSound.play();
        }
    } else {
        //flip room
        if (!room.isFlipped) {
            //flip room elements
            for (var y = 0; y < room.generated.length; y++) {
                for (var x = 0; x < room.generated[y].length; x++) {
                    room.generated[y][x].x = -1*room.generated[y][x].x;
                }
            }
            
            for(var i = 0; i < player.splats.length; i++) {
                player.splats[i].x = -1*player.splats[i].x;
            }
            
            player.x = -1*player.x;
            
            room.isFlipped = true;
            flipSound.play();
            flipSign.opacity = 1;
        }
    }
}

//start the engine
init();