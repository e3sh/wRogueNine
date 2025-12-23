function GameManager(g){

    const d = rogueDefines();
    const f = rogueFuncs();
    const t = rogueTypes();
    const v = {};//globalValiableInit();

    //const ms = rogueMessage(this);
    const ms = rogueMessage_jp(this);

    //props

    this.define = d;
    this.func = f;
    this.types = t;
    this.globalValiable = {};//v;
    this.messages = ms;
 
    itemData(this);
    monsterData(this);

    global(this);

	for (let i in this.globalValiable){
    //    this.UI.msg(`${i}: ${this.globalValiable[i].length}`);
    }
    for (let i in this.define){
    //    this.UI.msg(`${i}: ${this.define[i]}`);
    }

    this.UI = new UIManager(this, g);
    this.daemon = new DaemonScheduler(this);
    this.item = new ItemManager(this);
    this.player = new PlayerCharacter(this);
    this.dungeon = new DungeonMap(this);
    this.monster = new MonsterManager(this);

    this.quiet = 0;         /* # of quiet turns */
    this.nochange = false;  /* true if last stat same as now */
    this.count = 0;			/* # of times to repeat cmd */
    this.packvol = 0;       /* volume of things in pack */

    this.after = false;     /* True if we want after daemons */
    this.running = false;   /* True if player is running */
    this.wizard = false;    /* True if he is a wizard */
    this.waswizard = false; /* Was a wizard sometime */
    this.take = 0;          /* Thing the rogue is taking */
    this.door_stop = false; /* Stop run when we pass a door */
    this.runch = "";        /* Direction player is running */
    this.firstmove = false; /* First move after door_stop */    
    this.levcount = 0;      /* # of active mons this level */
    this.levtype = d.NORMLEV;/* type of level this is, maze, etc. */
    this.amulet = false;    /* He found the amulet */
    
	this.oldpos = new t.coord();    //struct coord oldpos;		/* Pos before last look() call */
	this.delta = new t.coord();     //struct coord delta;			/* Change indicated to get_dir() */
	this.rndspot = { x:-1, y:-1 };  //struct coord rndspot = { -1, -1 };	/* for random teleporting */

    this.isfight = false;   /* true if player is fighting */
    
    this.curprice = -1;     /* current price of item */
	this.inpool = false;    /* true if hero standing in pool */
    this.nlmove = false;	/* true when transported to new level */

    this.cutpurch; /* name of item ready to buy */

    this.rsmsg_f = false;
    this.rstime = 0;
    this.getGametime =()=>{return g.time()};

    this.castspell = false;
    this.death = false;

    this.nextScene = 0;
    
    let entities = [];
    this.entity = entities;

    this.playing = false;

    const r = this;

    this.qs = new quick_storage(r);

    /*
    * sceneChange param initialize
    */
    const SceneList = {
        0: ()=>{r.UI.command.main();} , //SCE_MAIN 
        1: ()=>{r.UI.scene.keywait();}, //SCE_KEYWAIT
        2: ()=>{r.UI.scene.inventry();}, //SCE_INVENT
        3: ()=>{r.UI.scene.get_item();}, //SCE_GETTIEM
        4: ()=>{r.UI.scene.create_obj();},//SCE_CREATE
        5: ()=>{r.UI.scene.result();},  //SCE_RESULT
    }

    let SceneFunc;// =  setthis.UI.command();/* Command execution */;

     this.setScene = (scene)=>{
        SceneFunc = SceneList[scene];
        //if (scene == 0) this.nextScene = 0;
    }

    this.UI.comment("game");

    //methods

    /*
    * rnd:
    *	Pick a very random number.
    */
    this.rnd = function(range){
        return Math.floor(Math.random()*(range));
    }

    /*
    * roll:
    *	Roll a number of dice
    */
    this.roll = function(number, sides){
        let dtotal = 0;
        while (number-->= 0) {
            dtotal += this.rnd(sides)+1;
        }
        return dtotal;
    }

    /*
    * detach:
    *	Takes an item out of whatever linked list it might be in
    */
    this.detach = function(list, item)
    //struct linked_list **list, *item;
    {
        if (list == item)
            list = item.l_next;
        if (item.l_prev != null)
            item.l_prev.l_next = item.l_next;
        if (item.l_next != null)
            item.l_next.l_prev = item.l_prev;
        item.l_next = null;
        item.l_prev = null;

        return list;
    }

    /*
    * _attach:	add an item to the head of a list
    */
    this.attach = function(list, item)
    //struct linked_list **list, *item;
    {
        if (list != null) 	{
            item.l_next = list;
            list.l_prev = item;
            item.l_prev = null;
        }
        else 	{
            item.l_next = null;
            item.l_prev = null;
        }
        list = item;

        return list
    }

    /*
    * _free_list:	Throw the whole blamed thing away
    */
    this.free_list = (ptr)=>
    //struct linked_list **ptr;
    {
        const discard = this.discard;
        //register struct linked_list *item;
        while (ptr != null) {
            item = ptr;
            ptr = f.next(item);
            discard(item);
        }
        return null;
    }

    /*
    * discard:  free up an item
    */
    this.discard = function(item)
    //struct linked_list *item;
    {
        for (let i in entities)
            if (entities[i] == item)
                entities[i].l_data = null;
        //total -= 2;
        item.l_data = null;
        //FREE(item.l_data);
        //FREE(item);
    }

    /*
    * new_item:	get a new item with a specified size
    */
    //struct linked_list *
    this.new_item = function(size)
    //int size;
    {
        //register struct linked_list *item;
        for (let i in entities){
            if (entities[i].l_data == null){
                entities[i].l_data = size;
                return entities[i];
            }
        }
        let item = new t.linked_list();
        item.l_data = size;//new t.object(); //new(size);
        item.l_next = item.l_prev = null;
        entities.push(item);

        //r.UI.setDsp(d.DSP_ENTITY);
        //r.UI.printw( `entity: ${entities.length}` );

        return entities[entities.length-1]; //item;
    }

    this.clone_object = function(obj){
        
        let nobj = new t.object();
        for (let key in obj){
            nobj[key] = obj[key];
        }
        return nobj;
    }


    this.entityState = function(){
        const inv_name = r.item.things_f.inv_name;

        let th = 0;
        let ob = 0;
        let c = 0;
        let map = [];
        for (let i in entities){
            if (entities[i].l_data == null){
                c++;
                map[i] = ".";
            } else {
                if (Boolean(entities[i].l_data.o_type)) {
                    ob++; map[i] = "o"; 
                    for (let item = r.player.get_pack(); item != null; item = item.l_next){
                        if (item.l_data == entities[i].l_data){
                            map[i] = "p";
                            break;
                        }
                    }
                    for (let item = r.dungeon.lvl_obj; item != null; item = item.l_next){
                        if (item.l_data == entities[i].l_data){
                            map[i] = "l";
                            break;
                        }
                    }    
                }
                if (Boolean(entities[i].l_data.t_type)) {th++; map[i] = "t"; }
            }
        }
        let el = entities.length;
        let res = [];
        res.push(`ALL:${el} OBJ:${ob} THING:${th} FREE:${c}    `);
        res.push(`----|----1----|----2----|----3`);
        let st = "";
        for (let i in map){
            st += map[i];
            if (st.length > 30){
                res.push(st);
                st = "";
            }
        }
        res.push(st);

        for (let i in map){
            if (map[i]=="o"){
                res.push(`${inv_name(entities[i].l_data,false).slice(0,5)} ${Boolean(map[i].l_prev)} ${Boolean(map[i].l_next)}`)
            }
        }
        return res;;
    }

    this.on_entity = function(item){

        for (let i in entities){
            //if (item.l_data == entities[i].l_data)
            if (item == entities[i])
                return true;
        }
        return false;
    }

    this.get_entity = function(item){

        for (let i in entities){
            //if (item.l_data == entities[i].l_data)
            if (item == entities[i])
                return entities[i];
        }
        return null;
    }

    function reset_all_entitys(){
        entities = [];
    }

    //
    this.main = function()
    //char **argv;
    //char **envp;
    {
        reset_all_entitys();

        const daemon = r.daemon.daemon;
        const fuse = r.daemon.fuse;
        const status = r.UI.io.status;;//r.UI.io.status;
        const doctor = r.daemon.doctor;
        const stomach = r.daemon.stomach;
        const runners = r.monster.chase.runners;
        const swander = r.daemon.swander;
        
        const init_everything = r.item.init_everything;
        const new_level = r.dungeon.new_level.create;

        const initscr = r.UI.initscr;	

        const pick_one = r.item.things_f.pick_one;
        const new_thing = r.item.things_f.new_thing;
        const add_pack = r.item.pack_f.add_pack;

        const OBJPTR = f.OBJPTR;
        const rnd = r.rnd;

        const setoflg = r.setoflg;

        const w_magic = r.globalValiable.w_magic; 
        const a_magic = r.globalValiable.a_magic; 
        const armors = r.globalValiable.armors; 

        r.player.fruit = ms.FRUIT;

        r.dungeon.level = 1;

        r.count = 0;			/* # of times to repeat cmd */
        r.packvol = 0; 
        
        init_everything();
        initscr();			/* Start up cursor package */
        //setup();
        r.UI.setCameraEnable(true);

        let firstinv;
        if (r.qs.check()){
            firstinv = false;
            r.UI.msg(ms.RESTART);

            r.qs.load();
            //load game
        }else{
            firstinv = true;
            r.UI.msg(ms.MAINSTART);

            r.player.purse = 0;
            r.player.food_left = d.HUNGERTIME;
            r.player.hungry_state = d.F_OKAY;
            //newGame;
        }
        //continue;

        new_level(d.NORMLEV);// POSTLEV MAZELEV NORMLEV
        //new_level(d.POSTLEV);

        /* Start up daemons and fuses */

        daemon(status, true, d.BEFORE);
        daemon(doctor, true, d.BEFORE);
        daemon(stomach, true, d.BEFORE);
        daemon(runners, true, d.AFTER);
        fuse(swander, true, d.WANDERTIME);

        if (firstinv) {
            /* Give the rogue his weaponry */
            let alldone;
            let gwsc = 0;
            do {
                wpt = pick_one(w_magic);
                switch (Number(wpt))
                {
                    case d.MACE:	case d.SWORD:	case d.TWOSWORD:
                    case d.SPEAR:	case d.TRIDENT:	case d.SPETUM:
                    case d.BARDICHE:	case d.PIKE:	case d.BASWORD:
                    case d.HALBERD:
                        alldone = true;
                    break;
                    default:
                        alldone = false;
                        //alert(wpt);
                        gwsc++;
                }
            } while(!alldone);
            if (gwsc) r.UI.comment(`first weapon shuffle: ${gwsc}`);

            item = new_thing(false, d.WEAPON, wpt);
            obj = OBJPTR(item);
            obj.o_hplus = rnd(3);
            obj.o_dplus = rnd(3);
            setoflg(obj,d.ISKNOW);
            add_pack(item, true);
            r.player.set_cur_weapon(obj);

            /* Now a bow */

            item = new_thing(false, d.WEAPON, d.BOW);
            obj = OBJPTR(item);
            obj.o_hplus = rnd(3);
            obj.o_dplus = rnd(3);
            setoflg(obj,d.ISKNOW);;
            add_pack(item, true);

            /* Now some arrows */

            item = new_thing(false, d.WEAPON, d.ARROW);
            obj = OBJPTR(item);
            obj.o_count = 25 + rnd(15);
            obj.o_hplus = rnd(2);
            obj.o_dplus = rnd(2);
            setoflg(obj,d.ISKNOW);
            add_pack(item, true);

            /* And his suit of armor */

            wpt = pick_one(a_magic);
            item = new_thing(false, d.ARMOR, wpt);
            obj = OBJPTR(item);
            setoflg(obj,d.ISKNOW);
            obj.o_ac = armors[wpt].a_class - rnd(4);
            r.player.set_cur_armor(obj);
            add_pack(item, true);
            
            /* Give him some food */

            item = new_thing(false, d.FOOD, 0);
            add_pack(item, true);
        }

        r.player.set_select(null);
 
        r.playit();
    }

    /*
    ** playit:	The main loop of the program.  Loop while(! the game is over,
    **		refreshing things and looking at the proper times.
    */

    this.playit = function()
    {
        const roomin = r.monster.chase.roomin;

        const player = r.player.get_player();
        const hero = r.player.get_hero();

        player.t_oldpos = {x:hero.x, y:hero.y};
        r.player.set_player(player);
        r.oldrp = roomin(hero);
        r.nochange = false;

        r.setScene(d.SCE_MAIN);
        SceneFunc();
        r.playing = true;

        r.UI.comment("playit");
    }

    //
    this.scenestep = function(){
        if (r.playing) SceneFunc();
    }



    /*
    * o_on:
    *	Returns true in the objects flag is set
    */
    this.o_on =(what,bit)=>
    //struct object *what;
    //long bit;
    {
        //reg int flag;

        let flag = false;
        if (what != null)
            flag = (what.o_flags & bit);
        return flag;
    }


    /*
    * o_off:
    *	Returns true is the objects flag is reset
    */
    this.o_off =(what,bit)=>
    //struct object *what;
    //long bit;
    {
        //reg int flag;

        let flag = false;
        if (what != null)
            flag = !(what.o_flags & bit);
        return flag;
    }


    /*
    * setoflg:
    *	Set the specified flag for the object
    */
    this.setoflg =(what,bit)=>
    //struct object *what;
    //long bit;
    {
        what.o_flags |= bit;
    }


    /*
    * resoflg:
    *	Reset the specified flag for the object
    */
    this.resoflg =(what,bit)=>
    //struct object *what;
    //long bit;
    {
        what.o_flags &= ~bit;
    }
}