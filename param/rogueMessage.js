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
        FRUIT: "juicy-fruit",
        MAINSTART: "Hello player, One moment while I open the door to the dungeon...",
        RESTART: "We will resume from where we left off last time.", 

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
        DEATH:  (name)=>{return `Defeated by  ${name}`},

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

        DO_POST: "Welcome to Friendly Fiend's Flea Market",
        OP_MARKET: "The market is closed. The stairs are that-a-way.",

        TRANS_LINE: (num)=>{return `You have ${num} transactions remaining.`},

        //monster manager
        WAKEMON: "The umber hulk's gaze has confused you.",

        //move
        DO_MOVE_1: "You are still stuck in the bear trap.",
        DO_MOVE_2: "You are being held.",
        DO_MOVE_3: "The spatial warp disappears !",

        BE_TRAP_PL: "You", 
        BE_TRAP_EN: (name)=>{return `The ${name}` },

        BE_TRAP_GONER: (name)=>{return `${name} fell into a trap!`},

        BE_TRAP_MAZE: "You are surrounded by twisty passages!",

        BE_TRAP_BEAR:  (name, asis)=>{return `${name}${asis} caught in a bear trap.`},

        BE_TRAP_SLEEP1: "You feel momentarily dizzy.",
        BE_TRAP_SLEEP2: (name, asis)=>{return `${name}${asis} asleep in a strange white mist.`},

        BE_TRAP_ARROW1: (how, name)=>{return `${how}An arrow shot ${name}.`},
        BE_TRAP_ARROW2: (name)=>{return `An arrow shoots past ${name}`},

        BE_TRAP_DART1: (name)=>{return `A small dart just hit ${name}`},
        BE_TRAP_DART2: (name)=>{return `A small dart whizzes by ${name}.`},

        BE_TRAP_POOL1: (name)=>{return `The ${name} drowns !!`},
        BE_TRAP_POOL2: "You here a faint groan from below.",
        BE_TRAP_POOL3: "You find yourself in strange surroundings.",
        BE_TRAP_POOL4: "Oh no!!! You drown in the pool!!! --More--",

        //potion
        QUAFF_1: "That's undrinkable!",
        QUAFF_CONF1: "You remain level-headed.",
        QUAFF_CONF2: "Wait, what's going on here. Huh? What? Who?",
        QUAFF_POISON1: "You feel very sick now.",
        QUAFF_POISON2: "You feel momentarily sick.",
        QUAFF_HEALING: "You begin to feel better.",
        QUAFF_STR: "You feel stronger, now.  What bulging muscles!",
        QUAFF_MFIND1: "You begin to sense the presence of monsters--More--",
        QUAFF_MFIND2: "You have a strange feeling for a moment, then it passes.",
        QUAFF_TFIND1: "You begin to sense the presence of magic.",
        QUAFF_TFIND2: "You have a strange feeling for a moment, then it passes.",
        QUAFF_PARALY1: "You feel numb for a moment.",
        QUAFF_PARALY2: "You can't move.",
        QUAFF_SEEINV: (fruit)=>{return `This potion tastes like ${fruit} juice.` },
        QUAFF_RAISE: "You suddenly feel much more skillful.",
        QUAFF_XHEAL: "You begin to feel much better.",
        QUAFF_HASTE: "You feel yourself moving much faster.",
        QUAFF_INVINC: "You feel invincible.",
        QUAFF_SMART: "You feel more perceptive.",
        QUAFF_RESTORE: "Hey, this tastes great. You feel warm all over.",
        QUAFF_BLIND1: "The light dims for a moment.",
        QUAFF_BLIND2: "A cloak of darkness falls around you.",
        QUAFF_ETH: "You feel more vaporous.",
        QUAFF_NOP: "This potion tastes extremely dull.",
        QUAFF_DEX: "You feel much more agile.",
        QUAFF_REGEN: "You feel yourself improved.",
        QUAFF_DECREP1: "You feel momentarily woozy.",
        QUAFF_DECREP2: "You feel crippled.",
        QUAFF_SUPHEAD: "You feel invigorated.",
        QUAFF_DEFAULT: "What an odd tasting potion!",

        //scroll
        READSC_1: "Nothing to read.",
        READSC_2: "As you read the scroll, it vanishes.",
        READSC_KNOWALL: "You feel more knowledgable.",
        READSC_CONFUSE: "Your hands begin to glow red.",
        READSC_LIGHT1: "The corridor glows and then fades.",
        READSC_LIGHT2: "The room is lit.",
        READSC_ARMOR: "Your armor glows faintly for a moment.",
        READSC_SLEEP: "You fall asleep.",
        READSC_CREATE: "You hear a faint cry of anguish in the distance.",
        READSC_IDENT: "This scroll is an identify scroll",
        READSC_SMAP1: "Oh, now this scroll has a ",
        READSC_SMAP2: "very detailed map on it.",
        READSC_SMAP3: "map on it.",
        READSC_GFIND1: "You begin to feel greedy and sense gold.",
        READSC_GFIND2: "You begin to feel a pull downward.",
        READSC_ENCH1: "You feel a strange sense of loss.",
        READSC_ENCH2: (name)=>{return `Your ${name} glows blue for a moment.`},
        READSC_SCARE: "You hear maniacal laughter in the distance.",
        READSC_REMOVE: "You feel as if somebody is watching over you.",
        READSC_AGGR: "You hear a high pitched humming noise.",
        READSC_NOP: "This scroll seems to be blank.",
        READSC_GENOCIDE: "You have been granted the boon of genocide.",
        READSC_DCURSE: "Your pack shudders.",
        READSC_DLEVEL: "You are whisked away to another region.",
        READSC_PROTECT1: "You are granted the power of protection.",
        READSC_PROTECT2: (name)=>{return `Protected ${name}`},
        READSC_ALLENCH1: "You are granted the power of enchantment.",
        READSC_ALLENCH2: "You are injured as the scroll flashes & bursts into flames !!!",
        READSC_ALLENCH3: (name)=>{return `Enchanted ${name}`},
        READSC_BLESS: "Your pack glistens brightly.",
        READSC_MAKEIT: "You have been endowed with the power of creation.",
        READSC_BAN1: "elevated to the upper", 
        READSC_BAN2: "banished to the lower",
        READSC_BAN3: (name)=> {return `You are ${name} regions.`},
        READSC_CWAND: "Your sticks gleam.",
        READSC_LOCTRAP: "You now recognize pitfalls.",
        READSC_DEFAULT: "What a puzzling scroll!",

        //eat
        EAT_1: "That's Inedible!",
        EAT_2: (fruit)=> {return `My, that was a yummy ${fruit}.`},
        EAT_3: "Yuk, this food tastes like ARA.",
        EAT_4: "Yum, that tasted good.",

        //dip_it
        DIPIT_1: "You are unable to release your weapon.",
        DIPIT_2: "You have to take off your armor before you can dip it.",
        DIPIT_3: "You have to take that ring off before you can dip it.",
        DIPIT_WEP: (name)=>{return `The ${name} glows for a moment.`},
        DIPIT_ARM: (name)=>{return `The ${name} glows for a moment.`},
        DIPIT_STI: (made, type)=>{return `The ${made} ${type} glows for a moment.`},
        DIPIT_SCR: (name)=>{return `The '${name}' scroll unfurls.`},
        DIPIT_POT: (name)=>{return `The ${name} potion bubbles for a moment.`},
        DIPIT_RIN: (name)=>{return `The ${name} ring vibrates for a moment.`},
        DIPIT_DEF: "The pool bubbles for a moment.",

        //weapon
        FALL_1: (name)=>{return `Your ${name} vanishes as it hits the ground.`},
        FALL_2: (name)=>{return `${name} vanishes as it hits the ground.`},
        WIELD: (name)=>{return `Wielding ${name}`}, 

        //armor
        WEAR_1: "You are already wearing some.",
        WEAR_2: "You can't wear that.",
        WEAR_3: (name)=>{return `Wearing ${name}.`},
        TAKEOFF_1: "Not wearing any armor.",
        TAKEOFF_2: (ch, name)=>{return `Was wearing ${ch}) ${name}`},

        //ring
        RINGON_1: "Already wearing two rings.",
        RINGON_2: "That won't fit on your finger.",
        RINGON_3: "You find yourself moving must faster.",
        RINGON_4: (name)=>{return `Now wearing ${name}`},

        RINGOFF1: "You're not wearing any rings.",
        RINGOFF2: "Not wearing such a ring.",
        RINGOFF3: (name)=>{return `Was wearing ${name}`},

        //thins
        MONEY_1: (value)=>{return `${value} gold pieces.`},
        MONEY_2: "That gold must have been counterfeit.",

        DROP_1: "There is something there already.",
        DROP_2: (name)=>{return `${name} sinks out of sight.`},
        DROP_3: "Thanks for your donation to the Fiend's flea market.",
        DROP_4: (name)=>{return `Dropped ${name}`},

        DROPCHK_1: "The trader does not accept shoddy merchandise.",
        DROPCHK_2: "You can't.  It appears to be cursed.",

        TOTALWIN:[
            "You Made It!",
            "Congratulations, you have made it to the light of day!",
            "You have joined the elite ranks of those who have escaped the",
            "Dungeons of Doom alive.",
        ],
    }
    return ms;
   
}