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
	
	const cw = d.DSP_MAIN_FG;
	const mw = d.DSP_MAIN_BG;

	/*
	* fight:
	*	The player attacks the monster.
	*/
	this.fight = (mp, weap, thrown)=>
	//struct coord *mp;
	//struct object *weap;
	//bool thrown;
	{
		const pl_on = r.player.pl_on;
		const pl_off = r.player.pl_off;
		const find_mons = r.monster.chase.find_mons;
		const look = r.player.misc.look;
		const THINGPTR = f.THINGPTR;
		const on = f.on;
		const off = f.off;
		const monsters = v.monsters;
		const roll_em = this.roll_em;
		const unhold = this.unhold;
		const killed = this.killed;
		const monhurt = r.monster.monhurt;
		const rf_on = r.dungeon.rooms_f.rf_on;
		const runto = r.monster.chase.runto;

		const player = r.player.get_player();
		const hero = r.player.get_hero();
		const him = r.player.get_him();

		let tp;//reg struct thing *tp;
		let st;//reg struct stats *st;
		let item;//reg struct linked_list *item;
		let did_hit = true;

		if (pl_on(d.ISETHER))			/* cant fight when ethereal */
			return 0;

		if ((item = find_mons(mp.y, mp.x)) == null) {
			r.UI.mvaddch(mp.y, mp.x, d.FLOOR);
			r.UI.mvwaddch(mw, mp.y, mp.x, ' ');
			look(false);
			r.UI.msg( ms.FIGHT_1 );
			return 0;
		}
		tp = THINGPTR(item);
		st = tp.t_stats; //<-ptr
		/*
		* Since we are fighting, things are not quiet so
		* no healing takes place.
		*/
		r.quiet = 0;
		r.isfight = true;
		runto(mp, hero);
		/*
		* Let him know it was really a mimic (if it was one).
		*/
		if(tp.t_type == 'M' && tp.t_disguise != 'M' && pl_off(d.ISBLIND)) {
			r.UI.msg( ms.FIGHT_2 );
			tp.t_disguise = 'M';
			did_hit = thrown;
		}
		if (did_hit) {
			let mname;

			did_hit = false;
			if (pl_on(d.ISBLIND))
				mname = ms.BATTLE_IT;
			else
				mname = monsters[tp.t_indx].m_name;
			/*
			* If the hero can see the invisibles, then
			* make it easier to hit.
			*/
			if (pl_on(d.CANSEE) && on(tp, d.ISINVIS) && off(tp, d.WASHIT)) {
				tp.t_flags |= d.WASHIT;
				st.s_arm += 3;
			}
			if (roll_em(him, st, weap, thrown)) {
				did_hit = true;
				if (thrown)
					thunk(weap, mname);
				else
					hit(null);
				if (pl_on(d.CANHUH)) {
					r.UI.msg( ms.FIGHT_3 );
					r.UI.msg( ms.FIGHT_4(mname) );
					tp.t_flags |= d.ISHUH;
					player.t_flags &= ~d.CANHUH;
					/*
					* If our hero was stuck by a bone devil,
					* release him now because the devil is
					* confused.
					*/
					if (pl_on(d.ISHELD))
						unhold(tp.t_type);
				}
				if (st.s_hpt <= 0)
					killed(item, true);
				else if (monhurt(tp) && off(tp, d.ISWOUND)) {
					if (r.levtype != d.MAZELEV && tp.t_room != null &&
					!rf_on(tp.t_room, d.ISTREAS)) {
						tp.t_flags |= d.ISWOUND;
						r.UI.msg( ms.FIGHT_5(prname(mname,false)) );
						unhold(tp.t_type);
					}
				}
				r.UI.battleEffect("*", tp.t_pos.x, tp.t_pos.y);
			}
			else {
				if (thrown)
					bounce(weap, mname);
				else
					miss(null);
			}
		}
		count = 0;

		tp.t_stats = st;
		item.l_data = tp;
		r.player.set_player(player);

		return did_hit;
	}


	/*
	* attack:
	*	The monster attacks the player
	*/
	this.attack = (mp)=>
	//struct thing *mp;
	{
		const pl_on = r.player.pl_on;
		const pl_off = r.player.pl_off;
		const roll_em = this.roll_em;
		const death = r.player.rips.death;
		const off = f.off;
		const hurt_armor = r.item.armor_f.hurt_armor;
		const save = this.save;
		const iswearing = r.item.ring_f.iswearing;
		const chg_abil = r.player.pstats.chg_abil;
		const herostr = ()=>{ return player.t_stats.s_ef.a_str; }
		const chg_hpt = r.player.pstats.chg_hpt;
		const midx = r.monster.midx;
		const GOLDCALC = ()=>{ return (r.rnd(50 + 10 * r.dungeon.level) + 2) };
		const find_mons = r.monster.chase.find_mons;
		const remove_monster = this.remove_monster;
		const get_worth = ()=>{};//trader
		const cur_null = r.item.pack_f.cur_null;
		const updpack = r.player.encumb.updpack;
		const rchg_str = r.player.pstats.rchg_str;
		const fuse = r.daemon.fuse;
		const lengthen = r.daemon.lengthen;
		const notslow = r.daemon.notslow; 

		const e_levels = v.e_levels;
		const monsters = v.monsters;

		const player = r.player.get_player();
		const cur_armor = r.player.get_cur_armor();
		const him = r.player.get_him();

		let mname;

		if (pl_on(d.ISETHER))		/* ethereal players cant be hit */
			return(0);
		if (mp.t_flags & d.ISPARA)	/* paralyzed monsters */
			return(0);
		r.running = false;
		r.quiet = 0;
		r.isfight = true;
		if (mp.t_type == 'M' && pl_off(d.ISBLIND))
			mp.t_disguise = 'M';
		if (pl_on(d.ISBLIND))
			mname = ms.BATTLE_IT;
		else
			mname = monsters[mp.t_indx].m_name;
		if (roll_em(mp.t_stats, him, null, false)) {
			if (pl_on(d.ISINVINC)) {
				r.UI.msg( ms.ATTACK_1(prname(mname,true)) );
			}
			else {
				r.nochange = false;
				if (mp.t_type != 'E'){
					let tgt = r.player.get_hero()
					r.UI.damageEffect("x", tgt.x, tgt.y);
					hit(mname);
				}
				if (him.s_hpt <= 0){
					death(mp.t_indx);
					return;
				}
				if (off(mp, d.ISCANC))
					switch (mp.t_type) {
					case 'R':
						if (hurt_armor(cur_armor)) {
							r.UI.msg( ms.ATTACK_R );
							cur_armor.o_ac++;
						}

					break;
					case 'E':
					/*
					* The gaze of the floating eye hypnotizes you
					*/
						if (pl_off(d.ISBLIND) && player.t_nocmd <= 0) {
							player.t_nocmd = r.rnd(16) + 25;
							r.UI.msg( ms.ATTACK_E );
						}
					break;
					case 'Q':
						if (!save(d.VS_POISON) && !iswearing(d.R_SUSAB)) {
							if (him.s_ef.a_dex > d.MINABIL) {
								chg_abil(d.DEX, -1, true);
								r.UI.msg( ms.ATTACK_Q );
							}
						}
					break;
					case 'A':
						if (!save(d.VS_POISON) && herostr() > d.MINABIL) {
							if (!iswearing(d.R_SUSTSTR) && !iswearing(d.R_SUSAB)) {
								if (r.levcount > 0) {
									chg_abil(d.STR, -1, true);
									r.UI.msg( ms.ATTACK_A1 );
								}
							}
							else
								r.UI.msg( ms.ATTACK_A2 );
						}
					break;
					case 'W':
						if (r.rnd(100) < 15 && !iswearing(d.R_SUSAB)) {
							if (him.s_exp <= 0){
								death(mp.t_indx);
								return;
							}
							r.UI.msg( ms.ATTACK_W );
							if (--him.s_lvl == 0) {
								him.s_exp = 0;
								him.s_lvl = 1;
							}
							else
								him.s_exp = e_levels[him.s_lvl - 1] + 1;
							chg_hpt(-r.roll(1,10),true,mp.t_indx);
						}

					break;
					case 'F':
						player.t_flags |= d.ISHELD;
						monsters[midx('F')].m_stats.s_dmg = `${++r.monster.fung_hit}d1`;
					break;
					case 'L': {
						let lastpurse;
						let lep;//struct linked_list *lep;
						let purse = r.player.purse;
						lastpurse = purse;
						purse -= GOLDCALC();
						if (!save(d.VS_MAGIC))
							purse -= GOLDCALC() + GOLDCALC() + GOLDCALC() + GOLDCALC();
						if (purse < 0)
							purse = 0;
						if (purse != lastpurse)
							r.UI.msg( ms.ATTACK_L );
						lep = find_mons(mp.t_pos.y,mp.t_pos.x);
						if (lep != null)
						{
							remove_monster(mp.t_pos, lep);
							mp = null;
						}
						r.player.purse = purse;
					}
					break;
					case 'N': {
						let steal, list; //struct linked_list *steal, *list;
						let sobj; //struct object *sobj;
						let stworth = 0, wo;

						/*
						* Nymph's steal a magic item, look through the pack
						* and pick out one we like, namely the object worth
						* the most bucks.
						*/
						steal = null;
						for (list = r.player.get_pack(); list != null; list = f.next(list)) {
							wo = get_worth(f.OBJPTR(list));
							if (wo > stworth) {
								stworth = wo;
								steal = list;
							}
						}
						if (steal != null) {
							sobj = f.OBJPTR(steal);
							if (f.o_off(sobj, d.ISPROT)) {
								let nym; //struct linked_list *nym;

								nym = find_mons(mp.t_pos.y, mp.t_pos.x);
								if (nym != null)
								{
									remove_monster(mp.t_pos, nym);
									mp = null;
								}
								r.UI.msg( ms.ATTACK_N(inv_name(sobj, true)) );
								r.player_set_pack(r.detach(r.player.get_pack(), steal));
								r.discard(steal);
								cur_null(sobj);
								updpack();
							}
						}
					}
					break;
					case 'c':
						if (!save(d.VS_PETRIFICATION)) {
							r.UI.msg( ms.ATTACK_c1 );
							r.UI.msg( ms.ATTACK_c2 );
							//wait_for(cw, ' ');
							death(mp.t_indx);
							return;
						}
					break;
					case 'd':
						if (r.rnd(100) < 50 && !(mp.t_flags & d.ISHUH))
							player.t_flags |= d.ISHELD;
						if (!save(d.VS_POISON)) {
							if (iswearing(d.R_SUSAB) || iswearing(d.R_SUSTSTR))
								r.UI.msg( ms.ATTACK_d1 );
							else {
								let fewer, ostr;

								fewer = r.roll(1,4);
								ostr = herostr();
								chg_abil(d.STR,-fewer,true);
								if (herostr() < ostr) {
									fewer = ostr - herostr();
									fuse(rchg_str, fewer - 1, 10);
								}
								r.UI.msg( ms.ATTACK_d2 );
							}
						}
					break;
					case 'g':
						if (!save(d.VS_BREATH) && !iswearing(d.R_BREATH)) {
							r.UI.msg( ms.ATTACK_g );
							chg_hpt(-r.roll(1,8),false,mp.t_indx);
						}
					break;
					case 'h':
						if (!save(d.VS_BREATH) && !iswearing(d.R_BREATH)) {
							r.UI.msg( ms.ATTACK_h );
							chg_hpt(-r.roll(1,4),false,mp.t_indx);
						}
					break;
					case 'p':
						if (!save(d.VS_POISON) && herostr() > d.MINABIL) {
							if (!iswearing(d.R_SUSTSTR) && !iswearing(d.R_SUSAB)) {
								r.UI.msg( ms.ATTACK_p );
								chg_abil(d.STR,-1,true);
							}
						}
					break;
					case 'u':
						if (!save(d.VS_POISON) && herostr() > d.MINABIL) {
							if (!iswearing(d.R_SUSTSTR) && !iswearing(d.R_SUSAB)) {
								r.UI.msg( ms.ATTACK_u );
								chg_abil(d.STR, -1, true);
								fuse(rchg_str, 1, r.roll(5,10));
							}
						}
					break;
					case 'w':
						if (!save(d.VS_POISON) && !iswearing(d.R_SUSAB)) {
							r.UI.msg( ms.ATTACK_w );
							chg_hpt(-1,true,mp.t_indx);
						}
					break;
					case 'i':
						if (!save(d.VS_PARALYZATION) && !iswearing(d.R_SUSAB)) {
							if (pl_on(d.ISSLOW))
								lengthen(notslow,r.roll(3,10));
							else {
								r.UI.msg( ms.ATTACK_i );
								player.t_flags |= d.ISSLOW;
								fuse(notslow,true,r.roll(5,10));
							}
						}
					break;
					default:
						break;
				}
			}
		}
		else if (mp.t_type != 'E') {
			if (mp.t_type == 'F') {
				him.s_hpt -= fung_hit;
				if (him.s_hpt <= 0){
					death(mp.t_indx);
					return;
				}
			}
			miss(mname);
		}
		//flushinp();					/* flush type ahead */
		r.count = 0;

		r.player.set_player(player);
		r.player.set_him(him);
		r.player.set_cur_armor(cur_armor);

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
		let res = r.rnd(20)+1;
		let need = (21 - at_lvl) - op_arm;

		return (res + wplus >= need);
	}


	/*
	* check_level:
	*	Check to see if the guy has gone up a level.
	*/
	this.check_level = function()
	{
		const e_levels = v.e_levels;
		const him = r.player.get_him();

		let lev, add, dif;

		for (lev = 0; e_levels[lev] != 0; lev++)
		if (e_levels[lev] > him.s_exp)
			break;
		lev += 1;
		if (lev > him.s_lvl) {
			dif = lev - him.s_lvl;
			add = r.roll(dif, 10) + (dif * r.player.pstats.getpcon(him));
			him.s_maxhp += add;
			if ((him.s_hpt += add) > him.s_maxhp)
				him.s_hpt = him.s_maxhp;
			r.UI.msg( ms.CHECKLVL(lev) );
		}
		him.s_lvl = lev;
		r.player.set_him(him);
	}


	/*
	* roll_em:
	*	Roll several attacks
	*/
	this.roll_em = (att, def, weap, hurl)=>
	//struct stats *att, *def;
	//struct object *weap;
	//bool hurl;
	{	
		const o_on = r.o_on;
		const isring = ()=>{return false;}
		const pl_off = r.player.pl_off;	
		const getpdex = r.player.pstats.getpdex;
		const add_dam = r.player.pstats.add_dam;	
		const str_plus = r.player.pstats.str_plus;
		const swing = this.swing;

		const him = r.player.get_him();
		const cur_weapon = r.player.get_cur_weapon();
		const cur_armor = r.player.get_cur_armor();
		const cur_ring = r.player.get_cur_ring();

		let cp;
		let ndice, nsides, def_arm, prop_hplus, prop_dplus;
		let did_hit = false;
		//char *mindex();


		prop_hplus = prop_dplus = 0;
		if (weap == null) {
			cp = att.s_dmg;
		}
		else if (hurl) {
			if (o_on(weap,d.ISMISL) && cur_weapon != null &&
			cur_weapon.o_which == weap.o_launch) {
				cp = weap.o_hurldmg;
				prop_hplus = cur_weapon.o_hplus;
				prop_dplus = cur_weapon.o_dplus;
			}
			else
				cp = (o_on(weap,d.ISMISL) ? weap.o_damage : weap.o_hurldmg);
		}
		else {
			cp = weap.o_damage;
			/*
			* Drain a staff of striking
			*/
			if (weap.o_type == d.STICK && weap.o_which == d.WS_HIT
			&& weap.o_charges == 0) {
				weap.o_damage = "0d0";
				weap.o_hplus = weap.o_dplus = 0;
			}
		}

		let bdice = cp.split("/"); //r.UI.comment(`damage:${cp} bd:${bdice.length}`);
		for (let i in bdice){
		//while(1) {
			let damage;
			let hplus = prop_hplus + (weap == null ? 0 : weap.o_hplus);
			let dplus = prop_dplus + (weap == null ? 0 : weap.o_dplus);

			if (att == him && weap == cur_weapon) {
				if (isring(d.LEFT, d.R_ADDDAM))
					dplus += cur_ring[d.LEFT].o_ac;
				else if (isring(d.LEFT, d.R_ADDHIT))
					hplus += cur_ring[d.LEFT].o_ac;
				if (isring(d.RIGHT, d.R_ADDDAM))
					dplus += cur_ring[d.RIGHT].o_ac;
				else if (isring(d.RIGHT, d.R_ADDHIT))
					hplus += cur_ring[d.RIGHT].o_ac;
			}
			//ndice = atoi(cp);
			//if ((cp = mindex(cp, 'd')) == null)
			//	break;
			//nsides = atoi(++cp);

			if (bdice[i].indexOf("d") == -1) break;
			let spw = bdice[i].split("d");

			ndice = Number(spw[0]);
			nsides = Number(spw[1]);
			//console.log(`${bdice[i]}/ d${ndice} s${nsides}`);

			if (def == him) {			/* defender is hero */
				if (cur_armor != null)
					def_arm = cur_armor.o_ac;
				else
					def_arm = def.s_arm;
				if (isring(d.LEFT, d.R_PROTECT))
					def_arm -= cur_ring[d.LEFT].o_ac;
				if (isring(d.RIGHT, d.R_PROTECT))
					def_arm -= cur_ring[d.RIGHT].o_ac;
			}
			else						/* defender is monster */
				def_arm = def.s_arm;
			if (hurl)
				hplus += getpdex(att,true);
			
			if (swing( att.s_lvl,
				def_arm + getpdex(def, false),
				hplus + str_plus(att)
				))
			{
				let proll;

				proll = r.roll(ndice, nsides);
				damage = dplus + proll + add_dam(att);
				if (pl_off(d.ISINVINC) || def != him){
					def.s_hpt -= Math.max(0, damage);
					r.UI.set_battledmg(Math.max(0, damage));
				}
				r.UI.comment(`damage:${damage} ${(def != him)?"->":"<-"} `);
				did_hit = true;
			}
			//if (cp.indexOf('/') == -1)
			//	break;
			//cp = cp.substring(cp.indexOf('/')+1);

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
		let i;

		for (i = 0; i < 3; i++)
			if (cp != c)  cp++;
		if (cp == c)
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
		let tbuf;//[LINLEN];

		tbuf = '';
		if (who == null)
			tbuf = ms.PRNAME_1; 
		else if (r.player.pl_on(d.ISBLIND))
			tbuf = ms.BATTLE_IT;
		else {
			tbuf = ms.PRNAME_2(who);
		}
		if (upper)
			tbuf = f.toupper(tbuf);
		return tbuf;
	}

	/*
	* hit:
	*	Print a message to indicate a succesful hit
	*/
	function hit(er)
	//char *er;
	{
		r.UI.msg( ms.HIT(prname(er, true)) );
	}


	/*
	* miss:
	*	Print a message to indicate a poor swing
	*/
	function miss(er)
	//char *er;
	{
		r.UI.msg( ms.MISS(prname(er, true), (er == 0 ? "":"es")) );
	}


	/*
	* save_throw:
	*	See if a creature saves against something
	*/
	this.save_throw = function(which, tp)
	//int which;
	//struct thing *tp;
	{
		const getpwis = r.player.pstats.getpwis;

		let need;
		let st;//reg struct stats *st;

		st = tp.t_stats;
		need = 14 + which - (st.s_lvl / 2) - getpwis(st);
		return (r.roll(1, 20) >= need);
	}


	/*
	* save:
	*	See if he saves against various nasty things
	*/
	this.save = (which)=>
	//int which;
	{
		return this.save_throw(which, r.player.get_player());
	}

	/*
	* raise_level:
	*	The guy just magically went up a level.
	*/
	this.raise_level = function()
	{
		const e_levels = v.e_levels;
		const him = r.player.get_him();
		const check_level = r.monster.battle.check_level;

		him.s_exp = e_levels[him.s_lvl-1] + 1;
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
		const w_magic = v.w_magic;

		if (weap.o_type == d.WEAPON)
			r.UI.msg( ms.THUNK_1(w_magic[weap.o_which].mi_name, mname) );
		else
			r.UI.msg( ms.THUNK_2(mname) );
	}


	/*
	* bounce:
	*	A missile misses a monster
	*/
	function bounce(weap, mname)
	//struct object *weap;
	//char *mname;
	{
		const w_magic = v.w_magic;

		if (weap.o_type == d.WEAPON)
			r.UI.msg( ms.BOUNCE_1(w_magic[weap.o_which], mname) );
		else
			r.UI.msg( ms.BOUNCE_2(mname) );
	}


	/*
	* remove:
	*	Remove a monster from the screen
	*/
	this.remove_monster = function(mp, item)
	//struct coord *mp;
	//struct linked_list *item;
	{
		const pl_on = r.player.pl_on;

		let what;

		r.UI.mvwaddch(mw, mp.y, mp.x, ' ');
		if (pl_on(d.ISBLIND))
			what = ' ';							/* if blind, then a blank */
		else
			what = (f.THINGPTR(item)).t_oldch;	/* normal char */
		r.UI.mvwaddch(cw, mp.y, mp.x, what);
		r.dungeon.mlist = r.detach(r.dungeon.mlist, item);
		r.discard(item);
	}


	/*
	* is_magic:
	*	Returns true if an object radiates magic
	*/
	this.is_magic = function(obj)
	//struct object *obj;
	{
		switch (obj.o_type) {
			case d.ARMOR:
				return obj.o_ac != armors[obj.o_which].a_class;
			case d.WEAPON:
				return obj.o_hplus != 0 || obj.o_dplus != 0;
			case d.POTION:
			case d.SCROLL:
			case d.STICK:
			case d.RING:
			case d.AMULET:
				return true;
		}
		return false;
	}


	/*
	* killed:
	*	Called to put a monster to death
	*/
	this.killed = (item, pr)=>
	//struct linked_list *item;
	//bool pr;
	{
		const monsters = v.monsters;
		const check_level = this.check_level;
		const unhold = r.monster.unhold;
		const roomin = r.monster.chase.roomin;
		const fallpos = r.item.weapon_f.fallpos;
		const save_throw = this.save_throw;
		const rf_on = r.dungeon.rooms_f.rf_on;
		const light = r.player.move.light;
		const remove_monster = this.remove_monster;
		const fall = r.item.weapon_f.fall;
		const GOLDCALC = ()=>{ return (r.rnd(50 + 10 * r.dungeon.level) + 2) };
		const pl_on = r.player.pl_on;

		const hero = r.player.get_hero();
		const him = r.player.get_him();

		let tp;//reg struct thing *tp;
		let obj;//reg struct object *obj;
		let pitem, nexti, itspack;//struct linked_list *pitem, *nexti, *itspack;
		let here;//struct coord here;
		
		r.nochange = false;
		tp = f.THINGPTR(item);
		here = tp.t_pos;
		if (pr) {
			//r.UI.addmsg("Defeated ");
			if (pl_on(d.ISBLIND))
				r.UI.msg( ms.KILLED_1);
			else
				r.UI.msg( ms.KILLED_2(monsters[tp.t_indx].m_name) );
		}
		him.s_exp += tp.t_stats.s_exp;
		r.isfight = false;
		check_level();
		unhold(tp.t_type);					/* free player if held */
		if (tp.t_type == 'L') {
			let rp; //reg struct room *rp;

			rp = roomin(here);
			if (rp != null) {
				if (rp.r_goldval!=0 || fallpos(here, rp.r_gold, false)) {
					rp.r_goldval += GOLDCALC();
					if (!save_throw(d.VS_MAGIC,tp))
						rp.r_goldval += GOLDCALC() + GOLDCALC() + GOLDCALC()
									+ GOLDCALC() + GOLDCALC();
					r.UI.mvaddch(rp.r_gold.y, rp.r_gold.x, d.GOLD);
					if (!rf_on(rp,d.ISDARK)) {
						light(hero);
						r.UI.mvwaddch(cw, hero.y, hero.x, d.PLAYER);
					}
				}
			}
		}
		pitem = tp.t_pack;
		itspack = tp.t_pack;
		remove_monster(here, item);
		while (pitem != null) {
			nexti = f.next(pitem);
			obj = f.OBJPTR(pitem);
			obj.o_pos = here;
			itspack = r.detach(itspack, pitem);
			fall(pitem, false);
			pitem = nexti;
		}
	}
}