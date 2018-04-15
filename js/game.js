var MAP = [];
Game = {};
var W = 500;
var H = 500;
var LEVEL;
var SCORE;
var BEST_SCORE = 0;
var CURRENT_TIME;
var LIVES;

/*================================================================ UTIL
*/

function rand(num) {
  return Math.floor(Math.random() * num)
};

/*================================================================ BOOT
*/

Game.Boot = function(game) {};
Game.Boot.prototype = {
  preload: function() {
    game.stage.backgroundColor = '#47BBC3';
    game.load.image('loading', 'images/loading.png');
    game.load.image('loading-border', 'images/loading-border.png');
  },
  create: function() {
    //generating empty array with sub-arrays which will be used soon as a map for rabbits spawning
    MAP.length = 9;
    for(var i = 0; i < MAP.length; i++) {
        MAP[i] = [];
        MAP[i].length = 15;
    }
    game.state.start('Load');
  }
};

/*================================================================ LOAD
*/

Game.Load = function(game) {};
Game.Load.prototype = {
  preload: function() {
    // loading label
    var loadingTextStyle = {
      font: '30px Arial',
      fill: '#FFF'
    };
    loadingText = game.add.text(
      Math.floor(W / 2) + 0.5,
      Math.floor(H / 2) - 15 + 0.5,
      'loading...',
      loadingTextStyle
    );
    loadingText.anchor.setTo(0.5, 0.5);

    // preloading image
    preloadingBorder = game.add.sprite(W / 2, H / 2 + 15, 'loading-border');
    preloadingBorder.x -= preloadingBorder.widtH / 2;
    preloading = game.add.sprite(W / 2, H / 2 + 19, 'loading');
    preloading.x -= preloading.widtH / 2;
    game.load.setPreloadSprite(preloading);

    // game images
    game.load.image('rabbit', 'images/rabbit.png');
    game.load.image('circle', 'images/circle.png');
    game.load.spritesheet('bad', 'images/bad.png', 36, 40);

  },
  create: function() {
    game.state.start('Menu');
  }
};

/*================================================================ MENU
*/

Game.Menu = function(game) {};
Game.Menu.prototype = {
  create: function() {
    // input
    game.input.onDown.add(this.startGame, this);

    // enemy
    this.bad = game.add.sprite(W / 2, H / 2 - 120, 'bad');
    this.bad.anchor.setTo(0.5, 1);
    this.bad.animations.add('walk', [0, 1], 5, true).play();

    // circle
    this.circle = game.add.sprite(W / 2, H / 2, 'circle');
    this.circle.anchor.setTo(0.5, 0.5);

    // top label
    var topLabelStyle = {
      font: '40px Arial',
      fill: '#FFF',
      align: 'center'
    };
    topLabel = game.add.text(W / 2 + 0.5, 50, "MMM, RABBITZ!", topLabelStyle);
    topLabel.anchor.setTo(0.5, 0.5);

    // middle label
    var middleLabelStyle = {
      font: '20px Arial',
      fill: '#FFF',
      align: 'center'
    };
    var middleLabel = game.add.text(W / 2 + 0.5, H / 2 + 0.5, "TAP TO\nSTART THE GAME", middleLabelStyle);
    middleLabel.anchor.setTo(0.5, 0.5);
    game.add.tween(middleLabel.scale).to({
      x: 1.1,
      y: 1.1
    }, 300).to({
      x: 1,
      y: 1
    }, 300).loop().start();

    // bottom label
    var bottomLabelStyle = {
      font: '20px Arial',
      fill: '#FFF',
      align: 'center'
    };
    var bottomLabel = game.add.text(W / 2 + 0.5, H - 30, "TRY TO SAVE ALL RABBITS BY TAPPING", bottomLabelStyle);
    bottomLabel.anchor.setTo(0.5, 0.5);
  },
  startGame: function() {
    game.state.start('Play');
  }
};

/*================================================================ PLAY
*/

Game.Play = function(game) {};
Game.Play.prototype = {
  create: function() {
    // var
    SCORE = 0;
    LEVEL = 1;
    LIVES = 3;

    this.changeLevel = true;

    // input
    game.input.onDown.add(this.jump, this);

    // player
    this.rabbits = game.add.group();
    this.rabbits.createMultiple(30, 'rabbit');

    // enemy
    this.bad = game.add.sprite(W / 2, H / 2, 'bad');
    this.bad.anchor.setTo(0.5, 1);
    this.bad.animations.add('walk', [0, 1], 5, true).play();
    game.physics.arcade.enable(this.bad);

    // circle
    this.circle = game.add.sprite(W / 2, H / 2, 'circle');
    this.circle.anchor.setTo(0.5, 0.5);

    // top label
    var topLabelStyle = {
      font: '20px Arial',
      fill: '#FFF',
      align: 'center'
    };
    this.topLabel = game.add.text(W / 2 + 0.5, 30, "TRY TO SAVE ALL RABBITS BY TAPPING", topLabelStyle);
    this.topLabel.anchor.setTo(0.5, 0.5);

    // middle label (LEVEL)
    var middleLabelStyle = {
      font: '80px Arial',
      fill: '#FFF',
      align: 'center'
    };

    // middle label (LIVES) 
    var middleLabel2Style = {
      font: '20px Arial',
      fill: '#FFF',
      align: 'center'
    };

    this.middleLabel = game.add.text(W / 2, H / 2, "1", middleLabelStyle);
    this.middleLabel.anchor.setTo(0.5, 0.5);

    this.middle2Label = game.add.text(W / 2, (H / 2) + 50, "Default", middleLabel2Style);
    this.middle2Label.anchor.setTo(0.5, 0.5);

  },
  update: function() {
    game.physics.arcade.overlap(this.bad, this.rabbits, this.hit, null, this);

    // angle
    // 0 -> 180
    // -180 -> 0
    
    //Losing condition
    if(LIVES == 0) {
      game.state.start('End');
    }

    // prevent js lagging
    if (this.bad.angle >= -2 && this.bad.angle <= 2 && this.changeLevel) {
      this.changeLevel = false;
      this.drawLevel();

    } else if (this.bad.angle > 2) {
      this.changeLevel = true;
    }

    this.bad.angle += 1.2;

    var x = W / 2 + (this.circle.width / 2 - 4) * Math.cos(this.bad.rotation - Math.PI / 2);
    var y = H / 2 + (this.circle.width / 2 - 4) * Math.sin(this.bad.rotation - Math.PI / 2);
    this.bad.reset(x, y);

    this.middle2Label.setText("LIVES: " + LIVES);
  },
  addRabbit: function(angle, i) {
    var rabbit = this.rabbits.getFirstDead();
    game.physics.arcade.enable(rabbit);
    rabbit.rotation = 0;
    rabbit.rotation = angle + Math.PI / 2;

    var xOut = W / 2 + (this.circle.width + 100) * Math.cos(angle);
    var yOut = H / 2 + (this.circle.width + 100) * Math.sin(angle);
    var xIn = W / 2 + (this.circle.width / 2 - 2) * Math.cos(angle);
    var yIn = H / 2 + (this.circle.width / 2 - 2) * Math.sin(angle);

    rabbit.jump = false;
    rabbit.alpha = 1;
    rabbit.pos = i;
    rabbit.reset(xOut, yOut);

    rabbit.anchor.setTo(0.5, 1);
    rabbit.t = game.add.tween(rabbit);
    rabbit.t.to({
      x: xIn,
      y: yIn
    }, 300).start();
  },
  hit: function(bad, rabbit) {
    rabbit.kill();
    //SCORE++;
    LIVES--;
  },

  jump: function() {
    var min = 20;
    var minR;

    this.rabbits.forEachAlive(function(r) {
      if (r.jump == false && r.pos < min) {
        min = r.pos;
        minR = r;
      }
    }, this);

    var rabbit = minR;
    if (min != 20 && !rabbit.t.isRunning) {
      var x = W / 2 + (this.circle.width / 2 + 90) * Math.cos(rabbit.rotation - Math.PI / 2);
      var y = H / 2 + (this.circle.width / 2 + 90) * Math.sin(rabbit.rotation - Math.PI / 2);
      rabbit.t2 = game.add.tween(rabbit)
        .to({
          x: x,
          y: y
        }, 400)
        .to({
          x: rabbit.x,
          y: rabbit.y
        }, 600);
      rabbit.t2.start();
      rabbit.jump = true;
    }
  },
  drawLevel: function() {
    console.log('LEVEL', LEVEL);
    if (LEVEL == 10) {
      game.state.start('Win');
      return;
    }

    // fade and kill alive rabbit
    this.rabbits.forEachAlive(function(r) {
      var t = game.add.tween(r).to({
        alpha: 0
      }, 300).start();

      t.onComplete.add(function() {
        this.kill(); SCORE++;
      }, r);
    }, this);

    // update middle label
    this.middleLabel.setText(LEVEL);
    

    // fade top label
    if (LEVEL == 2) {
      game.add.tween(this.topLabel).to({
        alpha: 0
      }, 500).start();
    }

    // adding rabbits (generating level map). Rabbits spawning randomly (at 50/50 chance) on avialible 15 cells. 
    var l = MAP[LEVEL - 1];
    for (var i = 0; i < l.length; i++) {
      l[i] = Math.random() < 0.6 ? 0 : 1;
      if(l[i] == 1) this.addRabbit(i * (Math.PI / 10), i);
    }

    console.log('map:', l);

    LEVEL++;
  }
};

/*================================================================ END
*/

Game.End = function(game) {};
Game.End.prototype = {
  create: function() {
    if (SCORE > BEST_SCORE) {
      BEST_SCORE = SCORE;
    }

    game.input.onDown.add(this.startGame, this);

    // circle
    this.circle = game.add.sprite(W / 2, H / 2, 'circle');
    this.circle.anchor.setTo(0.5, 0.5);

    // top
    var topLabelStyle = {
      font: '30px Arial',
      fill: '#FFF',
      align: 'center'
    };
    var topLabel = game.add.text(W / 2 + 0.5, 65, "YOU LOSE\nbut at least you saved " + SCORE + " rabbits\nthanks *qwakk*", topLabelStyle);
    topLabel.anchor.setTo(0.5, 0.5);

    var bottomLabelStyle = {
      font: '20px Arial',
      fill: '#FFF',
      align: 'center'
    };
    var bottomLabel = game.add.text(W / 2 + 0.5, H - 30, "BEST SCORE: " + BEST_SCORE, bottomLabelStyle);
    bottomLabel.anchor.setTo(0.5, 0.5);

    var middleLabelStyle = {
      font: '20px Arial',
      fill: '#FFF',
      align: 'center'
    };
    var middleLabel = game.add.text(W / 2 + 0.5, H / 2 + 0.5, "TAP TO\nRESTART THE GAME", middleLabelStyle);
    middleLabel.anchor.setTo(0.5, 0.5);


    this.currentTime = game.time.now + 500;

    game.world.alpha = 0;
    game.add.tween(game.world).to({
      alpha: 1
    }, 1000).start();
  },
  startGame: function() {
    if (this.currentTime < game.time.now) {
      game.world.alpha = 1;
      game.state.start('Play');
    }
  }
};

/*================================================================ WIN
*/

Game.Win = function(game) {};
Game.Win.prototype = {
  create: function() {
    if (SCORE > BEST_SCORE) {
      BEST_SCORE = SCORE;
    }

    game.input.onDown.add(this.startGame, this);

    // circle
    this.circle = game.add.sprite(W / 2, H / 2, 'circle');
    this.circle.anchor.setTo(0.5, 0.5);

    // top
    var topLabelStyle = {
      font: '30px Arial',
      fill: '#FFF',
      align: 'center'
    };
    var topLabel = game.add.text(W / 2 + 0.5, 65, "YOU WIN\nAnd saved " + SCORE + " rabbits\nthanks *qwakk*", topLabelStyle);
    topLabel.anchor.setTo(0.5, 0.5);

    var bottomLabelStyle = {
      font: '20px Arial',
      fill: '#FFF',
      align: 'center'
    };
    var bottomLabel = game.add.text(W / 2 + 0.5, H - 30, "BEST SCORE: " + BEST_SCORE, bottomLabelStyle);
    bottomLabel.anchor.setTo(0.5, 0.5);

    var middleLabelStyle = {
      font: '20px Arial',
      fill: '#FFF',
      align: 'center'
    };
    var middleLabel = game.add.text(W / 2 + 0.5, H / 2 + 0.5, "TAP TO\nRESTART THE GAME", middleLabelStyle);
    middleLabel.anchor.setTo(0.5, 0.5);


    this.currentTime = game.time.now + 500;

    game.world.alpha = 0;
    game.add.tween(game.world).to({
      alpha: 1
    }, 1000).start();
  },
  startGame: function() {
    if (this.currentTime < game.time.now) {
      game.world.alpha = 1;
      game.state.start('Play');
    }
  }
};

var game = new Phaser.Game(W, H, Phaser.CANVAS, 'game-container');

game.state.add('Boot', Game.Boot);
game.state.add('Load', Game.Load);
game.state.add('Menu', Game.Menu);
game.state.add('Play', Game.Play);
game.state.add('End', Game.End);
game.state.add('Win', Game.Win);
game.state.start('Boot');