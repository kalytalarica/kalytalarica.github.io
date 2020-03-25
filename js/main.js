var DEBUG = false;
var SPEED = 220 + (Math.random()*500);
var GRAVITY = 18;
var FLAP = 420;
var SPAWN_RATE = 1 / 1.2;
var OPENING = 144 + (Math.random()*50);



function init(parent) {

var state = {
    preload: preload,
    create: create,
    update: update,
    render: render
};

var game = new Phaser.Game(
    480,
    700,
    Phaser.CANVAS,
    parent,
    state,
    false,
    false
);

function postScore() {
    if ( postingScore ) {
	    return;
    }
    postScoreText.setText('ACABOU \nALCOOL EM GEL');
    postingScore = true;
	$j.getJSON('', function(d) {
		// check if we had an error..
		if (d.status == "error") {
		    postScoreText.setText(d.message + "!");
		} else {
			var key = d.data.key;
			if (key) {
				window.location.href = 'https://twitter.com/robertobarrox';
			}
		}
	});
}
function preload() {
    var assets = {
        spritesheet: {
            kalyta: ['assets/kalyta.png', 48, 31],
            nuvems: ['assets/nuvems.png', 128, 64]
        },
        image: {
            dedo: ['assets/dedo.png'],
            grama: ['assets/grama.png']
        },
        audio: {
            flap: ['assets/flap.wav'],
            score: ['assets/score.wav'],
            hurt: ['assets/hurt.wav']
        }
    };
    Object.keys(assets).forEach(function(type) {
        Object.keys(assets[type]).forEach(function(id) {
            game.load[type].apply(game.load, [id].concat(assets[type][id]));
        });
    });
}

var gameStarted,
    gameOver,
    score,
    bg,
    credits,
    nuvems,
    dedos,
    invs,
    kalyta,
    grama,
    scoreText,
    instText,
    postingScore,
    gameOverText,
    flapSnd,
    scoreSnd,
    hurtSnd,
    dedosTimer,
    nuvemsTimer,
    morcegoMode = 0,
    gameOvers = 0;

function create() {
    game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
    game.stage.scale.setScreenSize(true);
    // Draw bg
    bg = game.add.graphics(0, 0);
    bg.beginFill(0xDDEEFF, 1);
    bg.drawRect(0, 0, game.world.width, game.world.height);
    bg.endFill();
    // Credits 'yo
    credits = game.add.text(
        game.world.width / 2,
        10,
        'github.com/robertobarrosx\n@robertobarrosx',
        {
            font: '8px "Press Start 2P"',
            fill: '#000',
            align: 'center'
        }
    );
    credits.anchor.x = 0.5;
    // Add nuvems group
    nuvems = game.add.group();
    // Add dedos
    dedos = game.add.group();
    // Add invisible thingies
    invs = game.add.group();
    // Add kalyta
    kalyta = game.add.sprite(0, 0, 'kalyta');
    kalyta.anchor.setTo(0.5, 0.5);
    kalyta.animations.add('fly', [0, 1, 2, 3], 10, true);
    kalyta.animations.add('morcego', [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 60, false);
    kalyta.inputEnabled = true;
    kalyta.body.collideWorldBounds = true;
    kalyta.body.gravity.y = GRAVITY;
    // Add grama
    grama = game.add.tileSprite(0, game.world.height - 32, game.world.width, 32, 'grama');
    grama.tileScale.setTo(2, 2);
    // Add score text
    scoreText = game.add.text(
        game.world.width / 2,
        (game.world.height / 4.5),
        "",
        {
            font: '26px "Press Start 2P"',
            fill: '#fff',
            stroke: '#309830',
            strokeThickness: 6,
            align: 'center'
        }
    );
    scoreText.anchor.setTo(0.5, 0.5);
    // Add instructions text
    instText = game.add.text(
        game.world.width / 2,
        game.world.height - game.world.height / 4,
        "",
        {
            font: '8px "Press Start 2P"',
            fill: '#fff',
            stroke: '#466d85',
            strokeThickness: 4,
            align: 'center'
        }
    );
    instText.anchor.setTo(0.5, 0.5);
    // Add game over text
    highScoreText = game.add.text(
        game.world.width / 2,
        game.world.height / 3,
        "",
        {
            font: '24px "Press Start 2P"',
            fill: '#fff',
            stroke: '#466d85',
            strokeThickness: 8,
            align: 'center'
        }
    );
    highScoreText.anchor.setTo(0.5, 0.5);
    postScoreText = game.add.text(
        (game.world.width / 2),
        (game.world.height / 2)+100,
        "",
        {
            font: '20px "Press Start 2P"',
            fill: '#fff',
            stroke: '#309830',
            strokeThickness: 8,
            align: 'center'
        }
    );
    postScoreText.setText("PASSE\nALCOOL EM GEL!");
    postScoreText.anchor.setTo(0.5, 0.5);
    postScoreText.renderable = false;
    postScoreClickArea = new Phaser.Rectangle(0, postScoreText.y - postScoreText.height / 2, game.world.width, postScoreText.height*2);
    
    gameOverText = game.add.text(
        game.world.width / 2,
        game.world.height / 2,
        "",
        {
            font: '16px "Press Start 2P"',
            fill: '#fff',
            stroke: '#f66',
            strokeThickness: 5,
            align: 'center'
        }
    );
    gameOverText.anchor.setTo(0.5, 0.5);
    gameOverText.scale.setTo(2, 2);
    // Add sounds
    flapSnd = game.add.audio('flap');
    scoreSnd = game.add.audio('score');
    hurtSnd = game.add.audio('hurt');
    // Add controls
    game.input.onDown.add(flap);
    game.input.keyboard.addCallbacks(game, onKeyDown, onKeyUp);
    // Start nuvems timer
    nuvemsTimer = new Phaser.Timer(game);
    nuvemsTimer.onEvent.add(spawnCloud);
    nuvemsTimer.start();
    nuvemsTimer.add(Math.random());
    // RESET!
    reset();
}
function mute_toggle() {
	if (is_muted) {
		game.sound.mute = false;	
		is_muted = false;
	} else {
		game.sound.mute = true;	
		is_muted = true;
	}
}
function reset() {
    SPEED = 100 + (Math.random()*500);
    gameStarted = false;
    gameOver = false;
    score = 0;
    credits.renderable = true;
    scoreText.setText("NÃO TOQUE\nNA MINHA\nNAMORADA");
    instText.setText("TOQUE NA TELA PARA\nKALYTA LARICA\nVOAR");
    highScoreText.renderable = false;
    postScoreText.renderable = false;
    gameOverText.renderable = false;
    kalyta.body.allowGravity = false;
    kalyta.angle = 0;
    kalyta.reset(game.world.width / 4, game.world.height / 2);
    kalyta.scale.setTo(2, 2);
    kalyta.animations.play('fly');
    dedos.removeAll();
    invs.removeAll();
}

function start() {
    credits.renderable = false;
    kalyta.body.allowGravity = true;
    // SPAWN dedos!
    dedosTimer = new Phaser.Timer(game);
    dedosTimer.onEvent.add(spawndedos);
    dedosTimer.start();
    dedosTimer.add(2);
    // Show score
    scoreText.setText(score);
    instText.renderable = false;
    // START!
    gameStarted = true;
}

function flap() {
    if (!gameStarted) {
        start();
    }
    if (!gameOver) {
        kalyta.body.velocity.y = -FLAP;
        flapSnd.play();
    } else {
        // Check if the touch event is within our text for posting a score
        if (postScoreClickArea && Phaser.Rectangle.contains(postScoreClickArea, game.input.x, game.input.y)) {
            postScore();
        }
    }
}

function spawnCloud() {
    nuvemsTimer.stop();

    var cloudY = Math.random() * game.height / 2;
    var cloud = nuvems.create(
        game.width,
        cloudY,
        'nuvems',
        Math.floor(4 * Math.random())
    );
    var nuvemscale = 2 + 2 * Math.random();
    cloud.alpha = 2 / nuvemscale;
    cloud.scale.setTo(nuvemscale, nuvemscale);
    cloud.body.allowGravity = false;
    cloud.body.velocity.x = -SPEED / nuvemscale;
    cloud.anchor.y = 0;

    nuvemsTimer.start();
    nuvemsTimer.add(4 * Math.random());
}

function o() {
    return OPENING + 60 * ((score > 50 ? 50 : 50 - score) / 50);
}

function spawndedo(dedoY, flipped) {
    var dedo = dedos.create(
        game.width,
        dedoY + (flipped ? -o() : o()) / 2,
        'dedo'
    );
    dedo.body.allowGravity = false;

    // Flip dedo! *GASP*
    dedo.scale.setTo(2, flipped ? -2 : 2);
    dedo.body.offset.y = flipped ? -dedo.body.height * 2 : 0;

    // Move to the left
    dedo.body.velocity.x = -SPEED;

    return dedo;
}

function spawndedos() {
    dedosTimer.stop();

    var dedoY = ((game.height - 16 - o() / 2) / 2) + (Math.random() > 0.5 ? -1 : 1) * Math.random() * game.height / 6;
    // Bottom dedo
    var botdedo = spawndedo(dedoY);
    // Top dedo (flipped)
    var topdedo = spawndedo(dedoY, true);

    // Add invisible thingy
    var inv = invs.create(topdedo.x + topdedo.width, 0);
    inv.width = 2;
    inv.height = game.world.height;
    inv.body.allowGravity = false;
    inv.body.velocity.x = -SPEED;

    dedosTimer.start();
    dedosTimer.add(1 / SPAWN_RATE);
}

function addScore(_, inv) {
    invs.remove(inv);
    score += 1;
    scoreText.setText(score);
    scoreSnd.play();
}

function setGameOver() {
    gameOver = true;
    instText.setText("TOQUE NA KALYTA\nTENTE NOVAMENTE");
    instText.renderable = true;
    var hiscore = window.localStorage.getItem('hiscore');
    hiscore = hiscore ? hiscore : score;
    hiscore = score > parseInt(hiscore, 10) ? score : hiscore;
    window.localStorage.setItem('hiscore', hiscore);
    highScoreText.setText("MAIOR PONTUAÇÃO\n" + hiscore);
    highScoreText.renderable = true;
    gameOverText.setText("SE LASCOU");
    gameOverText.renderable = true;
    if (score > 0) {
	    postScoreText.renderable = true;
	}  
    // Stop all dedos
    dedos.forEachAlive(function(dedo) {
        dedo.body.velocity.x = 0;
    });
    invs.forEach(function(inv) {
        inv.body.velocity.x = 0;
    });
    // Stop spawning dedos
    dedosTimer.stop();
    // Make kalyta reset the game
    kalyta.events.onInputDown.addOnce(reset);
    hurtSnd.play();
    gameOvers++;
}

function update() {
    if (gameStarted) {
        // Make kalyta dive
        var dvy = FLAP + kalyta.body.velocity.y;
        kalyta.angle = (90 * dvy / FLAP) - 180;
        if (kalyta.angle < -30) {
            kalyta.angle = -30;
        }
        if (
            gameOver ||
            kalyta.angle > 90 ||
            kalyta.angle < -90
        ) {
            kalyta.angle = 90;
            kalyta.animations.stop();
            kalyta.frame = 4;
        } else {
            kalyta.animations.play(morcegoMode > 0 ? 'morcego' : 'fly');
        }
        // kalyta is DEAD!
        if (gameOver) {
            if (kalyta.scale.x < 4) {
                kalyta.scale.setTo(
                    kalyta.scale.x * 1.3,
                    kalyta.scale.y * 1.3
                );
            }
            // Shake game over text
            gameOverText.angle = Math.random() * 5 * Math.cos(game.time.now / 100);
        } else {
            // Check game over
            if (morcegoMode < 1) {
                game.physics.overlap(kalyta, dedos, setGameOver);
                if (!gameOver && kalyta.body.bottom >= game.world.bounds.bottom) {
                    setGameOver();
                }
            }
            // Add score
            game.physics.overlap(kalyta, invs, addScore);
        }
        // Remove offscreen dedos
        dedos.forEachAlive(function(dedo) {
            if (dedo.x + dedo.width < game.world.bounds.left) {
                dedo.kill();
            }
        });
        // Update dedo timer
        dedosTimer.update();
    } else {
        kalyta.y = (game.world.height / 2) + 8 * Math.cos(game.time.now / 200);
    }
    if (!gameStarted || gameOver) {
        // Shake instructions text
        instText.scale.setTo(
            2 + 0.1 * Math.sin(game.time.now / 100),
            2 + 0.1 * Math.cos(game.time.now / 100)
        );
    }
    // Shake score text
    scoreText.scale.setTo(
        2 + 0.1 * Math.cos(game.time.now / 100),
        2 + 0.1 * Math.sin(game.time.now / 100)
    );
    // Update nuvems timer
    nuvemsTimer.update();
    // Remove offscreen nuvems
    nuvems.forEachAlive(function(cloud) {
        if (cloud.x + cloud.width < game.world.bounds.left) {
            cloud.kill();
        }
    });
    // Scroll grama
    if (!gameOver) {
        grama.tilePosition.x -= game.time.physicsElapsed * SPEED / 2;
    }
    // Decrease morcego mode
    morcegoMode -= game.time.physicsElapsed * SPEED * 5;
}

function render() {
    if (DEBUG) {
        game.debug.renderSpriteBody(kalyta);
        dedos.forEachAlive(function(dedo) {
            game.debug.renderSpriteBody(dedo);
        });
        invs.forEach(function(inv) {
            game.debug.renderSpriteBody(inv);
        });
    }
}

function onKeyDown(e) { }

var pressTime = 0;
function onKeyUp(e) {
    if (Phaser.Keyboard.SPACEBAR == e.keyCode) {
        if (game.time.now - pressTime < 200) {
            morcegoMode = 1000;
        } else {
            flap();
        }
        pressTime = game.time.now;
    }
}

};
