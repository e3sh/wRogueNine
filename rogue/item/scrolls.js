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

	/*
	* read_scroll:
	*	Let the hero read a scroll
	*/
	this.read_scroll = function()
	{
		reg struct object *obj;
		reg struct linked_list *item;
		reg int i, j, wh;
		reg char ch, nch;
		struct room *rp;
		struct linked_list *titem;
		char buf[LINLEN];
		bool bless, curse;

		if ((item = get_item("read", SCROLL)) == null)
			return;
		obj = OBJPTR(item);
		if (obj.o_type != SCROLL) {
			msg("Nothing to read.");
			after = false;
			return;
		}
		msg("As you read the scroll, it vanishes.");
		wh = obj.o_which;
		bless = o_on(obj, ISBLESS);
		curse = o_on(obj, ISCURSED);
		del_pack(item);		/* Get rid of the thing */

		/*
		* Calculate the effect it has on the hero
		*/
		switch(wh) {
		case S_KNOWALL:
			if (!curse) {
				idenpack();				/* identify all the pack */
				msg("You feel more knowledgable.");
				chg_abil(WIS,1,true);
				s_know[S_KNOWALL] = true;
			}
		break;case S_CONFUSE:
			if (!curse) {
				/*
				* Scroll of monster confusion.  Give him that power.
				*/
				msg("Your hands begin to glow red.");
				player.t_flags |= CANHUH;
				s_know[S_CONFUSE] = true;
			}
		break;case S_LIGHT:
			rp = player.t_room;
			if (!curse) {
				if (rp == null) {
					s_know[S_LIGHT] = true;
					msg("The corridor glows and then fades.");
				}
				else {
					if (rf_on(rp,ISDARK)) {
						s_know[S_LIGHT] = true;
						msg("The room is lit.");
						rp.r_flags &= ~ISDARK;
					}
					light(&hero);
					mvwaddch(cw, hero.y, hero.x, PLAYER);
				}
			}
		break;case S_ARMOR:
			if (!curse) {
				if (cur_armor != null && o_off(cur_armor,ISPROT)) {
					s_know[S_ARMOR] = true;
					msg("Your armor glows faintly for a moment.");
					if (o_on(cur_armor,ISCURSED))
						cur_armor.o_ac = armors[cur_armor.o_which].a_class;
					else
						cur_armor.o_ac--;
					resoflg(cur_armor,ISCURSED);
				}
			}
		break;case S_HOLD:
			if (!curse) {
				/*
				* Hold monster scroll.  Stop all monsters within 3 spaces
				* from chasing after the hero.
				*/
				reg int x,y;
				reg struct linked_list *mon;

				for (x = hero.x - 3; x <= hero.x + 3; x++) {
					for (y = hero.y - 3; y <= hero.y + 3; y++) {
						if (y > 0 && x > 0 && isalpha(mvwinch(mw, y, x))) {
							if ((mon = find_mons(y, x)) != null) {
								reg struct thing *th;

								th = THINGPTR(mon);
								th.t_flags &= ~ISRUN;
								th.t_flags |= ISHELD;
								th.t_flags |= ISSTUCK;
							}
						}
					}
				}
			}
		break;case S_SLEEP:
			/*
			* Scroll which makes you fall asleep
			*/
			if (!bless) {
				s_know[S_SLEEP] = true;
				msg("You fall asleep.");
				player.t_nocmd += 4 + rnd(SLEEPTIME);
			}
		break;case S_CREATE:
			if (!bless) {
				if (makemons(mtlev[rnd(levcount)].m_show))
					s_know[S_CREATE] = true;
				else
					msg("You hear a faint cry of anguish in the distance.");
			}
		break;case S_IDENT:
			if (!curse) {
				msg("This scroll is an identify scroll");
				s_know[S_IDENT] = true;
				whatis(null);
			}
		break;case S_MAP:
			if (curse)
				break;
			s_know[S_MAP] = true;
			addmsg("Oh, now this scroll has a ");
			if (rnd(100) < 10 || bless) {
				addmsg("very detailed map on it.");
				endmsg();
				displevl();
			}
			else {
				addmsg("map on it.");
				endmsg();
				overwrite(stdscr, hw);
				for (i = 1; i < LINES - 2; i++) {
					for (j = 0; j < COLS; j++) {
						switch (nch = ch = mvwinch(hw, i, j)) {
							case SECRETDOOR:
								nch = DOOR;
								mvaddch(i, j, nch);
							case '-':
							case '|':
							case DOOR:
							case PASSAGE:
							case ' ':
							case STAIRS:
								if (mvwinch(mw, i, j) != ' ') {
									struct thing *it;
									struct linked_list *blah;

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
						if (nch != ch)
							waddch(hw, nch);
					}
				}
				overlay(cw, hw);
				overwrite(hw, cw);
			}
		break;case S_GFIND:
			if (!curse) {
				int gtotal = 0;
				struct room *rp;

				wclear(hw);
				for (rp = rooms; rp < &rooms[MAXROOMS]; rp++) {
					gtotal += rp.r_goldval;
					if (rp.r_goldval != 0 &&
					mvinch(rp.r_gold.y,rp.r_gold.x) == GOLD)
						mvwaddch(hw,rp.r_gold.y,rp.r_gold.x,GOLD);
				}
				if (gtotal) {
					s_know[S_GFIND] = true;
					msg("You begin to feel greedy and sense gold.");
					overlay(hw,cw);
				}
				else
					msg("You begin to feel a pull downward.");
			}
		break;case S_TELEP:
			if (!curse) {
				int rm;
				struct room *cur_room;

				cur_room = player.t_room;
				rm = teleport(rndspot, &player);
				if (cur_room != &rooms[rm])
					s_know[S_TELEP] = true;
			}
		break;case S_ENCH:
			if (!curse) {
				if (cur_weapon == null || (cur_weapon != null &&
				(o_on(cur_weapon,ISPROT) || cur_weapon.o_type != WEAPON)))
					msg("You feel a strange sense of loss.");
				else {
					s_know[S_ENCH] = true;
					if (o_on(cur_weapon,ISCURSED)) {
						resoflg(cur_weapon,ISCURSED);
						cur_weapon.o_hplus = rnd(2);
						cur_weapon.o_dplus = rnd(2);
					}
					else {		/* weapon was not cursed here */
						if (rnd(100) < 50)
							cur_weapon.o_hplus += 1;
						else
							cur_weapon.o_dplus += 1;
					}
					setoflg(cur_weapon, ISKNOW);
					msg("Your %s glows blue for a moment.",
					w_magic[cur_weapon.o_which].mi_name);
				}
			}
		break;case S_SCARE:
			/*
			* A monster will refuse to step on a scare monster scroll
			* if it is dropped.  Thus reading it is a mistake and produces
			* laughter at the poor rogue's boo boo.
			*/
			msg("You hear maniacal laughter in the distance.");
		break;case S_REMOVE:
			if (!curse) {
				if (cur_armor != null && o_off(cur_armor,ISPROT))
					resoflg(cur_armor,ISCURSED);
				if (cur_weapon != null && o_off(cur_weapon,ISPROT))
					resoflg(cur_weapon,ISCURSED);
				if (cur_ring[LEFT]!=null && o_off(cur_ring[LEFT],ISPROT))
					resoflg(cur_ring[LEFT],ISCURSED);
				if (cur_ring[RIGHT]!=null && o_off(cur_ring[RIGHT],ISPROT))
					resoflg(cur_ring[RIGHT],ISCURSED);
				msg("You feel as if somebody is watching over you.");
				s_know[S_REMOVE] = true;
			}
		break;case S_AGGR:
			if (!bless) {
				if (mlist != null) {
					aggravate();
					msg("You hear a high pitched humming noise.");
					s_know[S_AGGR] = true;
				}
			}
		break;case S_NOP:
			msg("This scroll seems to be blank.");
		break;case S_GENOCIDE:
			if (!curse) {
				msg("You have been granted the boon of genocide.");
				genocide();
				s_know[S_GENOCIDE] = true;
			}
		break;case S_DCURSE:
			if (!bless) {
				struct linked_list *ll;
				struct object *lb;

				msg("Your pack shudders.");
				for (ll = pack ; ll != null ; ll = next(ll)) {
					lb = OBJPTR(ll);
					if (o_off(lb,ISPROT)) {
						resoflg(lb, ISBLESS);
						setoflg(lb, ISCURSED);
					}
				}
			}
		break;case S_DLEVEL:
			if (!bless) {
				int much = rnd(9) - 4;

				if (much != 0) {
					level += much;
					if (level < 1)
						level = 1;
					mpos = 0;
					new_level(NORMLEV);		/* change levels */
					msg("You are whisked away to another region.");
					s_know[S_DLEVEL] = true;
				}
			}
		break;case S_PROTECT:
			if (!curse) {
				struct linked_list *ll;
				struct object *lb;

				msg("You are granted the power of protection.");
				if ((ll = get_item("protect",0)) != null) {
					lb = OBJPTR(ll);
					setoflg(lb,ISPROT);
					mpos = 0;
					msg("Protected %s.",inv_name(lb,true));
				}
				s_know[S_PROTECT] = true;
			}
		break;case S_ALLENCH:
			if (!curse) {
				struct linked_list *ll;
				struct object *lb;
				int howmuch, ac, good;

				msg("You are granted the power of enchantment.");
				good = true;
				if ((ll = get_item("enchant",0)) != null) {
					lb = OBJPTR(ll);
					resoflg(lb,ISCURSED);
					resoflg(lb,ISPROT);
					howmuch = rnd(3) + 1;
					switch(lb.o_type) {
						case RING:
							if (lb.o_ac < 0)
								lb.o_ac = 0;
							lb.o_ac += howmuch;
						break;case ARMOR:
							ac = armors[lb.o_which].a_class;
							if (lb.o_ac > ac)
								lb.o_ac = ac;
							lb.o_ac -= howmuch;
						break;case STICK:
							lb.o_charges += howmuch + 10;
						break;case WEAPON:
							if (lb.o_dplus < 0)
								lb.o_dplus = 0;
							if (lb.o_hplus < 0)
								lb.o_hplus = 0;
							lb.o_hplus += howmuch;
							lb.o_dplus += howmuch;
						break;default:
							msg("You are injured as the scroll flashes & bursts into flames !!!");
							chg_hpt(-roll(6,6),false,K_SCROLL);
							good = false;
					}
					if (good) {
						mpos = 0;
						msg("Enchanted %s.",inv_name(lb,true));
					}
				}
				s_know[S_ALLENCH] = true;
			}
		break;case S_BLESS:
			if (!curse) {
				struct linked_list *ll;
				struct object *lb;

				msg("Your pack glistens brightly.");
				for (ll = pack ; ll != null ; ll = next(ll)) {
					whatis(ll);
					lb = OBJPTR(ll);
					resoflg(lb,ISCURSED);
					setoflg(lb,ISBLESS);
				}
			}
		break;case S_MAKEIT:
			if (!curse) {
				msg("You have been endowed with the power of creation.");
				s_know[S_MAKEIT] = true;
				create_obj(true);
			}
		break;case S_BAN: {
			int howdeep;
			char *ptr;

			if (bless) {
				if (level > 6) {
					howdeep = 1 + rnd(5);
					ptr = "elevated to the upper";
				}
				else {
					howdeep = -1;
					bless = false;
				}
			}
			else {
				howdeep = level + 10 + rnd(20) + (curse * 20);
				ptr = "banished to the lower";
			}
			if ((!bless && level < howdeep) || bless) {
				level = howdeep;
				new_level(NORMLEV);
				mpos = 0;
				msg("You are %s regions.", ptr);
				s_know[S_BAN] = true;
			}
		}
		break;case S_CWAND:
			if (!curse) {
				struct linked_list *ll;
				struct object *lb;
				bool wands = false;

				for (ll = pack ; ll != null ; ll = next(ll)) {
					lb = OBJPTR(ll);
					if (lb.o_type == STICK) {
						whatis(ll);
						setoflg(lb, ISKNOW);
						resoflg(lb, ISCURSED);
						lb.o_charges += rnd(11) + 5;
						wands = true;
					}
				}
				if (wands) {
					msg("Your sticks gleam.");
					s_know[wh] = true;
				}
			}
		break;case S_LOCTRAP: {
			struct trap *trp;

			if (ntraps > 0) {
				for (trp = &traps[0]; trp < &traps[ntraps]; trp++)
					trp.tr_flags |= ISFOUND;
				look(false);
				msg("You now recognize pitfalls.");
				s_know[S_LOCTRAP] = true;
			}
		}
		break;default:
			msg("What a puzzling scroll!");
			return;
		}
		look(true);
		nochange = false;
		if (s_know[wh] && s_guess[wh]) {
			free(s_guess[wh]);
			s_guess[wh] = null;
		}
		else if (!s_know[wh] && s_guess[wh] == null) {
			strcpy(buf, s_names[wh]);
			msg(callit);
			if (get_str(buf, cw) == NORM) {
				s_guess[wh] = new(strlen(buf) + 1);
				strcpy(s_guess[wh], buf);
			}
		}
	}
}