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
        RESTART: "前回の続きから再開します", 

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

        //monster manager
        WAKEMON: "アンバーハルクの視線に、あなたは惑わされた。",
        
        //move
        DO_MOVE_1: "あなたはまだ熊の罠に引っかかったままです。",
        DO_MOVE_2: "あなたは拘束されています。",
        DO_MOVE_3: "空間の歪みが消える！",

        BE_TRAP_PL: "あなた", 
        BE_TRAP_EN: (name)=>{return `${name}` },

        BE_TRAP_GONER: (name)=>{return `${name}は罠にかかった！`},

        BE_TRAP_MAZE: "あなたは曲がりくねった通路に囲まれています！",

        BE_TRAP_BEAR:  (name, asis)=>{return `${name}${asis} 熊の罠にかかった。`},

        BE_TRAP_SLEEP1: "あなたは一瞬めまいを感じる",
        BE_TRAP_SLEEP2: (name, asis)=>{return `${name}${asis} 見知らぬ白い霧の中で眠っている。`},

        BE_TRAP_ARROW1: (how, name)=>{return `${how}${name}に矢が放たれる.`},
        BE_TRAP_ARROW2: (name)=>{return `${name}の側を矢が飛び去る `},

        BE_TRAP_DART1: (name)=>{return `小さなダーツがちょうど${name}に当たった`},
        BE_TRAP_DART2: (name)=>{return `小さなダーツが${name}のそばをすっ飛んでいく。`},

        BE_TRAP_POOL1: (name)=>{return `${name}が溺れる！`},
        BE_TRAP_POOL2: "下からかすかなうめき声が聞こえる。",
        BE_TRAP_POOL3: "あなたは見知らぬ環境の中にいることに気づく。",
        BE_TRAP_POOL4: "ああ、大変！！プールで溺れちゃった！！",

        //potion
        QUAFF_1: "それは飲めないよ！",
        QUAFF_CONF1: "あなたは冷静さを保っている。",
        QUAFF_CONF2: "待って、ここどうなってるの？え？なに？誰？",
        QUAFF_POISON1: "今、あなたはひどく気分が悪い。",
        QUAFF_POISON2: "一瞬、気分が悪くなる。",
        QUAFF_HEALING: "体調が良くなり始めた。",
        QUAFF_STR: "今、あなたはより強く感じる。なんて膨らんだ筋肉だ！",
        QUAFF_MFIND1: "怪物たちの気配を感じ始める",
        QUAFF_MFIND2: "一瞬、奇妙な感覚が走るが、すぐに消えていく。",
        QUAFF_TFIND1: "魔法の存在を感じ始めた。",
        QUAFF_TFIND2: "一瞬、奇妙な感覚が走るが、すぐに消えていく。",
        QUAFF_PARALY1: "一瞬、感覚が麻痺する。",
        QUAFF_PARALY2: "動けない。",
        QUAFF_SEEINV: (fruit)=>{return `このポーションは${fruit}ジュースのような味がする。` },
        QUAFF_RAISE: "突然、自分の技術が格段に向上したように感じる。",
        QUAFF_XHEAL: "あなたはだんだん気分が良くなってくる。",
        QUAFF_HASTE: "あなたは自分がずっと速く動いているのを感じる。",
        QUAFF_INVINC: "あなたは無敵だと感じる。",
        QUAFF_SMART: "あなたはより敏感に感じている。",
        QUAFF_RESTORE: "おい、これすごくおいしい。体中が温かくなるよ。",
        QUAFF_BLIND1: "光が一瞬弱まった。",
        QUAFF_BLIND2: "闇のマントがあなたの周囲に降りかかる。",
        QUAFF_ETH: "あなたはより気体のように感じられる。",
        QUAFF_NOP: "このポーションはひどく味気ない。",
        QUAFF_DEX: "あなたは以前よりずっと身軽に感じる。",
        QUAFF_REGEN: "あなたは自分が上達したと感じる。",
        QUAFF_DECREP1: "一瞬、めまいがする。",
        QUAFF_DECREP2: "あなたは身動きが取れないと感じる。",
        QUAFF_SUPHEAD: "あなたは元気を取り戻した。",
        QUAFF_DEFAULT: "なんて奇妙な味のポーションなんだ！",

        //scroll
        READSC_1: "読むものはない。",
        READSC_2: "巻物を読み終えると、それは消えてしまった。",
        READSC_KNOWALL: "あなたは知識が深まったと感じる。",
        READSC_CONFUSE: "あなたの手が赤く光り始める。",
        READSC_LIGHT1: "廊下が光り、そして消える。",
        READSC_LIGHT2: "部屋は明るくなっています。",
        READSC_ARMOR: "あなたの鎧が一瞬、かすかに光る。",
        READSC_SLEEP: "あなたは眠りに落ちる。",
        READSC_CREATE: "遠くでかすかな苦痛の叫びが聞こえる。",
        READSC_IDENT: "この巻物は鑑定の巻物である。",
        READSC_GFIND1: "貪欲な気持ちが芽生え、金の気配を感じる。",
        READSC_GFIND2: "下へ引っ張られるような感覚がする。",
        READSC_ENCH1: "あなたは奇妙な喪失感を感じる。",
        READSC_ENCH2: (name)=>{return `あなたの ${name} が一瞬、青く光る。`},
        READSC_SCARE: "遠くで狂気じみた笑い声が聞こえる。",
        READSC_REMOVE: "誰かがあなたを見守っているような気がする。",
        READSC_AGGR: "甲高いブーンという音が聞こえる。",
        READSC_NOP: "この巻物は何も書かれていないようだ。",
        READSC_GENOCIDE: "あなたは大量虐殺という恩寵を授かった。",
        READSC_DCURSE: "あなたの荷物が震える。",
        READSC_DLEVEL: "あなたはたちまち別の土地へと運ばれる。",
        READSC_PROTECT1: "あなたに守護の力が授けられた。",
        READSC_PROTECT2: (name)=>{return `保護された ${name}`},
        READSC_ALLENCH1: "あなたは魅惑の力を授けられた。",
        READSC_ALLENCH2: "巻物が閃光を放ち炎に包まれる！！！あなたは負傷した",
        READSC_ALLENCH3: (name)=>{return `魔法にかけられた ${name}`},
        READSC_BLESS: "あなたのパックが明るく輝いている。",
        READSC_MAKEIT: "あなたは創造の力を授けられた。",
        READSC_BAN1: "上層に昇る", 
        READSC_BAN2: "下層へ追放された",
        READSC_BAN3: (name)=> {return `あなたは ${name} 地域です。`},
        READSC_CWAND: "あなたの杖が輝いている。",
        READSC_LOCTRAP: "あなたは今、落とし穴を認識している。",
        READSC_DEFAULT: "なんとも不可解な巻物だ。",

        //eat
        EAT_1: "それは食べられない！",
        EAT_2: (fruit)=> {return `なんておいしい${fruit}だ。`},
        EAT_3: "うわっ、この食べ物、変わった味だな。",
        EAT_4: "うーん、美味しかった。",



    }
    return ms;
   
}