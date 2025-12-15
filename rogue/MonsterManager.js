/*
 * File with various monster functions in it
 *
 */
function MonsterManager(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const mtlev = []; //struct monster *mtlev[MONRANGE];
	const monsters = v.monsters;

	const cw = d.DSP_MAIN_FG;
	const mw = d.DSP_MAIN_BG;

	this.get_mtlev =()=>{return mtlev};

	this.chase = new chase(r);
	this.battle = new battle(r);

	this.fung_hit = 0; /* # of time fungi has hit */

	r.UI.comment("monster");
	/*
	* rnd_mon:
	*	Pick a monster to show up.  The lower the level,
	*	the meaner the monster.
	*/
	this.rnd_mon = (wander,baddie)=>
	//bool wander;
	//bool baddie;		/* true when from a polymorph stick */
	{
		const midx = this.midx;
		let i, ok, cnt;

		cnt = 0;
		if (r.levcount == 0)			/* if only asmodeus possible */
			return(d.MAXMONS);
		if (baddie) {
			while (1) {
				i = r.rnd(d.MAXMONS);					/* pick ANY monster */
				if (monsters[i].m_lev.l_lev < 0)	/* skip genocided ones */
					continue;
				return i;
			}
		}
		ok = false;
		do {
			/*
			* get a random monster from this range
			*/
			i = r.rnd(r.levcount);
			/*
			* Only create a wandering monster if we want one
			* (or the count is exceeded)
			*/
			if (!wander || mtlev[i].m_lev.d_wand || ++cnt > 500)
				ok = true;
		} while(!ok);
		return (midx(mtlev[i].m_show));
	}

	/*
	* lev_mon:
	*	This gets all monsters possible on this level
	*/
	this.lev_mon = function()
	{
		let i;
		let mm;//reg struct monster *mm;

		r.levcount = 0;
		for (i = 0; i < d.MAXMONS; i++) {
			mm = monsters[i];
			if (mm.m_lev.h_lev >= r.dungeon.level && mm.m_lev.l_lev <= r.dungeon.level) {
				mtlev[r.levcount] = mm;
				if (++r.levcount >= d.MONRANGE)
					break;
			}
		}
		if (r.levcount == 0)					/* if no monsters are possible */
			mtlev[0] = monsters[d.MAXMONS];	/* then asmodeus 'A' */
	}

	/*
	* new_monster:
	*	Pick a new monster and add it to the list
	*/
	//struct linked_list *
	this.new_monster = function(type, cp, treas)
	//struct coord *cp;
	//bool treas;
	//char type;
	{
		const roomin = r.monster.chase.roomin;
		const mvwinch = r.UI.mvwinch;
		const mvwaddch = r.UI.mvwaddch;
		const goingup = ()=>{return (r.dungeon.level < r.dungeon.max_level)};
		const iswearing = r.item.ring_f.iswearing;
		const runto = r.monster.chase.runto;

		const hero = r.player.get_hero();

		let item;//reg struct linked_list *item;
		let tp; //reg struct thing *tp;
		let mp; //reg struct monster *mp;
		let st; //reg struct stats *st;
		let killexp;//float killexp;		/* experience gotten for killing him */

		item = r.new_item(new t.thing());//sizeof(struct thing));
		r.dungeon.mlist = r.attach(r.dungeon.mlist, item);
		tp = f.THINGPTR(item);
		tp.t_stats	= new t.coord();
		tp.t_pos	= new t.coord();
		tp.t_oldpos = new t.stats();
		tp.t_dest = [];;

		st = tp.t_stats;
		mp = monsters[type];		/* point to this monsters structure */
		tp.t_type = mp.m_show;
		tp.t_indx = type;
		tp.t_pos = cp;
		tp.t_room = roomin(cp);
		tp.t_oldch = mvwinch(cw, cp.y, cp.x);
		tp.t_nomove = 0;
		tp.t_nocmd = 0;
		mvwaddch(mw, cp.y, cp.x, tp.t_type);

		//console.log(mp);
		/*
		* copy monster data
		*/
		tp.t_stats = mp.m_stats;

		/*
		* If below amulet level, make the monsters meaner the
		* deeper the hero goes.
		*/
		if (r.dungeon.level > d.AMLEVEL)
			st.s_lvl += ((r.dungeon.level - d.AMLEVEL) / 4);

		/*
		* If monster in treasure room, then tougher.
		*/
		if (treas)
			st.s_lvl += 1;
		if (r.levtype == d.MAZELEV)
			st.s_lvl += 1;
		/*
		* If the hero is going back up, then the monsters are more
		* prepared for him, so tougher.
		*/
		if (goingup())
			st.s_lvl += 1;

		/*
		* Get hit points for monster depending on his experience
		*/
		st.s_hpt = r.roll(st.s_lvl, 8);
		st.s_maxhp = st.s_hpt;
		/*
		* Adjust experience point we get for killing it by the
		*  strength of this particular monster by ~~ +- 50%
		*/
		killexp = mp.m_stats.s_exp * (0.47 + st.s_hpt /
			(8 * st.s_lvl));

		st.s_exp = killexp;			/* use float for accuracy */
		if(st.s_exp < 1)
			st.s_exp = 1;				/* minimum 1 experience point */
		tp.t_flags = mp.m_flags;
		/*
		* If monster in treasure room, then MEAN
		*/
		if (treas || r.levtype == d.MAZELEV)
			tp.t_flags |= d.ISMEAN;
		tp.t_turn = true;
		tp.t_pack = null;
		/*
		* Dont wander if treas room
		*/
		if (iswearing(d.R_AGGR) && !treas)
			runto(cp, hero);
		if (tp.t_type == 'M') {
			let mch;

			if (tp.t_pack != null)
				mch = (f.OBJPTR(tp.t_pack)).o_type;
			else {
				switch (r.rnd(r.dungeon.level >= d.AMLEVEL ? 9 : 8)) {
					case 0: mch = d.GOLD;
					break;case 1: mch = d.POTION;
					break;case 2: mch = d.SCROLL;
					break;case 3: mch = d.STAIRS;
					break;case 4: mch = d.WEAPON;
					break;case 5: mch = d.ARMOR;
					break;case 6: mch = d.RING;
					break;case 7: mch = d.STICK;
					break;case 8: mch = d.AMULET;
				}
			}
			if (treas)
				mch = 'M';		/* no disguise in treasure room */
			tp.t_disguise = mch;
		}
		item.l_data = tp;
		return item;
	}

	/*
	* wanderer:
	*	A wandering monster has awakened and is headed for the player
	*/
	this.wanderer = function()
	{
		const rnd_room = r.dungeon.new_level.rnd_room;
		const rnd_pos = r.dungeon.rooms_f.rnd_pos;
		const step_ok = r.UI.io.step_ok;	
		const new_monster = r.monster.new_monster;
		const rnd_mon = r.monster.rnd_mon;

		const player = r.player.get_player();
		const hero = r.player.get_hero();

		let ch;
		let rp, hr = player.t_room;//reg struct room *rp, *hr = player.t_room;
		let item; //reg struct linked_list *item;
		let tp; //reg struct thing *tp;
		let mp; //struct coord mp;

		do {
			rp = r.dungeon.rooms[rnd_room()];
			if (rp != hr || r.levtype == d.MAZELEV) {
				mp = rnd_pos(rp);
				ch = r.UI.mvinch(mp.y, mp.x);
			}
		} while (!step_ok(ch));
		item = new_monster(rnd_mon(true,false), mp, false);
		tp = f.THINGPTR(item);
		tp.t_flags |= d.ISRUN;
		tp.t_dest = hero;

		console.log("wanderer");
	}

	/*
	* wake_monster:
	*	What to do when the hero steps next to a monster
	*/
	//struct linked_list *
	this.wake_monster = (y, x) =>
	//int y, x;
	{
		const find_mons = this.chase.find_mons;
		const THINGPTR = f.THINGPTR;
		const rf_on = r.dungeon.rooms_f.rf_on;
		const on = f.on;
		const off = f.off;
		const iswearing = r.item.ring_f.iswearing;
		const pl_off = r.player.pl_off;
		const unconfuse = r.daemon.unconfuse;
		const save = r.monster.battle.save;
		const DISTANCE = f.DISTANCE;

		const player = r.player.get_player();
		const hero = r.player.get_hero();

		let tp; //reg struct thing *tp;
		let it; //reg struct linked_list *it;
		let rp; //reg struct room *rp;
		let ch;
		let treas = false;

		if ((it = find_mons(y, x)) == null)
			return null;
		tp = THINGPTR(it);
		ch = tp.t_type;
		/*
		* Every time he sees mean monster, it might start chasing him
		*/
		rp = player.t_room;
		if (rp != null && rf_on(rp,d.ISTREAS)) {
			tp.t_flags &= ~d.ISHELD;
			treas = true;
		}
		if (treas || (r.rnd(100) > 33 && on(tp,d.ISMEAN) && off(tp,d.ISHELD) &&
		!iswearing(d.R_STEALTH))) {
			tp.t_dest = hero;
			tp.t_flags |= d.ISRUN;
		}
		if (ch == 'U' && pl_off(d.ISBLIND)) {
			if ((rp != null && !rf_on(rp,d.ISDARK) && r.levtype != d.MAZELEV)
			|| DISTANCE(y, x, hero.y, hero.x) < 3) {
				if (off(tp,d.ISFOUND) && !save(d.VS_PETRIFICATION)
				&& !iswearing(d.R_SUSAB) && pl_off(d.ISINVINC)) {
					msg(ms.WAKEMON);
					if (pl_on(d.ISHUH))
						lengthen(unconfuse,r.rnd(20)+d.HUHDURATION);
					else
						fuse(unconfuse,true,r.rnd(20)+d.HUHDURATION);
					player.t_flags |= d.ISHUH;
					r.player.set_player(player);
				}
				tp.t_flags |= d.ISFOUND;
			}
		}
		/*
		* Hide invisible monsters
		*/
		if ((tp.t_flags & d.ISINVIS) && pl_off(d.CANSEE))
			ch = r.UI.mvinch(y, x);
		/*
		* Let greedy ones guard gold
		*/
		if (on(tp, d.ISGREED) && off(tp, d.ISRUN)) {
			if (rp != null && rp.r_goldval) {
				tp.t_dest = rp.r_gold;
				tp.t_flags |= d.ISRUN;
			}
		}
		it.l_data = tp;
		return it;
	}

	/*
	* genocide:
	*	Eradicate a monster forevermore
	*/
	this.genocide = function()
	{
		const THINGPTR = f.THINGPTR;
		const next = f.next;
		const remove_monster = r.monster.battle.remove_monster
		const lev_mon = r.monster.lev_mon;
		const midx = r.monster.midx;

		let ip, nip;//reg struct linked_list *ip, *nip;
		let mp; //reg struct thing *mp;
		let mm; //struct monster *mm;
		let i, ii, c;

		if (r.levcount == 0) {
			//mpos = 0;
			r.UI.msg("You cannot genocide Asmodeus !!");
			return;
		}

		//let tryagain = false;
		//while (tryagain){

		//	i = true;		/* assume an error now */
		//	while (i) {
		//		msg("Which monster (remember UPPER & lower case)?");
		//		c = readchar();		/* get a char */
		//		if (c == ESCAPE) {	/* he can abort (the fool) */
		//			msg("");
		//			return;
		//		}
		//		if (isalpha(c))		/* valid char here */
		//			i = false;		/* exit the loop */
		//		else {				/* he didn't type a letter */
		//			mpos = 0;
		//			msg("Please specify a letter between 'A' and 'z'");
		//		}
		//	}

		let enelist = target_genocide();
		for (let j in enelist){
			i = midx(enelist[j]);						/* get index to monster */
			mm = monsters[i];
			if (mm.m_lev.l_lev < 0) {
				//mpos = 0;
				r.UI.msg(`You have already eliminated the ${mm.m_name}.`);
				//tryagain = true;
			}else{
				for (ip = r.dungeon.mlist; ip != null; ip = nip) {
					mp = THINGPTR(ip);
					nip = next(ip);
					if (mp.t_type == enelist[j]){
						remove_monster(mp.t_pos, ip);
						let x = mp.t_pos.x;
						let y = mp.t_pos.y;
						r.UI.setEffect(`KILL`, {x:x,y:y} ,{x: x, y: y-1},120);
					}
				}
				mm.m_lev.l_lev = -1;				/* get rid of it */
				mm.m_lev.h_lev = -1;
				lev_mon();							/* redo monster list */
				//mpos = 0;
				r.UI.msg(`You have wiped out the ${mm.m_name}.`);
			}
		}
	}

	/*
	* 7*7 area include monster genocide
	*
	*/
	function target_genocide(){

		const isalpha =(ch)=>{ return /^[a-zA-Z]+$/.test(ch); };
		const find_mons = r.monster.chase.find_mons;
		const THINGPTR = f.THINGPTR;

		const hero = r.player.get_hero();

		let x,y;
		let mon; //reg struct linked_list *mon;
		let tgt = [];

		for (x = hero.x - 3; x <= hero.x + 3; x++) {
			for (y = hero.y - 3; y <= hero.y + 3; y++) {
				if (y > 0 && x > 0 && isalpha(r.UI.mvwinch(mw, y, x))) {
					if ((mon = find_mons(y, x)) != null) {
						let th; //reg struct thing *th;

						th = THINGPTR(mon);
						tgt.push(th.t_type);
					}
				}
			}
		}
		return tgt;
	}

	/*
	* unhold:
	*	Release the player from being held
	*/
	this.unhold = (whichmon)=>
	//char whichmon;
	{
		const midx = r.monster.midx;

		const player = r.player.get_player();

		switch (whichmon) {
			case 'F':
				this.fung_hit = 0;
				monsters[midx('F')].m_stats.s_dmg = "000d0";
			case 'd':
				player.t_flags &= ~d.ISHELD;
		}
		r.player.get_player(player);
	}

	/*
	* midx:
	*	This returns an index to 'whichmon'
	*/
	this.midx = function(whichmon)
	//char whichmon;
	{
		const isupper =(str)=>{ return /^[A-Z]+$/.test(str); };
		const islower =(str)=>{ return /^[a-z]+$/.test(str); };

		if (isupper(whichmon))
			return(whichmon.charCodeAt(0) - 'A'.charCodeAt(0));			/* 0 to 25 for uppercase */
		else if (islower(whichmon))
			return(whichmon.charCodeAt(0) - 'a'.charCodeAt(0) + 26);	/* 26 to 51 for lowercase */
		else
			return(d.MAXMONS);				/* 52 for Asmodeus */
	}

	/*
	* monhurt:
	*	See when monster should run or fight. Return
	*	true if hit points less than acceptable.
	*/
	this.monhurt = function(th)
	//struct thing *th;
	{
		let ewis, crithp, f1, f2;
		let st; //reg struct stats *st;

		st = th.t_stats;
		ewis = st.s_ef.a_wis;
		if (ewis <= d.MONWIS)				/* stupid monsters dont know */
			return false;
		f1 = st.s_maxhp / 4;			/* base hpt for being hurt */
		f2 = (ewis - d.MONWIS) * 5 / 3;	/* bonus for smart monsters */
		if (th.t_flags & d.ISWOUND)		/* if recovering from being */
			f1 *= 2;					/* wounded, then double the base */
		crithp = f1 + f2;				/* get critical hpt for hurt */
		if (crithp > st.s_maxhp)		/* only up to max hpt */
			crithp = st.s_maxhp;
		if (st.s_hpt < crithp)			/* if < critical, then still hurt */
			return true;
		return false;
	}
}