function rogueMessage(r){

    ms = {
        //deamons
        UNCONFUSE: "You feel less confused now.",
        SIGHT: "The veil of darkness lifts.",
        NOHASTE: "You feel yourself slowing down.",
        STOMACH_1: "Your stomach writhes with hunger pains.",
        STOMACH_2: "You starve to death !!",
        STOMACH_3: "You faint.",
        STOMACH_4: "You are starting to feel weak.",
        STOMACH_5: "Getting hungry.",
        NOTETH_1: "You begin to feel more corporeal.",
        NOTETH_2: (text)=>{return `You materialize in ${text}.`},
        NOTSLOW: "You no longer feel hindered.",
        NOTREGEN: "You no longer feel bolstered.",
        NOTINVINC: "You no longer feel invincible.",

        //gameManager
        FRUIT:"juicy-fruit",
        MAINSTART:"Hello player, One moment while I open the door to the dungeon...",

        //item
        WGHTCHK_1: "Your pack is too heavy for you.",  
        WGHTCHK_2: "You must drop something",

    }
    return ms;
   
}