var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 496,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    } 
};
   
var game = new Phaser.Game(config);

function preload() {

  // graphics (C)opyright Namco
  this.load.image('dot', 'assets/dot.png');
  this.load.image('Hallenbeck', 'assets/Hallenbeck.png', {frameWidth: 32, frameHeight: 32});
  this.load.image('tiles', 'assets/pacman-tiles.png');
  this.load.spritesheet('pacman', 'assets/pacman.png', {frameWidth: 32, frameHeight: 32});
  this.load.tilemapTiledJSON('map', 'assets/pacman-map.json');
  this.load.tilemapTiledJSON('map-with-dots', 'assets/pacman-map1.json');
}

function create() {
  // renders the map
  const map = this.make.tilemap({key: 'map-with-dots'});
  const tileset = map.addTilesetImage("pacman-tiles", "tiles");
  const worldMap = map.createDynamicLayer("Pacman", tileset, 0, 0);

  // set collisions where player collides with everything except dots and open spaces
  // 7 maps to dots and 14 maps to open spaces
  worldMap.setCollisionByExclusion([7,14]);

  this.dotMap = []; //holds the positions of where the dots should appear on the map

  this.scoreMap = new Map(); //creates and holds the scores for all players in the world

  // Create a physics group - useful for colliding the player against all the dots
  //this.dotGroup = this.physics.add.staticGroup();

  // this removes all the dots from the map
  worldMap.forEachTile( tile => {
    if (tile.index === 7) {
      // A sprite has its origin at the center, so get the origin of the tile
      const x = tile.getCenterX();
      const y = tile.getCenterY();

      // add the coordinates to the dotMap
      this.dotMap.push({x, y});

      // removes the tile at the current place
      worldMap.removeTileAt(tile.x, tile.y);
    }
  });
  
  // create the pacman munch animation
  this.anims.create({
    key: 'munch',
    frames: this.anims.generateFrameNumbers('pacman', {start: 0, end: 2}),
    frameRate: 15,
    repeat: -1
  });

  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  
  // listen for current players
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id], worldMap);
      } else {
        addOtherPlayers(self, players[id], worldMap);
      }
    });
  });

  // checks for if a new players added onto server
  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo, worldMap);
  });

  // checks for players that disconnect
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        self.scoreMap.get(otherPlayer.playerId).destroy(); // destroy text
        self.scoreMap.delete(otherPlayer.playerId); // delete player's score from the map of player scores
        otherPlayer.destroy(); // destroy the player object
      }
    });
  });

  // listen for player movements
  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setAngle(playerInfo.angle);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  this.socket.on('dotLocation', function (dotLocation) {
    if (self.dot) self.dot.destroy();
    self.dot = self.physics.add.image(dotLocation.x, dotLocation.y, 'Hallenbeck');
    var rand = self.dotMap[Math.floor(Math.random() * self.dotMap.length)];
    self.physics.add.overlap(self.pacman, self.dot, function () {
      this.socket.emit('dotCollected', {x: rand.x, y: rand.y});
    }, null, self);
  });

  // listens for the the scores for all the players and updates them
  this.socket.on('scoreUpdate', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        var playerScore = self.scoreMap.get(self.socket.id);
        playerScore.setText('Your Score: ' + players[id].score);
      } else {
        var otherPlayerScore = self.scoreMap.get(players[id].playerId);
        otherPlayerScore.setText(players[id].playerId + ': ' + players[id].score);
      }
    });
  });

  // define cursors as standard arrow keys
  cursors = this.input.keyboard.createCursorKeys();

}

function update(time, delta) {
  if(this.pacman){
    // Horizontal movement
    if (cursors.left.isDown) {
      this.pacman.body.setVelocityX(-150);
      this.pacman.angle = 180;
    } else if (cursors.right.isDown) {
      this.pacman.body.setVelocityX(150);
      this.pacman.angle = 0;
    }

    // Vertical movement
    if (cursors.up.isDown) {
      this.pacman.body.setVelocityY(-150);
      this.pacman.angle = 270;
    } else if (cursors.down.isDown) {
      this.pacman.body.setVelocityY(150);
      this.pacman.angle = 90;
    }

    // emit player movement
    var x = this.pacman.x;
    var y = this.pacman.y;
    var a = this.pacman.angle;
    if (this.pacman.oldPosition && (x !== this.pacman.oldPosition.x || y !== this.pacman.oldPosition.y || a !== this.pacman.oldPosition.angle)) {
      this.socket.emit('playerMovement', { x: this.pacman.x, y: this.pacman.y, angle: this.pacman.angle });
    }
    
    // save old position data
    this.pacman.oldPosition = {
      x: this.pacman.x,
      y: this.pacman.y
    };

    // checks to see if pacman overlaps with dots if so then eats them
    // this.physics.add.overlap(this.pacman, this.dotGroup, eatDot, null, this);
  }
}

function addPlayer(self, playerInfo, worldMap) {
  self.pacman = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'pacman');
  self.pacman.setSize(16, 16);
  self.pacman.setCollideWorldBounds(true);

  // play the animation
  self.pacman.play('munch');

  // add the score for that player onto the score board
  self.scoreMap.set(self.socket.id, self.add.text(480, 16, '', { fontSize: '16px', fill: '#FFFFFF' }));
  var scoreText = self.scoreMap.get(self.socket.id);
  scoreText.setText('Your Score: ' + playerInfo.score);

  // check for wall collisions
  self.physics.add.collider(self.pacman, worldMap);
}

function addOtherPlayers(self, playerInfo, worldMap) {
  self.otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'pacman');
  self.otherPlayer.setSize(16, 16);
  self.otherPlayer.setCollideWorldBounds(true);
  
  // play the animation
  self.otherPlayer.play('munch');

  self.otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(self.otherPlayer);
  
  // add the score for that player onto the score board
  self.scoreMap.set(self.otherPlayer.playerId, self.add.text(480, 16*(self.otherPlayers.getLength()+1), '', { fontSize: '16px', fill: '#FFFFFF' }));
  var scoreText = self.scoreMap.get(self.otherPlayer.playerId);
  scoreText.setText(playerInfo.playerId + ': ' + playerInfo.score);

  // check for wall collisions
  self.physics.add.collider(self.otherPlayer, worldMap);
}
/*
// eat function
function eatDot( pacman, dot ){
  dot.disableBody(true, true); //disables the bodies of the 

  // enables all of the starts back onto the map
  if (this.dotGroup.countActive(true) === 0){
    this.dotGroup.children.iterate(function (child) {
      child.enableBody(true, child.x, child.y, true, true);
    })
  }
}
*/