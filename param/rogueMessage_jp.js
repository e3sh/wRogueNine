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
    }
    return ms;
   
}