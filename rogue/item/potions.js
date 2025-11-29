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

	/*
	* quaff:
	*	Let the hero drink a potion
	*/
	this.quaff = function()
	{
		reg struct object *obj;
		reg struct linked_list *item, *titem;
		reg struct thing *th;
		reg int wh;
		char buf[LINLEN];
		bool bless, curse;

		/*
		* Make certain that it is somethings that we want to drink
		*/
		if ((item = get_item("quaff", POTION)) == null)
			return;
		obj = OBJPTR(item);
		if (obj.o_type != POTION) {
			msg("That's undrinkable!");
			after = false;
			return;
		}
		wh = obj.o_which;
		bless = o_on(obj, ISBLESS);
		curse = o_on(obj, ISCURSED);
		del_pack(item);		/* get rid of it */

		/*
		* Calculate the effect it has on the poor guy.
		*/
		switch(wh) {
		case P_CONFUSE:
			if (!bless) {
				if (pl_on(ISINVINC))
					msg("You remain level-headed.");
				else {
					chg_abil(WIS,-1,true);		/* confuse his mind */
					if (pl_off(ISHUH)) {
						msg("Wait, what's going on here. Huh? What? Who?");
						if (pl_on(ISHUH))
							lengthen(unconfuse,rnd(8)+HUHDURATION);
						else
							fuse(unconfuse,true,rnd(8)+HUHDURATION);
						player.t_flags |= ISHUH;
					}
				}
				p_know[P_CONFUSE] = true;
			}
		break;case P_POISON:
			if (!bless) {
				if (pl_off(ISINVINC) && !iswearing(R_SUSTSTR) &&
				!iswearing(R_SUSAB)) {
					chg_abil(CON,-1,true);		
					chg_abil(STR,-(rnd(3)+1),true);
					msg("You feel very sick now.");
				}
				else
					msg("You feel momentarily sick.");
				p_know[P_POISON] = true;
			}
		break;case P_HEALING:
			if (!curse) {
				heal_self(4, true);
				msg("You begin to feel better.");
				if (!iswearing(R_SLOW))
					notslow(false);
				sight(false);
				p_know[P_HEALING] = true;
			}
		break;case P_STRENGTH:
			if (!curse) {
				msg("You feel stronger, now.  What bulging muscles!");
				chg_abil(STR,1,true);
				p_know[P_STRENGTH] = true;
			}
		break;case P_MFIND:
			/*
			* Potion of monster detection - find all monsters
			*/
			if (mlist != null && !curse) {
				dispmons();
				mpos = 0;
				msg("You begin to sense the presence of monsters--More--");
				p_know[P_MFIND] = true;
				wait_for(cw,' ');
				msg("");		/* clear line */
			}
			else
				msg("You have a strange feeling for a moment, then it passes.");
		break;case P_TFIND:
			/*
			* Potion of magic detection.  Show the potions and scrolls
			*/
			if (lvl_obj != null && !curse) {
				struct linked_list *mobj;
				struct object *tp;
				bool show;

				show = false;
				wclear(hw);
				for (mobj = lvl_obj; mobj != null; mobj = next(mobj)) {
					tp = OBJPTR(mobj);
					if (is_magic(tp)) {
						show = true;
						mvwaddch(hw, tp.o_pos.y, tp.o_pos.x, MAGIC);
					}
				}
				for(titem = mlist; titem != null; titem = next(titem)) {
					reg struct linked_list *pitem;

					th = THINGPTR(titem);
					for(pitem=th.t_pack;pitem!=null;pitem=next(pitem)) {
						if (is_magic(ldata(pitem))) {
							show = true;
							mvwaddch(hw,th.t_pos.y, th.t_pos.x, MAGIC);
						}
					}
				}
				if (show) {
					msg("You begin to sense the presence of magic.");
					overlay(hw,cw);
					p_know[P_TFIND] = true;
					break;
				}
			}
			msg("You have a strange feeling for a moment, then it passes.");
		break;case P_PARALYZE:
			if (!bless) {
				if (pl_on(ISINVINC))
					msg("You feel numb for a moment.");
				else {
					msg("You can't move.");
					player.t_nocmd = HOLDTIME;
				}
				p_know[P_PARALYZE] = true;
			}
		break;case P_SEEINVIS:
			if (!curse) {
				int invlen = roll(40,20);

				msg("This potion tastes like %s juice.", fruit);
				if (pl_off(CANSEE)) {
					player.t_flags |= CANSEE;
					fuse(unsee, true, invlen);
					light(&hero);
				}
				else
					lengthen(unsee, invlen);
				sight(false);
			}
		break;case P_RAISE:
			if (!curse) {
				msg("You suddenly feel much more skillful.");
				p_know[P_RAISE] = true;
				chg_abil(DEX,1,true);
				chg_abil(WIS,1,true);
				chg_abil(CON,1,true);
				raise_level();
			}
		break;case P_XHEAL:
			if (!curse) {
				heal_self(8, true);
				if (rnd(100) < 50)
					chg_abil(CON,1,true);
				msg("You begin to feel much better.");
				p_know[P_XHEAL] = true;
				if (!iswearing(R_SLOW))
					notslow(false);
				unconfuse();
				extinguish(unconfuse);
				sight(false);
			}
		break;case P_HASTE:
			if (!curse) {
				add_haste(true);
				msg("You feel yourself moving much faster.");
				p_know[P_HASTE] = true;
			}
		break;case P_INVINC:
			if (!curse) {
				int time = rnd(400) + 350;

				msg("You feel invincible.");
				if (player.t_flags & ISINVINC)
					lengthen(notinvinc,time);
				else
					fuse(notinvinc,true,time);
				player.t_flags |= ISINVINC;
				p_know[P_INVINC] = true;
			}
		break;case P_SMART:
			if (!curse) {
				msg("You feel more perceptive.");
				p_know[P_SMART] = true;
				chg_abil(WIS,1,true);
			}
		break;case P_RESTORE:
			if (!curse) {
				msg("Hey, this tastes great. You feel warm all over.");
				him.s_re = max_stats.s_re;
				him.s_ef = max_stats.s_re;
				ringabil();				/* add in rings */
				updpack();				/* update weight */
				p_know[P_RESTORE] = true;
				extinguish(rchg_str);	/* kill restore in from ulodyte */
			}
		break;case P_BLIND:
			if (!bless) {
				if (pl_on(ISINVINC))
					msg("The light dims for a moment.");
				else {
					chg_abil(WIS,-1,true);
					msg("A cloak of darkness falls around you.");
					if (pl_off(ISBLIND)) {
						player.t_flags |= ISBLIND;
						fuse(sight, true, rnd(400) + 450);
						light(&hero);
					}
				}
				p_know[P_BLIND] = true;
			}
		break;case P_ETH:
			if (!curse) {
				int ethlen = roll(40,20);

				msg("You feel more vaporous.");
				if (pl_on(ISETHER))
					lengthen(noteth,ethlen);
				else
					fuse(noteth,true,ethlen);
				player.t_flags |= ISETHER;
				p_know[P_ETH] = true;
			}
		break;case P_NOP:
			msg("This potion tastes extremely dull.");
		break;case P_DEX:
			if (!curse) {
				chg_abil(DEX,1,true);		/* increase dexterity */
				p_know[P_DEX] = true;
				msg("You feel much more agile.");
			}
		break;case P_REGEN:
			if (!curse) {
				int reglen = rnd(450) + 450;

				if (pl_on(ISREGEN))
					lengthen(notregen, reglen);
				else
					fuse(notregen, true, reglen);
				player.t_flags |= ISREGEN;
				msg("You feel yourself improved.");
				p_know[P_REGEN] = true;
			}
		break;case P_DECREP:
		case P_SUPHERO: {
			int howmuch = rnd(3) + 1;

			if (wh == P_DECREP) {
				if (!bless) {
					if (iswearing(R_SUSAB) || pl_on(ISINVINC)) {
						msg("You feel momentarily woozy.");
						howmuch = 0;
					}
					else {
						msg("You feel crippled.");
						howmuch = -howmuch;
						if (!iswearing(R_SUSTSTR))
							chg_abil(STR,howmuch,true);
					}
				}
				else
					howmuch = 0;
			}
			else {			/* potion of superhero */
				if (curse)
					howmuch = 0;
				msg("You feel invigorated.");
				chg_abil(STR,howmuch,true);
			}
			chg_abil(CON,howmuch,true);
			chg_abil(DEX,howmuch,true);
			chg_abil(WIS,howmuch,true);		/* change abilities */
			p_know[wh] = true;
		}
		break;default:
			msg("What an odd tasting potion!");
			return;
		}
		nochange = false;
		if (p_know[wh] && p_guess[wh]) {
			free(p_guess[wh]);
			p_guess[wh] = null;
		}
		else if(!p_know[wh] && p_guess[wh] == null) {
			strcpy(buf, p_colors[wh]);
			msg(callit);
			if (get_str(buf, cw) == NORM) {
				p_guess[wh] = new(strlen(buf) + 1);
				strcpy(p_guess[wh], buf);
			}
		}
	}
}