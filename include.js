//============================================
//include
//============================================

const r = "rogue/";
const p = "param/";

const w = [
    // GameCore
    "https://e3sh.github.io/WebGameCoreSystem/coremin.js",
    "jncurses.js",
    "main.js",
    "ioControl.js",
    "sceneControl.js",
    // Rogue 
    r + "GameManager.js",
    r + "manager/global.js",
    //    r + "manager/rip.js",
    //    r + "manager/wizard.js",
    //    r + "manager/qs.js",
    r + "PlayerCharacter.js",
        r + "player/encumb.js",
        r + "player/misc.js",
        r + "player/move.js",
    //    r + "player/pstats.js",
    //    r + "player/rips.js",
    r + "DungeonMap.js",
        r + "dungeon/new_level.js",
        r + "dungeon/rooms.js",
        r + "dungeon/passages.js",
    //    r + "dungeon/trader.js",

    r + "MonsterManager.js",
        r + "monster/chase.js",
    //    r + "monster/battle.js",
    r + "ItemManager.js",
    //    r + "item/rings.js",
        r + "item/things.js",
        r + "item/pack.js",
    //    r + "item/potions.js",
        r + "item/weapons.js",
    //    r + "item/armor.js",
    //    r + "item/scrolls.js",
    //    r + "item/sticks.js",
    r + "UIManager.js",
        r + "UI/io.js",
        r + "UI/command.js",
    //    r + "UI/wizard.js",
    //    r + "UI/moveEffect.js",
    r + "DaemonScheduler.js",
    // Rogue Parameters
    p + "rogueDefines.js",
    p + "rogueFuncs.js",
    p + "rogueTypes.js",
    p + "rogueMessage.js",
    p + "rogueMessage_jp.js",
    p + "itemData.js",
    p + "monsterData.js",
];

for (let i in w) {
    document.write(`<script type="text/javascript" src="${w[i]}"></script>`);
};
