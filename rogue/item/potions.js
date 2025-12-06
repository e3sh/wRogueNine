/*
 * Functions for dealing with potions
 *
 */

function potions(r){
    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const cw = d.DSP_MAIN_FG;
    const mw = d.DSP_MAIN_BG;
    //const hw = d.DSP_WINDOW;

	/*
	* quaff:
	*	Let the hero drink a potion
	*/
	this.quaff = function()
	{
		const get_item = r.item.pack_f.get_item;
		const OBJPTR = f.OBJPTR;
		const o_on = r.o_on;
		const iswearing = r.item.ring_f.iswearing;
		const del_pack = r.item.pack_f.del_pack;
		const pl_on = r.player.pl_on;
		const pl_off = r.player.pl_off;
		const chg_abil = r.player.pstats_f.chg_abil;
		const p_know = r.item.p_know; 
		const lengthen = r.daemon.lengthen;
		const fuse = r.daemon.fuse;
		const unconfuse = r.daemon.unconfuse;
		const heal_self = r.player.pstats.heal_self;
		const notslow = r.daemon.notslow; 
		const sight = r.daemon.sight;
		const dispmons = r.UI.dispmons;
		const next = f.next;
		const THINGPTR = f.THINGPTR;
		const is_magic = r.monster.battle.is_magic;
		const ldata = f.ldata;
		const light = r.player.move.light;
		const unsee = r.daemon.unsee;
		const raise_level = r.monster.battle.raise_level;
		const add_haste = r.player.pstats_f.add_haste;
		const notinvinc = r.daemon.notinvinc;
		const updpack = r.player.encumb.updpack;
		const ringabil = r.item.ring_f.ringabil;
		const rchg_str = r.player.pstats.rchg_str;
		const extinguish = r.daemon.extinguish;
		const noteth = r.daemon.noteth;
		const notregen = r.daemon.notregen;

		const player = r.player.get_player();
		const hero = r.player.get_hero();
		const him = r.player.get_him();
		const max_stats = r.player.get_max_stats();

		let obj; //reg struct object *obj;
		let item, titem; //reg struct linked_list *item, *titem;
		let th; //reg struct thing *th;
		let wh; //reg int wh;
		let buf; //char buf[LINLEN];
		let bless, curse;

		/*
		* Make certain that it is somethings that we want to drink
		*/
		if ((item = get_item("quaff", d.POTION)) == null)
			return;
		obj = OBJPTR(item);
		if (obj.o_type != d.POTION) {
			r.UI.msg("That's undrinkable!");
			r.after = false;
			return;
		}
		wh = obj.o_which;
		bless = o_on(obj, d.ISBLESS);
		curse = o_on(obj, d.ISCURSED);
		del_pack(item);		/* get rid of it */

		/*
		* Calculate the effect it has on the poor guy.
		*/
		switch(wh) {
		case d.P_CONFUSE:
			if (!bless) {
				if (pl_on(d.ISINVINC))
					r.UI.msg("You remain level-headed.");
				else {
					chg_abil(d.WIS,-1,true);		/* confuse his mind */
					if (pl_off(d.ISHUH)) {
						r.UI.msg("Wait, what's going on here. Huh? What? Who?");
						if (pl_on(d.ISHUH))
							lengthen(unconfuse,r.rnd(8)+d.HUHDURATION);
						else
							fuse(unconfuse,true,r.rnd(8)+d.HUHDURATION);
						player.t_flags |= d.ISHUH;
					}
				}
				p_know[d.P_CONFUSE] = true;
			}
		break;
		case d.P_POISON:
			if (!bless) {
				if (pl_off(d.ISINVINC) && !iswearing(d.R_SUSTSTR) &&
				!iswearing(d.R_SUSAB)) {
					chg_abil(d.CON,-1,true);		
					chg_abil(d.STR,-(r.rnd(3)+1),true);
					r.UI.msg("You feel very sick now.");
				}
				else
					r.UI.msg("You feel momentarily sick.");
				p_know[d.P_POISON] = true;
			}
		break;
		case d.P_HEALING:
			if (!curse) {
				heal_self(4, true);
				r.UI.msg("You begin to feel better.");
				if (!iswearing(d.R_SLOW))
					notslow(false);
				sight(false);
				p_know[d.P_HEALING] = true;
			}
		break;
		case d.P_STRENGTH:
			if (!curse) {
				r.UI.msg("You feel stronger, now.  What bulging muscles!");
				chg_abil(d.STR,1,true);
				p_know[d.P_STRENGTH] = true;
			}
		break;
		case d.P_MFIND:
			/*
			* Potion of monster detection - find all monsters
			*/
			if (r.dungeon.mlist != null && !curse) {
				dispmons();
				//mpos = 0;
				r.UI.msg("You begin to sense the presence of monsters--More--");
				p_know[d.P_MFIND] = true;
				//wait_for(cw,' ');
				//msg("");		/* clear line */
			}
			else
				r.UI.msg("You have a strange feeling for a moment, then it passes.");
		break;
		case d.P_TFIND:
			/*
			* Potion of magic detection.  Show the potions and scrolls
			*/
			if (r.dungeon.lvl_obj != null && !curse) {
				let mobj; //struct linked_list *mobj;
				let tp;//struct object *tp;
				let show;
				const hw = cw;

				show = false;
				r.UI.wclear(hw);
				for (mobj = r.dungeon.lvl_obj; mobj != null; mobj = next(mobj)) {
					tp = OBJPTR(mobj);
					if (is_magic(tp)) {
						show = true;
						r.UI.mvwaddch(hw, tp.o_pos.y, tp.o_pos.x, d.MAGIC);
					}
				}
				for(titem = r.dungeon.mlist; titem != null; titem = next(titem)) {
					let pitem; //reg struct linked_list *pitem;

					th = THINGPTR(titem);
					for(pitem=th.t_pack;pitem!=null;pitem=next(pitem)) {
						if (is_magic(ldata(pitem))) {
							show = true;
							r.UI.mvwaddch(hw,th.t_pos.y, th.t_pos.x, d.MAGIC);
						}
					}
				}
				if (show) {
					r.UI.msg("You begin to sense the presence of magic.");
					//overlay(hw,cw);
					p_know[P_TFIND] = true;
					break;
				}
			}
			r.UI.msg("You have a strange feeling for a moment, then it passes.");
		break;
		case d.P_PARALYZE:
			if (!bless) {
				if (pl_on(d.ISINVINC))
					r.UI.msg("You feel numb for a moment.");
				else {
					r.UI.msg("You can't move.");
					player.t_nocmd = d.HOLDTIME;
				}
				p_know[d.P_PARALYZE] = true;
			}
		break;
		case d.P_SEEINVIS:
			if (!curse) {
				let invlen = r.roll(40,20);

				r.UI.msg(`This potion tastes like ${ms.FRUIT} juice.`);
				if (pl_off(d.CANSEE)) {
					player.t_flags |= d.CANSEE;
					fuse(unsee, true, invlen);
					light(hero);
				}
				else
					lengthen(unsee, invlen);
				sight(false);
			}
		break;
		case d.P_RAISE:
			if (!curse) {
				r.UI.msg("You suddenly feel much more skillful.");
				p_know[d.P_RAISE] = true;
				chg_abil(d.DEX,1,true);
				chg_abil(d.WIS,1,true);
				chg_abil(d.CON,1,true);
				raise_level();
			}
		break;
		case d.P_XHEAL:
			if (!curse) {
				heal_self(8, true);
				if (r.rnd(100) < 50)
					chg_abil(d.CON,1,true);
				r.UI.msg("You begin to feel much better.");
				p_know[d.P_XHEAL] = true;
				if (!iswearing(d.R_SLOW))
					notslow(false);
				unconfuse();
				extinguish(unconfuse);
				sight(false);
			}
		break;
		case d.P_HASTE:
			if (!curse) {
				add_haste(true);
				r.UI.msg("You feel yourself moving much faster.");
				p_know[d.P_HASTE] = true;
			}
		break;
		case d.P_INVINC:
			if (!curse) {
				let time = r.rnd(400) + 350;

				r.UI.msg("You feel invincible.");
				if (player.t_flags & d.ISINVINC)
					lengthen(notinvinc,time);
				else
					fuse(notinvinc,true,time);
				player.t_flags |= d.ISINVINC;
				p_know[d.P_INVINC] = true;
			}
		break;
		case d.P_SMART:
			if (!curse) {
				r.UI.msg("You feel more perceptive.");
				p_know[P_SMART] = true;
				chg_abil(d.WIS,1,true);
			}
		break;
		case d.P_RESTORE:
			if (!curse) {
				r.UI.msg("Hey, this tastes great. You feel warm all over.");
				him.s_re = max_stats.s_re;
				him.s_ef = max_stats.s_re;
				ringabil();				/* add in rings */
				updpack();				/* update weight */
				p_know[d.P_RESTORE] = true;
				extinguish(rchg_str);	/* kill restore in from ulodyte */

				r.player.set_him(him);
			}
		break;
		case d.P_BLIND:
			if (!bless) {
				if (pl_on(d.ISINVINC))
					r.UI.msg("The light dims for a moment.");
				else {
					chg_abil(d.WIS,-1,true);
					r.UI.msg("A cloak of darkness falls around you.");
					if (pl_off(d.ISBLIND)) {
						player.t_flags |= d.ISBLIND;
						fuse(sight, true, r.rnd(400) + 450);
						light(hero);
					}
				}
				p_know[d.P_BLIND] = true;
			}
		break;
		case d.P_ETH:
			if (!curse) {
				let ethlen = r.roll(40,20);

				r.UI.msg("You feel more vaporous.");
				if (pl_on(d.ISETHER))
					lengthen(noteth,ethlen);
				else
					fuse(noteth,true,ethlen);
				player.t_flags |= d.ISETHER;
				p_know[d.P_ETH] = true;
			}
		break;
		case d.P_NOP:
			r.UI.msg("This potion tastes extremely dull.");
		break;
		case d.P_DEX:
			if (!curse) {
				chg_abil(d.DEX,1,true);		/* increase dexterity */
				p_know[d.P_DEX] = true;
				r.UI.msg("You feel much more agile.");
			}
		break;
		case d.P_REGEN:
			if (!curse) {
				let reglen = r.rnd(450) + 450;

				if (pl_on(d.ISREGEN))
					lengthen(notregen, reglen);
				else
					fuse(notregen, true, reglen);
				player.t_flags |= d.ISREGEN;
				r.UI.msg("You feel yourself improved.");
				p_know[d.P_REGEN] = true;
			}
		break;
		case d.P_DECREP:
		case d.P_SUPHERO: {
			let howmuch = r.rnd(3) + 1;

			if (wh == d.P_DECREP) {
				if (!bless) {
					if (iswearing(d.R_SUSAB) || pl_on(d.ISINVINC)) {
						r.UI.msg("You feel momentarily woozy.");
						howmuch = 0;
					}
					else {
						r.UI.msg("You feel crippled.");
						howmuch = -howmuch;
						if (!iswearing(d.R_SUSTSTR))
							chg_abil(d.STR,howmuch,true);
					}
				}
				else
					howmuch = 0;
			}
			else {			/* potion of superhero */
				if (curse)
					howmuch = 0;
				r.UI.msg("You feel invigorated.");
				chg_abil(d.STR,howmuch,true);
			}
			chg_abil(d.CON,howmuch,true);
			chg_abil(d.DEX,howmuch,true);
			chg_abil(d.WIS,howmuch,true);		/* change abilities */
			p_know[wh] = true;
		}
		break;
		default:
			r.UI.msg("What an odd tasting potion!");
			return;
		}
		r.nochange = false;

		r.player.set_player(player);
		/*
		if (p_know[wh] && p_guess[wh]) {
			//free(p_guess[wh]);
			p_guess[wh] = null;
		}
		else if(!p_know[wh] && p_guess[wh] == null) {
			buf = p_colors[wh];
			r.UI.msg(callit);
			if (get_str(buf, cw) == d.NORM) {
				//p_guess[wh] = new(strlen(buf) + 1);
				p_guess[wh] = buf;
			}
		}
		*/
	}
}