function DungeonMap(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;
 
	this.rooms = [];//struct room rooms[MAXROOMS];		/* One for each room -- A level */
	this.mlist = null;//struct linked_list *mlist = null;	/* monsters on this level */
	this.lvl_obj = null;//struct linked_list *lvl_obj = null;	/* objects on this level */
	this.traps = [];//struct trap traps[MAXTRAPS];		/* traps on this level */

	this.level = 1;
	this.max_level = 1;

	this.stairs ={x:0 , y:0}; /* where the stairs are put */
	this.ntraps = 0;
	
	for (let i=0; i<d.MAXROOMS; i++){
		this.rooms[i] = new t.room();
		this.rooms[i].r_pos	= new t.coord();
		this.rooms[i].r_max	= new t.coord();
		this.rooms[i].r_gold =new t.coord();	
		this.rooms[i].r_exit = [];
		this.rooms[i].r_ptr	=  [];
		this.rooms[i].r_goldval = 0;
		this.rooms[i].r_flag = 0;
		this.rooms[i].r_nexits = 0;
	}

	this.new_level = new new_level(r);
	this.passage = new passage(r);
	this.rooms_f = new room(r)
	this.trader = new trader(r);

	r.UI.comment("dungeon");

}