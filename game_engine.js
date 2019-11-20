/*eslint-env browser*/

//
// BASIC ENGINE CODE 
// FOR GMTK GAME JAM 2019
// copyright 2019 danegraphics
//
// I included code for a parallax effect... just in case.

//load the canvas and context
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

//booleans for button presses
var rightPressed = false;
var upPressed = false;
var leftPressed = false;
var downPressed = false;
var spacePressed = false;

//OBJECT CONSTRUCTORS

//camera object
function Camera(x, y) {
    this.x = x;
    this.y = y;
    this.following = false;
    this.update = function(obj) {
        if (this.following) {
            this.x += 0.05*(obj.x - this.x);
            this.y += 0.05*(obj.y - this.y);
        }
    }
}

//basic object
function BasicObject(source) {
    this.x = 0;
    this.y = 0;
    this.xoffset = 0;
    this.yoffset = 0;
    this.vx = 0;
    this.vy = 0;
    this.image = new Image();
    this.image.src = source;
    this.image2 = new Image();
    this.width = 32;
    this.height = 32;
    this.parallax = 0;
    this.opacity = 1;
    this.adds = false;
    this.canHit = false;
    this.hitboxWidth = 25;
    this.hitboxHeight = 25;
    this.hitoffsetx = 0;
    this.hitoffsety = 0;
    this.type = '';
}

//Grid object
function Grid(r, c, w, h) {
    this.rows = r;
    this.columns = c;
    this.boxWidth = w;
    this.boxHeight = h;
    this.calcPosFromCoords = function(x,y) {
        var startx = -1*(this.columns * this.boxWidth)/2 + this.boxWidth/2;
        var starty = (this.rows * this.boxHeight)/2 - this.boxHeight/2;
        var outx = x*this.boxWidth + startx;
        var outy = -1*y*this.boxHeight + starty;
        return {x: outx, y: outy};
    }
}

//template sprite object
function SpriteObject() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.image = new Image();
    this.height = 16;
    this.width = 16;
    this.sprite_w = 16;
    this.sprite_h = 16;
    this.sprite_x = 0;
    this.sprite_y = 0;
    this.hitboxWidth = 32;
    this.hitboxHeight = 32;
    this.hitoffsetx = 0;
    this.hitoffsety = 0;
    this.canHit = false;
    this.type = '';
    this.animations = {};
    this.current_animation = {};
    this.parallax = 0;
    this.opacity = 1;
    this.state = 'idle';
    this.previous_state = 'idle';
}

//sprite animation constructors
function SpriteAnimation() {
    this.sprite_frames = 2;
    this.sprite_row = 0;
    this.fps = 10;
    this.current_frame = 0;
    this.frame_counter = 0;
    this.loop = true;
    this.completed = false;
}
function SpriteAnimation(row, frames, fps) {
    this.sprite_frames = frames;
    this.sprite_row = row;
    this.fps = fps;
    this.current_frame = 0;
    this.frame_counter = 0;
    this.loop = true;
    this.completed = false;
}

//repeating background object
function Background(source) {
    this.image = new Image();
    this.image.src = source;
    this.x = 0;
    this.y = 0;
    this.width = canvas.width;
    this.height = canvas.height;
    this.parallax = 0;
    this.opacity = 1;
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}

//UPDATE FUNCTIONS

function updateSpriteAnimation(object) {
    //set the frame length based on fps
    var frameLength = 60 / object.current_animation.fps;
    
    //iterate frame counter
    object.current_animation.frame_counter += 1;
    if (object.current_animation.frame_counter >= 60000) {
        object.current_animation.frame_counter = 0;
    }
    
    //figure out current frame
    var currentFrame = Math.floor(object.current_animation.frame_counter/frameLength);
    if (currentFrame >= object.current_animation.sprite_frames) {
        if (!object.current_animation.loop) {
            object.current_animation.completed = true;
        }
    }
    currentFrame = currentFrame % object.current_animation.sprite_frames;
    
    object.current_animation.current_frame = currentFrame;
    object.sprite_x = object.sprite_w*currentFrame;
    object.sprite_y = object.current_animation.sprite_row * object.sprite_h;
    
    return object;
}


//DRAWING FUNCTIONS

function drawObject(object) {
    var x = (canvas.width/2) + (Math.floor(object.x+object.xoffset) - Math.floor((1-object.parallax)*camera.x) - (object.width/2));
    var y = (canvas.height/2) - (Math.floor(object.y+object.yoffset) - Math.floor((1-object.parallax)*camera.y) + (object.height/2));
    ctx.globalAlpha = object.opacity;
    if(object.adds) {
        ctx.globalCompositeOperation = 'overlay';
        ctx.drawImage(object.image, x, y, object.width, object.height);
        ctx.globalCompositeOperation = 'source-over';
    } else {
        ctx.drawImage(object.image, x, y, object.width, object.height);
    }
    ctx.globalAlpha = 1;
}

function drawObjectSecondImage(object) {
    var x = (canvas.width/2) + (Math.floor(object.x+object.xoffset) - Math.floor((1-object.parallax)*camera.x) - (object.width/2));
    var y = (canvas.height/2) - (Math.floor(object.y+object.yoffset) - Math.floor((1-object.parallax)*camera.y) + (object.height/2));
    ctx.globalAlpha = object.opacity;
    ctx.drawImage(object.image2, x, y, object.width, object.height);
    ctx.globalAlpha = 1;
}

function drawBackground(backg) {
    var x = (canvas.width/2) + (Math.floor(backg.x) - Math.floor((1-backg.parallax)*camera.x));
    var y = (canvas.height/2) - (Math.floor(backg.y) - Math.floor((1-backg.parallax)*camera.y));
    var ptrn = ctx.createPattern(backg.image, 'repeat');
    ctx.fillStyle = ptrn;
    ctx.globalAlpha = backg.opacity;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillRect(0, 0, backg.width, backg.height);
    ctx.restore();
    ctx.globalAlpha = 1;
}

function drawSpriteObject(spr) {
    var x = (canvas.width/2) + (Math.floor(spr.x) - Math.floor((1-spr.parallax)*camera.x) - (spr.width/2));
    var y = (canvas.height/2) - (Math.floor(spr.y) - Math.floor((1-spr.parallax)*camera.y) + (spr.height/2));
    ctx.globalAlpha = spr.opacity;
    ctx.drawImage(spr.image, spr.sprite_x, spr.sprite_y, spr.sprite_w, spr.sprite_h, x, y, spr.width, spr.height);
    ctx.globalAlpha = 1;
}

//COLLISON DETECTION

//basic box collision detection
function checkBoxCollision(obj1, obj2) {
    var distx = Math.abs((obj1.x+obj1.hitoffsetx) - (obj2.x+obj2.hitoffsetx));
    var disty = Math.abs((obj1.y+obj1.hitoffsety) - (obj2.y+obj2.hitoffsety));
    if((distx < (obj1.hitboxWidth/2 + obj2.hitboxWidth/2)) && (disty < (obj1.hitboxHeight/2 + obj2.hitboxHeight/2))) {
        return true;
    }
    return false;
}

function collisionWithWall(obj, wall) {
    var offsetx = (obj.x+obj.hitoffsetx) - (wall.x+wall.hitoffsetx);
    var offsety = (obj.y+obj.hitoffsety) - (wall.y+wall.hitoffsety);
    var distx = Math.abs(offsetx);
    var disty = Math.abs(offsety);
    if((distx < (obj.hitboxWidth/2 + wall.hitboxWidth/2)) && (disty < (obj.hitboxHeight/2 + wall.hitboxHeight/2))) {
        //correct collision
        if (disty < distx) {
            var fixx = (offsetx/distx)*(obj.hitboxWidth/2 + wall.hitboxWidth/2) - offsetx;
            obj.x += fixx;
        } 
        if (distx < disty){
            var fixy = (offsety/disty)*(obj.hitboxHeight/2 + wall.hitboxHeight/2) - offsety;
            obj.y += fixy;
        }
    }
}

//Keyboard Input Detection
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
function keyDownHandler(e) {
    if ("code" in e) {
        switch(e.code) {
            case "Unidentified":
                break;
            case "ArrowRight":
            case "Right":
            case "KeyD":
                rightPressed = true;
                return;
            case "ArrowLeft":
            case "Left":
            case "KeyA":
                leftPressed = true;
                return;
            case "ArrowUp":
            case "Up":
            case "KeyW":
                upPressed = true;
                return;
            case "ArrowDown":
            case "Down":
            case "KeyS":
                downPressed = true;
                return;
            case "Space":
                spacePressed = true;
                return;
            default:
                return;
        }
    }
}
function keyUpHandler(e) {
    if ("code" in e) {
        switch(e.code) {
            case "Unidentified":
                break;
            case "ArrowRight":
            case "Right":
            case "KeyD":
                rightPressed = false;
                return;
            case "ArrowLeft":
            case "Left":
            case "KeyA":
                leftPressed = false;
                return;
            case "ArrowUp":
            case "Up":
            case "KeyW":
                upPressed = false;
                return;
            case "ArrowDown":
            case "Down":
            case "KeyS":
                downPressed = false;
                return;
            case "Space":
                spacePressed = false;
                return;
            default:
                return;
        }
    }
}