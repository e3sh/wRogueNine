/*
 * Hero movement commands
 */

function move(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;
	
    const cw = d.DSP_MAIN_FG;
    const mw = d.DSP_MAIN_BG;

	/*
	* Used to hold the new hero position
	*/
	let nh = {x: 0, y: 0};//struct coord nh;

	/*
	* do_run:
	*	Start the hero running
	*/

	this.do_run = function(ch)
	//char ch;
	{
		r.running = true;
		r.after = false;
		r.runch = ch;
	}

	/*
	* do_move:
	*	Check to see that a move is legal.  If it is handle the
	*	consequences (fighting, picking up, etc.)
	*/

	this.do_move = (dy, dx)=>
	//int dy, dx;
	{
		const msg = r.UI.msg;
		const pl_on = r.player.pl_on;
		const pl_off = r.player.pl_off;
		const iswearing = ()=>{return false}; //r.item.ring.iswearing;
		const rndmove = this.rndmove;
		const cordok = r.UI.cordok;
		const diag_ok = r.monster.chase.diag_ok;
		const winat = r.UI.winat;
		const dead_end = r.UI.io.dead_end;
		const show = this.show;
		const ce = f.ce;
		const isatrap = this.isatrap;
		const be_trapped = this.be_trapped;
		const illeg_ch = r.UI.io.illeg_ch;
		const roomin = r.monster.chase.roomin;
		const isalpha =(ch)=>{ return /^[a-zA-Z]+$/.test(ch); };
		const fight = ()=>{r.UI.msg("fight")};//r.monster.fight.fight
		const mvwaddch = r.UI.mvwaddch;
		const mvinch = r.UI.mvinch;
		const rf_on = r.dungeon.rooms_f.rf_on;
		const light = this.light;
		const teleport = ()=>{};
		const THINGPTR = f.THINGPTR;
		const next = f.next;

		const player = r.player.get_player();
		const hero = r.player.get_hero();

		let ch;
		let rp; //reg struct room *rp;

		r.firstmove = false;
		r.curprice = -1;
		r.inpool = false;

		if (player.t_nomove > 0) {
			player.t_nomove -= 1;
			msg("You are still stuck in the bear trap.");
			return;
		}
		/*
		* Do a confused move (maybe)
		*/
		if ((r.rnd(100) < 80 && pl_on(d.ISHUH)) ||
		(iswearing(d.R_DELUS) && r.rnd(100) < 25))
			nh = rndmove(player);
		else {
			nh.y = hero.y + dy;
			nh.x = hero.x + dx;
		}
		/*
		* Check if he tried to move off the screen or make
		*  an illegal diagonal move, and stop him if he did.
		*/
		if (!cordok(nh.y, nh.x) ||
		(pl_off(d.ISETHER) && !diag_ok(hero, nh))) {
			r.after = r.running = false;
			return;
		}
		if (r.running) {
			ch = winat(nh.y, nh.x); 
			if (dead_end(ch)) {
				let gox, goy, apsg, whichway;

				gox = goy = apsg = 0;
				if (dy == 0) {
					ch = show(hero.y+1,hero.x);
					if (ch == d.PASSAGE) {
						apsg += 1;
						goy = 1;
					}
					ch = show(hero.y-1,hero.x);
					if (ch == d.PASSAGE) {
						apsg += 1;
						goy = -1;
					}
				}
				else if (dx == 0) {
					ch = show(hero.y,hero.x+1);
					if (ch == d.PASSAGE) {
						gox = 1;
						apsg += 1;
					}
					ch = show(hero.y,hero.x-1);
					if (ch == d.PASSAGE) {
						gox = -1;
						apsg += 1;
					}
				}
				if (apsg != 1) {
					r.running = r.after = false;
					return;
				}
				else {			/* can still run here */
					nh.y = hero.y + goy;
					nh.x = hero.x + gox;
					whichway = (goy + 1) * 3 + gox + 1;
					switch(whichway) {
						case 0: r.runch = 'y';
						break;
						case 1: r.runch = 'k';
						break;
						case 2: r.runch = 'u';
						break;
						case 3: r.runch = 'h';
						break;
						case 4: r.runch = '.';	/* shouldn't do */
						break;
						case 5: r.runch = 'l';
						break;
						case 6: r.runch = 'b';
						break;
						case 7: r.runch = 'j';
						break;
						case 8: r.runch = 'n';
					}
				}
			}
		}
		if (r.running && ce(hero, nh))
			r.after = r.running = false;
		ch = winat(nh.y, nh.x); 
		if (pl_on(d.ISHELD) && ch != 'F' && ch != 'd') {
			msg("You are being held.");
			return;
		}
		if (pl_off(d.ISETHER)) {
			if (isatrap(ch)) {
				ch = be_trapped(nh, player);
				if (nlmove) {
					r.nlmove = false;
					return;
				}
				else if (ch == d.POOL)
					r.inpool = true;
			}
			else if (dead_end(ch)) {
				r.after = r.running = false;
				return;
			}
			else {
				switch(ch) {
					case d.GOLD:	case d.POTION:	case d.SCROLL:
					case d.FOOD:	case d.WEAPON:	case d.ARMOR:
					case d.RING:	case d.AMULET:	case d.STICK:
						r.running = false;
						r.take = ch;
					default:
						if (illeg_ch(ch)) {
							r.running = false;
							r.UI.setDsp(d.DSP_MAIN);
							r.UI.mvaddch(nh.y, nh.x, d.FLOOR);
							//teleport(rndspot, player);
							light(nh);
							msg("The spatial warp disappears !");
							return;
						}
				}
			}
		}
		rp = roomin(nh);
		if (ch == d.DOOR) {		/* just stepped on a door */
			r.running = false;
			if (rp != null && rf_on(rp, d.ISTREAS)) {
				let item;//struct linked_list *item;
				let tp;//struct thing *tp;

				for (item = r.dungeon.mlist; item != null; item = next(item)) {
					tp = THINGPTR(item);
					if (tp.t_room == rp)
						runto(tp.t_pos, hero);
				}
			}
		}
		else if (ch == d.STAIRS && pl_off(d.ISETHER))
			r.running = false;
		else if (isalpha(ch) && pl_off(d.ISETHER)) {
			r.running = false;
			fight(nh, r.player.get_cur_weapon(), false);
			return;
		}
		if (rp == null && player.t_room != null)
			light(hero);		/* exiting a room */
		else if (rp != null && player.t_room == null)
			light(nh);			/* just entering a room */
		if (pl_on(d.ISBLIND))
			ch = ' ';
		else
			ch = player.t_oldch;

		mvwaddch(cw, hero.y, hero.x, ch);
		player.t_oldch = mvinch(nh.y, nh.x);
		mvwaddch(cw, nh.y, nh.x, d.PLAYER);
		//hero = nh;
		hero.x = nh.x ; hero.y = nh.y;
		r.player.set_hero(hero);
		player.t_room = rp;
		//player.t_oldch = mvinch(hero.y, hero.x);
		//console.log(`${player.t_oldch}`);
		r.player.set_player(player);
	}

	/*
	* Called to illuminate a room.
	* If it is dark, remove anything that might move.
	*/
	this.light = (cp)=>
	//struct coord *cp;
	{
		const roomin = r.monster.chase.roomin;
		const pl_on = r.player.pl_on;
		const mvaddch = r.UI.mvaddch;
		const mvwaddch = r.UI.mvwaddch;
		const iswearing = ()=>{}; //r.item.ring.iswearing;
		const cansee = r.monster.chase.cansee;
		const look = r.player.misc.look;
		const isalpha =(ch)=>{ return /^[a-zA-Z]+$/.test(ch); };
		const show = this.show;
		const rf_on = r.dungeon.rooms_f.rf_on;
		const mvinch = r.UI.mvinch;
		const wmove = r.UI.wmove;
		const mvwinch = r.UI.mvwinch;
		const THINGPTR = f.THINGPTR;
		const wake_monster = r.monster.wake_monster;
		const isatrap = this.isatrap;

		let rp; //reg struct room *rp;
		let j, k, x, y;
		let ch, rch;
		let item; //reg struct linked_list *item;

		rp = roomin(cp);
		if (rp == null)
			return;
		if (pl_on(d.ISBLIND)) {
			for (j = 0; j < rp.r_max.y; j += 1) {
				for (k = 0; k < rp.r_max.x; k += 1) {
					y = rp.r_pos.y + j;
					x = rp.r_pos.x + k;
					mvwaddch(cw, y, x, ' ');
				}
			}
			look(false);
			return;
		}
		if (iswearing(d.R_LIGHT))
			rp.r_flags &= ~d.ISDARK;
		for (j = 0; j < rp.r_max.y; j += 1) {
			for (k = 0; k < rp.r_max.x; k += 1) {
				y = rp.r_pos.y + j;
				x = rp.r_pos.x + k;
				if (r.levtype == d.MAZELEV && !cansee(y, x))
					continue;
				ch = show(y, x);
				wmove(cw, y, x);
				/*
				* Figure out how to display a secret door
				*/
				if (ch == d.SECRETDOOR) {
					if (j == 0 || j == rp.r_max.y - 1)
						ch = '-';
					else
						ch = '|';
				}
				if (isalpha(ch)) {
					let mit; //struct thing *mit;

					item = wake_monster(y, x);
					if (item == null) {
						ch = d.FLOOR;
						mvaddch(y, x, ch);
					}
					else {
						mit = THINGPTR(item);
						if (mit.t_oldch == ' ')
							if (!rf_on(rp,d.ISDARK))
								mit.t_oldch = mvinch(y, x);
						if (r.levtype == d.MAZELEV)
							ch = mvinch(y, x);
					}
				}
				if (rf_on(rp,d.ISDARK)) {
					rch = mvwinch(cw, y, x);
					if (isatrap(rch)) {
						ch = rch;			/* if its a trap */
					}
					else {					/* try other things */
						switch (rch) {
							case d.DOOR:	case d.STAIRS:	case '|':
							case '-':
								ch = rch;
							break;
							default:
								ch = ' ';
						}
					}
				}
				mvwaddch(cw, y, x, ch);
			}
		}
		//r.UI.comment("light");
	}

	/*
	* show:
	*	returns what a certain thing will display as to the un-initiated
	*/
	this.show = (y, x)=>
	//int y, x;
	{
		const winat = r.UI.winat;	
		const isatrap = this.isatrap;
		const iswearing = ()=>{}; //r.item.ring.iswearing;
		const trap_at = this.trap_at;
		const mvaddch = r.UI.mvaddch;
		const mvinch = r.UI.mvinch;
		const pl_off = r.player.pl_off;
		const THINGPTR = f.THINGPTR;
		const find_mons = r.monster.chase.find_mons;

		let ch = winat(y, x);
		let it; //reg struct linked_list *it;
		let tp; //reg struct thing *tp;
		let ta; //reg struct trap *ta;

		if (isatrap(ch)) {
			if ((ta = trap_at(y, x)) == null)
				return d.FLOOR;
			if (iswearing(d.R_FTRAPS))
				ta.tr_flags |= d.ISFOUND;
			return ((ta.tr_flags & d.ISFOUND) ? ta.tr_type : d.FLOOR);
		}
		if (ch == d.SECRETDOOR && iswearing(d.R_FTRAPS)) {
			mvaddch(y,x,d.DOOR);
			return d.DOOR;
		}
		if ((it = find_mons(y, x)) != null) {	/* maybe a monster */
			tp = THINGPTR(it);
			if (ch == 'M' || (tp.t_flags & d.ISINVIS)) {
				if (ch == 'M')
					ch = tp.t_disguise;
				else if (pl_off(d.CANSEE)) {
					if (ch == 's')
						ch = ' ';		/* shadows show as a blank */
					else
						ch = mvinch(y, x);	/* hide invisibles */
				}
			}
		}
		//r.UI.comment("show");
		return ch;
	}

	/*
	* be_trapped:
	*	Hero or monster stepped on a trap.
	*/
	this.be_trapped = function(tc, th)
	//struct thing *th;
	//struct coord *tc;
	{
		const player = r.player.get_player();

		let trp; //reg struct trap *trp;
		let ch, ishero;
		let mon; //struct linked_list *mon;
		let stuckee, seeit, sayso;

		if ((trp = trap_at(tc.y, tc.x)) == null)
			return;
		ishero = (th == player);
		if (ishero) {
			stuckee = "You";
			count = running = false;
		}
		else {
			stuckee = `The ${monsters[th.t_indx].m_name}`;
		}
		seeit = cansee(tc.y, tc.x);
		if (seeit)
			mvwaddch(cw, tc.y, tc.x, trp.tr_type);
		trp.tr_flags |= d.ISFOUND;
		sayso = true;

		const goner =()=>{

			nlmove = true;
			if (seeit && sayso)
				msg("%s fell into a trap!", stuckee);
			return d.GONER;
		}

		switch (ch = trp.tr_type) {
			case d.POST:
				if (ishero) {
					nlmove = true;
					new_level(d.POSTLEV);
				}
				else
					ch = goner();
			break;
			case d.MAZETRAP:
				if (ishero) {
					nlmove = true;
					level += 1;
					new_level(d.MAZELEV);
					msg("You are surrounded by twisty passages!");
				}
				else
					ch = goner();
			break;
			case d.TELTRAP:
				nlmove = true;
				teleport(trp.tr_goto, th);
			break;
			case d.TRAPDOOR:
				if (ishero) {
					level += 1;
					new_level(d.NORMLEV);
				}
				else {		/* monsters get lost */
	goner:
					ch = d.GONER;
				}
				nlmove = true;
				if (seeit && sayso)
					msg("%s fell into a trap!", stuckee);
			break;
			case d.BEARTRAP:
				th.t_nomove += d.BEARTIME;
				if (seeit) {
					strcat(stuckee, (ishero ? " are" : " is"));
					msg("%s caught in a bear trap.", stuckee);
				}
			break;
			case d.SLEEPTRAP:
				if (ishero && pl_on(d.ISINVINC))
					msg("You feel momentarily dizzy.");
				else {
					if (ishero)
						th.t_nocmd += d.SLEEPTIME;
					else
						th.t_nomove += d.SLEEPTIME;
					if (seeit)
						msg("%s fall%s asleep in a strange white mist.",
						stuckee, (ishero ? "":"s"));
				}
			break;
			case d.ARROWTRAP: {
				let resist, ac;
				let it;//struct stats *it;

				stuckee[0] = tolower(stuckee[0]);
				it = th.t_stats;
				if (ishero && cur_armor != null)
					ac = cur_armor.o_ac;
				else
					ac = it.s_arm;
				resist = ac + getpdex(it, false);
				if (ishero && pl_on(d.ISINVINC))
					resist = -100;		/* invincible is impossible to hit */
				if (swing(3 + (level / 4), resist, 1)) {
					if (seeit)
						msg("%sAn arrow shot %s.", (ishero ? "Oh no! " : ""),
						stuckee);
					if (ishero)
						chg_hpt(-roll(1,6),false,d.K_ARROW);
					else {
						it.s_hpt -= roll(1,6);
						if (it.s_hpt < 1) {
							sayso = false;
							ch = goner();
						}
					}
				}
				else {
					let item; //struct linked_list *item;
					let arrow; //struct object *arrow;

					if (seeit)
						msg("An arrow shoots past %s.", stuckee);
					item = new_thing(false, d.WEAPON, d.ARROW);
					arrow = OBJPTR(item);
					arrow.o_hplus = 3;
					arrow.o_dplus = rnd(2);
					arrow.o_count = 1;
					arrow.o_pos = th.t_pos;
					fall(item, false);
				}
			}
			break;
			case d.DARTTRAP: {
				let resist, ac;
				let it;//struct stats *it;

				stuckee[0] = tolower(stuckee[0]);
				it = th.t_stats;
				if (ishero && cur_armor != null)
					ac = cur_armor.o_ac;
				else
					ac = it.s_arm;
				resist = ac + getpdex(it, false);
				if (ishero && pl_on(d.ISINVINC))
					resist = -100;		/* invincible is impossible to hit */
				if (swing(3 + (level / 4), resist, 0)) {
					if (seeit)
						msg("A small dart just hit %s.", stuckee);
					if (ishero) {
						if (!save(d.VS_POISON))
							chg_abil(d.CON,-1,true);
						if (!iswearing(d.R_SUSTSTR))
							chg_abil(d.STR,-1,true);
						chg_hpt(-roll(1, 4),false,d.K_DART);
					}
					else {
						if (!save_throw(d.VS_POISON, th))
							it.s_ef.a_str -= 1;
						it.s_hpt -= roll(1, 4);
						if (it.s_hpt < 1) {
							sayso = false;
							ch = goner();
						}
					}
				}
				else if (seeit)
					msg("A small dart whizzes by %s.", stuckee);
			}
			break;
			case d.POOL:
				if (!ishero && rnd(100) < 10) {
					if (seeit)
						msg("The %s drowns !!", stuckee);
					ch = goner();
				}
				if ((trp.tr_flags & d.ISGONE) && rnd(100) < 10) {
					nlmove = true;
					if (rnd(100) < 15)
						teleport(rndspot);	   /* teleport away */
					else if(rnd(100) < 15 && level > 2) {
						level -= rnd(2) + 1;
						new_level(d.NORMLEV);
						msg("You here a faint groan from below.");
					}
					else if(rnd(100) < 40) {
						level += rnd(4);
						new_level(d.NORMLEV);
						msg("You find yourself in strange surroundings.");
					}
					else if(rnd(100) < 6 && pl_off(d.ISINVINC)) {
						msg("Oh no!!! You drown in the pool!!! --More--");
						wait_for(cw, ' ');
						death(d.K_POOL);
					}
					else
						nlmove = false;
			}
		}
		flushinp();		/* flush typeahead */
		return ch;
	}

	/*
	* dip_it:
	*	Dip an object into a magic pool
	*/
	this.dip_it = function()
	{
		let what; //reg struct linked_list *what;
		let ob; //reg struct object *ob;
		let tp; //reg struct trap *tp;
		let wh;

		tp = trap_at(hero.y,hero.x);
		if (tp == null || inpool == false || (tp.tr_flags & d.ISGONE))
			return;

		if ((what = get_item("dip",0)) == null)
			return;
		ob = OBJPTR(what);
		mpos = 0;
		/*
		* If hero is trying to dip an object OTHER than his
		* current weapon, make sure that he could drop his
		* current weapon
		*/
		if (ob != cur_weapon) {
			if (cur_weapon != null && o_on(cur_weapon, d.ISCURSED)) {
				msg("You are unable to release your weapon.");
				after = false;
				return;
			}
		}
		if (ob == cur_armor) {
			msg("You have to take off your armor before you can dip it.");
			after = false;
			return;
		}
		else if (ob == cur_ring[d.LEFT] || ob == cur_ring[d.RIGHT]) {
			msg("You have to take that ring off before you can dip it.");
			after = false;
			return;
		}
		wh = ob.o_which;
		tp.tr_flags |= d.ISGONE;
		if (ob != null && o_off(ob,d.ISPROT)) {
			setoflg(ob,d.ISKNOW);
			switch(ob.o_type) {
			case d.WEAPON:
				if(rnd(100) < 20) {		/* enchant weapon here */
					if (o_off(ob,d.ISCURSED)) {
						ob.o_hplus += 1;
						ob.o_dplus += 1;
					}
					else {		/* weapon was prev cursed here */
						ob.o_hplus = rnd(2);
						ob.o_dplus = rnd(2);
					}
					resoflg(ob,d.ISCURSED);
				}
				else if(rnd(100) < 10) {	/* curse weapon here */
					if (o_off(ob,d.ISCURSED)) {
						ob.o_hplus = -(rnd(2)+1);
						ob.o_dplus = -(rnd(2)+1);
					}
					else {			/* if already cursed */
						ob.o_hplus--;
						ob.o_dplus--;
					}
					setoflg(ob,d.ISCURSED);
				}			
				msg("The %s glows for a moment.",w_magic[wh].mi_name);
			break;
			case d.ARMOR:
				if (rnd(100) < 30) {			/* enchant armor */
					if(o_off(ob,d.ISCURSED))
						ob.o_ac -= rnd(2) + 1;
					else
						ob.o_ac = -rnd(3)+ armors[wh].a_class;
					resoflg(ob,d.ISCURSED);
				}
				else if(rnd(100) < 15){			/* curse armor */
					if (o_off(ob,d.ISCURSED))
						ob.o_ac = rnd(3)+ armors[wh].a_class;
					else
						ob.o_ac += rnd(2) + 1;
					setoflg(ob,d.ISCURSED);
				}
				msg("The %s glows for a moment.",a_magic[wh].mi_name);
			break;
			case d.STICK: {
				let i;
				let rd;//struct rod *rd;

				i = rnd(8) + 1;
				if(rnd(100) < 25)		/* add charges */
					ob.o_charges += i;
				else if(rnd(100) < 10) {	/* remove charges */
					if ((ob.o_charges -= i) < 0)
						ob.o_charges = 0;
				}
				ws_know[wh] = true;
				rd = ws_stuff[wh];
				msg("The %s %s glows for a moment.",rd.ws_made,rd.ws_type);
			}
			break;
			case d.SCROLL:
				s_know[wh] = true;
				msg("The '%s' scroll unfurls.",s_names[wh]);
			break;
			case d.POTION:
				p_know[wh] = true;
				msg("The %s potion bubbles for a moment.",p_colors[wh]);
			break;
			case d.RING:
				r_know[wh] = true;
				if (magring(ob)) {
					if(rnd(100) < 25) {	 		/* enchant ring */
						if (o_off(ob,d.ISCURSED))
							ob.o_ac += rnd(2) + 1;
						else
							ob.o_ac = rnd(2) + 1;
						resoflg(ob,d.ISCURSED);
					}
					else if(rnd(100) < 10) {	 /* curse ring */
						if (o_off(ob,d.ISCURSED))
							ob.o_ac = -(rnd(2) + 1);
						else
							ob.o_ac -= (rnd(2) + 1);
						setoflg(ob,d.ISCURSED);
					}
				}
				msg("The %s ring vibrates for a moment.",r_stones[wh]);
			break;
			default:
				msg("The pool bubbles for a moment.");
			}
		}
		cur_weapon = ob;	/* hero has to weild item to dip it */
	}


	/*
	* trap_at:
	*	Find the trap at (y,x) on screen.
	*/
	//struct trap *
	this.trap_at = function(y, x)
	//int y, x;
	{
		let tp, ep;//reg struct trap *tp, *ep;

		ep = traps[ntraps];
		for (tp = traps; tp < ep; tp += 1)
			if (tp.tr_pos.y == y && tp.tr_pos.x == x)
				break;
		if (tp >= ep)
			tp = null;
		return tp;
	}

	/*
	* rndmove:
	*	move in a random direction if the monster/person is confused
	*/
	//struct coord *
	this.rndmove = function(who)
	//struct thing *who;
	{


		let x, y, ex, ey, ch;
		let nopen = 0;
		let item;//struct linked_list *item;
		let ret;//static struct coord ret;  /* what we will be returning */
		let dest;//static struct coord dest;

		ret = who.t_pos;
		/*
		* Now go through the spaces surrounding the player and
		* set that place in the array to true if the space can be
		* moved into
		*/
		ey = ret.y + 1;
		ex = ret.x + 1;
		for (y = who.t_pos.y - 1; y <= ey; y += 1) {
			for (x = who.t_pos.x - 1; x <= ex; x += 1) {
				if (!cordok(y, x))
					continue;
				ch = winat(y, x);
				if (step_ok(ch)) {
					dest.y = y;
					dest.x = x;
					if (!diag_ok(who.t_pos, dest))
						continue;
					if (ch == d.SCROLL && who != player) {
						/*
						* check for scare monster scrolls
						*/
						item = find_obj(y, x);
						if (item != null && (OBJPTR(item)).o_which == d.S_SCARE)
							continue;
					}
					if (rnd(++nopen) == 0)
						ret = dest;
				}
			}
		}
		return ret;
	}

	/*
	* isatrap:
	*	Returns true if this character is some kind of trap
	*/
	this.isatrap = function(ch)
	//char ch;
	{
		switch(ch) {
			case d.POST:
			case d.DARTTRAP:
			case d.POOL:
			case d.TELTRAP:
			case d.TRAPDOOR:
			case d.ARROWTRAP:
			case d.SLEEPTRAP:
			case d.BEARTRAP:
			case d.MAZETRAP:
				return true;
			default:
				return false;
		}
	}
}