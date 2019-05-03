var usrname = '';

var NameInputScene = {
  key: 'NameInputScene',

  preload: function preload(){
    this.load.image('block', 'assets/input/block.png')
    this.load.image('rub', 'assets/input/rub.png')
    this.load.image('end', 'assets/input/end.png')
    this.load.bitmapFont('arcade', 'assets/fonts/bitmap/arcade.png', 'assets/fonts/bitmap/arcade.xml')
  },

  create: function create(){
    var chars= [ 
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], 
      ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'], 
      ['U', 'V', 'W', 'X', 'Y', 'Z', '.', '-', '<', '>']
    ];
    
    var cursor = {x: 0, y: 0};
    var name = '';

    var input = this.add.bitmapText(80, 50, 'arcade', 'ABCDEFGHIJ\n\nKLMNOPQRST\n\nUVWXYZ.-').setLetterSpacing(20);
    input.setInteractive();

    var rub = this.add.image(input.x + 430, input.y + 148, 'rub');
    var end = this.add.image(input.x + 482, input.y + 148, 'end');

    var block = this.add.image(input.x - 10, input.y -2, 'block').setOrigin(0);

    var legend = this.add.bitmapText(260, 260, 'arcade', 'NAME').setTint(0xff00ff);

    var playerText = this.add.bitmapText(260, 310, 'arcade', name).setTint(0xff0000);

    this.input.keyboard.on('keyup', function (event) {
        if (event.keyCode === 37)
        {
            //  left
            if (cursor.x > 0)
            {
                cursor.x--;
                block.x -= 52;
            }
        }
        else if (event.keyCode === 39)
        {
            //  right
            if (cursor.x < 9)
            {
                cursor.x++;
                block.x += 52;
            }
        }
        else if (event.keyCode === 38)
        {
            //  up
            if (cursor.y > 0)
            {
                cursor.y--;
                block.y -= 64;
            }
        }
        else if (event.keyCode === 40)
        {
            //  down
            if (cursor.y < 2)
            {
                cursor.y++;
                block.y += 64;
            }
        }
        else if (event.keyCode === 13 || event.keyCode === 32)
        {
            //  Enter or Space
            if (cursor.x === 9 && cursor.y === 2 && name.length > 0)
            {
                //  Submit
                usrname = name;
                this.scene.launch('GameScene');
            }
            else if (cursor.x === 8 && cursor.y === 2 && name.length > 0)
            {
                //  Rub
                name = name.substr(0, name.length - 1);

                playerText.text = name;
            }
            else if (name.length < 7)
            {
                //  Add
                name = name.concat(chars[cursor.y][cursor.x]);

                playerText.text = name;
            }
        }
    });
    
    input.on('pointermove', function(pointer, x, y) {
        var cx = Phaser.Math.Snap.Floor(x, 52, 0, true);
        var cy = Phaser.Math.Snap.Floor(y, 64, 0, true);
        var char = chars[cy][cx];

        pointer.x = cx;
        pointer.y = cy;

        block.x = input.x - 10 + (cx * 52);
        block.y = input.y - 2 + (cy * 64);
    }, this)

    input.on('pointerup', function(pointer, x, y) {
        var cx = Phaser.Math.Snap.Floor(x, 52, 0, true);
        var cy = Phaser.Math.Snap.Floor(y, 64, 0, true);
        var char = chars[cy][cx];

        pointer.x = cx;
        pointer.y = cy;

        block.x = input.x - 10 + (cx * 52);
        block.y = input.y - 2 + (cy * 64);

        if (char === '<' && name.length > 0)
        {
            //  Rub
            name = name.substr(0, name.length - 1);

            playerText.text = name;
        }
        else if (char === '>' && name.length > 0)
        {
            //  Submit
            usrname = name;
            this.scene.launch('GameScene');
        }
        else if (name.length < 7)
        {
            //  Add
            name = name.concat(char);

            playerText.text = name;
        }
    }, this)
  }
}

var GameScene = {
  key: 'GameScene',

  preload: function preload(){
      // graphics (C)opyright Namco
      this.load.image('dot', 'assets/dot.png');
      this.load.image('Hallenbeck', 'assets/Hallenbeck.png', {frameWidth: 32, frameHeight: 32});
      this.load.image('tiles', 'assets/pacman-tiles.png');
      this.load.spritesheet('pacman', 'assets/pacman.png', {frameWidth: 32, frameHeight: 32});
      this.load.spritesheet('blackdragon', 'assets/blackdragon.png', {frameWidth: 75, frameHeight: 80});
      this.load.spritesheet('stringe', 'assets/Stringe.png', {frameWidth: 50, frameHeight: 53});
      this.load.spritesheet('innerrage', 'assets/InnerRage.png', {frameWidth: 139, frameHeight: 181});
      this.load.spritesheet('jrreaper', 'assets/JrReaper.png', {frameWidth: 42, frameHeight: 41});
      this.load.tilemapTiledJSON('map-with-dots', 'assets/pacman-map1.json');
  },

  create: function create(){
      // destroys the TitleScene
      this.scene.remove('NameInputScene');

      // this resets the world bound collisions
      this.physics.world.setBounds(0, 0, 448, 496, true, true, true, true);

      // renders the map
      const map = this.make.tilemap({key: 'map-with-dots'});
      const tileset = map.addTilesetImage("pacman-tiles", "tiles");
      const worldMap = map.createDynamicLayer("Pacman", tileset, 0, 0);

      // set collisions where player collides with everything except dots and open spaces
      // 7 maps to dots and 14 maps to open spaces
      worldMap.setCollisionByExclusion([7,14]);

      this.dotMap = []; //holds the positions of where the dots should appear on the map

      this.scoreMap = new Map(); //creates and holds the scores for all players in the world

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


      // dragon enemy animation
      this.anims.create({
        key: 'dragon-fly',
        frames: this.anims.generateFrameNumbers('blackdragon', {start: 0, end: 4}),
        frameRate: 6,
        repeat: -1
      });

      
      // stringe enemy animation
      this.anims.create({
        key: 'stringe-fly',
        frames: this.anims.generateFrameNumbers('stringe', {start: 0, end: 1}),
        frameRate: 6,
        repeat: -1
      });

      // inner rage standing enemy animation
      this.anims.create({
        key: 'innerrage-stand',
        frames: this.anims.generateFrameNumbers('innerrage', {start: 0, end: 7}),
        frameRate: 6,
        repeat: -1
      });

      // Jr Reaper enemy animation
      this.anims.create({
        key: 'jrreaper-anim',
        frames: this.anims.generateFrameNumbers('jrreaper', {start: 0, end: 7}),
        frameRate: 6,
        repeat: -1
      });
      
      var self = this;
      this.socket = io();
      this.socket.emit('playerName', {username: usrname});
      this.otherPlayers = this.physics.add.group();
      
      // listen for current players
      this.socket.on('currentPlayers', function (players) {
          var rand = self.dotMap[Math.floor(Math.random() * self.dotMap.length)];
          Object.keys(players).forEach(function (id) {
          if (players[id].playerId === self.socket.id) {
              self.pacman = self.physics.add.sprite(rand.x, rand.y, 'pacman');
              self.pacman.setCircle(8, 8, 8);
              // self.pacman.tint =  0xff00ff; can use this to change color of pacman
              self.pacman.setCollideWorldBounds(true);

              // play the animation
              self.pacman.play('munch');
          
              // add the score for that player onto the score board
              self.scoreMap.set(self.socket.id, self.add.text(480, 16, '', { fontSize: '16px', fill: '#FFFFFF' }));
              var scoreText = self.scoreMap.get(self.socket.id);
              scoreText.setText(players[id].username + ': ' + players[id].score);
          
              // check for wall collisions
              self.physics.add.collider(self.pacman, worldMap);
          } else {
              self.otherPlayer = self.physics.add.sprite(players[id].x, players[id].y, 'pacman');
              self.otherPlayer.setCircle(8, 8, 8);
              self.otherPlayer.setCollideWorldBounds(true);
              
              // play the animation
              self.otherPlayer.play('munch');
            
              self.otherPlayer.playerId = players[id].playerId;
              self.otherPlayers.add(self.otherPlayer);
              
              // add the score for that player onto the score board
              self.scoreMap.set(self.otherPlayer.playerId, self.add.text(480, 16*(self.otherPlayers.getLength()+1), '', { fontSize: '16px', fill: '#FFFFFF' }));
              var scoreText = self.scoreMap.get(self.otherPlayer.playerId);
              scoreText.setText(players[id].username + ': ' + players[id].score);
            
              // check for wall collisions
              self.physics.add.collider(self.otherPlayer, worldMap);
          }
          });
      });

      // checks for if a new players added onto server
      this.socket.on('newPlayer', function (playerInfo) {
        self.otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'pacman');
        self.otherPlayer.setCircle(8, 8, 8);
        self.otherPlayer.setCollideWorldBounds(true);
        
        // play the animation
        self.otherPlayer.play('munch');
      
        self.otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(self.otherPlayer);
        
        // add the score for that player onto the score board
        self.scoreMap.set(self.otherPlayer.playerId, self.add.text(480, 16*(self.otherPlayers.getLength()+1), '', { fontSize: '16px', fill: '#FFFFFF' }));
        var scoreText = self.scoreMap.get(self.otherPlayer.playerId);
        scoreText.setText(playerInfo.username + ': ' + playerInfo.score);
      
        // check for wall collisions
        self.physics.add.collider(self.otherPlayer, worldMap);
      });

      // checks for players that disconnect
      this.socket.on('disconnect', function (playerId) {
          self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                self.scoreMap.get(otherPlayer.playerId).destroy(); // destroy text
                self.scoreMap.delete(otherPlayer.playerId); // delete player's score from the map of player scores
                otherPlayer.destroy(); // destroy the player object
                this.scene.launch('TitleScene');
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

      // listen for dragon movement
      this.socket.on('blackdragonMoved', function (dragonInfo){
        self.blackdragon.x = dragonInfo.x;
        self.blackdragon.y = dragonInfo.y;
      });

      // listen for stringe movement
      this.socket.on('stringeMoved', function (stringeInfo){
        self.stringe.x = stringeInfo.x;
        self.stringe.y = stringeInfo.y;
      });

      // listen for inner rage movement
      this.socket.on('innerrageMoved', function (innerrageInfo){
        self.innerrage.x = innerrageInfo.x;
        self.innerrage.y = innerrageInfo.y;
      });

      this.socket.on('jrreaperMoved', function(jrreaperInfo){
        self.jrreaper.x = jrreaperInfo.x;
        self.jrreaper.y = jrreaperInfo.y;
      });

      this.socket.on('dotLocation', function (dotLocation) {
          if (self.dot) self.dot.destroy();
          self.dot = self.physics.add.image(dotLocation.x, dotLocation.y, 'Hallenbeck');
          var rand = self.dotMap[Math.floor(Math.random() * self.dotMap.length)];
          self.physics.add.overlap(self.pacman, self.dot, function () {
            this.socket.emit('dotCollected', {x: rand.x, y: rand.y});
          }, null, self);
      });
      
      this.socket.on('blackdragonLocation', function (loc) {
        if (self.blackdragon) self.blackdragon.destroy();
        self.blackdragon = self.physics.add.sprite(loc.x, loc.y, 'blackdragon');
      
        self.blackdragon.displayHeight = 60;
        self.blackdragon.displayWidth = 60;
        self.blackdragon.setCircle(12, 29, 30);
        self.blackdragon.play('dragon-fly');

        self.blackdragon.body.setVelocity(loc.vx, loc.vy).setBounce(1, 1).setCollideWorldBounds(true);

        // check for wall collisions, this breaks the dragon movement idk why tho
        //self.physics.add.collider(self.blackdragon, worldMap);

        self.physics.add.overlap(self.pacman, self.blackdragon, function () {
          location.reload(true); //reloads the url
        }, null, self);

      });

      this.socket.on('stringeLocation', function(loc){
        if (self.stringe) self.stringe.destroy();
        self.stringe = self.physics.add.sprite(loc.x, loc.y, 'stringe');

        self.stringe.displayHeight = 50;
        self.stringe.displayWidth = 50;
        self.stringe.setCircle(8, 18, 20);
        self.stringe.play('stringe-fly');

        self.stringe.body.setVelocity(loc.vx, loc.vy).setBounce(1, 1).setCollideWorldBounds(true);

        // check for wall collisions
        // self.physics.add.collider(self.stringe, worldMap);

        self.physics.add.overlap(self.pacman, self.stringe, function () {
          location.reload(true); //reloads the url
        }, null, self);

      });

      this.socket.on('innerrageLocation', function(loc){
        if(self.innerrage) self.innerrage.destroy();
        self.innerrage = self.physics.add.sprite(loc.x, loc.y, 'innerrage');

        self.innerrage.displayHeight = 60;
        self.innerrage.displayWidth = 60;
        self.innerrage.setCircle(35, 38, 70);
        self.innerrage.play('innerrage-stand');

        self.innerrage.body.setVelocity(loc.vx, loc.vy).setBounce(1, 1).setCollideWorldBounds(true);

        self.physics.add.overlap(self.pacman, self.innerrage, function(){
          location.reload(true); //reloads the url
        }, null , self);

      });

      this.socket.on('jrreaperLocation', function(loc){
        if(self.jrreaper) self.jrreaper.destroy();
        self.jrreaper = self.physics.add.sprite(loc.x, loc.y, 'jrreaper');

        //self.jrreaper.setCircle(1, 1, 1); ill take care of this later
        self.jrreaper.play('jrreaper-anim');

        self.jrreaper.body.setVelocity(loc.vx, loc.vy).setBounce(1, 1).setCollideWorldBounds(true);

        self.physics.add.overlap(self.pacman, self.jrreaper, function(){
          location.reload(true); //reloads the url 
        }, null, self);

      });

      // listens for the the scores for all the players and updates them
      this.socket.on('scoreUpdate', function (players) {
      Object.keys(players).forEach(function (id) {
          if (players[id].playerId === self.socket.id) {
            var playerScore = self.scoreMap.get(self.socket.id);
            playerScore.setText(players[id].username + ': ' + players[id].score);
          } else {
            var otherPlayerScore = self.scoreMap.get(players[id].playerId);
            otherPlayerScore.setText(players[id].username + ': ' + players[id].score);
          }
        });
      });

      // define cursors as standard arrow keys
      cursors = this.input.keyboard.createCursorKeys();
  },

  update: function update(){
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
    }

    if(this.blackdragon){

      if(this.blackdragon.body.velocity.x < 0){
        this.blackdragon.flipX = false;
      }else if(this.blackdragon.body.velocity.x > 0){
        this.blackdragon.flipX = true;
      }

      var x = this.blackdragon.x;
      var y = this.blackdragon.y;
      var vx = this.blackdragon.body.velocity.x;
      var vy = this.blackdragon.body.velocity.y;
      
      if (this.blackdragon.oldPosition && (x !== this.blackdragon.oldPosition.x || y !== this.blackdragon.oldPosition.y || vx !== this.blackdragon.oldPosition.vx || vy !== this.blackdragon.oldPosition.vy )){
        this.socket.emit('blackdragonMovement', { x: this.blackdragon.x, y: this.blackdragon.y, 
        vx: this.blackdragon.body.velocity.x, vy: this.blackdragon.body.velocity.y});
      }

      this.blackdragon.oldPosition = {
        x: this.blackdragon.x,
        y: this.blackdragon.y,
        vx: this.blackdragon.body.velocity.x,
        vy: this.blackdragon.body.velocity.y
      }
    }

    if(this.stringe){

      if(this.stringe.body.velocity.x < 0){
        this.stringe.flipX = false;
      } else if (this.stringe.body.velocity.x > 0){
        this.stringe.flipX = true;
      }

      var x = this.stringe.x;
      var y = this.stringe.y;
      var vx = this.stringe.body.velocity.x;
      var vy = this.stringe.body.velocity.y;

      if(this.stringe.oldPosition && (x !== this.stringe.oldPosition.x || y !== this.stringe.oldPosition.y || vx !== this.stringe.oldPosition.vx || vy !== this.stringe.oldPosition.vy)){
        this.socket.emit('stringeMovement', {x: this.stringe.x, y: this.stringe.y, vx: this.stringe.body.velocity.x, vy: this.stringe.body.velocity.y});
      }

      this.stringe.oldPosition = {
        x: this.stringe.x,
        y: this.stringe.y,
        vx: this.stringe.body.velocity.x,
        vy: this.stringe.body.velocity.y
      }
    }

    if(this.innerrage){
      
      if(this.innerrage.body.velocity.x < 0){
        this.innerrage.flipX = true;
      } else if (this.innerrage.body.velocity.x > 0){
        this.innerrage.flipX = false;
      }

      var x = this.innerrage.x;
      var y = this.innerrage.y;
      var vx = this.innerrage.body.velocity.x;
      var vy = this.innerrage.body.velocity.y;

      if(this.innerrage.oldPosition && (x !== this.innerrage.oldPosition.x || y != this.innerrage.oldPosition.y || 
        vx !== this.innerrage.oldPosition.vx || vy !== this.innerrage.oldPosition.vy )){
          this.socket.emit('innerrageMovement', {x: this.innerrage.x, y: this.innerrage.y, vx: this.innerrage.body.velocity.x, vy: this.innerrage.body.velocity.y});
        }

      this.innerrage.oldPosition = {
        x: this.innerrage.x,
        y: this.innerrage.y,
        vx: this.innerrage.body.velocity.x,
        vy: this.innerrage.body.velocity.y
      }

    }

    if(this.jrreaper){
      if(this.jrreaper.body.velocity.x < 0){
        this.jrreaper.flipX = false;
      } else if (this.jrreaper.body.velocity.x > 0){
        this.jrreaper.flipX = true;
      }

      var x = this.jrreaper.x;
      var y = this.jrreaper.y;
      var vx = this.jrreaper.body.velocity.x;
      var vy = this.jrreaper.body.velocity.y;

      if(this.jrreaper.oldPosition && (x !== this.jrreaper.oldPosition.x || y !== this.jrreaper.oldPosition.y || 
        vx !== this.jrreaper.oldPosition.vx || vy !== this.jrreaper.oldPosition.vy)){
          this.socket.emit('jrreaperMovement', {x: this.jrreaper.x, y: this.jrreaper.y, vx: this.jrreaper.body.velocity.x, vy: this.jrreaper.body.velocity.y});
      }

      this.jrreaper.oldPosition = {
        x: this.jrreaper.x,
        y: this.jrreaper.y,
        vx: this.jrreaper.body.velocity.x,
        vy: this.jrreaper.body.velocity.y
      }
    }
  }

}

var game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800, //448 is the size of the map
  height: 496,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: [NameInputScene, GameScene]
});
