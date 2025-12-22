/*
 * Functions to deal with the various sticks one
 * might find while wandering around the dungeon.
 *
 */

function sticks(r){
	    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const cw = d.DSP_MAIN_FG;
    const mw = d.DSP_MAIN_BG;
	const hw = d.DSP_MAIN_FG;

	/*
	* fix_stick:
	*	Init a stick for the hero
	*/
	this.fix_stick = function(cur)
	//struct object *cur;
	{
		const ws_stuff = r.item.ws_stuff;

		let rd; //struct rod *rd;

		cur.o_type = d.STICK;
		cur.o_charges = 4 + r.rnd(5);
		cur.o_hurldmg = "1d1";
		rd = ws_stuff[cur.o_which];
		cur.o_weight = rd.ws_wght;
		cur.o_vol = rd.ws_vol;
		if (rd.ws_type == "staff") {
			cur.o_damage = "2d3";
			cur.o_charges += r.rnd(5) + 3;
		}
		else {
			cur.o_damage = "1d1";
		}
		switch (cur.o_which) {
			case d.WS_HIT:
				if(r.rnd(100) < 15) {
					cur.o_hplus = 9;
					cur.o_dplus = 9;
					cur.o_damage = "3d8";
				}
				else {
					cur.o_hplus = 3;
					cur.o_dplus = 3;
					cur.o_damage = "1d8";
				}
			break;
			case d.WS_LIGHT:
				cur.o_charges += 7 + r.rnd(9);
		}
		return cur;
	}

	/*
	* do_zap:
	*	Zap a stick at something
	*/
	this.do_zap = function(gotdir)
	//bool gotdir;
	{
		const on = f.on;
		const find_mons = r.monster.chase.find_mons;
		const runto = r.monster.chase.runto;
		const del_pack = r.item.pack_f.del_pack;
		const get_item = r.item.pack_f.get_item;
		const OBJPTR = f.OBJPTR;
		const o_on = r.o_on;
		const heal_self = r.player.pstats.heal_self;
		const unconfuse = r.daemon.unconfuse;
		const notslow = r.daemon.notslow; 
		const sight = r.daemon.sight;
		const chg_hpt = r.player.pstats.chg_hpt;
		const cordok = r.UI.cordok;
		const isalpha = (ch)=>{ return /^[a-zA-Z]+$/.test(ch); }
		const THINGPTR = f.THINGPTR;
		const killed = r.monster.battle.killed;
		const step_ok = r.UI.io.step_ok;
		const winat = r.UI.winat;
		const unhold = r.monster.unhold;
		const rnd_mon = r.monster.rnd_mon;
		const new_monster = r.monster.new_monster;
		const rnd_pos = r.dungeon.rooms_f.rnd_pos;
		const do_motion = r.item.weapon_f.do_motion;
		const save_throw = r.monster.battle.save_throw;
		const hit_monster = r.item.weapon_f.hit_monster;
		const fight = r.monster.battle.fight;
		const show = r.player.move.show;
		const check_level = r.monster.battle.check_level;
		const light = r.player.move.light;
		const save = r.monster.battle.save;

		const ws_know = r.item.ws_know;
		const monsters = v.monsters;
		const ws_stuff = r.item.ws_stuff;

		const player = r.player.get_player();
		const him = r.player.get_him();
		const hero = r.player.get_hero();

		let item; //reg struct linked_list *item;
		let obj; //reg struct object *obj;
		let tp; //reg struct thing *tp;
		let y, x, wh;
		let rp; //struct room *rp;
		let bless, curse;
		let better = 0;

		if ((item = get_item("zap with", d.STICK)) == null)
			return;
		obj = OBJPTR(item);
		wh = obj.o_which;
		bless = o_on(obj, d.ISBLESS);
		curse = o_on(obj, d.ISCURSED);
		if (obj.o_type != d.STICK) {
			r.UI.msg("You can't zap with that!");
			r.after = false;
			return;
		}
		if (obj.o_charges == 0) {
			r.UI.msg(ms.DO_ZAP_1);
			return;
		}
		//if (!gotdir)
		//	do {
		//		r.delta.y = r.rnd(3) - 1;
		//		r.delta.x = r.rnd(3) - 1;
		//	} while (r.delta.y == 0 && r.delta.x == 0);
		rp = player.t_room;
		if (bless)
			better = 3;
		else if (curse)
			better = -3;
		switch (wh) {
		case d.WS_SAPLIFE:
			if (!bless) {
				if (him.s_hpt > 1)
				him.s_hpt /= 2;	/* zap half his hit points */
			}
		break;
		case d.WS_CURE:
			if (!curse) {
				ws_know[d.WS_CURE] = true;
				heal_self(6, false);
				unconfuse(false);
				notslow(false);
				sight(false);
			}
		break;
		case d.WS_PYRO:
			if (!bless) {
				r.UI.msg(ms.DO_ZAP_PYRO);
				chg_hpt(-r.roll(6,6), false, d.K_ROD);
				ws_know[d.WS_PYRO] = true;
				del_pack(item);		/* throw it away */
			}
		break;
		case d.WS_HUNGER:
			if (!bless) {
				let ip; //struct linked_list *ip;
				let lb; //struct object *lb;

				r.player.food_left /= 3;
				if ((ip = r.player.get_pack()) != null) {
					lb = OBJPTR(ip);
					if (lb.o_type == d.FOOD) {
						if ((lb.o_count -= r.roll(1,4)) < 1)
							del_pack(ip);
					}
				}
			}
		break;
		case d.WS_PARZ:
		case d.WS_MREG:
		case d.WS_MDEG:
		case d.WS_ANNIH: {
			let mitem; //struct linked_list *mitem;
			let it; //struct thing *it;
			let i,j;

			for (i = hero.y - 3; i <= hero.y + 3; i++) {
				for (j = hero.x - 3; j <= hero.x + 3; j++) {
					if (!cordok(i, j))
						continue;
					if (isalpha(r.UI.mvwinch(mw,i,j))) {
						mitem = find_mons(i, j);
						if (mitem == null)
							continue;
						it = THINGPTR(mitem);
						switch(wh) {
							case d.WS_ANNIH:
								if (!curse)
									killed(mitem,false);
							break;
							case d.WS_MREG:
								if (!bless)
									it.t_stats.s_hpt *= 2;
							break;
							case d.WS_MDEG:
								if (!curse) {
									it.t_stats.s_hpt /= 2;
									if (it.t_stats.s_hpt < 2)
										killed(mitem,false);
								}
							break;
							case d.WS_PARZ:
								if (!curse) {
									it.t_flags |= d.ISPARA;
									it.t_flags &= ~d.ISRUN;
								}
							}
						}
					}
				}
			}
		break;
		case d.WS_LIGHT:
			if (!curse) {
				ws_know[d.WS_LIGHT] = true;
				if (rp == null)
					r.UI.msg(ms.DO_ZAP_LIGHT1);
				else {
					r.UI.msg(ms.DO_ZAP_LIGHT2);
					rp.r_flags &= ~d.ISDARK;
					light(hero);
					r.UI.mvwaddch(cw, hero.y, hero.x, d.PLAYER);
				}
			}
		break;
		case d.WS_DRAIN:
			/*
			* Take away 1/2 of hero's hit points, then take it away
			* evenly from the monsters in the room (or next to hero
			* if he is in a passage)
			*/
			if (him.s_hpt < 2) {
				r.UI.msg(ms.DO_ZAP_DRAIN);
				return;
			}
			else if (!curse) {
				if (rp == null)
					drain(hero.y-1, hero.y+1, hero.x-1, hero.x+1);
				else
					drain(rp.r_pos.y, rp.r_pos.y+rp.r_max.y,
					rp.r_pos.x, rp.r_pos.x+rp.r_max.x);
			}
		break;
		case d.WS_POLYM:
		case d.WS_TELAWAY:
		case d.WS_TELTO:
		case d.WS_CANCEL:
		case d.WS_MINVIS:
		{
			let monster, oldch;

			y = hero.y;
			x = hero.x;
			do {
				y += r.delta.y;
				x += r.delta.x;
			} while (step_ok(winat(y, x)));
			if (isalpha(monster = r.UI.mvwinch(mw, y, x))) {
				let omonst;

				if (wh != d.WS_MINVIS)
					unhold(monster);
				item = find_mons(y, x);
				if (item == null)
					break;
				tp = THINGPTR(item);
				omonst = tp.t_indx;
				if (wh == d.WS_POLYM && !curse) {
					r.dungeon.mlist = r.detach(r.dungeon.mlist, item);
					r.discard(item);
					oldch = tp.t_oldch;
					r.delta.y = y;
					r.delta.x = x;
					monster = rnd_mon(false, true);
					item = new_monster(monster, r.delta, false);
					if (!(tp.t_flags & d.ISRUN))
						runto(delta, hero);
					if (isalpha(r.UI.mvwinch(cw, y, x)))
						r.UI.mvwaddch(cw, y, x, monsters[monster].m_show);
					tp.t_oldch = oldch;
					ws_know[d.WS_POLYM] |= (monster != omonst);
				}
				else if (wh == d.WS_MINVIS && !bless) {
					tp.t_flags |= ISINVIS;
					r.UI.mvwaddch(cw,y,x,tp.t_oldch);	/* hide em */
					runto(tp.t_pos, hero);
				}
				else if (wh == d.WS_CANCEL && !curse) {
					tp.t_flags |= d.ISCANC;
					tp.t_flags &= ~d.ISINVIS;
				}
				else {
					if (wh == d.WS_TELAWAY) {
						if (curse)
							break;
						tp.t_pos = rnd_pos(r.dungeon.rooms[rnd_room()]);
					}
					else {					/* WS_TELTO */
						if (bless)
							break;
						tp.t_pos.y = hero.y + r.delta.y;
						tp.t_pos.x = hero.x + r.delta.x;
					}
					if (isalpha(r.UI.mvwinch(cw, y, x)))
						r.UI.mvwaddch(cw, y, x, tp.t_oldch);
					tp.t_dest = hero;
					tp.t_flags |= d.ISRUN;
					r.UI.mvwaddch(mw, y, x, ' ');
					r.UI.mvwaddch(mw, tp.t_pos.y, tp.t_pos.x, monster);
					tp.t_oldch = r.UI.mvwinch(cw,tp.t_pos.y,tp.t_pos.x);
				}
				item.l_data = tp;
			}
		}
		break;
		case d.WS_MISSILE:
		{
			let whe; //struct coord *whe;
			//static struct object bolt = {
			//	{0, 0}, "", "6d6", "", '*', 0, 0, 1000, 0, 0, 0, 0, 0, 0,
			//};
       		const bolt = {
				o_pos	:{x:0,y:0},		/* Where it lives on the screen */
				o_damage:"",		/* Damage if used like sword */
				o_hurldmg:"6d6",	/* Damage if thrown */
				o_typname:"",		/* name this thing is called */
				o_type	:'*',				/* What kind of object it is */
				o_count	: 0,			/* Count for plural objects */
				o_which	: 0,			/* Which object of a type it is */
				o_hplus	: 1000,			/* Plusses to hit */
				o_dplus	: 0,			/* Plusses to damage */
				o_ac	: 0,				/* Armor class or charges */
				o_flags	: 0,			/* Information about objects */
				o_group	: 0,			/* Group number for this object */
				o_weight: 0,			/* weight of this object */
				o_vol	: 0,				/* volume of this object */
				o_launch:"",			/* What you need to launch it */
        	}

			if (curse)
				bolt.o_hurldmg = "3d3";
			else if (bless)
				bolt.o_hurldmg = "9d9";
			ws_know[d.WS_MISSILE] = true;
			do_motion(bolt, r.delta.y, r.delta.x);
			whe = bolt.o_pos;
			if (isalpha(r.UI.mvwinch(mw, whe.y, whe.x))) {
				let it; //struct linked_list *it;

				runto(whe, hero);
				it = find_mons(whe.y, whe.x);
				if (it != null) {
					if (!save_throw(d.VS_MAGIC + better, THINGPTR(it))) {
						hit_monster(whe, bolt);
						break;
					}
				}
			}
			r.UI.msg(ms.DO_ZAP_MSIL);
		}
		break;
		case d.WS_NOP:
			r.UI.msg(ms.DO_ZAP_NOP(ws_stuff[wh].ws_type));
		break;
		case d.WS_HIT: {
			let ch;

			r.delta.y += hero.y;
			r.delta.x += hero.x;
			ch = winat(r.delta.y, r.delta.x);
			if (curse) {				/* decrease for cursed */
				obj.o_damage = "1d1";
				obj.o_hplus = obj.o_dplus = 0;
			}
			else if (bless) {			/* increase for blessed */
				obj.o_damage = "5d8";
				obj.o_hplus = obj.o_dplus = 12;
			}
			if (isalpha(ch))
				fight(r.delta, obj, false);
		}
		break;
		case d.WS_HASTE_M:
		case d.WS_CONFMON:
		case d.WS_SLOW_M:
		case d.WS_MOREMON: {
			let m1,m2;
			let mp; //struct coord mp;
			let titem; //struct linked_list *titem;

			y = hero.y;
			x = hero.x;
			do {
				y += r.delta.y;
				x += r.delta.x;
			} while (step_ok(winat(y, x)));
			if (isalpha(r.UI.mvwinch(mw, y, x))) {
				item = find_mons(y, x);
				if (item == null)
					break;
				tp = THINGPTR(item);
				if (wh == d.WS_HASTE_M && !bless) {			/* haste it */
					if (on(tp, d.ISSLOW))
						tp.t_flags &= ~d.ISSLOW;
					else
						tp.t_flags |= d.ISHASTE;
				}
				else if (wh == d.WS_CONFMON && !curse) {		/* confuse it */
					tp.t_flags |= d.ISHUH;
					if (pl_on(d.ISHELD) && tp.t_type == 'd')
						player.t_flags &= ~d.ISHELD;
				}
				else if (wh == d.WS_SLOW_M && !curse) {		/* slow it */
					if (on(tp, d.ISHASTE))
						tp.t_flags &= ~d.ISHASTE;
					else
						tp.t_flags |= d.ISSLOW;
					tp.t_turn = true;
				}
				else if (!bless) {	/* WS_MOREMON: multiply it */
					let ch;
					let th; //struct thing *th;

					for (m1 = tp.t_pos.x-1; m1 <= tp.t_pos.x+1; m1++) {
						for(m2 = tp.t_pos.y-1; m2 <= tp.t_pos.y+1; m2++) {
							if (hero.x == m1 && hero.y == m2)
								continue;
							ch = winat(m2,m1);
							if (step_ok(ch)) {
								mp.x = m1;			/* create it */
								mp.y = m2;
								titem = new_monster(tp.t_indx, mp, false);
								th = THINGPTR(titem);
								th.t_flags |= d.ISMEAN;
								runto(mp, hero);
							}
						}
					}
				}
				delta.y = y;
				delta.x = x;
				runto(delta, hero);
				item.l_data = tp;
			}
		}
		break;
		case d.WS_ELECT:
		case d.WS_FIRE:
		case d.WS_COLD: {
			
			let dirch, ch, name;
			let bounced, used;
			let boingcnt, boltlen;
			let pos; //struct coord pos;
			let spotpos = [];//struct coord spotpos[BOLT_LENGTH * 2];
			
			//static struct object bolt =	{
			//	{0, 0}, "", "6d6", "", '*', 0, 0, 1000, 0, 0, 0, 0, 0, 0,
			//};
      		const bolt = {
				o_pos	:{x:0,y:0},		/* Where it lives on the screen */
				o_damage:"",		/* Damage if used like sword */
				o_hurldmg:"6d6",	/* Damage if thrown */
				o_typname:"",		/* name this thing is called */
				o_type	:'*',				/* What kind of object it is */
				o_count	: 0,			/* Count for plural objects */
				o_which	: 0,			/* Which object of a type it is */
				o_hplus	: 1000,			/* Plusses to hit */
				o_dplus	: 0,			/* Plusses to damage */
				o_ac	: 0,				/* Armor class or charges */
				o_flags	: 0,			/* Information about objects */
				o_group	: 0,			/* Group number for this object */
				o_weight: 0,			/* weight of this object */
				o_vol	: 0,				/* volume of this object */
				o_launch:"",			/* What you need to launch it */
        	}

			boltlen = d.BOLT_LENGTH;
			if (curse) {
				bolt.o_hurldmg = "3d3";
				boltlen -= 3;
			}
			else if (bless) {
				bolt.o_hurldmg = "9d9";
				boltlen += 3;
			}
			switch (r.delta.y + r.delta.x) {
				case 0: dirch = '/';
				break;
				case 1: case -1: dirch = (r.delta.y == 0 ? '-' : '|');
				break;
				case 2: case -2: dirch = '\\';
			}
			pos = {x:hero.x, y:hero.y};
			bounced = false;
			boingcnt = 0;
			used = false;
			if (wh == d.WS_ELECT)
				name = "bolt";
			else if (wh == d.WS_FIRE)
				name = "flame";
			else
				name = "ice";
			let wcnt = 0
			for (y = 0; y < boltlen && !used; y++) {

				ch = winat(pos.y, pos.x);
		//console.log(`${ch} ${(pos.x == hero.x && pos.y == hero.y)}
		//	delta:${r.delta.x} ${r.delta.y} 
		//	pos :${pos.x} ${pos.y} 
		//	hero:${hero.x} ${hero.y}`);

				spotpos[y] = pos;
				switch (ch) {
				case d.SECRETDOOR:
				case '|':
				case '-':
				case ' ':
					bounced = true;
					if (++boingcnt > 6) 
						used = true;	/* only so many bounces */
					r.delta.y = -r.delta.y;
					r.delta.x = -r.delta.x;
					y--;
					r.UI.msg(ms.DO_ZAP_ELM1);
					break;
				default:
					if (isalpha(ch)) {
						let it; //struct linked_list *it;

						it = find_mons(pos.y, pos.x);
						runto(pos, hero);
						if (it != null) {
							if (!save_throw(d.VS_MAGIC+better,THINGPTR(it))) {
								bolt.o_pos = pos;
								hit_monster(pos, bolt);
								used = true;
							}
							else if(ch != 'M' || show(pos.y,pos.x)=='M') {
								r.UI.msg(ms.DO_ZAP_ELM2(name));
							}
						}
					}
					else if(bounced && pos.y==hero.y && pos.x==hero.x) {
						bounced = false;
						if (!save(d.VS_MAGIC + better)) {
							r.UI.msg(ms.DO_ZAP_ELM3(name));
							chg_hpt(-r.roll(6, 6),false,d.K_BOLT);
							used = true;
						}
						else
							r.UI.msg(ms.DO_ZAP_ELM4(name));
					}
					//r.UI.mvwaddch(cw, pos.y, pos.x, dirch);
					//draw(cw);
				}
				pos.y += r.delta.y;
				pos.x += r.delta.x;
				r.UI.setEffect("*", {x:hero.x,y:hero.y}, {x:pos.x,y:pos.y}, 90, wcnt++*10);
			}
			for (x = 0; x < y; x++)
				r.UI.mvwaddch(cw, spotpos[x].y, spotpos[x].x,
				show(spotpos[x].y, spotpos[x].x));
			ws_know[wh] = true;
		}
		break;
		case d.WS_ANTIM: {
			let m1, m2, x1, y1;
			let ll; //struct linked_list *ll;
			let lt; //struct thing *lt;
			let ch, radius;

			y1 = hero.y;
			x1 = hero.x;
			do {
				y1 += delta.y;
				x1 += delta.x;
				ch = winat(y1, x1);
			} while (ch == d.PASSAGE || ch == d.FLOOR);
			if (curse)
				radius = 2;
			else if (bless)
				radius = 0;
			else
				radius = 1;
			for (m1 = x1 - radius; m1 <= x1 + radius; m1++) {
				for (m2 = y1 - radius; m2 <= y1 + radius; m2++) {
					if (!cordok(m2, m1))
						continue;
					ch = winat(m2, m1);
					if (m1 == hero.x && m2 == hero.y)
						continue;
					if (ch == ' ')
						continue;
					ll = find_obj(m2,m1);
					if (ll != null) {
						r.dungeon.lvl_obj = r.detach(r.dungeon.lvl_obj ,ll);
						r.discard(ll);
					}
					ll = find_mons(m2,m1);
					if (ll != null) {
						lt = THINGPTR(ll);
						him.s_exp += lt.t_stats.s_exp;
						unhold(lt.t_type);
						/*
						* throw away anything that the monster
						* was carrying in its pack
						*/
						lt.t_pack = r.free_list(lt.t_pack);
						r.dungeon.mlist = r.detach(r.dungeon.mlist,ll);
						r.discard(ll);
						r.UI.mvwaddch(mw,m2,m1,' ');
					}
					r.UI.mvaddch(m2,m1,' ');
					r.UI.mvwaddch(cw,m2,m1,' ');
				}
			}
			//touchwin(cw);
			//touchwin(mw);
			check_level();
		}
		break;
		default:
			r.UI.msg(ms.DO_ZAP_DEFAULT);
		}
		obj.o_charges--;

		r.player.set_player( player);
		r.player.set_him( him);
	}

	/*
	* drain:
	*	Do drain hit points from player stick
	*/
	function drain(ymin, ymax, xmin, xmax)
	//int ymin, ymax, xmin, xmax;
	{
		const cansee = r.monster.chase.cansee;
		const isalpha = (ch)=>{ return /^[a-zA-Z]+$/.test(ch); }
		const find_mons = r.monster.chase.find_mons;
		const THINGPTR = f.THINGPTR;
		const killed = r.monster.battle.killed;

		const him = r.player.get_him();

		let i, j, cnt;
		let ick; //reg struct thing *ick;
		let item ;//reg struct linked_list *item;

		/*
		* First count how many things we need to spread the hit points among
		*/
		cnt = 0;
		for (i = ymin; i <= ymax; i++)
			for (j = xmin; j <= xmax; j++)
				if (isalpha(r.UI.mvwinch(mw, i, j)))
					cnt++;
		if (cnt == 0) {
			r.UI.msg(ms.DRAIN);
			return;
		}
		cnt = him.s_hpt / cnt;
		him.s_hpt /= 2;
		/*
		* Now zot all of the monsters
		*/
		for (i = ymin; i <= ymax; i++) {
			for (j = xmin; j <= xmax; j++) {
				if(isalpha(r.UI.mvwinch(mw, i, j))) {
					item = find_mons(i, j);
					if (item == null)
						continue;
					ick = THINGPTR(item);
					if ((ick.t_stats.s_hpt -= cnt) < 1)
						killed(item,cansee(i,j) && !(ick.t_flags & d.ISINVIS));
				}
			}
		}
	}

	/*
	* charge_str:
	*	Return number of charges left in a stick
	*/
	//char *
	this.charge_str = function(obj)
	//struct object *obj;
	{
		const o_on = r.o_on;

		let buf; //static char buf[20];

		buf = '';
		if (o_on(obj,d.ISKNOW) || o_on(obj,d.ISPOST))
			buf = `[${obj.o_charges}]`;
		return buf;
	}
}