/*eslint-env browser*/

//
// PLAYER CHARACTER CODE 
// FOR GMTK GAME JAM 2019
// copyright 2019 danegraphics
//

//main player object
function Player() {
    this.x = 0;
    this.y = 0;
    this.height = 16;
    this.width = 16;
    this.opacity = 0.8;
    this.sprite_w = 16;
    this.sprite_h = 16;
    this.sprite_x = 0;
    this.sprite_y = 0;
    this.hitboxWidth = 8;
    this.hitboxHeight = 8;
    this.hitoffsetx = 0;
    this.hitoffsety = -4;
    this.animations = {};
    this.current_animation = {};
    this.parallax = 0;
    this.state = 'idle';
    this.previous_state = 'idle';
    this.alive = true;
    this.controllable = false;
    this.blobs = [];
    this.splats = [];
    this.key = null;
    this.invertedControls = false;
    
    //velocity variables just in case
    this.vx = 0;
    this.vy = 0;
    
    //initiate image
    this.image = new Image();
    this.image.src = 'images/SimeSprites.png';
    
    //create animations
    this.animations.idle = new SpriteAnimation(0, 6, 10);
    this.animations.running = new SpriteAnimation(1, 7, 20);
    this.current_animation = this.animations.idle;
    
    //generate blobs upon death
    this.createBlobs = function(n) {
        //create n blobs
        for(var i = 0; i < n; i++) {
            var blob = new Blob('images/slime-ball.png');
            var speed = 0.5 + Math.random();
            var direction = Math.random()*2*Math.PI;
            blob.vx = speed*Math.cos(direction);
            blob.vy = speed*Math.sin(direction);
            blob.x = this.x;
            blob.y = this.y;
            this.blobs.push(blob);
        }
    }
    
    //draw the blobs if there are any
    this.drawBlobs = function() {
        for(var i = 0; i < this.blobs.length; i++) {
            drawObject(this.blobs[i]);
        }
    }
    
    //draw the splats if there are any
    this.drawSplats = function() {
        ctx.globalCompositeOperation = 'overlay';
        for(var i = 0; i < this.splats.length; i++) {
            drawObject(this.splats[i]);
        }
        ctx.globalCompositeOperation = 'source-over';
    }
    
    this.die = function() {
        this.alive = false;
        this.state = 'idle';
        this.invertedControls = false;
        this.current_animation = this.animations.idle;
        this.key = null;

        //spawn splatters
        player.createBlobs(15);
        
        //creat death splat
        var splat = new BasicObject('images/splat.png');
        splat.x = this.x;
        splat.y = this.y;
        splat.width = 30;
        splat.height = 24;
        splat.yoffset = -5;
        splat.opacity = 1.5;
        this.splats.push(splat);
    }
    
    this.reset = function() {
        this.alive = false;
        this.state = 'idle';
        this.current_animation = this.animations.idle;
        this.key = null;
    }
    
    this.madeSplat = false;
    
    this.update = function() {
        //for whether the player is alive or not
        
        //update trail if it exists
        if (this.state == 'running' && this.current_animation.current_frame == 6) {
            if (!this.madeSplat) {
                var splat = new BasicObject('images/splat.png');
                splat.x = this.x;
                splat.y = this.y;
                splat.width = 15;
                splat.height = 12;
                splat.yoffset = -5;
                splat.opacity = 1.5;
                this.splats.push(splat);
                walkSound.play();
                this.madeSplat = true;
            }
        } else {
            this.madeSplat = false;
        }
        for(var i = 0; i < this.splats.length; i++) {
            this.splats[i].opacity -= 0.01;
            if (this.splats[i].opacity < 0) {
                this.splats[i] = null;
                this.splats.splice(i,1);
            }
        }
        
        //update blobs if they exist
        for(var i = 0; i < this.blobs.length; i++) {
            this.blobs[i].update();
            if(this.blobs[i].yoffset < 0) {
                
                var splat = new BasicObject('images/splat.png');
                splat.x = this.blobs[i].x;
                splat.y = this.blobs[i].y;
                splat.width = 20;
                splat.height = 16;
                splat.yoffset = -5;
                this.splats.push(splat);
                
                this.blobs[i] = null;
                this.blobs.splice(i,1);
            }
        }
        
        //update the key if it exists
        if(this.key != null) {
            //make the key follow instead of sicking to the player
            var keyDist = 13;
            var adjustx = (this.x-this.key.x);
            var adjusty = (this.y-this.key.y);
            var dist = Math.sqrt(Math.pow(adjustx,2) + Math.pow(adjusty,2));
            this.key.x += ((dist-keyDist)/dist)*adjustx;
            this.key.y += ((dist-keyDist)/dist)*adjusty;
        }
        
        updateSpriteAnimation(this);
        
        //if player is alive
        if(!this.alive || !this.controllable) {
            return;
        }
        if(rightPressed) {
            if (this.invertedControls) {
                this.x -= 1;
            } else {
                this.x += 1;
            }
            
        }
        if(leftPressed) {
            if (this.invertedControls) {
                this.x += 1;
            } else {
                this.x -= 1;
            }
            
        }
        if(upPressed) {
            if (this.invertedControls) {
                this.y -= 1;
            } else {
                this.y += 1;
            }
            
        }
        if(downPressed) {
            if (this.invertedControls) {
                this.y += 1;
            } else {
                this.y -= 1;
            }
            
        }

        if(upPressed || downPressed || rightPressed || leftPressed) {
            this.previous_state = this.state;
            this.state = 'running';
            if(this.previous_state != 'running') {
                resetAnimations(this);
                this.current_animation = this.animations.running;
            }
        } else {
            this.previous_state = this.state;
            this.state = 'idle';
            if(this.previous_state != 'idle') {
                resetAnimations(this);
                this.current_animation = this.animations.idle;
            }
        }

        //handle completed animation
        if(this.current_animation.completed == true) {
            resetAnimations(this);
            if(upPressed || downPressed || rightPressed || leftPressed) {
                this.current_animation = this.animations.running;
                this.state = 'running';
            } else {
                this.current_animation = this.animations.idle;
                this.state = 'idle';
            }
        }
    };
    
}

//resets all of the animations
function resetAnimations(obj) {
    for (var animation in obj.animations) {
        obj.animations[animation].completed = false;
        obj.animations[animation].current_frame = 0;
        obj.animations[animation].frame_counter = 0;
    }
}

//blob objects
function Blob(source) {
    this.x = 0;
    this.y = 0;
    this.xoffset = 0;
    this.yoffset = 0;
    this.vx = 0;
    this.vy = 0;
    this.vup = 1+3*Math.random();
    this.vfallrate = 0.15;
    this.image = new Image();
    this.image.src = source;
    this.width = 8;
    this.height = 8;
    this.parallax = 0;
    this.canHit = false;
    this.hitboxWidth = 25;
    this.hitboxHeight = 25;
    this.hitoffsetx = 0;
    this.hitoffsety = 0;
    this.type = 'Blob';
    this.update = function () {
        //update the blob
        this.vup -= this.vfallrate;
        this.yoffset += this.vup;
        
        this.x += this.vx;
        this.y += this.vy;
    }
}