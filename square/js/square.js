"use strict";

var stage, hero, queue;
var platforms=[], currentLevel=-1;
var tileSheet;
var keys = {
    left: false,
    up: false,
    right: false,
    down: false

};

var settings = {
    maxGravity: 6,
    resetJumpPower: 20,
    heroSpeed: 5
};

function init(){
    stage = new createjs.Stage("box");

    queue = new createjs.LoadQueue(true);
    queue.on("progress", loadProgress);
    queue.on("complete", gameReady);

    queue.loadManifest([
        {id: "heino", src: "data/heino.json"},
        {id: "tiles", src: "data/bgtiles.json"},
        {id: "levels", src: "data/levels.json"}
    ]);
}

function loadProgress(e){

}

function gameReady(){
    tileSheet = new createjs.SpriteSheet(queue.getResult("tiles"));
    nextLevel();
    window.onkeyup = keyUp;
    window.onkeydown = keyDown;
    var heroTemp = new createjs.SpriteSheet(queue.getResult("heino"));
    hero = new createjs.Sprite(heroTemp, "down");
    hero.height = 40;
    hero.width = 32;
    hero.gravityEffect = 0;
    hero.jumpPower = 0;
    hero.nextX;
    hero.nextY;

    stage.addChild(hero);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.on("tick", tock);
    /*var ss = new createjs.SpriteSheet(queue.getResult("heino"));
    hero = new createjs.Sprite(ss, "left");
    stage.addChild(hero);*/
}

function keyDown(e){
    switch(e.keyCode){
        case 37:
            keys.left=true;
            break;
        case 38:
            keys.up=true;
            break;
        case 39:
            keys.right=true;
            break;
    }

}

function keyUp(e){
    switch(e.keyCode){
        case 37:
            keys.left=false;
            break;
        case 38:
            keys.up=false;
            break;
        case 39:
            keys.right=false;
            break;
    }

}

function nextLevel(){
    console.log("nextLevel!");
    var i, r;
    currentLevel++;

    stage.removeAllChildren();
    platforms=[];
    var temp = queue.getResult("levels");
    var levelData = temp.levels[currentLevel];
    for (i=0; i<levelData.platforms.length; i++){
        console.log();
        for(r=0; r<levelData.platforms[i].repeat; r++){
            var t = new createjs.Sprite(tileSheet, levelData.platforms[i].sprite);
            t.x = levelData.platforms[i].x+36*r;
            t.y = levelData.platforms[i].y;
            t.width = 36;
            t.height = 36;
            stage.addChild(t);
            platforms.push(t);
        }
    }


}

/*function hitTest(rect1,rect2) {
    if ( rect1.x >= rect2.x + rect2.width
        || rect1.x + rect1.width <= rect2.x
        || rect1.y >= rect2.y + rect2.height
        || rect1.y + rect1.height <= rect2.y )
    {
        return false;
    }
    return true;
}*/

function predictHit(rect1,rect2) {
 if ( rect1.nextX >= rect2.x + rect2.width
 || rect1.nextX + rect1.width <= rect2.x
 || rect1.nextY >= rect2.y + rect2.height
 || rect1.nextY + rect1.height <= rect2.y )
 {
 return false;
 }
 return true;
 }

function objectOnPlatform(moving, stationary){
    if(moving.x < stationary.x + stationary.width
        && moving.x+moving.width > stationary.x
        && Math.abs((moving.y+moving.height) - stationary.y)<4 ){

        moving.y = stationary.y-moving.height;

        return true;
    }
    return false;
}

function moveHero(){
    var i, standingOnPlatform=false;
    var canJump=false;
    for(i=0; i < platforms.length;i++){
        if(objectOnPlatform(hero, platforms[i])){
            standingOnPlatform=true;
            canJump=true;
            //console.log("ouch");
        }
    }
    //jumping logic
    if(keys.up && canJump){
        console.log("jumping");
        standingOnPlatform=false;
        
        canJump=false;
        hero.jumpPower=settings.resetJumpPower;
    }

    if(keys.right){
        var collisionDetected=false;
        hero.nextY = hero.y;
        hero.nextX = hero.x+settings.heroSpeed;

        for(i=0; i<platforms.length; i++){
            if(predictHit(hero, platforms[i])){
                collisionDetected=true;
                break;
            }
        }
        if(!collisionDetected){
            hero.x+=settings.heroSpeed;
        }
    }

    if(keys.left){
        var collisionDetected=false;
        hero.nextY = hero.y;
        hero.nextX = hero.x-settings.heroSpeed;

        for(i=0; i<platforms.length; i++){
            if(predictHit(hero, platforms[i])){
                collisionDetected=true;
                break;
            }
        }
        if(!collisionDetected){
            hero.x-=settings.heroSpeed;
        }
    }


    //gravity
    if(!standingOnPlatform) {
        if(hero.jumpPower > 0){
            var collisionDetected=false;
            hero.nextY = hero.y-hero.jumpPower;
            hero.nextX = hero.x;

            for(i=0; i<platforms.length; i++){
                if(predictHit(hero, platforms[i])){
                    collisionDetected=true;
                    break;
                }
            }
            if(collisionDetected){
                hero.jumpPower = 0;
            }
            hero.y-=hero.jumpPower;
            hero.jumpPower--;
        }
        hero.y += hero.gravityEffect;
        hero.gravityEffect++;
        if (hero.gravityEffect > settings.maxGravity) {
            hero.gravityEffect = settings.maxGravity

        }
    }

}

function tock(e){
    moveHero();
    stage.update(e);
}