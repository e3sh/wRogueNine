/*
 * Read a scroll and let it happen
 *
 */

function scrolls(r){
	    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const cw = d.DSP_MAIN_FG;
    const mw = d.DSP_MAIN_BG;
	const hw = d.DSP_MAIN;

	/*
	* read_scroll:
	*	Let the hero read a scroll
	*/
	this.read_scroll = function()
	{
		const find_mons = r.monster.chase.find_mons;
		const look = r.player.misc.look;
		const del_pack = r.item.pack_f.del_pack;
		const get_item = r.item.pack_f.get_item;
		const OBJPTR = f.OBJPTR;
		const o_on = r.o_on;
		const o_off = r.o_off;
		const chg_abil = r.player.pstats.chg_abil;
		const light = r.player.move.light;
		const rf_on = r.dungeon.rooms_f.rf_on;
		const isalpha =(ch)=>{ return /^[a-zA-Z]+$/.test(ch); };
		const THINGPTR = f.THINGPTR;
		const makemons = r.UI.wizard.makemons;
		const teleport = r.UI.wizard.teleport;
		const setoflg = r.setoflg;
		const resoflg = r.resoflg;
		const aggravate = r.player.misc.aggravate;
		const genocide = r.monster.genocide;
		const next = f.next;
		const new_level = r.dungeon.new_level.create;
 		const inv_name = r.item.things_f.inv_name;
		const chg_hpt = r.player.pstats.chg_hpt;
		const whatis = r.UI.wizard.whatis;
		const idenpack = r.item.pack_f.idenpack;

		const s_know = r.item.s_know;
		const w_magic = v.w_magic;
		const armors = v.armors;

		const mtlev = r.monster.get_mtlev();	

		const player = r.player.get_player();
		const hero = r.player.get_hero();
		
		let obj; //reg struct object *obj;
		let item; //reg struct linked_list *item;
		let i, j, wh;
		let ch, nch;
		let rp; //struct room *rp;
		let titem; //struct linked_list *titem;
		let buf ; //[LINLEN];
		let bless, curse;

		if ((item = get_item("read", d.SCROLL)) == null)
			return;
		obj = OBJPTR(item);
		if (obj.o_type != d.SCROLL) {
			r.UI.msg( ms.READSC_1);
			r.after = false;
			return;
		}
		r.UI.msg(ms.READSC_2);
		wh = obj.o_which;
		bless = o_on(obj, d.ISBLESS);
		curse = o_on(obj, d.ISCURSED);
		del_pack(item);		/* Get rid of the thing */

		/*
		* Calculate the effect it has on the hero
		*/
		switch(wh) {
		case d.S_KNOWALL:
			if (!curse) {
				idenpack();				/* identify all the pack */
				r.UI.msg( ms.READSC_KNOWALL);
				chg_abil(d.WIS,1,true);
				s_know[d.S_KNOWALL] = true;
			}
		break;
		case d.S_CONFUSE:
			if (!curse) {
				/*
				* Scroll of monster confusion.  Give him that power.
				*/
				r.UI.msg( ms.READSC_CONFUSE);
				player.t_flags |= d.CANHUH;
				s_know[d.S_CONFUSE] = true;
				r.player.set_player( player);
			}
		break;
		case d.S_LIGHT:
			rp = player.t_room;
			if (!curse) {
				if (rp == null) {
					s_know[d.S_LIGHT] = true;
					r.UI.msg(ms.READSC_LIGHT1);
				}
				else {
					if (rf_on(rp,d.ISDARK)) {
						s_know[d.S_LIGHT] = true;
						r.UI.msg(ms.READSC_LIGHT2);
						rp.r_flags &= ~d.ISDARK;
					}
					light(hero);
					r.UI.mvwaddch(cw, hero.y, hero.x, d.PLAYER);
				}
			}
		break;
		case d.S_ARMOR:
			if (!curse) {
				const cur_armor = r.player.get_cur_armor();
				const armors = v.armors

				if (cur_armor != null && o_off(cur_armor,d.ISPROT)) {
					s_know[d.S_ARMOR] = true;
					r.UI.msg( ms.READSC_ARMOR);
					if (o_on(cur_armor, d.ISCURSED))
						cur_armor.o_ac = armors[cur_armor.o_which].a_class;
					else
						cur_armor.o_ac--;
					r.resoflg(cur_armor, d.ISCURSED);
					r.player.set_cur_armor(cur_armor);
				}
			}
		break;
		case d.S_HOLD:
			if (!curse) {
				/*
				* Hold monster scroll.  Stop all monsters within 3 spaces
				* from chasing after the hero.
				*/
				let x,y;
				let mon; //reg struct linked_list *mon;

				for (x = hero.x - 3; x <= hero.x + 3; x++) {
					for (y = hero.y - 3; y <= hero.y + 3; y++) {
						if (y > 0 && x > 0 && isalpha(r.UI.mvwinch(mw, y, x))) {
							if ((mon = find_mons(y, x)) != null) {
								let th; //reg struct thing *th;

								th = THINGPTR(mon);
								th.t_flags &= ~d.ISRUN;
								th.t_flags |= d.ISHELD;
								th.t_flags |= d.ISSTUCK;

								r.UI.setEffect(`HOLD`, {x:x,y:y} ,{x: x, y: y-1},120);
							}
						}
					}
				}
			}
		break;
		case d.S_SLEEP:
			/*
			* Scroll which makes you fall asleep
			*/
			if (!bless) {
				s_know[d.S_SLEEP] = true;
				r.UI.msg( ms.READSC_SLEEP);
				player.t_nocmd += 4 + r.rnd(d.SLEEPTIME);
				r.player.set_player( player);
			}
		break;
		case d.S_CREATE:
			if (!bless) {
				if (makemons(mtlev[r.rnd(r.levcount)].m_show))
					s_know[d.S_CREATE] = true;
				else
					r.UI.msg( ms.READSC_CREATE);
			}
		break;
		case d.S_IDENT:
			if (!curse) {
				r.UI.msg( ms.READSC_IDENT);
				get_item("identify",0);
				s_know[d.S_IDENT] = true;
				//whatis(null);
			}
		break;
		case d.S_MAP:
			if (curse)
				break;
			s_know[d.S_MAP] = true;
			r.UI.addmsg( ms.READSC_SMAP1);
			if (r.rnd(100) < 10 || bless) {
				r.UI.addmsg( ms.READSC_SMAP2);
				r.UI.endmsg(" ");
				r.UI.displevl();
			}
			else {
				r.UI.addmsg( ms.READSC_SMAP3);
				r.UI.endmsg(" ");
				//overwrite(stdscr, hw);
				for (i = 1; i < d.LINES; i++) {
					for (j = 0; j < d.COLS; j++) {
						nch = ch = r.UI.mvwinch(hw, i, j);
						switch (ch) {
							case d.SECRETDOOR:
								nch = d.DOOR;
								r.UI.mvaddch(i, j, nch);
							case '-':
							case '|':
							case d.DOOR:
							case d.PASSAGE:
							case ' ':
							case d.STAIRS:
								if (r.UI.mvwinch(cw, i, j) != ' ') {
									let it;// struct thing *it;
									let blah; //struct linked_list *blah;

									blah = find_mons(i, j);
									if (blah != null) {
										it = THINGPTR(blah);
										if (it.t_oldch == ' ')
											it.t_oldch = nch;
									}
								}
								break;
							default:
								nch = ' ';
						}
						//if (nch != ch)
							r.UI.mvwaddch(cw, i, j, nch);
					}
				}
				//overlay(cw, hw);
				//overwrite(hw, cw);
			}
		break;
		case d.S_GFIND:
			if (!curse) {
				let gtotal = 0;
				let rp; //struct room *rp;

				//wclear(hw);
				//for (rp = rooms; rp < &rooms[MAXROOMS]; rp++) {
				for (let i in r.dungeon.rooms){
					rp = r.dungeon.rooms[i];
					gtotal += rp.r_goldval;
					if (rp.r_goldval != 0 &&
					r.UI.mvinch(rp.r_gold.y,rp.r_gold.x) == d.GOLD)
						r.UI.mvwaddch(cw,rp.r_gold.y,rp.r_gold.x,d.GOLD);
				}
				if (gtotal) {
					s_know[d.S_GFIND] = true;
					r.UI.msg( ms.READSC_GFIND1);
					//overlay(hw,cw);
				}
				else
					r.UI.msg( ms.READSC_GFIND2);
			}
		break;
		case d.S_TELEP:
			if (!curse) {
				let rm;
				let cur_room;//struct room *cur_room;

				cur_room = player.t_room;
				rm = teleport(r.rndspot, player);
				if (cur_room != rm) //r.dungeon.rooms[rm])
					s_know[d.S_TELEP] = true;
			}
		break;
		case d.S_ENCH:
			const cur_weapon = r.player.get_cur_weapon();

			if (!curse) {
				if (cur_weapon == null || (cur_weapon != null &&
				(o_on(cur_weapon,d.ISPROT) || cur_weapon.o_type != d.WEAPON)))
					r.UI.msg( ms.READSC_ENCH1);
				else {
					s_know[d.S_ENCH] = true;
					if (o_on(cur_weapon,d.ISCURSED)) {
						resoflg(cur_weapon,d.ISCURSED);
						cur_weapon.o_hplus = r.rnd(2);
						cur_weapon.o_dplus = r.rnd(2);
					}
					else {		/* weapon was not cursed here */
						if (r.rnd(100) < 50)
							cur_weapon.o_hplus += 1;
						else
							cur_weapon.o_dplus += 1;
					}
					setoflg(cur_weapon, d.ISKNOW);
					r.UI.msg( ms.READSC_ENCH2(w_magic[cur_weapon.o_which].mi_name));

					r.player.set_cur_weapon(cur_weapon);
				}
			}
		break;
		case d.S_SCARE:
			/*
			* A monster will refuse to step on a scare monster scroll
			* if it is dropped.  Thus reading it is a mistake and produces
			* laughter at the poor rogue's boo boo.
			*/
			r.UI.msg( ms.READSC_SCARE);
		break;
		case d.S_REMOVE:
			if (!curse) {
				let ll; //struct linked_list *ll;
				let lb; //struct object *lb;

				for (ll = r.player.get_pack() ; ll != null ; ll = next(ll)) {
					lb = OBJPTR(ll);
					if (o_off(lb,d.ISPROT)) {
						resoflg(lb, d.ISCURSED);
					}
				}
				//let cur_weapon = r.player.get_cur_weapon();
				//let cur_armor = r.player.get_cur_armor();
				//let cur_ring = r.player.get_cur_ring();

				//if (cur_armor != null && o_off(cur_armor,d.ISPROT))
				//	resoflg(cur_armor,d.ISCURSED);
				//if (cur_weapon != null && o_off(cur_weapon,d.ISPROT))
				//	resoflg(cur_weapon,d.ISCURSED);
				//if (cur_ring[d.LEFT]!=null && o_off(cur_ring[d.LEFT],d.ISPROT))
				//	resoflg(cur_ring[d.LEFT],d.ISCURSED);
				//if (cur_ring[d.RIGHT]!=null && o_off(cur_ring[d.RIGHT],d.ISPROT))
				//	resoflg(cur_ring[d.RIGHT],d.ISCURSED);
				r.UI.msg( ms.READSC_REMOVE);
				s_know[d.S_REMOVE] = true;

				//r.player.set_cur_weapon(cur_weapon);
				//r.player.set_cur_armor(cur_armor);
				//r.player.set_cur_ring(cur_ring);
			}
		break;
		case d.S_AGGR:
			if (!bless) {
				if (r.dungeon.mlist != null) {
					aggravate();
					r.UI.msg( ms.READSC_AGGR);
					s_know[d.S_AGGR] = true;
				}
			}
		break;
		case d.S_NOP:
			r.UI.msg( ms.READSC_NOP);
		break;
		case d.S_GENOCIDE:
			if (!curse) {
				r.UI.msg( ms.READSC_GENOCIDE);
				genocide();
				s_know[d.S_GENOCIDE] = true;
			}
		break;
		case d.S_DCURSE:
			if (!bless) {
				let ll; //struct linked_list *ll;
				let lb; //struct object *lb;

				r.UI.msg( ms.READSC_DCURSE);
				for (ll = r.player.get_pack() ; ll != null ; ll = next(ll)) {
					lb = OBJPTR(ll);
					if (o_off(lb,d.ISPROT)) {
						resoflg(lb, d.ISBLESS);
						setoflg(lb, d.ISCURSED);
					}
				}
			}
		break;
		case d.S_DLEVEL:
			if (!bless) {
				let much = r.rnd(9) - 4;

				if (much != 0) {
					r.dungeon.level += much;
					if (r.dungeon.level < 1)
						r.dungeon.level = 1;
					//mpos = 0;
					new_level(d.NORMLEV);		/* change levels */
					r.UI.msg( ms.READSC_DLEVEL);
					s_know[d.S_DLEVEL] = true;
				}
			}
		break;
		case d.S_PROTECT:
			if (!curse) {
				let ll; //struct linked_list *ll;
				let lb; //struct object *lb;

				r.UI.msg(ms.READSC_PROTECT1);
				if ((ll = get_item("protect",0)) != null) {
				//	lb = OBJPTR(ll);
				//	setoflg(lb,d.ISPROT);
					//mpos = 0;
				//	r.UI.msg(ms.READSC_PROTECT2(inv_name(lb,true)));
				}
				s_know[d.S_PROTECT] = true;
			}
		break;
		case d.S_ALLENCH:
			if (!curse) {
				let ll; //struct linked_list *ll;
				let lb; //struct object *lb;
				let howmuch, ac, good;

				r.UI.msg( ms.READSC_ALLENCH1);
				good = true;
				if ((ll = get_item("enchant",0)) != null) {
					/*
					lb = OBJPTR(ll);
					resoflg(lb,d.ISCURSED);
					resoflg(lb,d.ISPROT);
					howmuch = r.rnd(3) + 1;
					switch(lb.o_type) {
						case d.RING:
							if (lb.o_ac < 0)
								lb.o_ac = 0;
							lb.o_ac += howmuch;
						break;
						case d.ARMOR:
							ac = armors[lb.o_which].a_class;
							if (lb.o_ac > ac)
								lb.o_ac = ac;
							lb.o_ac -= howmuch;
						break;
						case d.STICK:
							lb.o_charges += howmuch + 10;
						break;
						case d.WEAPON:
							if (lb.o_dplus < 0)
								lb.o_dplus = 0;
							if (lb.o_hplus < 0)
								lb.o_hplus = 0;
							lb.o_hplus += howmuch;
							lb.o_dplus += howmuch;
						break;
						default:
							r.UI.msg(ms. READSC_ALLENCH2);
							chg_hpt(-r.roll(6,6),false,d.K_SCROLL);
							good = false;
							
					}
					if (good) {
						//mpos = 0;
						r.UI.msg(ms.READSC_ALLENCH3(inv_name(lb,true)));
					}
					*/
				}
				s_know[d.S_ALLENCH] = true;
			}
		break;
		case d.S_BLESS:
			if (!curse) {
				let ll; //struct linked_list *ll;
				let lb; //struct object *lb;

				r.UI.msg(ms.READSC_BLESS);
				for (ll = r.player.get_pack() ; ll != null ; ll = next(ll)) {
					whatis(ll);
					lb = OBJPTR(ll);
					resoflg(lb,d.ISCURSED);
					setoflg(lb,d.ISBLESS);
				}
			}
		break;
		case d.S_MAKEIT:
			if (!curse) {
				r.UI.msg(ms.READSC_MAKEIT);
				s_know[d.S_MAKEIT] = true;
				r.UI.wizard.create_obj(true);
			}
		break;
		case d.S_BAN: {
			let howdeep;
			let ptr;

			if (bless) {
				if (r.dungeon.level > 6) {
					howdeep = 1 + r.rnd(5);
					ptr = ms.READSC_BAN1;
				}
				else {
					howdeep = -1;
					bless = false;
				}
			}
			else {
				howdeep = r.dungeon.level + 10 + r.rnd(20) + (curse * 20);
				ptr = ms.READSC_BAN2;
			}
			if ((!bless && r.dungeon.level < howdeep) || bless) {
				r.dungeon.level = howdeep;
				new_level(d.NORMLEV);
				//mpos = 0;
				r.UI.msg(ms.READSC_BAN3(ptr));
				s_know[d.S_BAN] = true;
			}
		}
		break;
		case d.S_CWAND:
			if (!curse) {
				let ll; //struct linked_list *ll;
				let lb; //struct object *lb;
				let wands = false;

				for (ll = r.player.get_pack() ; ll != null ; ll = next(ll)) {
					lb = OBJPTR(ll);
					if (lb.o_type == d.STICK) {
						whatis(ll);
						setoflg(lb, d.ISKNOW);
						resoflg(lb, d.ISCURSED);
						lb.o_charges += r.rnd(11) + 5;
						wands = true;
					}
				}
				if (wands) {
					r.UI.msg(ms.READSC_CWAND);
					s_know[wh] = true;
				}
			}
		break;
		case d.S_LOCTRAP: {
			let trp; //struct trap *trp;

			if (r.dungeon.ntraps > 0) {
				//for (trp = &traps[0]; trp < &traps[ntraps]; trp++)
				for (let i in r.dungeon.traps)
					r.dungeon.traps[i].tr_flags |= d.ISFOUND;
				look(false);
				r.UI.msg(ms.READSC_LOCTRAP);
				s_know[d.S_LOCTRAP] = true;
			}
		}
		break;
		default:
			r.UI.msg(ms.READSC_DEFAULT);
			return;
		}
		look(true);
		r.nochange = false;

		r.player.set_player( player);
		//r.player.set_hero( hero);

		//if (s_know[wh] && s_guess[wh]) {
		//	free(s_guess[wh]);
		//	s_guess[wh] = null;
		//}
		//else if (!s_know[wh] && s_guess[wh] == null) {
		//	strcpy(buf, s_names[wh]);
		//	msg(callit);
		//	if (get_str(buf, cw) == NORM) {
		//		s_guess[wh] = new(strlen(buf) + 1);
		//		strcpy(s_guess[wh], buf);
		//	}
		//}
	}
	
	this.identify = function( item){
	
		const OBJPTR = f.OBJPTR;
		const setoflg = r.setoflg; 
		const inv_name = r.item.things_f.inv_name;

		const s_know = r.item.s_know;	
		const p_know = r.item.p_know;	
		const r_know = r.item.r_know;	
		const ws_know = r.item.ws_know;

		let obj; //reg struct object *obj;
		let wh;

		obj = OBJPTR(item);
		setoflg(obj, d.ISKNOW);
		wh = obj.o_which;
		switch (obj.o_type) {
			case d.SCROLL:
				s_know[wh] = true;
			break;
			case d.POTION:
				p_know[wh] = true;
			break;
			case d.STICK:
				ws_know[wh] = true;
			break;
			case d.RING:
				r_know[wh] = true;
		}
		//if (item == null)
			r.UI.msg(inv_name(obj, false));
	}

	this.protect = function( item){
		const OBJPTR = f.OBJPTR;
		const setoflg = r.setoflg;
 		const inv_name = r.item.things_f.inv_name;

		let lb; //struct object *lb;

		lb = OBJPTR( item);
		setoflg(lb,d.ISPROT);
		//mpos = 0;
		r.UI.msg(ms.READSC_PROTECT2(inv_name(lb,true)));
	}

	this.enchant = function( item){

		const OBJPTR = f.OBJPTR;
		const resoflg = r.resoflg;
 		const inv_name = r.item.things_f.inv_name;
		const chg_hpt = r.player.pstats.chg_hpt;
		const armors = v.armors;

		let lb; //struct object *lb;
		let howmuch, ac, good = true;

		lb = OBJPTR(item);
		resoflg(lb,d.ISCURSED);
		resoflg(lb,d.ISPROT);
		howmuch = r.rnd(3) + 1;
		switch(lb.o_type) {
			case d.RING:
				if (lb.o_ac < 0)
					lb.o_ac = 0;
				lb.o_ac += howmuch;
			break;
			case d.ARMOR:
				ac = armors[lb.o_which].a_class;
				if (lb.o_ac > ac)
					lb.o_ac = ac;
				lb.o_ac -= howmuch;
			break;
			case d.STICK:
				lb.o_charges += howmuch + 10;
			break;
			case d.WEAPON:
				if (lb.o_dplus < 0)
					lb.o_dplus = 0;
				if (lb.o_hplus < 0)
					lb.o_hplus = 0;
				lb.o_hplus += howmuch;
				lb.o_dplus += howmuch;
			break;
			default:
				r.UI.msg(ms. READSC_ALLENCH2);
				chg_hpt(-r.roll(6,6),false,d.K_SCROLL);
				good = false;
		}
		if (good) {
			//mpos = 0;
			r.UI.msg(ms.READSC_ALLENCH3(inv_name(lb,true)));
		}
	}
}