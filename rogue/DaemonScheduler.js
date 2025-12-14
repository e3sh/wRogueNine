function DaemonScheduler(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const EMPTY	= 0;
	const DAEMON =-1;

	//#define _X_ { 0, 0, 0, 0 }

	const d_list = Array(d.MAXDAEMONS);

	//d_list.forEach((e)=>{e = new t.delayed_action();});
	for (let i=0; i<d.MAXDAEMONS; i++){
		d_list[i] = new t.delayed_action();
	}

	//struct delayed_action d_list[MAXDAEMONS] = {
	//	_X_, _X_, _X_, _X_, _X_, _X_, _X_, _X_, _X_, _X_,
	//	_X_, _X_, _X_, _X_, _X_, _X_, _X_, _X_, _X_, _X_,
	//};

	let demoncnt = 0; 
	
	//public function
	//daemon, do_daemons, fuse, lengthon, extinguish, do_fuses, activity

	//public func
	//doctor, swander, rollwand, unconfuse, unsee, sight, nohaste, stomach, noteth, sapem
	//notslow, notregen, notinvinc 

    let between = 0;

	const rnd = this.rnd;
	//const isring = r.item.ring.isring;
	//const pl_on= r.system.disply.pl_on;
	//const him = r.player.get_him();

	//const daemon = this.daemon;
	//const extinguish = this.extinguish;
	const fuse = this.fuse;

	const msg = r.UI.msg;

	//const roll = r.roll;
	//const wanderer =  r.monster.wanderer;
	//const light = r.player.move.light;
	//const death = r.player.rips.death;
	//const updpack = r.player.encumb.updpack; //inner function
	//const wghtchk = r.player.encumb.wghtchk;

	//const dead_end = r.UI.io.dead_end ;
	//const identify = r.UI.command.identify;
	//const chg_abil = r.player.pstats.chg_Abil;

	//const player = new t.thing();
	//const food_left = 0;
	//const hungry_state = 0;
	//const count = 0;

	r.UI.comment("daemon");

	/*
	* d_insert:
	*	Insert a function in the daemon list.
	*/
	//struct delayed_action *
	function d_insert(func, arg, type, time)
	//int arg, type, time, (*func)();
	{
		//reg struct delayed_action *dev;

		if (demoncnt < d.MAXDAEMONS) {
			d_list[demoncnt].d_type = type;
			d_list[demoncnt].d_time = time;
			d_list[demoncnt].d_func = func;
			d_list[demoncnt].d_arg = arg;
			demoncnt += 1;
			return d_list[demoncnt];
		}
		return null;
	}

	function d_delete(wire)
	//struct delayed_action *wire;
	{
		//reg struct delayed_action *d1, *d2;

		//for (d1 = d_list; d1 < d_list[demoncnt]; d1++) {
		for (let i=0; i<demoncnt; i++){
			if (wire == d_list[i]) {
				//for (d2 = d1 + 1; d2 < d_list[demoncnt]; d2++)
				//	*d1++ = *d2;
				for (let j = i; j<demoncnt-1; j++)
					d_list[j] = d_list[j+1];
				demoncnt -= 1;
				d_list[demoncnt].d_type = EMPTY;
				d_list[demoncnt].d_func = EMPTY;

				return;
			}
		}
	}
	/*
	* find_slot:
	*	Find a particular slot in the table
	*/
	//struct delayed_action *
	function find_slot(func)
	//int (*func)();
	{
		//reg struct delayed_action *dev;
		//for (dev = d_list; dev < &d_list[demoncnt]; dev++)
		for (let i=0; i<demoncnt; i++)
			if (d_list[i].d_type != d.EMPTY && func == d_list[i].d_func)
				return d_list[i];
		return null;
	}

	/*
	* daemon:
	*	Start a daemon, takes a function.
	*/
	this.daemon = function(func, arg, type)
	//int arg, type, (*func)();
	{
		d_insert(func, arg, type, DAEMON);
	}

	/*
	* do_daemons:
	*	Run all the daemons that are active with the current
	*	flag, passing the argument to the function.
	*/
	this.do_daemons = function(flag)
	//int flag;
	{
		//reg struct delayed_action *dev;

		//for (dev = d_list; dev < &d_list[demoncnt]; dev++)
		for (let i=0; i<demoncnt; i++)
			if (d_list[i].d_type == flag && d_list[i].d_time == DAEMON){
				//console.log(d_list[i].d_func);
				d_list[i].d_func(d_list[i].d_arg);
			}
	}

	/*
	* fuse:
	*	Start a fuse to go off in a certain number of turns
	*/
	this.fuse = function(func, arg, time)
	//int (*func)(), arg, time;
	{
		d_insert(func, arg, d.AFTER, time);
	}

	/*
	* lengthen:
	*	Increase the time until a fuse goes off
	*/
	this.lengthen = function(func, xtime)
	//int (*func)(), xtime;
	{
		//reg struct delayed_action *wire;
		//for (wire = d_list; wire < &d_list[demoncnt]; wire++)
		for (let i=0; i<demoncnt; i++)
			if (d_list[i].d_type != EMPTY && func == d_list[i].d_func)
				d_list[i].d_time += xtime;
	}

	/*
	* extinguish:
	*	Put out a fuse. Find all such fuses and kill them.
	*/
	this.extinguish = function(func)
	//int (*func)();
	{
		//reg struct delayed_action *dev;

		//for (dev = d_list; dev < &d_list[demoncnt]; dev++)
		//	if (dev.d_type != EMPTY && func == dev.d_func)
		for (let i=0; i<demoncnt; i++)
			if (d_list[i].d_type != EMPTY && func == d_list[i].d_func)
				d_delete(d_list[i]);
	}

	/*
	* do_fuses:
	*	Decrement counters and start needed fuses
	*/
	this.do_fuses = function()
	{
		//reg struct delayed_action *dev;

		//for (dev = d_list; dev < &d_list[demoncnt]; dev++) {
		for (let i=0; i<demoncnt; i++){
			if (d_list[i].d_type == d.AFTER && d_list[i].d_time > DAEMON) {
				if (--d_list[i].d_time == 0) {
					d_list[i].d_func(d_list[i].d_arg);
					d_delete(d_list[i]);
				}
			}
		}
	}

	/*
	* activity:
	*	Show wizard number of demaons and memory blocks used
	*/
	this.activity = function()
	{
		msg(`Daemons = ${demoncnt}`);//: Memory Items = %d : Memory Used = %d",
		//	demoncnt,total,sbrk(0));
	}

	/*
	* doctor:
	*	A healing daemon that restores hit points after rest
	*/
	this.doctor =(fromfuse)=>
	//	int fromfuse;
	{
		//doctor
		const him = r.player.get_him();
		const isring = (a,b)=>{return false};
		const pl_on = r.player.pl_on;

		let thp, lv, ohp, ccon;

		lv = him.s_lvl;
		thp = him.s_hpt;
		ohp = thp;
		r.quiet += 1;

		ccon = him.s_ef.a_con; 
		if (ccon > 16 && !r.isfight)
			thp += r.rnd(ccon - 15);
		if (lv < 8) {
			if (r.quiet > 20 - lv * 2)
				thp += 1;
		}
		else {
			if (r.quiet >= 3)
				thp += r.rnd(lv - 7) + 1;
		}
		if (isring(d.LEFT, d.R_REGEN))
			thp += 1;
		if (isring(d.RIGHT, d.R_REGEN))
			thp += 1;
		if (pl_on(d.ISREGEN))
			thp += 1;
		if (ohp != thp) {
			r.nochange = false;
			if (thp > him.s_maxhp)
				thp = him.s_maxhp;
			r.quiet = 0;
		}
		him.s_hpt = thp;
		r.player.set_him(him);
		//console.log("doctor");
	}

	/*
	* Swander:
	*	Called when it is time to start rolling for wandering monsters
	*/
	this.swander =(fromfuse)=>
	//int fromfuse;
	{
		//swander
		const daemon = r.daemon.daemon;
		const rollwand = r.daemon.rollwand;

		daemon(rollwand, true, d.BEFORE);
		r.UI.comment("swander");
	}


	/*
	* rollwand:
	*	Called to roll to see if a wandering monster starts up
	*/
	this.rollwand =(fromfuse)=>
	//int fromfuse;
	{
		//rollwand
		const wanderer = r.monster.wanderer;
		const swander = r.daemon.swander;
		const rollwand = r.daemon.rollwand;
		const extinguish = r.daemon.extinguish;
		const fuse = r.daemon.fuse;

		if (++between >= 4) {
			if (r.roll(1, 6) == 4) {
				if (r.levtype != d.POSTLEV)		/* no monsters for posts */
					wanderer();
				extinguish(rollwand);
				fuse(swander, true, d.WANDERTIME);
			}
			between = 0;
		}
		r.UI.comment("rollwand");
	}


	/*
	* unconfuse:
	*	Release the poor player from his confusion
	*/
	this.unconfuse =(fromfuse)=>
	//int fromfuse;
	{
		//unconfuse
		const player = r.player.get_player();

		if (r.player.pl_on(d.ISHUH))
			r.UI.msg(ms.UNCONFUSE);
		player.t_flags &= ~d.ISHUH;

		r.player.set_player(player);
	}

	/*
	* unsee:
	*	He lost his see invisible power
	*/
	this.unsee =(fromfuse)=>
	//int fromfuse;
	{
		//unsee
		const player = r.player.get_player();

		player.t_flags &= ~d.CANSEE;
		r.player.set_player(player);
	}

	/*
	* sight:
	*	He gets his sight back
	*/
	this.sight =(fromfuse)=>
	//int fromfuse;
	{
		//sight
		const pl_on = r.player.pl_on;
		const light = r.player.move.light;

		const player = r.player.get_player();
		const hero = r.player.get_hero();

		if (pl_on(d.ISBLIND))
			msg(ms.SIGHT);
		player.t_flags &= ~d.ISBLIND;
		r.player.set_player(player);

		light(hero);
	}

	/*
	* nohaste:
	*	End the hasting
	*/
	this.nohaste =(fromfuse)=>
	//int fromfuse;
	{
		//nohaste
		const pl_on = r.player.pl_on;
		const player = r.player.get_player();

		if (pl_on(d.ISHASTE))
			msg(ms.NOHASTE);
		player.t_flags &= ~d.ISHASTE;
		r.player.set_player(player);
	}


	/*
	* stomach:
	*	Digest the hero's food
	*/
	this.stomach =(fromfuse)=>
	//int fromfuse;
	{
		//stomach
		//const updpack = r.player.encumb.updpack;
		//const msg = r.UI.msg;
		//const death = ()=>{};
		const updpack = r.player.encumb.updpack;
		const wghtchk = r.player.encumb.wghtchk;
		const death = r.player.rips.death;

		const player = r.player.get_player();

		let oldfood, old_hunger;

		old_hunger = r.player.hungry_state;
		if (r.player.food_left <= 0) {		 /* the hero is fainting */
			if (--r.player.food_left == -150) {
				msg(ms.STOMACH_1);
			}
			else if (r.player.food_left < -350) {
				msg(ms.STOMACH_2);
				msg(" ");
				death(d.K_STARVE);
			}
			if (player.t_nocmd > 0 || r.rnd(100) > 20)
				return;
			player.t_nocmd = r.rnd(8)+4;
			msg(ms.STOMACH_3);
			r.running = false;
			r.count = 0;
			r.player.hungry_state = d.F_FAINT;
		}
		else {
			oldfood = r.player.food_left;
			r.player.food_left -= r.player.ringfood + r.player.foodlev - r.amulet;
			if (player.t_nocmd > 0)		/* wait till he can move */
				return;
			if (r.player.food_left < d.WEAKTIME && oldfood >= d.WEAKTIME) {
				msg(ms.STOMACH_4);
				r.player.hungry_state = d.F_WEAK;
			}
			else if(r.player.food_left < d.HUNGTIME && oldfood >= d.HUNGTIME) {
				msg(ms.STOMACH_5);
				r.player.hungry_state = d.F_HUNGRY;
			}
		}
		if (old_hunger != r.player.hungry_state)
			updpack();				/* new pack weight */
		wghtchk(false);

		r.player.set_player(player);

		//console.log("stomach");
	}

	/*
	* noteth:
	*	Hero is no longer etherereal
	*/
	this.noteth =(fromfuse)=>
	//int fromfuse;
	{
		//noteth
		const pl_on = r.player.pl_on;
		const player = r.player.get_player();
		const dead_end = r.UI.io.dead_end;
		const death = r.player.rips.death;

		let ch;

		if (pl_on(d.ISETHER)) {
			msg(ms.NOTETH_1);
			ch = player.t_oldch;
			if (dead_end(ch)) {
				msg(ms.NOTETH_2(identify(ch)));
				msg(" ");
				death(K_STONE);	/* can't materialize in walls */
			}
		}
		player.t_flags &= ~ISETHER;
		r.player.set_player(player);
	}

	/*
	* sapem:
	*	Sap the hero's life away
	*/
	this.sapem =(fromfuse)=>
	//int fromfuse;
	{
		//sapem
		const chh_abil = r.player.pstat.chg_abil;

		chg_abil(rnd(4) + 1, -1, true);
		fuse(this.sapem, true, 150);
		r.nochange = false;
	}

	/*
	* notslow:
	*	Restore the hero's normal speed
	*/
	this.notslow =(fromfuse)=>
	//int fromfuse;
	{
		//noslow
		const pl_on = r.player.pl_on;
		const player = r.player.get_player();

		if (pl_on(d.ISSLOW))
			msg(ms.NOTSLOW);
		player.t_flags &= ~d.ISSLOW;
		r.player.set_player(player);
	}

	/*
	* notregen:
	*	Hero is no longer regenerative
	*/
	this.notregen =(fromfuse)=>
	//int fromfuse;
	{
		//notregen
		const pl_on = r.player.pl_on;
		const player = r.player.get_player();

		if (pl_on(d.ISREGEN))
			msg(ms.NOTREGEN);
		player.t_flags &= ~d.ISREGEN;
		r.player.set_player(player);
	}

	/*
	* notinvinc:
	*	Hero not invincible any more
	*/
	this.notinvinc =(fromfuse)=>
	//int fromfuse;
	{
		//notinvinc
		const pl_on = r.player.pl_on;
		const player = r.player.get_player();

		if (pl_on(d.ISINVINC))
			msg(ms.NOTINVINC);
		player.t_flags &= ~d.ISINVINC;
		r.player.set_player(player);
	}


}
