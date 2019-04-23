// This class is the basic "Account" class.
export class Account {
    username: string
    playerId: number
    score: number
    rotation: number
    x: number
    y: number
    angle: number
    // Basic constructor. On account creation you only need two things:
    //      1: the username the account chooses
    //      2: the ID number the account will be assigned
    // The team color will be chosen later.
    constructor(id: number, x: number, y: number, 
        rotation: number, val: number ){
        this.playerId = id
        this.score = val
        this.x = x
        this.y = y
        this.rotation = rotation
    }

    // This function allows for the changing the user color
    //set_color(team_color:string) {
    //    this.team_color = team_color
    //}
}
