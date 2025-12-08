function rogueMessage_jp(r){

    ms = {
        //deamons
        UNCONFUSE: "今は混乱が少なくなっている。",
        SIGHT: "闇のヴェールが上がる。",
        NOHASTE: "自分が遅くなっていくのを感じる。",
        STOMACH_1: "空腹の痛みでお腹がうずく。",
        STOMACH_2: "飢え死にするぞ！！",
        STOMACH_3: "あなたは気を失う。",
        STOMACH_4: "あなたは次第に弱さを感じ始めています。",
        STOMACH_5: "お腹が空いてきた。",
        NOTETH_1: "あなたはより肉体的な感覚を覚え始める。",
        NOTETH_2: (text)=>{return `あなたは ${text} に実体化します。`},
        NOTSLOW: "もはや妨げられることはない。",
        NOTREGEN: "もはや支えられていると感じない。",
        NOTINVINC: "もはや無敵とは思えなくなった。",

        //gameManager
        FRUIT: "みずみずしい果物",
        MAINSTART: "ダンジョンの扉を開けるから、ちょっと待ってくれ...",

        //item
        WGHTCHK_1: "あなたの荷物は重すぎる。",  
        WGHTCHK_2: "何かを落とさなければならない",

        //UI
        CMD_MAIN: "動けるようになった",

        //monster
        BATTLE_IT: "何か", 

        FIGHT_1: "あの怪物はおそらく幻影に違いない。",
        FIGHT_2: "待て！あれはミミックだ！",
        FIGHT_3: "あなたの手が赤く光るのをやめる",
        FIGHT_4:(text)=>{return `${text}は混乱しているようだ。`},
        FIGHT_5:(text)=>{return `あなたは${text}に傷を負わせた`},

        ATTACK_1:(text)=>{return `${text}はあなたを傷つけることはありません。`},
        ATTACK_R: "あなたの防具が弱体化した。",
        ATTACK_E: "君は釘付けだ。",
        ATTACK_Q: "身軽さが感じられない。",
        ATTACK_A1: "刺されたことで弱っている",
        ATTACK_A2: "刺しても効果がない。",
        ATTACK_W: "突然、弱さを感じる。",
        ATTACK_L: "財布が軽くなった気がする。",
        ATTACK_N: (name)=>{return `彼女は${name}を盗んだ！`},
        ATTACK_c1: "あなたの身体が固まり始める。",
        ATTACK_c2: "あなたは石化しました！！！",
        ATTACK_d1: "刺しても効果がありません。",
        ATTACK_d2: "今、あなたは弱くなったと感じている。",
        ATTACK_g: "焦げつくような感覚がする。",
        ATTACK_h: "あなたは焼かれた。",
        ATTACK_p: "あなたはかじられている。",
        ATTACK_u: "あなたは噛まれた。",
        ATTACK_w: "あなたは活力を失っていると感じる。",
        ATTACK_i: "あなたは障害を感じている。",

        CHECKLVL: (num)=>{return `経験レベル ${num} になった`},

        PRNAME_1: "あなた",
        PRNAME_2: (name)=>{return `${name}`},

        HIT: (name)=>{return `${name}の攻撃が当たった`},
        MISS: (name, tail)=>{return `${name}の攻撃がはずれた`},
        THUNK_1: (weap, name)=>{return `${weap}が${name}に命中した`},
        THUNK_2: (name)=>{return `あなたの攻撃が${name}に当たった`},
        BOUNCE_1: (weap ,name)=>{return `${name}への${weap}がはずれた`},
        BOUNCE_2: (name)=>{return `あなたの${name}への攻撃がはずれた`},

        KILLED_1: "何かを倒した",
        KILLED_2: (name)=>{return `${name}を倒した`},
        
        //dungeon
        BARGAIN_1: "お買い得",
        BARGAIN_2: "高品質",
        BARGAIN_3: "貴重",

        PRICEIT: (type, quo, price)=>{return `その ${quo}な${type} はたったの ${price}ゴールドです`},

        BUYIT_1: "お金を持っていない",
        BUYIT_2: (type)=>{return `その ${type} は高くて買えません！`},

        SELLIT_1: "それは買わないよ",
        SELLIT_2: (type, price)=>{return `あなたの${type}は${price}ゴールドの価値があります。`},
        SELLIT_3: (name)=>{return `${name}を売却しました`},

        OP_MARKET: "市場は閉まっています。階段からお帰り下さい。",

        TRANS_LINE: (num)=>{return `残り${num}回の取引が可能です。`},
    }
    return ms;
   
}