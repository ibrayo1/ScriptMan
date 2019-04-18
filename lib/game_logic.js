var direction = {
    up: false,
    down: false,
    left: false,
    right: false
}
document.addEventListener('keydown', (keyPress)=> {
    // If the key pressed is W
    if(keyPress.keyCode == 87){
        direction.up = true
    }
    // If the key pressed is S
    if(keyPress.keyCode == 83){
        direction.down = true
    }
    // If the key pressed is A
    if(keyPress.keyCode == 65){
        direction.left = true
    }
    // If the key pressed is D
    if(keyPress.keyCode == 68){
        direction.right = true
    }
})
document.addEventListener('keyup', (keyPress) => {
    // If the key released is W
    if(keyPress.keyCode == 87){
        direction.up = false
    }
    // If the key released is S
    if(keyPress.keyCode == 83){
        direction.down = false
    }
    // If the key released is A
    if(keyPress.keyCode == 65){
        direction.left = false
    }
    // If the key released is D
    if(keyPress.keyCode == 68){
        direction.right = false
    }

})

