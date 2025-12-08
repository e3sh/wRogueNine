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

        //UI
        CMD_MAIN: "You can move again.",

        //monster
        BATTLE_IT: "it", 

        FIGHT_1: "That monster must have been an illusion.",
        FIGHT_2: "Wait! That's a mimic!",
        FIGHT_3: "Your hands stop glowing red",
        FIGHT_4:(text)=>{return `The ${text} appears confused.`},
        FIGHT_5:(text)=>{return `You wounded ${text}`},

        ATTACK_1:(text)=>{return `${text} does not harm you.`},
        ATTACK_R: "Your armor weakens.",
        ATTACK_E: "You are transfixed.",
        ATTACK_Q: "You feel less agile.",
        ATTACK_A1: "A sting has weakened you",
        ATTACK_A2: "Sting has no effect.",
        ATTACK_W: "You suddenly feel weaker.",
        ATTACK_L: "Your purse feels lighter.",
        ATTACK_N: (name)=>{return `She stole ${name}!`},
        ATTACK_c1: "Your body begins to solidify.",
        ATTACK_c2: "You are turned to stone !!! --More--",
        ATTACK_d1: "Sting has no effect.",
        ATTACK_d2: "You feel weaker now.",
        ATTACK_g: "You feel singed.",
        ATTACK_h: "You are seared.",
        ATTACK_p: "You are gnawed.",
        ATTACK_u: "You are bitten.",
        ATTACK_w: "You feel devitalized.",
        ATTACK_i: "You feel impaired.",

        CHECKLVL: (num)=>{return `Welcome to level ${num}`},

        PRNAME_1: "you",
        PRNAME_2: (name)=>{return `the ${name}`},

        HIT: (name)=>{return `${name} hit.`},
        MISS: (name, tail)=>{return `${name} miss${tail}.`},
        THUNK_1: (weap, name)=>{return `The ${weap} hits the ${name}.`},
        THUNK_2: (name)=>{return `You hit the ${name}.`},
        BOUNCE_1: (weap ,name)=>{return `The ${weap} misses the ${name}.`},
        BOUNCE_2: (name)=>{return `You missed the ${name}.`},

        KILLED_1: "Defeated it.",
        KILLED_2: (name)=>{return `Defeated ${name}.`},

        //dungeon
        BARGAIN_1: "great bargain",
        BARGAIN_2: "quality product",
        BARGAIN_3: "exceptional find",

        PRICEIT: (type, quo, price)=>{return `That ${type} is a ${quo} for only ${price} pieces of gold`},

        BUYIT_1: "You have no money.",
        BUYIT_2: (type)=>{return `You can't afford to buy that ${type} !`},

        SELLIT_1: "We don't buy those.",
        SELLIT_2: (type, price)=>{return `Your ${type} is worth ${price} pieces of gold.`},
        SELLIT_3: (name)=>{return `Sold ${name}`},

        OP_MARKET: "The market is closed. The stairs are that-a-way.",

        TRANS_LINE: (num)=>{return `You have ${num} transactions remaining.`},

    }
    return ms;
   
}