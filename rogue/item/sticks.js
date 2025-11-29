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

	/*
	* fix_stick:
	*	Init a stick for the hero
	*/
	this.fix_stick = function(cur)
	//struct object *cur;
	{
		struct rod *rd;

		cur.o_type = STICK;
		cur.o_charges = 4 + rnd(5);
		strcpy(cur.o_hurldmg, "1d1");
		rd = &ws_stuff[cur.o_which];
		cur.o_weight = rd.ws_wght;
		cur.o_vol = rd.ws_vol;
		if (strcmp(rd.ws_type, "staff") == 0) {
			strcpy(cur.o_damage, "2d3");
			cur.o_charges += rnd(5) + 3;
		}
		else {
			strcpy(cur.o_damage, "1d1");
		}
		switch (cur.o_which) {
			case WS_HIT:
				if(rnd(100) < 15) {
					cur.o_hplus = 9;
					cur.o_dplus = 9;
					strcpy(cur.o_damage,"3d8");
				}
				else {
					cur.o_hplus = 3;
					cur.o_dplus = 3;
					strcpy(cur.o_damage,"1d8");
				}
			break;case WS_LIGHT:
				cur.o_charges += 7 + rnd(9);
		}
	}

	/*
	* do_zap:
	*	Zap a stick at something
	*/
	this.do_zap = function(gotdir)
	//bool gotdir;
	{
		reg struct linked_list *item;
		reg struct object *obj;
		reg struct thing *tp;
		reg int y, x, wh;
		struct room *rp;
		bool bless, curse;
		int better = 0;

		if ((item = get_item("zap with", STICK)) == null)
			return;
		obj = OBJPTR(item);
		wh = obj.o_which;
		bless = o_on(obj, ISBLESS);
		curse = o_on(obj, ISCURSED);
		if (obj.o_type != STICK) {
			msg("You can't zap with that!");
			after = false;
			return;
		}
		if (obj.o_charges == 0) {
			msg("Nothing happens.");
			return;
		}
		if (!gotdir)
		do {
			delta.y = rnd(3) - 1;
			delta.x = rnd(3) - 1;
		} while (delta.y == 0 && delta.x == 0);
		rp = player.t_room;
		if (bless)
			better = 3;
		else if (curse)
			better = -3;
		switch (wh) {
		case WS_SAPLIFE:
			if (!bless) {
				if (him.s_hpt > 1)
				him.s_hpt /= 2;	/* zap half his hit points */
			}
		break;case WS_CURE:
			if (!curse) {
				ws_know[WS_CURE] = true;
				heal_self(6, false);
				unconfuse(false);
				notslow(false);
				sight(false);
			}
		break;case WS_PYRO:
			if (!bless) {
				msg("The rod explodes !!!");
				chg_hpt(-roll(6,6), false, K_ROD);
				ws_know[WS_PYRO] = true;
				del_pack(item);		/* throw it away */
			}
		break;case WS_HUNGER:
			if (!bless) {
				struct linked_list *ip;
				struct object *lb;

				food_left /= 3;
				if ((ip = pack) != null) {
					lb = OBJPTR(ip);
					if (lb.o_type == FOOD) {
						if ((lb.o_count -= roll(1,4)) < 1)
							del_pack(ip);
					}
				}
			}
		break;case WS_PARZ:
		case WS_MREG:
		case WS_MDEG:
		case WS_ANNIH: {
			struct linked_list *mitem;
			struct thing *it;
			reg int i,j;

			for (i = hero.y - 3; i <= hero.y + 3; i++) {
				for (j = hero.x - 3; j <= hero.x + 3; j++) {
					if (!cordok(i, j))
						continue;
					if (isalpha(mvwinch(mw,i,j))) {
						mitem = find_mons(i, j);
						if (mitem == null)
							continue;
						it = THINGPTR(mitem);
						switch(wh) {
							case WS_ANNIH:
								if (!curse)
									killed(mitem,false);
							break;case WS_MREG:
								if (!bless)
									it.t_stats.s_hpt *= 2;
							break;case WS_MDEG:
								if (!curse) {
									it.t_stats.s_hpt /= 2;
									if (it.t_stats.s_hpt < 2)
										killed(mitem,false);
								}
							break;case WS_PARZ:
								if (!curse) {
									it.t_flags |= ISPARA;
									it.t_flags &= ~ISRUN;
								}
							}
						}
					}
				}
			}
		break;case WS_LIGHT:
			if (!curse) {
				ws_know[WS_LIGHT] = true;
				if (rp == null)
					msg("The corridor glows and then fades.");
				else {
					msg("The room is lit.");
					rp.r_flags &= ~ISDARK;
					light(&hero);
					mvwaddch(cw, hero.y, hero.x, PLAYER);
				}
			}
		break;case WS_DRAIN:
			/*
			* Take away 1/2 of hero's hit points, then take it away
			* evenly from the monsters in the room (or next to hero
			* if he is in a passage)
			*/
			if (him.s_hpt < 2) {
				msg("You are too weak to use it.");
				return;
			}
			else if (!curse) {
				if (rp == null)
					drain(hero.y-1, hero.y+1, hero.x-1, hero.x+1);
				else
					drain(rp.r_pos.y, rp.r_pos.y+rp.r_max.y,
					rp.r_pos.x, rp.r_pos.x+rp.r_max.x);
			}
		break;case WS_POLYM:
		case WS_TELAWAY:
		case WS_TELTO:
		case WS_CANCEL:
		case WS_MINVIS:
		{
			reg char monster, oldch;

			y = hero.y;
			x = hero.x;
			do {
				y += delta.y;
				x += delta.x;
			} while (step_ok(winat(y, x)));
			if (isalpha(monster = mvwinch(mw, y, x))) {
				int omonst;

				if (wh != WS_MINVIS)
					unhold(monster);
				item = find_mons(y, x);
				if (item == null)
					break;
				tp = THINGPTR(item);
				omonst = tp.t_indx;
				if (wh == WS_POLYM && !curse) {
					r.dungeon.mlist = r.detach(r.dungeon.mlist, item);
					r.discard(item);
					oldch = tp.t_oldch;
					delta.y = y;
					delta.x = x;
					monster = rnd_mon(false, true);
					item = new_monster(monster, &delta, false);
					if (!(tp.t_flags & ISRUN))
						runto(&delta, &hero);
					if (isalpha(mvwinch(cw, y, x)))
						mvwaddch(cw, y, x, monsters[monster].m_show);
					tp.t_oldch = oldch;
					ws_know[WS_POLYM] |= (monster != omonst);
				}
				else if (wh == WS_MINVIS && !bless) {
					tp.t_flags |= ISINVIS;
					mvwaddch(cw,y,x,tp.t_oldch);	/* hide em */
					runto(&tp.t_pos, &hero);
				}
				else if (wh == WS_CANCEL && !curse) {
					tp.t_flags |= ISCANC;
					tp.t_flags &= ~ISINVIS;
				}
				else {
					if (wh == WS_TELAWAY) {
						if (curse)
							break;
						tp.t_pos = *rnd_pos(&rooms[rnd_room()]);
					}
					else {					/* WS_TELTO */
						if (bless)
							break;
						tp.t_pos.y = hero.y + delta.y;
						tp.t_pos.x = hero.x + delta.x;
					}
					if (isalpha(mvwinch(cw, y, x)))
						mvwaddch(cw, y, x, tp.t_oldch);
					tp.t_dest = &hero;
					tp.t_flags |= ISRUN;
					mvwaddch(mw, y, x, ' ');
					mvwaddch(mw, tp.t_pos.y, tp.t_pos.x, monster);
					tp.t_oldch = mvwinch(cw,tp.t_pos.y,tp.t_pos.x);
				}
			}
		}
		break;case WS_MISSILE:
		{
			struct coord *whe;
			static struct object bolt = {
				{0, 0}, "", "6d6", "", '*', 0, 0, 1000, 0, 0, 0, 0, 0, 0,
			};

			if (curse)
				strcpy(bolt.o_hurldmg,"3d3");
			else if (bless)
				strcpy(bolt.o_hurldmg,"9d9");
			ws_know[WS_MISSILE] = true;
			do_motion(&bolt, delta.y, delta.x);
			whe = &bolt.o_pos;
			if (isalpha(mvwinch(mw, whe.y, whe.x))) {
				struct linked_list *it;

				runto(whe, &hero);
				it = find_mons(whe.y, whe.x);
				if (it != null) {
					if (!save_throw(VS_MAGIC + better, THINGPTR(it))) {
						hit_monster(whe, &bolt);
						break;
					}
				}
			}
			msg("Missle vanishes.");
		}
		break;case WS_NOP:
			msg("Your %s flickers momentarily and then fades",
				ws_stuff[wh].ws_type);
		break;case WS_HIT: {
			char ch;

			delta.y += hero.y;
			delta.x += hero.x;
			ch = winat(delta.y, delta.x);
			if (curse) {				/* decrease for cursed */
				strcpy(obj.o_damage,"1d1");
				obj.o_hplus = obj.o_dplus = 0;
			}
			else if (bless) {			/* increase for blessed */
				strcpy(obj.o_damage,"5d8");
				obj.o_hplus = obj.o_dplus = 12;
			}
			if (isalpha(ch))
				fight(&delta, obj, false);
		}
		break;case WS_HASTE_M:
		case WS_CONFMON:
		case WS_SLOW_M:
		case WS_MOREMON: {
			reg int m1,m2;
			struct coord mp;
			struct linked_list *titem;

			y = hero.y;
			x = hero.x;
			do {
				y += delta.y;
				x += delta.x;
			} while (step_ok(winat(y, x)));
			if (isalpha(mvwinch(mw, y, x))) {
				item = find_mons(y, x);
				if (item == null)
					break;
				tp = THINGPTR(item);
				if (wh == WS_HASTE_M && !bless) {			/* haste it */
					if (on(*tp, ISSLOW))
						tp.t_flags &= ~ISSLOW;
					else
						tp.t_flags |= ISHASTE;
				}
				else if (wh == WS_CONFMON && !curse) {		/* confuse it */
					tp.t_flags |= ISHUH;
					if (pl_on(ISHELD) && tp.t_type == 'd')
						player.t_flags &= ~ISHELD;
				}
				else if (wh == WS_SLOW_M && !curse) {		/* slow it */
					if (on(*tp, ISHASTE))
						tp.t_flags &= ~ISHASTE;
					else
						tp.t_flags |= ISSLOW;
					tp.t_turn = true;
				}
				else if (!bless) {	/* WS_MOREMON: multiply it */
					char ch;
					struct thing *th;

					for (m1 = tp.t_pos.x-1; m1 <= tp.t_pos.x+1; m1++) {
						for(m2 = tp.t_pos.y-1; m2 <= tp.t_pos.y+1; m2++) {
							if (hero.x == m1 && hero.y == m2)
								continue;
							ch = winat(m2,m1);
							if (step_ok(ch)) {
								mp.x = m1;			/* create it */
								mp.y = m2;
								titem = new_monster(tp.t_indx, &mp, false);
								th = THINGPTR(titem);
								th.t_flags |= ISMEAN;
								runto(&mp, &hero);
							}
						}
					}
				}
				delta.y = y;
				delta.x = x;
				runto(&delta, &hero);
			}
		}
		break;case WS_ELECT:
		case WS_FIRE:
		case WS_COLD: {
			reg char dirch, ch, *name;
			reg bool bounced, used;
			int boingcnt, boltlen;
			struct coord pos;
			struct coord spotpos[BOLT_LENGTH * 2];
			static struct object bolt =	{
				{0, 0}, "", "6d6", "", '*', 0, 0, 1000, 0, 0, 0, 0, 0, 0,
			};

			boltlen = BOLT_LENGTH;
			if (curse) {
				strcpy(bolt.o_hurldmg,"3d3");
				boltlen -= 3;
			}
			else if (bless) {
				strcpy(bolt.o_hurldmg,"9d9");
				boltlen += 3;
			}
			switch (delta.y + delta.x) {
				case 0: dirch = '/';
				break;case 1: case -1: dirch = (delta.y == 0 ? '-' : '|');
				break;case 2: case -2: dirch = '\\';
			}
			pos = hero;
			bounced = false;
			boingcnt = 0;
			used = false;
			if (wh == WS_ELECT)
				name = "bolt";
			else if (wh == WS_FIRE)
				name = "flame";
			else
				name = "ice";
			for (y = 0; y < boltlen && !used; y++) {
				ch = winat(pos.y, pos.x);
				spotpos[y] = pos;
				switch (ch) {
					case SECRETDOOR:
					case '|':
					case '-':
					case ' ':
						bounced = true;
						if (++boingcnt > 6) 
							used = true;	/* only so many bounces */
						delta.y = -delta.y;
						delta.x = -delta.x;
						y--;
						msg("The bolt bounces");
						break;
					default:
						if (isalpha(ch)) {
							struct linked_list *it;

							it = find_mons(pos.y, pos.x);
							runto(&pos, &hero);
							if (it != null) {
								if (!save_throw(VS_MAGIC+better,THINGPTR(it))) {
									bolt.o_pos = pos;
									hit_monster(&pos, &bolt);
									used = true;
								}
								else if(ch != 'M' || show(pos.y,pos.x)=='M') {
									msg("%s misses", name);
								}
							}
						}
						else if(bounced && pos.y==hero.y && pos.x==hero.x) {
							bounced = false;
							if (!save(VS_MAGIC + better)) {
								msg("The %s hits you.", name);
								chg_hpt(-roll(6, 6),false,K_BOLT);
								used = true;
							}
							else
								msg("The %s whizzes by you.", name);
						}
						mvwaddch(cw, pos.y, pos.x, dirch);
						draw(cw);
					}
					pos.y += delta.y;
					pos.x += delta.x;
				}
				for (x = 0; x < y; x++)
					mvwaddch(cw, spotpos[x].y, spotpos[x].x,
					show(spotpos[x].y, spotpos[x].x));
				ws_know[wh] = true;
			}
		break;case WS_ANTIM: {
			reg int m1, m2, x1, y1;
			struct linked_list *ll;
			struct thing *lt;
			int ch, radius;

			y1 = hero.y;
			x1 = hero.x;
			do {
				y1 += delta.y;
				x1 += delta.x;
				ch = winat(y1, x1);
			} while (ch == PASSAGE || ch == FLOOR);
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
						discard(ll);
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
						discard(ll);
						mvwaddch(mw,m2,m1,' ');
					}
					mvaddch(m2,m1,' ');
					mvwaddch(cw,m2,m1,' ');
				}
			}
			touchwin(cw);
			touchwin(mw);
			check_level();
		}
		break;default:
			msg("What a bizarre schtick!");
		}
		obj.o_charges--;
	}

	/*
	* drain:
	*	Do drain hit points from player stick
	*/
	this.drain = function(ymin, ymax, xmin, xmax)
	//int ymin, ymax, xmin, xmax;
	{
		reg int i, j, cnt;
		reg struct thing *ick;
		reg struct linked_list *item;

		/*
		* First count how many things we need to spread the hit points among
		*/
		cnt = 0;
		for (i = ymin; i <= ymax; i++)
			for (j = xmin; j <= xmax; j++)
				if (isalpha(mvwinch(mw, i, j)))
					cnt++;
		if (cnt == 0) {
			msg("You have a tingling feeling.");
			return;
		}
		cnt = him.s_hpt / cnt;
		him.s_hpt /= 2;
		/*
		* Now zot all of the monsters
		*/
		for (i = ymin; i <= ymax; i++) {
			for (j = xmin; j <= xmax; j++) {
				if(isalpha(mvwinch(mw, i, j))) {
					item = find_mons(i, j);
					if (item == null)
						continue;
					ick = THINGPTR(item);
					if ((ick.t_stats.s_hpt -= cnt) < 1)
						killed(item,cansee(i,j) && !(ick.t_flags & ISINVIS));
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
		static char buf[20];

		buf[0] = '\0';
		if (o_on(obj,ISKNOW) || o_on(obj,ISPOST))
			sprintf(buf, " [%d]", obj.o_charges);
		return buf;
	}
}