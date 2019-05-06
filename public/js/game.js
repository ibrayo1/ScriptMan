var usrname = '';

var NameInputScene = {
  key: 'NameInputScene',

  preload: function preload(){
    this.load.image('block', 'assets/input/block.png')
    this.load.image('rub', 'assets/input/rub.png')
    this.load.image('end', 'assets/input/end.png')
    this.load.bitmapFont('arcade', 'assets/fonts/bitmap/arcade.png', 'assets/fonts/bitmap/arcade.xml')
    this.load.audio('move-blip', "assets/sounds/tone1.ogg");
    this.load.audio('zap', "assets/sounds/zap1.ogg");

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
              this.sound.play('zap');

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
            this.sound.play('zap');

            this.scene.launch('GameScene');
        }
        else if (name.length < 7)
        {
            //  Add
            name = name.concat(char);
            this.sound.play('move-blip');

            playerText.text = name;
        }
    }, this)
  }
}

var GameScene = {
  key: 'GameScene',

  preload: function preload(){
      // graphics (C)opyright Namco
      this.load.image('power_dot', 'assets/dot.png');
      this.load.image('dot', 'assets/dot.png');
      this.load.image('Hallenbeck', 'assets/Hallenbeck.png', {frameWidth: 32, frameHeight: 32});
      this.load.image('tiles', 'assets/pacman-tiles.png');
      this.load.spritesheet('pacman', 'assets/pacman.png', {frameWidth: 32, frameHeight: 32});
      this.load.spritesheet('blackdragon', 'assets/blackdragon.png', {frameWidth: 75, frameHeight: 80});
      this.load.spritesheet('stringe', 'assets/Stringe.png', {frameWidth: 50, frameHeight: 53});
      this.load.spritesheet('innerrage', 'assets/InnerRage.png', {frameWidth: 139, frameHeight: 181});
      this.load.spritesheet('jrreaper', 'assets/JrReaper.png', {frameWidth: 42, frameHeight: 41});
      this.load.spritesheet('red_ghost', 'assets/red_ghost.png', {frameWidth: 32, frameHeight: 32});
      this.load.audio('chomp1', 'assets/sounds/pacman_chomp1.wav')
      this.load.audio('chomp2', 'assets/sounds/pacman_chomp2.wav')


      this.load.tilemapTiledJSON('map-with-dots', 'assets/pacman-map1.json');
  },

  create: function create(){
      // destroys the TitleScene
      this.scene.remove('NameInputScene');

      //Is this client controlling the ghosts?
      this.is_controller = false;

      const waitText = this.add.text(200,50, "Waiting for 4 players");
      waitText.setDepth(1000);
      waitText.setBackgroundColor("#000000")
      waitText.setFontSize(24);
      this.scene.pause();


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

      //Add a group to hold all our dots
      this.dots = this.physics.add.group({
        key: 'dots'
      });

      this.enemies = this.physics.add.group({
        key: 'enemies'
      });

      // this removes all the dots from the map
      worldMap.forEachTile( tile => {
          if (tile.index === 7 || tile.index == 35) {
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
      
      // create the dragon fly animation
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
              self.pacman.tint =  players[id].color;
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
              self.physics.add.overlap(self.otherPlayer, self.dots, collectDot, null, this);
              self.otherPlayer.setCircle(8, 8, 8);
              self.otherPlayer.tint = players[id].color;
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

      this.socket.on('startGame', function(){
        console.log("fuck");
        waitText.destroy();
        self.scene.resume();
      })

      this.socket.on('spawn_blackdragon', function(position){
          self.blackdragon = self.physics.add.sprite(position.x, position.y, 'blackdragon');
          self.blackdragon.displayHeight = 60;
          self.blackdragon.displayWidth = 60;
          self.blackdragon.setCircle(10, 30, 40);
          self.blackdragon.setCollideWorldBounds(true);

          self.blackdragon.play('dragon-fly');

          self.physics.add.collider(self.blackdragon, worldMap);
          self.enemies.add(self.blackdragon);
          self.last_blackdragon_pos = position;
          self.blackdragon.setVelocityX(170);
      });

      this.socket.on('spawn_stringe', function(position){
        self.stringe = self.physics.add.sprite(position.x, position.y, 'stringe');
        self.stringe.displayHeight = 50;
        self.stringe.displayWidth = 50;
        self.stringe.setCircle(8, 18, 20);
        self.stringe.setCollideWorldBounds(true);
        self.enemies.add(self.stringe);

        self.stringe.play('stringe-fly');

        self.physics.add.collider(self.stringe, worldMap);
        self.last_stringe_pos = position;
        self.stringe.setVelocityX(-170);
      });

      this.socket.on('spawn_innerrage', function(position){
        self.innerrage = self.physics.add.sprite(position.x, position.y, 'innerrage');
        self.innerrage.displayHeight = 60;
        self.innerrage.displayWidth = 60;
        self.innerrage.setCircle(17, 60, 93);
        self.enemies.add(self.stringe);

        self.enemies.add(self.innerrage);        


        self.innerrage.play('innerrage-stand');

        self.physics.add.collider(self.innerrage, worldMap);
        self.last_innerrage_pos = position;
        self.innerrage.setVelocityX(170);
      });

      this.socket.on('spawn_jrreaper', function(position){
        self.jrreaper = self.physics.add.sprite(position.x, position.y, 'jrreaper');
        self.jrreaper.setCircle(8, 15, 15);
        self.jrreaper.play('jrreaper-anim');
        self.enemies.add(self.jrreaper);        
        self.physics.add.collider(self.jrreaper, worldMap);
        self.last_jrreaper_pos = position;
        self.jrreaper.setVelocityX(-170);
      });

      // checks for if a new players added onto server
      this.socket.on('newPlayer', function (playerInfo) {
        self.otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'pacman');
        self.otherPlayer.setCircle(8, 8, 8);
        self.otherPlayer.tint = playerInfo.color;
        self.otherPlayer.setCollideWorldBounds(true);

        self.physics.add.overlap(self.otherPlayer, self.dots, collectDot, null, this);
        
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
                this.scene.launch('NameInputScene');
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

      this.socket.on('enemies_controller', function(){
        console.log("This is the controller")
        self.is_controller = true;
      });

      this.socket.on('new_enemies_controller', function(playerInfo){
        if(playerInfo.playerId == self.socket.id){
          self.is_controller = true;
        } else {
          self.is_controller = false;
        }
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

      this.socket.on("blackdragon_pos", function(pos){
        self.blackdragon.setX(pos.x);
        self.blackdragon.setY(pos.y);
        self.blackdragon.flipX = pos.flip;
      });

      this.socket.on("stringe_pos", function(pos){
        self.stringe.setX(pos.x);
        self.stringe.setY(pos.y);
        self.stringe.flipX = pos.flip;
      });

      this.socket.on("innerrage_pos", function(pos){
        self.innerrage.setX(pos.x);
        self.innerrage.setY(pos.y);
        self.innerrage.flipX = pos.flip;
      });

      this.socket.on("jrreaper_pos", function(pos){
        self.jrreaper.setX(pos.x);
        self.jrreaper.setY(pos.y);
        self.jrreaper.flipX = pos.flip;
      });

      //Listen for the incoming dotmap
      this.socket.on('dotMap', function (dotArray) {
        console.log("Got dotmap")
        console.log(dotArray);
        for(var i = 0; i < dotArray.length; i++){
          if(dotArray[i] == 1){
            var dot = self.physics.add.image(self.dotMap[i].x, self.dotMap[i].y, 'dot');
            dot.mapIndex = i;
            self.dots.add(dot);
          }else if(dotArray[i] == 2){
            var dot = self.physics.add.image(self.dotMap[i].x, self.dotMap[i].y, 'power_dot')
            self.dots.add(dot);
          }
        }
      });

      // define cursors as standard arrow keys
      cursors = this.input.keyboard.createCursorKeys();
  },

  update: function update(){  
    if (this.is_controller == true){
      if( 
          this.blackdragon &&
          this.last_blackdragon_pos.x == this.blackdragon.x && 
          this.last_blackdragon_pos.y == this.blackdragon.y
        ){
        //Make it so we can't just go back on 
        direction = Math.floor((Math.random() * 4));
        while(direction == this.last_blackdragon_direction){
          direction = Math.floor((Math.random() * 4));
        }

        if(direction == 0){
          this.blackdragon.setVelocityY(0);
          this.blackdragon.setVelocityX(170);
          this.blackdragonflipX = true;
          this.blackdragon.flipX = this.blackdragonflipX;
        }else if(direction == 1){
          this.blackdragon.setVelocityY(0);
          this.blackdragon.setVelocityX(-170);
          this.blackdragonflipX = false;
          this.blackdragon.flipX = this.blackdragonflipX;
        }else if(direction == 2){
          this.blackdragon.setVelocityX(0);
          this.blackdragon.setVelocityY(170);
        }else{
          this.blackdragon.setVelocityX(0);
          this.blackdragon.setVelocityY(-170);
        }
      }
      if(this.stringe && this.last_stringe_pos.x == this.stringe.x && this.last_stringe_pos.y == this.stringe.y ){
        //Make it so we can't just go back on 
        direction = Math.floor((Math.random() * 4));
        while(direction == this.last_stringe_direction){
          direction = Math.floor((Math.random() * 4));
        }

        if(direction == 0){
          this.stringe.setVelocityY(0);
          this.stringe.setVelocityX(170);
          this.stringeflipX = true;
          this.stringe.flipX = this.stringeflipX;
        }else if(direction == 1){
          this.stringe.setVelocityY(0);
          this.stringe.setVelocityX(-170);
          this.stringeflipX = false;
          this.stringe.flipX = this.stringeflipX;
        }else if(direction == 2){
          this.stringe.setVelocityX(0);
          this.stringe.setVelocityY(170);
        }else{
          this.stringe.setVelocityX(0);
          this.stringe.setVelocityY(-170);
        }
      }
      if(this.innerrage && this.last_innerrage_pos.x == this.innerrage.x && this.last_innerrage_pos.y == this.innerrage.y){
        //Make it so we can't just go back on 
        direction = Math.floor((Math.random() * 4));
        while(direction == this.last_innerrage_direction){
          direction = Math.floor((Math.random() * 4));
        }

        if(direction == 0){
          this.innerrage.setVelocityY(0);
          this.innerrage.setVelocityX(170);
          this.innerrageflipX = false;
          this.innerrage.flipX = this.innerrageflipX;
        }else if(direction == 1){
          this.innerrage.setVelocityY(0);
          this.innerrage.setVelocityX(-170);
          this.innerrageflipX = true;
          this.innerrage.flipX = this.innerrageflipX;
        }else if(direction == 2){
          this.innerrage.setVelocityX(0);
          this.innerrage.setVelocityY(170);
        }else{
          this.innerrage.setVelocityX(0);
          this.innerrage.setVelocityY(-170);
        }
      }
      if(this.jrreaper && this.last_jrreaper_pos.x == this.jrreaper.x && this.last_jrreaper_pos.y == this.jrreaper.y){
        //Make it so we can't just go back on 
        direction = Math.floor((Math.random() * 4));
        while(direction == this.last_jrreaper_direction){
          direction = Math.floor((Math.random() * 4));
        }

        if(direction == 0){
          this.jrreaper.setVelocityY(0);
          this.jrreaper.setVelocityX(170);
          this.jrreaperflipX = true;
          this.jrreaper.flipX = this.jrreaperflipX;
        }else if(direction == 1){
          this.jrreaper.setVelocityY(0);
          this.jrreaper.setVelocityX(-170);
          this.jrreaperflipX = false;
          this.jrreaper.flipX = this.jrreaperflipX;
        }else if(direction == 2){
          this.jrreaper.setVelocityX(0);
          this.jrreaper.setVelocityY(170);
        }else{
          this.jrreaper.setVelocityX(0);
          this.jrreaper.setVelocityY(-170);
        }
      }
    }

    this.last_blackdragon_pos.x = this.blackdragon.x;
    this.last_blackdragon_pos.y = this.blackdragon.y;
    this.last_stringe_pos.x = this.stringe.x;
    this.last_stringe_pos.y = this.stringe.y;
    this.last_innerrage_pos.x = this.innerrage.x;
    this.last_innerrage_pos.y = this.innerrage.y;
    this.last_jrreaper_pos.x = this.jrreaper.x;
    this.last_jrreaper_pos.y = this.jrreaper.y;

    if(this.is_controller){
      //Send the ghost pos
      var blackdragonPos = {x: this.blackdragon.x, y: this.blackdragon.y, flip: this.blackdragonflipX};
      this.socket.emit('blackdragon_pos', blackdragonPos);

      var stringePos = {x: this.stringe.x, y: this.stringe.y, flip: this.stringeflipX};
      this.socket.emit('stringe_pos', stringePos);

      var innerragePos = {x: this.innerrage.x, y: this.innerrage.y, flip: this.innerrageflipX};
      this.socket.emit('innerrage_pos', innerragePos);

      var jrreaperPos = {x: this.jrreaper.x, y: this.jrreaper.y, flip: this.jrreaperflipX};
      this.socket.emit('jrreaper_pos', jrreaperPos);
    }


    if(this.pacman){
      this.physics.add.overlap(this.pacman, this.dots, collectDot, null, this);
      this.physics.add.overlap(this.pacman, this.enemies, enemyCollide, null, this);

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
  }
}


//Handle the collections of a dot
function collectDot(player, star){
  console.log(this.next_chomp);
  if(this.next_chomp == 1){
    if(this.sound)
      this.sound.play('chomp1');
    this.next_chomp = 2;
  }else{
    this.next_chomp = 1;
    if(this.sound)
      this.sound.play('chomp2');
  }
  if(this.socket)
    this.socket.emit('dotCollected', star.mapIndex)
  star.destroy();
}

function enemyCollide(player, enemy){
  console.log(player);
  console.log(enemy);
  console.log(this.socket);
  if(this.socket){
    this.socket.emit('disconnect');
    this.socket.disconnect();
  }
  const waitText = this.add.text(200,50, "You lost!");
  waitText.setDepth(1000);
  waitText.setBackgroundColor("#000000")
  waitText.setFontSize(24);

  const againText = this.add.text(200,150, "Click to play again!");
  againText.setDepth(1000);
  againText.setBackgroundColor("#000000")
  againText.setFontSize(24);
  againText.setInteractive();

  againText.on('pointerdown', ()=>{
    location.reload();
  })

  this.pacman = null;
  player.destroy();

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
