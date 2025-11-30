/*
 * Code for one object to chase another
 */

this.chase = function(r){
	
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const THINGPTR = f.THINGPTR;
	const next = f.next;
	const off = f.off;
	const on = f.on;
	const cansee = this.cansee;
	const roomin = this.roomin;
	const DISTANCE = f.DISTANCE;
	
	const FARAWAY = 32767;
	const RDIST =(a, b)=>{return f.DISTANCE((a).y, (a).x, (b).y, (b).x)};

	let ch_ret; //struct coord ch_ret;	/* Where chasing takes you */

	/*
	* runners:
	*	Make all the running monsters move.
	*/
	this.runners = function()
	{
		let tp; //reg struct thing *tp;
		let mon, nextmon; //reg struct linked_list *mon,*nextmon;

		for (mon = r.dungeon.mlist; mon != null; mon = nextmon) {
			tp = THINGPTR(mon);
			nextmon = next(mon);
			if (off(tp, d.ISHELD) && on(tp, d.ISRUN)) {
				if (tp.t_nomove > 0)
					if (--tp.t_nomove > 0)
						continue;
				if (on(tp, d.ISHASTE))
					if (do_chase(mon) == -1)
						continue;
				if (off(tp, d.ISSLOW) || tp.t_turn)
					if (do_chase(mon) == -1)
						continue;
				tp.t_turn ^= true;
			}
		}
	}

	/*
	* do_chase:
	*	Make one thing chase another.
	*/
	function do_chase(mon)
	//struct linked_list *mon;
	{
		const rf_on = r.dungeon.room.rf_on;
		const killed = r.dungeon.fight.killed;

		let th;//reg struct thing *th;
		let rer, ree, rxx;//reg struct room *rer, *ree, *rxx;
		let mindist, i, dist;
		let st; //struct stats *st;
		let stoprun = false, ondoor = false, link = false;
		let runaway, dofight, wound, sch, ch;
		let pthis;//struct coord this;
		let trp;//struct trap *trp;

		th = THINGPTR(mon);
		wound = th.t_flags & d.ISWOUND;
		if (wound)
			mindist = 0;
		else
			mindist = FARAWAY;
		runaway = wound;
		dofight = !runaway;
		rer = th.t_room;
		if (th.t_type == 'V') {
			if (rer != null && !rf_on(rer, d.ISDARK)) {
				/*
				* Vampires can't stand the light
				*/
				if (cansee(th.t_pos.y, th.t_pos.x))
					r.UI.msg("The vampire vaporizes into thin air !");
				killed(mon, false);
				return(-1);
			}
		}
		ree = roomin(th.t_dest);	/* room of chasee */
		pthis = th.t_dest;
		/*
		* If the object of our desire is in a different
		* room, then run to the door nearest to our goal.
		*/
		if (mvinch(th.t_pos.y, th.t_pos.x) == d.DOOR)
			ondoor = true;
		rxx = null;
		if (rer != null || ree != null) {
			/*
			* Monster not in room, hero in room. Run to closest door
			* in hero's room if not wounded. Run away if wounded.
			*/
			if (rer == null && ree != null) {
				if (!wound)
					rxx = ree;
			}
			/*
			* Monster in a room, hero not in room. If on a door,
			* then use closest distance. If not on a door, then
			* run to closest door in monsters room.
			*/
			else if (rer != null && ree == null) {
				if (!ondoor) {
					rxx = rer;
					if (wound)
						runaway = false;
				}
			}
			/*
			* Both hero and monster in a DIFFERENT room. Set flag to
			* check for links between the monster's and hero's rooms.
			* If no links are found, then the closest door in the
			* monster's room is used.
			*/
			else if (rer != ree) {
				if (!wound) {
					link = true;
					if (ondoor)
						rxx = ree;	/* if on door, run to heros room */
					else
						rxx = rer;	/* else to nearest door this room */
				}
			}
			/*
			* Both hero and monster in same room. If monster is
			* wounded, find the best door to run to.
			*/
			else if (wound) {
				let ex;//struct coord *ex;
				let poss, mdtd, hdtd, ghdtd, nx, gx = 0, best;

				best = ghdtd = -FARAWAY;
				for (nx = 0; nx < ree.r_nexits; nx++) {
					ex = ree.r_exit[nx];
					if (r.UI.mvinch(ex.y, ex.x) == d.SECRETDOOR)
						continue;
					gx += 1;
					mdtd = Math.abs(th.t_pos.y - ex.y) + Math.abs(th.t_pos.x - ex.x);
					hdtd = Math.abs(hero.y - ex.y) + Math.abs(hero.x - ex.x);
					poss = hdtd - mdtd;				/* possible move */
					if (poss > best) {
						best = poss;
						pthis = ex;
					}
					else if (poss == best && hdtd > ghdtd) {
						ghdtd = hdtd;
						best = poss;
						pthis = ex;
					}
				}
				runaway = false;		/* go for target */
				if (best < 1)
					dofight = true;		/* fight if we must */
				mdtd = (gx <= 1 && best < 1);
				if (ondoor || mdtd) {
					pthis = hero;
					runaway = true;
					if (!mdtd)
						dofight = false;
				}
			}
			if (rxx != null) {
				for (i = 0; i < rxx.r_nexits; i += 1) {
					dist = RDIST(th.t_dest, rxx.r_exit[i]);
					if (link && rxx.r_ptr[i] == ree)
						dist = -1;
					if ((!wound && dist < mindist) ||
						(wound && dist > mindist)) {
						pthis = rxx.r_exit[i];
						mindist = dist;
					}
				}
			}
		}
		else if (DISTANCE(hero.y, hero.x, th.t_pos.y, th.t_pos.x) <= 3)
			dofight = true;
		/*
		* this now contains what we want to run to this time
		* so we run to it.  If we hit it we either want to
		* fight it or stop running.
		*/
		if (chase(th, pthis, runaway, dofight) == d.FIGHT) {
			return( attack(th) );
		}
		else if ((th.t_flags & (d.ISSTUCK | d.ISPARA)))
			return(0);				/* if paralyzed or stuck */
		if ((trp = trap_at(ch_ret.y, ch_ret.x)) != null) {
			ch = be_trapped(ch_ret, th);
			if (ch == d.GONER || nlmove) {
				if (ch == d.GONER)
					remove_monster(th.t_pos, mon);
				nlmove = false;
				return((ch == d.GONER) ? -1 : 0);
			}
		}
		if (pl_off(d.ISBLIND))
			mvwaddch(cw,th.t_pos.y,th.t_pos.x,th.t_oldch);
		sch = mvwinch(cw, ch_ret.y, ch_ret.x);
		if (rer != null && rf_on(rer,d.ISDARK) && sch == d.FLOOR &&
		DISTANCE(ch_ret.y,ch_ret.x,th.t_pos.y,th.t_pos.x) < 3 &&
		pl_off(d.ISBLIND))
			th.t_oldch = ' ';
		else
			th.t_oldch = sch;
		if (cansee(unc(ch_ret)) && off(th, d.ISINVIS))
			mvwaddch(cw, ch_ret.y, ch_ret.x, th.t_type);
		mvwaddch(mw, th.t_pos.y, th.t_pos.x, ' ');
		mvwaddch(mw, ch_ret.y, ch_ret.x, th.t_type);
		th.t_oldpos = th.t_pos;
		th.t_pos = ch_ret;
		th.t_room = roomin(ch_ret);
		i = 5;
		if (th.t_flags & d.ISREGEN)
			i = 40;
		st = th.t_stats;
		if (rnd(100) < i) {
			if (++st.s_hpt > st.s_maxhp)
				st.s_hpt = st.s_maxhp;
			if (!monhurt(th))
				th.t_flags &= ~d.ISWOUND;
		}
		if (stoprun && ce(th.t_pos, th.t_dest))
			th.t_flags &= ~d.ISRUN;
		return d.CHASE;
	}


	/*
	* chase:
	*	Find the spot for the chaser to move closer to the
	*	chasee.  Returns true if we want to keep on chasing
	*	later false if we reach the goal.
	*/
	this.chase = function(tp, ee, runaway, dofight)
	//struct thing *tp;
	//struct coord *ee;
	//bool runaway, dofight;
	{
		const cordok = r.UI.cordok;

		let x, y, ch;
		let dist, thisdist, closest;
		let er = tp.t_pos;//reg struct coord *er = &tp.t_pos;
		let closecoord, ctry;//struct coord try, closecoord;
		let numsteps, onscare;

		/*
		* If the thing is confused, let it move randomly.
		*/
		ch = d.CHASE;
		onscare = false;
		if (on(tp, d.ISHUH)) {
			ch_ret = rndmove(tp);
			dist = f.DISTANCE(hero.y, hero.x, ch_ret.y, ch_ret.x);
			if (r.rnd(1000) < 5)
				tp.t_flags &= ~d.ISHUH;
			if (dist == 0)
				ch = d.FIGHT;
		}
		else {
			/*
			* Otherwise, find the the best spot to run to
			* in order to get to your goal.
			*/
			numsteps = 0;
			if (runaway)
				closest = 0;
			else
				closest = FARAWAY;
			ch_ret = er;
			closecoord = tp.t_oldpos;
			for (y = er.y - 1; y <= er.y + 1; y += 1) {
				for (x = er.x - 1; x <= er.x + 1; x += 1) {
					if (!cordok(y, x))
						continue;
					ctry.x = x;
					ctry.y = y;
					if (!diag_ok(er, ctry))
						continue;
					ch = winat(y, x);
					if (step_ok(ch)) {
						let trp; //struct trap *trp;

						if (isatrap(ch)) {
							trp = trap_at(y, x);
							if (trp != null && off(tp, d.ISHUH)) {
								/*
								* Dont run over found traps unless
								* the hero is standing on it. If confused,
								* then he can run into them.
								*/
								if (trp.tr_flags & d.ISFOUND) {
									if (trp.tr_type == d.POOL && r.rnd(100) < 80)
										continue;
									else if (y != hero.y || x != hero.x)
										continue;
								}
							}
						}
						/*
						* Check for scare monster scrolls.
						*/
						if (ch == d.SCROLL) {
							let item;//struct linked_list *item;

							item = find_obj(y, x);
							if (item != null)
								if ((OBJPTR(item)).o_which == d.S_SCARE) {
									if (ce(hero, ctry))
										onscare = true;
									continue;
								}
						}
						/*
						* Vampires will not run into a lit room.
						*/
						if (tp.t_type == 'V') {
							let lr;//struct room *lr;

							lr = roomin(ctry);
							if (lr != null && !rf_on(lr, d.ISDARK))
								continue;
						}
						/*
						* This is a valid place to step
						*/
						if (y == hero.y && x == hero.x) {
							if (dofight) {
								ch_ret = ctry;	/* if fighting */
								return d.FIGHT;	/* hit hero */
							}
							else
								continue;
						}
						thisdist = DISTANCE(y, x, ee.y, ee.x);
						if (thisdist <= 0) {
							ch_ret = ctry;	/* got here but */
							return d.CHASE;	/* dont fight */
						}
						numsteps += 1;
						if ((!runaway && thisdist < closest) ||
							(runaway && thisdist > closest)) {
							/*
							* dont count the monsters last position as
							* the closest spot, unless running away and
							* in the same room.
							*/
							if (!ce(ctry, tp.t_oldpos) || (runaway
							&& player.t_room == tp.t_room
							&& tp.t_room != null)) {
								closest = thisdist;
								closecoord = ctry;
							}
						}
					}
				}
			}
			/*
			* If dead end, then go back from whence you came.
			* Otherwise, pick the closest of the remaining spots.
			*/
			if (numsteps > 0)			/* move to best spot */
				ch_ret = closecoord;
			else {						/* nowhere to go */
				if (DISTANCE(tp.t_pos.y, tp.t_pos.x, hero.y, hero.x) < 2)
					if (!onscare)
						ch_ret = hero;
			}
			if (ce(hero, ch_ret))
				ch = d.FIGHT;
		}
		return ch;
	}


	/*
	* runto:
	*	Set a monster running after something
	*/
	this.runto = (runner, spot)=>
	//struct coord *runner;
	//struct coord *spot;
	{
		const find_mons = this.find_mons;
		const THINGPTR = f.THINGPTR;

		let item; //reg struct linked_list *item;
		let tp; //reg struct thing *tp;

		if ((item = find_mons(runner.y, runner.x)) == null)
			return;
		tp = THINGPTR(item);
		if (tp.t_flags & d.ISPARA)
			return;
		tp.t_dest = spot;
		tp.t_flags |= d.ISRUN;
		tp.t_flags &= ~d.ISHELD;
	}


	/*
	* roomin:
	*	Find what room some coordinates are in.
	*	null means they aren't in any room.
	*/
	//struct room *
	this.roomin = function(cp)
	//struct coord *cp;
	{
		const cordok = r.UI.cordok;

		let rp; //reg struct room *rp;

		if (cordok(cp.y, cp.x)) {
			//for (rp = r.dungeon.rooms; rp < r.dungeon.rooms[d.MAXROOMS]; rp += 1)
			for (let i in r.dungeon.rooms){
				rp = r.dungeon.rooms[i];
				if (f.inroom(rp, cp))
					return rp;
			}
		}
		return null;
	}


	/*
	* find_mons:
	*	Find the monster from his coordinates
	*/
	//struct linked_list *
	this.find_mons = function(y, x)
	//int y, x;
	{
		let item; //reg struct linked_list *item;
		let th; //reg struct thing *th;

		for (item = r.dungeon.mlist; item != null; item = f.next(item)) {
			th = f.THINGPTR(item);
			if (th.t_pos.y == y && th.t_pos.x == x)
				return item;
		}
		return null;
	}


	/*
	* diag_ok:
	*	Check to see if the move is legal if it is diagonal
	*/
	this.diag_ok = function(sp, ep)
	//struct coord *sp, *ep;
	{
		const step_ok = r.UI.io.step_ok;
		const mvinch = r.UI.mvinch;

		if (ep.x == sp.x || ep.y == sp.y)
			return true;
		if (step_ok(mvinch(ep.y,sp.x)) && step_ok(mvinch(sp.y,ep.x)))
			return true;
		return false;
	}


	/*
	* cansee:
	*	returns true if the hero can see a certain coordinate.
	*/
	this.cansee = function(y, x)
	//int y, x;
	{
		let rer; //reg struct room *rer;
		let tp; //struct coord tp;

		if (pl_on(d.ISBLIND))
			return false;
		/*
		* We can only see if the hero in the same room as
		* the coordinate and the room is lit or if it is close.
		*/
		if (DISTANCE(y, x, hero.y, hero.x) < 3)
			return true;
		tp.y = y;
		tp.x = x;
		rer = roomin(tp);
		if (rer != null && levtype != d.MAZELEV)
			if (rer == player.t_room && !rf_on(rer,d.ISDARK))
				return true;
		return false;
	}
}