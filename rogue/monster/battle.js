/*
 * All the fighting gets done here
 *
 */

function battle(r){
	    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	/*
	* fight:
	*	The player attacks the monster.
	*/
	this.fight = function(mp, weap, thrown)
	//struct coord *mp;
	//struct object *weap;
	//bool thrown;
	{

		reg struct thing *tp;
		reg struct stats *st;
		reg struct linked_list *item;
		bool did_hit = true;

		if (pl_on(ISETHER))			/* cant fight when ethereal */
			return 0;

		if ((item = find_mons(mp.y, mp.x)) == null) {
			mvaddch(mp.y, mp.x, FLOOR);
			mvwaddch(mw, mp.y, mp.x, ' ');
			look(false);
			msg("That monster must have been an illusion.");
			return 0;
		}
		tp = THINGPTR(item);
		st = &tp.t_stats;
		/*
		* Since we are fighting, things are not quiet so
		* no healing takes place.
		*/
		quiet = 0;
		isfight = true;
		runto(mp, &hero);
		/*
		* Let him know it was really a mimic (if it was one).
		*/
		if(tp.t_type == 'M' && tp.t_disguise != 'M' && pl_off(ISBLIND)) {
			msg("Wait! That's a mimic!");
			tp.t_disguise = 'M';
			did_hit = thrown;
		}
		if (did_hit) {
			reg char *mname;

			did_hit = false;
			if (pl_on(ISBLIND))
				mname = "it";
			else
				mname = monsters[tp.t_indx].m_name;
			/*
			* If the hero can see the invisibles, then
			* make it easier to hit.
			*/
			if (pl_on(CANSEE) && on(*tp, ISINVIS) && off(*tp, WASHIT)) {
				tp.t_flags |= WASHIT;
				st.s_arm += 3;
			}
			if (roll_em(him, st, weap, thrown)) {
				did_hit = true;
				if (thrown)
					thunk(weap, mname);
				else
					hit(null);
				if (pl_on(CANHUH)) {
					msg("Your hands stop glowing red");
					msg("The %s appears confused.", mname);
					tp.t_flags |= ISHUH;
					player.t_flags &= ~CANHUH;
					/*
					* If our hero was stuck by a bone devil,
					* release him now because the devil is
					* confused.
					*/
					if (pl_on(ISHELD))
						unhold(tp.t_type);
				}
				if (st.s_hpt <= 0)
					killed(item, true);
				else if (monhurt(tp) && off(*tp, ISWOUND)) {
					if (levtype != MAZELEV && tp.t_room != null &&
					!rf_on(tp.t_room, ISTREAS)) {
						tp.t_flags |= ISWOUND;
						msg("You wounded %s.",prname(mname,false));
						unhold(tp.t_type);
					}
				}
			}
			else {
				if (thrown)
					bounce(weap, mname);
				else
					miss(null);
			}
		}
		count = 0;
		return did_hit;
	}


	/*
	* attack:
	*	The monster attacks the player
	*/
	this.attack = function(mp)
	//struct thing *mp;
	{
		reg char *mname;

		if (pl_on(ISETHER))		/* ethereal players cant be hit */
			return(0);
		if (mp.t_flags & ISPARA)	/* paralyzed monsters */
			return(0);
		running = false;
		quiet = 0;
		isfight = true;
		if (mp.t_type == 'M' && pl_off(ISBLIND))
			mp.t_disguise = 'M';
		if (pl_on(ISBLIND))
			mname = "it";
		else
			mname = monsters[mp.t_indx].m_name;
		if (roll_em(&mp.t_stats, him, null, false)) {
			if (pl_on(ISINVINC)) {
				msg("%s does not harm you.",prname(mname,true));
			}
			else {
				nochange = false;
				if (mp.t_type != 'E')
					hit(mname);
				if (him.s_hpt <= 0)
					death(mp.t_indx);
				if (off(*mp, ISCANC))
					switch (mp.t_type) {
					case 'R':
						if (hurt_armor(cur_armor)) {
							msg("Your armor weakens.");
							cur_armor.o_ac++;
						}
					break;case 'E':
					/*
					* The gaze of the floating eye hypnotizes you
					*/
						if (pl_off(ISBLIND) && player.t_nocmd <= 0) {
							player.t_nocmd = rnd(16) + 25;
							msg("You are transfixed.");
						}
					break;case 'Q':
						if (!save(VS_POISON) && !iswearing(R_SUSAB)) {
							if (him.s_ef.a_dex > MINABIL) {
								chg_abil(DEX, -1, true);
								msg("You feel less agile.");
							}
						}
					break;case 'A':
						if (!save(VS_POISON) && herostr() > MINABIL) {
							if (!iswearing(R_SUSTSTR) && !iswearing(R_SUSAB)) {
								if (levcount > 0) {
									chg_abil(STR, -1, true);
									msg("A sting has weakened you");
								}
							}
							else
								msg("Sting has no effect.");
						}
					break;case 'W':
						if (rnd(100) < 15 && !iswearing(R_SUSAB)) {
							if (him.s_exp <= 0)
								death(mp.t_indx);
							msg("You suddenly feel weaker.");
							if (--him.s_lvl == 0) {
								him.s_exp = 0;
								him.s_lvl = 1;
							}
							else
								him.s_exp = e_levels[him.s_lvl - 1] + 1;
							chg_hpt(-roll(1,10),true,mp.t_indx);
						}
					break;case 'F':
						player.t_flags |= ISHELD;
						sprintf(monsters[midx('F')].m_stats.s_dmg,"%dd1",++fung_hit);
					break;case 'L': {
						long lastpurse;
						struct linked_list *lep;

						lastpurse = purse;
						purse -= GOLDCALC;
						if (!save(VS_MAGIC))
							purse -= GOLDCALC + GOLDCALC + GOLDCALC + GOLDCALC;
						if (purse < 0)
							purse = 0;
						if (purse != lastpurse)
							msg("Your purse feels lighter.");
						lep = find_mons(mp.t_pos.y,mp.t_pos.x);
						if (lep != null)
						{
							remove_monster(&mp.t_pos, lep);
							mp = null;
						}
					}
					break;case 'N': {
						struct linked_list *steal, *list;
						struct object *sobj;
						int stworth = 0, wo;

						/*
						* Nymph's steal a magic item, look through the pack
						* and pick out one we like, namely the object worth
						* the most bucks.
						*/
						steal = null;
						for (list = pack; list != null; list = next(list)) {
							wo = get_worth(OBJPTR(list));
							if (wo > stworth) {
								stworth = wo;
								steal = list;
							}
						}
						if (steal != null) {
							sobj = OBJPTR(steal);
							if (o_off(sobj, ISPROT)) {
								struct linked_list *nym;

								nym = find_mons(mp.t_pos.y, mp.t_pos.x);
								if (nym != null)
								{
									remove_monster(&mp.t_pos, nym);
									mp = null;
								}
								msg("She stole %s!", inv_name(sobj, true));
								pack = r.detach(pack, steal);
								r.discard(steal);
								cur_null(sobj);
								updpack();
							}
						}
					}
					break;case 'c':
						if (!save(VS_PETRIFICATION)) {
							msg("Your body begins to solidify.");
							msg("You are turned to stone !!! --More--");
							wait_for(cw, ' ');
							death(mp.t_indx);
						}
					break;case 'd':
						if (rnd(100) < 50 && !(mp.t_flags & ISHUH))
							player.t_flags |= ISHELD;
						if (!save(VS_POISON)) {
							if (iswearing(R_SUSAB) || iswearing(R_SUSTSTR))
								msg("Sting has no effect.");
							else {
								int fewer, ostr;

								fewer = roll(1,4);
								ostr = herostr();
								chg_abil(STR,-fewer,true);
								if (herostr() < ostr) {
									fewer = ostr - herostr();
									fuse(rchg_str, fewer - 1, 10);
								}
								msg("You feel weaker now.");
							}
						}
					break;case 'g':
						if (!save(VS_BREATH) && !iswearing(R_BREATH)) {
							msg("You feel singed.");
							chg_hpt(-roll(1,8),false,mp.t_indx);
						}
					break;case 'h':
						if (!save(VS_BREATH) && !iswearing(R_BREATH)) {
							msg("You are seared.");
							chg_hpt(-roll(1,4),false,mp.t_indx);
						}
					break;case 'p':
						if (!save(VS_POISON) && herostr() > MINABIL) {
							if (!iswearing(R_SUSTSTR) && !iswearing(R_SUSAB)) {
								msg("You are gnawed.");
								chg_abil(STR,-1,true);
							}
						}
					break;case 'u':
						if (!save(VS_POISON) && herostr() > MINABIL) {
							if (!iswearing(R_SUSTSTR) && !iswearing(R_SUSAB)) {
								msg("You are bitten.");
								chg_abil(STR, -1, true);
								fuse(rchg_str, 1, roll(5,10));
							}
						}
					break;case 'w':
						if (!save(VS_POISON) && !iswearing(R_SUSAB)) {
							msg("You feel devitalized.");
							chg_hpt(-1,true,mp.t_indx);
						}
					break;case 'i':
						if (!save(VS_PARALYZATION) && !iswearing(R_SUSAB)) {
							if (pl_on(ISSLOW))
								lengthen(notslow,roll(3,10));
							else {
								msg("You feel impaired.");
								player.t_flags |= ISSLOW;
								fuse(notslow,true,roll(5,10));
							}
						}
					break;default:
						break;
				}
			}
		}
		else if (mp.t_type != 'E') {
			if (mp.t_type == 'F') {
				him.s_hpt -= fung_hit;
				if (him.s_hpt <= 0)
					death(mp.t_indx);
			}
			miss(mname);
		}
		flushinp();					/* flush type ahead */
		count = 0;

		if (mp == null)
			return(-1);
		else
			return(0);
	}


	/*
	* swing:
	*	Returns true if the swing hits
	*/
	this.swing = function(at_lvl, op_arm, wplus)
	//int at_lvl, op_arm, wplus;
	{
		reg int res = rnd(20)+1;
		reg int need = (21 - at_lvl) - op_arm;

		return (res + wplus >= need);
	}


	/*
	* check_level:
	*	Check to see if the guy has gone up a level.
	*/
	this.check_level = function()
	{
		reg int lev, add, dif;

		for (lev = 0; e_levels[lev] != 0; lev++)
		if (e_levels[lev] > him.s_exp)
			break;
		lev += 1;
		if (lev > him.s_lvl) {
			dif = lev - him.s_lvl;
			add = roll(dif, 10) + (dif * getpcon(him));
			him.s_maxhp += add;
			if ((him.s_hpt += add) > him.s_maxhp)
				him.s_hpt = him.s_maxhp;
			msg("Welcome to level %d", lev);
		}
		him.s_lvl = lev;
	}


	/*
	* roll_em:
	*	Roll several attacks
	*/
	this.roll_em = function(att, def, weap, hurl)
	//struct stats *att, *def;
	//struct object *weap;
	//bool hurl;
	{
		reg char *cp;
		reg int ndice, nsides, def_arm, prop_hplus, prop_dplus;
		reg bool did_hit = false;
		char *mindex();

		prop_hplus = prop_dplus = 0;
		if (weap == null) {
			cp = att.s_dmg;
		}
		else if (hurl) {
			if (o_on(weap,ISMISL) && cur_weapon != null &&
			cur_weapon.o_which == weap.o_launch) {
				cp = weap.o_hurldmg;
				prop_hplus = cur_weapon.o_hplus;
				prop_dplus = cur_weapon.o_dplus;
			}
			else
				cp = (o_on(weap,ISMISL) ? weap.o_damage : weap.o_hurldmg);
		}
		else {
			cp = weap.o_damage;
			/*
			* Drain a staff of striking
			*/
			if (weap.o_type == STICK && weap.o_which == WS_HIT
			&& weap.o_charges == 0) {
				strcpy(weap.o_damage, "0d0");
				weap.o_hplus = weap.o_dplus = 0;
			}
		}
		while(1) {
			int damage;
			int hplus = prop_hplus + (weap == null ? 0 : weap.o_hplus);
			int dplus = prop_dplus + (weap == null ? 0 : weap.o_dplus);

			if (att == him && weap == cur_weapon) {
				if (isring(LEFT, R_ADDDAM))
					dplus += cur_ring[LEFT].o_ac;
				else if (isring(LEFT, R_ADDHIT))
					hplus += cur_ring[LEFT].o_ac;
				if (isring(RIGHT, R_ADDDAM))
					dplus += cur_ring[RIGHT].o_ac;
				else if (isring(RIGHT, R_ADDHIT))
					hplus += cur_ring[RIGHT].o_ac;
			}
			ndice = atoi(cp);
			if ((cp = mindex(cp, 'd')) == null)
				break;
			nsides = atoi(++cp);

			if (def == him) {			/* defender is hero */
				if (cur_armor != null)
					def_arm = cur_armor.o_ac;
				else
					def_arm = def.s_arm;
				if (isring(LEFT, R_PROTECT))
					def_arm -= cur_ring[LEFT].o_ac;
				if (isring(RIGHT, R_PROTECT))
					def_arm -= cur_ring[RIGHT].o_ac;
			}
			else						/* defender is monster */
				def_arm = def.s_arm;
			if (hurl)
				hplus += getpdex(att,true);
			if (swing(att.s_lvl, def_arm + getpdex(def, false),
			hplus + str_plus(att))) {
				reg int proll;

				proll = roll(ndice, nsides);
				damage = dplus + proll + add_dam(att);
				if (pl_off(ISINVINC) || def != him)
					def.s_hpt -= max(0, damage);
				did_hit = true;
			}
			if ((cp = mindex(cp, '/')) == null)
				break;
			cp++;
		}
		return did_hit;
	}


	/*
	* mindex:
	*	Look for char 'c' in string pointed to by 'cp'
	*/
	//char *
	function mindex(cp, c)
	//char *cp, c;
	{
		reg int i;

		for (i = 0; i < 3; i++)
			if (*cp != c)  cp++;
		if (*cp == c)
			return cp;
		else
			return null;
	}


	/*
	* prname:
	*	The print name of a combatant
	*/
	//char *
	function prname(who, upper)
	//char *who;
	//bool upper;
	{
	static char tbuf[LINLEN];

		*tbuf = '\0';
		if (who == 0)
			strcpy(tbuf, "you"); 
		else if (pl_on(ISBLIND))
			strcpy(tbuf, "it");
		else {
			strcpy(tbuf, "the ");
			strcat(tbuf, who);
		}
		if (upper)
			*tbuf = toupper(*tbuf);
		return tbuf;
	}

	/*
	* hit:
	*	Print a message to indicate a succesful hit
	*/
	function hit(er)
	//char *er;
	{
		msg("%s hit.",prname(er, true));
	}


	/*
	* miss:
	*	Print a message to indicate a poor swing
	*/
	function miss(er)
	//char *er;
	{
		msg("%s miss%s.",prname(er, true),(er == 0 ? "":"es"));
	}


	/*
	* save_throw:
	*	See if a creature saves against something
	*/
	this.save_throw = function(which, tp)
	//int which;
	//struct thing *tp;
	{
		reg int need;
		reg struct stats *st;

		st = &tp.t_stats;
		need = 14 + which - (st.s_lvl / 2) - getpwis(st);
		return (roll(1, 20) >= need);
	}


	/*
	* save:
	*	See if he saves against various nasty things
	*/
	this.ave = function(which)
	//int which;
	{
		return save_throw(which, &player);
	}

	/*
	* raise_level:
	*	The guy just magically went up a level.
	*/
	this.raise_level = function()
	{
		him.s_exp = e_levels[him.s_lvl-1] + 1L;
		check_level();
	}


	/*
	* thunk:
	*	A missile hits a monster
	*/
	function thunk(weap, mname)
	//struct object *weap;
	//char *mname;
	{
		if (weap.o_type == WEAPON)
			msg("The %s hits the %s.",w_magic[weap.o_which].mi_name,mname);
		else
			msg("You hit the %s.", mname);
	}


	/*
	* bounce:
	*	A missile misses a monster
	*/
	function bounce(weap, mname)
	//struct object *weap;
	//char *mname;
	{
		if (weap.o_type == WEAPON)
			msg("The %s misses the %s.", w_magic[weap.o_which].mi_name,mname);
		else
			msg("You missed the %s.", mname);
	}


	/*
	* remove:
	*	Remove a monster from the screen
	*/
	this.remove_monster = function(mp, item)
	//struct coord *mp;
	//struct linked_list *item;
	{
		reg char what;

		mvwaddch(mw, mp.y, mp.x, ' ');
		if (pl_on(ISBLIND))
			what = ' ';							/* if blind, then a blank */
		else
			what = (THINGPTR(item)).t_oldch;	/* normal char */
		mvwaddch(cw, mp.y, mp.x, what);
		r.dungeon.mlist = r.detach(r.dungeon.mlist, item);
		discard(item);
	}


	/*
	* is_magic:
	*	Returns true if an object radiates magic
	*/
	this.is_magic = function(obj)
	//struct object *obj;
	{
		switch (obj.o_type) {
			case ARMOR:
				return obj.o_ac != armors[obj.o_which].a_class;
			case WEAPON:
				return obj.o_hplus != 0 || obj.o_dplus != 0;
			case POTION:
			case SCROLL:
			case STICK:
			case RING:
			case AMULET:
				return true;
		}
		return false;
	}


	/*
	* killed:
	*	Called to put a monster to death
	*/
	this.killed = function(item, pr)
	//struct linked_list *item;
	//bool pr;
	{
		reg struct thing *tp;
		reg struct object *obj;
		struct linked_list *pitem, *nexti, *itspack;
		struct coord here;
		
		nochange = false;
		tp = THINGPTR(item);
		here = tp.t_pos;
		if (pr) {
			addmsg("Defeated ");
			if (pl_on(ISBLIND))
				msg("it.");
			else
				msg("%s.", monsters[tp.t_indx].m_name);
		}
		him.s_exp += tp.t_stats.s_exp;
		isfight = false;
		check_level();
		unhold(tp.t_type);					/* free player if held */
		if (tp.t_type == 'L') {
			reg struct room *rp;

			rp = roomin(&here);
			if (rp != null) {
				if (rp.r_goldval!=0 || fallpos(&here, &rp.r_gold, false)) {
					rp.r_goldval += GOLDCALC;
					if (!save_throw(VS_MAGIC,tp))
						rp.r_goldval += GOLDCALC + GOLDCALC + GOLDCALC
									+ GOLDCALC + GOLDCALC;
					mvaddch(rp.r_gold.y, rp.r_gold.x, GOLD);
					if (!rf_on(rp,ISDARK)) {
						light(&hero);
						mvwaddch(cw, hero.y, hero.x, PLAYER);
					}
				}
			}
		}
		pitem = tp.t_pack;
		itspack = tp.t_pack;
		remove_monster(&here, item);
		while (pitem != null) {
			nexti = next(pitem);
			obj = OBJPTR(pitem);
			obj.o_pos = here;
			itspack = r.detach(itspack, pitem);
			fall(pitem, false);
			pitem = nexti;
		}
	}
}