/*
 * routines dealing specifically with rings
 *
 */

function rings(r){
    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const cw = d.DSP_MAIN_FG;
	const mw = d.DSP_MAIN_BG;

	/*
	* ring_on:
	*	Put on a ring
	*/
	this.ring_on = ()=>
	{
		const get_item = r.item.pack_f.get_item;
		const OBJPTR = f.OBJPTR;
		const o_on = r.o_on;
		const player = r.player.get_player();
		const him = r.player.get_him();
		const chg_abil = r.player.pstats.chg_abil;
		const light = r.player.move.light;
		const hero = r.player.get_hero();
		const is_current =r.player.misc.is_current;
		//const gethand = this.gethand;
		const setoflg = r.setoflg;
		const add_haste = r.player.pstats.add_haste;
		const inv_name = r.item.things_f.inv_name;
		const aggravate = r.player.misc.aggravate;
		const updpack = r.player.encumb.updpack;
		const look = r.player.move.look;
		const fuse = r.daemon.fuse;
		const sapem = r.daemon.sapem;

		const cur_ring = r.player.get_cur_ring();

		const r_know = r.item.r_know;
		const r_guess = r.item.r_guess;
		const r_stones = r.item.r_stones;

		let obj; //reg struct object *obj;
		let item; //reg struct linked_list *item;
		let ring, wh;
		let buf;
		let okring;

		if (cur_ring[d.LEFT] != null && cur_ring[d.RIGHT] != null) {
			r.UI.msg(ms.RINGON_1);
			r.after = false;
			return;
		}
		/*
		* Make certain that it is somethings that we want to wear
		*/
		if ((item = get_item("put on", d.RING)) == null)
			return;
		obj = OBJPTR(item);
		if (obj.o_type != d.RING) {
			r.UI.msg(ms.RINGON_2);
			return;
		}
		/*
		* find out which hand to put it on
		*/
		if (is_current(obj))
			return;
		if (cur_ring[d.LEFT] == null && cur_ring[d.RIGHT] == null) {
			ring = d.LEFT;
			//if ((ring = gethand(false)) < 0)
			//	return;
		}
		else if (cur_ring[d.LEFT] == null)
			ring = d.LEFT;
		else
			ring = d.RIGHT;
		cur_ring[ring] = obj;
		wh = obj.o_which;
		/*
		* okring = false break;case:
		* 1) ring is cursed and benefit = plus
		* 2) ring is blessed and benefit = minus
		*/
		okring = !((obj.o_ac > 0 && o_on(obj, d.ISCURSED)) ||
				(obj.o_ac < 0 && o_on(obj, d.ISBLESS)));
		/*
		* Calculate the effect it has on the poor guy (if possible).
		*/
		if (okring) {
			switch (wh) {
				case d.R_SPEED:
					if (--obj.o_ac < 0) {
						obj.o_ac = 0;
						setoflg(obj,d.ISCURSED);
					}
					else {
						add_haste(false);
						r.UI.msg(ms.RINGON_3);
					}
				break;
				case d.R_GIANT:				/* to 24 */
					him.s_ef.a_str = d.MAXSTR;
				break;
				case d.R_ADDSTR:
					chg_abil(d.STR,obj.o_ac,d.FROMRING);
				break;
				case d.R_KNOW:
					chg_abil(d.WIS,obj.o_ac,d.FROMRING);
				break;
				case d.R_DEX:
					chg_abil(d.DEX,obj.o_ac,d.FROMRING);
				break;
				case d.R_CONST:
					chg_abil(d.CON,obj.o_ac,d.FROMRING);
				break;
				case d.R_SEEINVIS:
					player.t_flags |= d.CANSEE;
					light(hero);
					r.UI.mvwaddch(cw, hero.y, hero.x, d.PLAYER);
				break;
				case d.R_AGGR:
					aggravate();
				break;
				case d.R_HEAVY:
					updpack();			/* new pack weight */
				break;
				case d.R_BLIND:
					r_know[d.R_BLIND] = true;
					player.t_flags |= d.ISBLIND;
					look(false);
				break;
				case d.R_SLOW:
					player.t_flags |= d.ISSLOW;
				break;
				case d.R_SAPEM:
					fuse(sapem,true,150);
				break;
				case d.R_LIGHT: {
					let rop; //struct room *rop;

					r_know[d.R_LIGHT] = true;
					if ((rop = player.t_room) != null) {
						rop.r_flags &= ~d.ISDARK;
						light(hero);
						r.UI.mvwaddch(cw, hero.y, hero.x, d.PLAYER);
					}
				}
			}
		}
		if (r_know[wh] && r_guess[wh]) {
			//free(r_guess[wh]);
			r_guess[wh] = null;
		}
		else if(!r_know[wh] && r_guess[wh] == null) {
			//mpos = 0;
			//buf = r_stones[wh];
			//r.UI.msg(callit);
			//if (get_str(buf, cw) == d.NORM) {
			//	r_guess[wh] = buf;
			//}
		}
		//mpos = 0;
		r.UI.msg(ms.RINGON_4(inv_name(obj,true)));
		r.player.ringfood = ring_eat();
		r.nochange = false;

		r.player.set_cur_ring(cur_ring);
	}


	/*
	* ring_off:
	*	Take off some ring
	*/
	this.ring_off = function()
	{
		const msg = r.UI.msg;
		const dropcheck = r.item.things_f.dropcheck;
		const inv_name = r.item.things_f.inv_name;
		const get_item = r.item.pack_f.get_item;

		const cur_ring = r.player.get_cur_ring();

		let ring;
		let obj; //reg struct object *obj;
		
		if (cur_ring[d.LEFT] == null && cur_ring[d.RIGHT] == null) {
			msg(ms.RINGOFF1);
			return;
		}
		else if (cur_ring[d.LEFT] == null)
			ring = d.RIGHT;
		else if (cur_ring[d.RIGHT] == null)
			ring = d.LEFT;
		else{
			let item = r.player.get_select();
			if (item == null) {r.UI.msg("not eq"); return;}
			if (item == cur_ring[d.LEFT])
				ring = d.LEFT;
			else if (item == cur_ring[d.RIGHT])
				ring = d.RIGHT;
			else { 
				r.UI.msg(`not eq?${ring}${inv_name(item, true)}`)
				return;
			}
		}
		//	if ((ring = gethand(true)) < 0)
		//		return;
		//mpos = 0;
		obj = cur_ring[ring];
		if (obj == null) {
			msg(ms.RINGOFF2);
			return;
		}
		if (dropcheck(obj)) {
			msg(ms.RINGOFF3(inv_name(obj, true)));
			r.nochange = false;
			r.player.ringfood = ring_eat();
			cur_ring[ring] = null;		
		}
		r.player.set_cur_ring(cur_ring);
	}


	/*
	* toss_ring:
	*	Remove a ring and stop its effects
	*/
	this.toss_ring = (what)=>
	//struct object *what;
	{
		const o_on = r.o_on;
		const extinguish = r.daemon.extinguish;
		const nohaste = r.daemon.nohaste;
		const sight = r.daemon.sight;
		const player = r.player.get_player();
		const him = r.player.get_him();
		const ringabil = this.ringabil;
		const chg_abil = r.player.pstats.chg_abil;
		const light = r.player.move.light;
		const hero = r.player.get_hero();
		const unsee = r.daemon.unsee;

		const cur_ring = r.player.get_cur_ring();

		let okring;

		/*
		* okring = false break;case:
		* 1) ring is cursed and benefit = plus
		* 2) ring is blessed and benefit = minus
		*/
		okring = !((what.o_ac > 0 && o_on(what, d.ISCURSED)) ||
				(what.o_ac < 0 && o_on(what, d.ISBLESS)));

		cur_ring[what == cur_ring[d.LEFT] ? d.LEFT : d.RIGHT] = null;
		if (okring) {
			switch (what.o_which) {
				case d.R_SPEED:
					extinguish(nohaste);
					nohaste(false);
				break;case d.R_BLIND:
					sight(false);
				break;case d.R_SLOW:
					player.t_flags &= ~d.ISSLOW;
				break;case d.R_SAPEM:
					extinguish(sapem);
				break;case d.R_GIANT:
					him.s_ef = him.s_re;
					ringabil();
				break;case d.R_ADDSTR:
					chg_abil(d.STR,-what.o_ac,false);
				break;case d.R_KNOW:
					chg_abil(d.WIS,-what.o_ac,false);
				break;case d.R_DEX:
					chg_abil(d.DEX,-what.o_ac,false);
				break;case d.R_CONST:
					chg_abil(d.CON,-what.o_ac,false);
				break;case d.R_SEEINVIS:
					player.t_flags &= ~d.CANSEE;
					extinguish(unsee);
					light(hero);
					r.UI.mvwaddch(cw, hero.y, hero.x, d.PLAYER);
			}
			r.player.set_him(him);
			r.player.set_player(player);
		}
	}


	/*
	* gethand:
	*	Get a hand to wear a ring
	*/
	function gethand(isrmv)
	//bool isrmv;
	{
		let c;
		let ptr;
		let obj; //struct object *obj;

		while(1) {
			addmsg("Left or Right ring");
			if (isrmv)
				addmsg(starlist);
			addmsg("? ");
			endmsg();
			c = readchar();
			if (isupper(c))
				c = tolower(c);
			if (c == '*' && isrmv) {
				wclear(hw);
				obj = cur_ring[LEFT];
				if (obj != null)
					ptr = inv_name(obj, true);
				else
					ptr = "none";
				wprintw(hw, "L)  %s\n\r",ptr);
				obj = cur_ring[RIGHT];
				if (obj != null)
					ptr = inv_name(obj, true);
				else
					ptr = "none";
				wprintw(hw, "R)  %s\n\r", ptr);
				wprintw(hw, "\n\r\nWhich hand? ");
				draw(hw);
				c = readchar();
				if (isupper(c))
					c = tolower(c);
				restscr(cw);
			}
			if (c == 'l')
				return LEFT;
			else if (c == 'r')
				return RIGHT;
			else if (c == ESCAPE)
				return -1;
			mpos = 0;
			msg("L or R");
		}
	}

	/*
	* ring_eat:
	*	How much food do the hero's rings use up?
	*/
	function ring_eat()
	{
		const o_on = r.o_on;
		const rnd = r.rnd;
		const cur_ring = r.player.get_cur_ring();

		let lb; //reg struct object *lb;
		let hand, i, howmuch;
		let addit;

		howmuch = 0;
		addit = true;
		for (i = d.LEFT; i <= d.RIGHT ; i += 1) {
			lb = cur_ring[i];
			if (lb != null) {
				switch (lb.o_which) {
					case d.R_REGEN:
					case d.R_GIANT:
						howmuch += 2;
					break;
					case d.R_SPEED:
					case d.R_SUSTSTR:
					case d.R_SUSAB:
						howmuch += 1;
					break;
					case d.R_SEARCH:
						howmuch += (rnd(100) < 33);
					break;
					case d.R_DIGEST:
						switch(lb.o_ac) {
							case -3: if (rnd(100) < 25)
										howmuch += 3;
							break;
							case -2: if (rnd(100) < 50)
										howmuch += 2;
							break;
							case -1: howmuch += 1;
							break;
							case  0: howmuch -= (rnd(100) < 50);
							break;
							case  3: if (rnd(100) < 25)
										howmuch -= 3;
							break;
							case  2: if (rnd(100) < 50)
										howmuch -= 2;
							default: howmuch -= 1;
						}
					break;
					default:
						addit = false;
				}
				if (addit) {
					if (o_on(lb, d.ISBLESS))
						howmuch -= 1;
					else if (o_on(lb, d.ISCURSED))
						howmuch += 1;
				}
			}
		}
		return howmuch;
	}


	/*
	* ring_num:
	*	Print ring bonuses
	*/
	//char *
	this.ring_num = (what)=>
	//struct object *what;
	{
		const o_on = r.o_on;
		const magring = this.magring;
		const num = r.item.weapon_f.num;
		let number;

		number = "";
		if (o_on(what,d.ISKNOW) || o_on(what,d.ISPOST)) {
			if (magring(what)) {	/* only rings with numbers */
				number = ' ';
				number += num(what.o_ac, 0);
			}
		}
		return number;
	}


	/*
	* magring:
	*	Returns true if a ring has a number, i.e. +2
	*/
	this.magring = function(what)
	//struct object *what;
	{
		switch(what.o_which) {
			case d.R_SPEED:
			case d.R_ADDSTR:
			case d.R_PROTECT:
			case d.R_ADDHIT:
			case d.R_ADDDAM:
			case d.R_DIGEST:
			case d.R_CONST:
			case d.R_KNOW:
			case d.R_DEX:
				return true;
			default:
				return false;
		}
	}


	/*
	* ringabil:
	*	Compute effective abilities due to rings
	*/
	this.ringabil = function()
	{
		const chg_abil = r.player.pstats.chg_abil;
		const cur_ring = r.player.get_cur_ring();

		let rptr; //reg struct object *rptr;
		let i;

		for(i = d.LEFT; i <= d.RIGHT; i++) {
			rptr = cur_ring[i];
			if (rptr != null) {
				switch(rptr.o_which) {
					case d.R_ADDSTR:
						chg_abil(d.STR,rptr.o_ac,d.FROMRING);
					break;
					case d.R_DEX: 
						chg_abil(d.DEX,rptr.o_ac,d.FROMRING);
					break;
					case d.R_KNOW:
						chg_abil(d.WIS,rptr.o_ac,d.FROMRING);
					break;
					case d.R_CONST:
						chg_abil(d.CON,rptr.o_ac,d.FROMRING);
				}
			}
		}
	}


	/*
	* init_ring:
	*	Initialize a ring
	*/
	this.init_ring = function(what,fromwiz)
	//struct object *what;
	//bool fromwiz;			/* true when from wizards */
	{
		const getbless = ()=>{return 0;};// UI.wizard
		const rnd = r.rnd;
		const setoflg = r.setoflg;
		const itemvol = r.player.encumb.itemvol;
		const getindex = r.player.misc.getindex;

		const things = v.things;

		let much;

		switch (what.o_which) {
			case d.R_DIGEST:		/* -3 to +3 rings */
			case d.R_ADDSTR:
			case d.R_PROTECT:
			case d.R_ADDHIT:
			case d.R_ADDDAM:
			case d.R_DEX:
			case d.R_KNOW:
			case d.R_CONST:
				if (fromwiz) {
					much = getbless();		/* get wizards response */
				}
				else {						/* normal users */
					if (rnd(100) < 25)
						much = -rnd(3) - 1;
					else
						much = rnd(3) + 1;
				}
				what.o_ac = much;
				if (much < 0)
					setoflg(what,d.ISCURSED);
			break;case d.R_SPEED:
				what.o_ac = rnd(4) + 1;
			break;case d.R_AGGR:
			case d.R_DELUS:
			case d.R_HEAVY:
			case d.R_BLIND:
			case d.R_SLOW:
			case d.R_SAPEM:
			case d.R_TELEPORT:
				what.o_ac = 0;
				setoflg(what,d.ISCURSED);	
			break;
			case d.R_GIANT:
				what.o_ac = 25;		/* lots !! of STR */
			break;
			default:
				what.o_ac = 1;
		}
		what.o_type = d.RING;
		what.o_weight = things[d.TYP_RING].mi_wght;
		what.o_typname = ms.THINGS[d.TYP_RING]; //things[d.TYP_RING].mi_name;
		what.o_vol = itemvol(what);

		return what;
	}

	/*
	* ringex:
	*	Get extra gains from rings
	*/
	this.ringex = (rtype)=>
	//int rtype;
	{
		const isring = this.isring;
		const cur_ring = r.player.get_cur_ring();

		let howmuch = 0;

		if (isring(d.LEFT, rtype))
			howmuch += cur_ring[d.LEFT].o_ac;
		if (isring(d.RIGHT, rtype))
			howmuch += cur_ring[d.RIGHT].o_ac;
		return howmuch;
	}

	/*
	* iswearing:
	*	Returns true when the hero is wearing a certain type of ring
	*/
	this.iswearing = (ring)=>
	//int ring;
	{
		const isring = this.isring;

		return (isring(d.LEFT,ring) || isring(d.RIGHT,ring));
	}

	/*
	* isring:
	*	Returns true if a ring is on a hand
	*/
	this.isring = function(hand,ring)
	//int hand, ring;
	{
		const cur_ring = r.player.get_cur_ring();

		//if (cur_ring[hand] != null && cur_ring[hand].o_which == ring)
		if (cur_ring[hand] != null && cur_ring[hand] == ring)
			return true;
		return false;
	}
}