function PlayerCharacter(r){
    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	let oldrp;	//struct room *oldrp;	/* Roomin(&oldpos) */
	let player		= new t.thing();	//struct thing player;	/* The rogue */
	player.t_stats	= new t.stats();	/* Physical description */
	player.t_stats.s_re = new t.real(); /* True ability */
	player.t_stats.s_ef = new t.real();	/* Effective ability */

	let max_stats	= new t.stats();	//struct stats max_stats;	/* The maximum for the player */
	let cur_weapon	= null;	//struct object *cur_weapon = null;	/* Which weapon he is weilding */
	let cur_armor	= null;	//struct object *cur_armor = null;	/* the rogue's armor */
	let cur_ring	= [];	//struct object *cur_ring[2];	/* Which rings are being worn */
	cur_ring[d.LEFT] = null;
	cur_ring[d.RIGHT] = null;
	let him = player.t_stats;	//struct stats *him;	/* pointer to hero stats */

	this.purse		= 0;	/* How much gold the rogue has */
	this.food_left	= d.HUNGERTIME;	/* Amount of food stomach */
	this.hungry_state = d.F_OKAY;	/* How hungry is he */
	this.foodlev	= 1;	/* how fast he eats food */
	this.ringfood	= 0;	/* rings affect on food consumption */	
	this.nofood		= 0;	/* # of levels without food */

	this.fruit;		/* Favorite fruit */

	this.set_oldrp		=(obj)=>{ oldrp = obj; };
	this.set_player		=(obj)=>{ player = obj; };	
	this.set_max_stats	=(obj)=>{ max_stats = obj; };	
	this.set_cur_weapon =(obj)=>{ cur_weapon = obj; };
	this.set_cur_armor	=(obj)=>{ cur_armor = obj; };
	this.set_cur_ring	=(obj)=>{ cur_ring = obj; };	
	this.set_him		=(obj)=>{ player.t_stats = him = obj};
	this.set_hero		=(obj)=>{ player.t_pos = obj;};
	this.set_pstats		=(obj)=>{ player.t_stats = obj;};
	this.set_pack		=(obj)=>{ player.t_pack = obj;};

	this.get_oldrp		=()=>{return oldrp; };	
	this.get_player		=()=>{return player; };	
	this.get_max_stats	=()=>{return max_stats; };	
	this.get_cur_weapon =()=>{return cur_weapon; };	
	this.get_cur_armor	=()=>{return cur_armor;};	
	this.get_cur_ring	=()=>{return cur_ring; };	
	this.get_him		=()=>{return player.t_stats;};	
	this.get_hero		=()=>{return player.t_pos;};
	this.get_pstats		=()=>{return player.t_stats;};
	this.get_pack		=()=>{return player.t_pack;};

	let cur_select = null;
	this.get_select =()=>{
		return pack_check(cur_select)?cur_select: null;
	};
	this.set_select =(obj)=>{cur_select = obj};
	//let cur_dest = null;
	//this.get_dest =()=>{return cur_dest};
	//this.set_dest =(obj)=>{cur_dest = obj};

	/*
    * pl_on: Returns true if the player's flag is set
    */
    this.pl_on =(what)=> { return (player.t_flags & what); }

    /*
    * pl_off: Returns true when player's flag is reset
    */
    this.pl_off =(what)=> { return (!(player.t_flags & what)); }

	this.encumb = new encumb(r);	//重量関係
	this.misc	= new misc(r);	//
	this.move	= new move(r);
	this.pstats = new pstats(r);
	this.rips = new rips(r);

	this.equipcheck = (obj)=>{
		return ((obj == cur_weapon)||
			(obj == cur_armor)||
			(obj == cur_ring[d.LEFT])||
			(obj == cur_ring[d.RIGHT]))?true:false;
	}

	function pack_check(obj){
		const OBJPTR = f.OBJPTR;
		const next = f.next;

		let res = false;
		let op, ip;
		for (ip = r.player.get_pack(); ip != null; ip = next(ip)) {
			op = OBJPTR(ip);
			if (op == obj){
				res = true;
				break;
			}
		}	
		return res;
	}

	r.UI.comment("player");
}