/*
 * routines dealing specifically with rings
 *
 */

function rings(){
    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	/*
	* ring_on:
	*	Put on a ring
	*/
	this.ring_on = function()
	{
		reg struct object *obj;
		reg struct linked_list *item;
		reg int ring, wh;
		char buf[LINLEN];
		bool okring;

		if (cur_ring[LEFT] != null && cur_ring[RIGHT] != null) {
			msg("Already wearing two rings.");
			after = false;
			return;
		}
		/*
		* Make certain that it is somethings that we want to wear
		*/
		if ((item = get_item("put on", RING)) == null)
			return;
		obj = OBJPTR(item);
		if (obj.o_type != RING) {
			msg("That won't fit on your finger.");
			return;
		}
		/*
		* find out which hand to put it on
		*/
		if (is_current(obj))
			return;
		if (cur_ring[LEFT] == null && cur_ring[RIGHT] == null) {
			if ((ring = gethand(false)) < 0)
				return;
		}
		else if (cur_ring[LEFT] == null)
			ring = LEFT;
		else
			ring = RIGHT;
		cur_ring[ring] = obj;
		wh = obj.o_which;
		/*
		* okring = false break;case:
		* 1) ring is cursed and benefit = plus
		* 2) ring is blessed and benefit = minus
		*/
		okring = !((obj.o_ac > 0 && o_on(obj, ISCURSED)) ||
				(obj.o_ac < 0 && o_on(obj, ISBLESS)));
		/*
		* Calculate the effect it has on the poor guy (if possible).
		*/
		if (okring) {
			switch (wh) {
				case R_SPEED:
					if (--obj.o_ac < 0) {
						obj.o_ac = 0;
						setoflg(obj,ISCURSED);
					}
					else {
						add_haste(false);
						msg("You find yourself moving must faster.");
					}
				break;case R_GIANT:				/* to 24 */
					him.s_ef.a_str = MAXSTR;
				break;case R_ADDSTR:
					chg_abil(STR,obj.o_ac,FROMRING);
				break;case R_KNOW:
					chg_abil(WIS,obj.o_ac,FROMRING);
				break;case R_DEX:
					chg_abil(DEX,obj.o_ac,FROMRING);
				break;case R_CONST:
					chg_abil(CON,obj.o_ac,FROMRING);
				break;case R_SEEINVIS:
					player.t_flags |= CANSEE;
					light(&hero);
					mvwaddch(cw, hero.y, hero.x, PLAYER);
				break;case R_AGGR:
					aggravate();
				break;case R_HEAVY:
					updpack();			/* new pack weight */
				break;case R_BLIND:
					r_know[R_BLIND] = true;
					player.t_flags |= ISBLIND;
					look(false);
				break;case R_SLOW:
					player.t_flags |= ISSLOW;
				break;case R_SAPEM:
					fuse(sapem,true,150);
				break;case R_LIGHT: {
					struct room *rop;

					r_know[R_LIGHT] = true;
					if ((rop = player.t_room) != null) {
						rop.r_flags &= ~ISDARK;
						light(&hero);
						mvwaddch(cw, hero.y, hero.x, PLAYER);
					}
				}
			}
		}
		if (r_know[wh] && r_guess[wh]) {
			free(r_guess[wh]);
			r_guess[wh] = null;
		}
		else if(!r_know[wh] && r_guess[wh] == null) {
			mpos = 0;
			strcpy(buf, r_stones[wh]);
			msg(callit);
			if (get_str(buf, cw) == NORM) {
				r_guess[wh] = new(strlen(buf) + 1);
				strcpy(r_guess[wh], buf);
			}
		}
		mpos = 0;
		msg("Now wearing %s",inv_name(obj,true));
		ringfood = ring_eat();
		nochange = false;
	}


	/*
	* ring_off:
	*	Take off some ring
	*/
	this.ring_off = function()
	{
		reg int ring;
		reg struct object *obj;
		
		if (cur_ring[LEFT] == null && cur_ring[RIGHT] == null) {
			msg("You're not wearing any rings.");
			return;
		}
		else if (cur_ring[LEFT] == null)
			ring = RIGHT;
		else if (cur_ring[RIGHT] == null)
			ring = LEFT;
		else
			if ((ring = gethand(true)) < 0)
				return;
		mpos = 0;
		obj = cur_ring[ring];
		if (obj == null) {
			msg("Not wearing such a ring.");
			return;
		}
		if (dropcheck(obj)) {
			msg("Was wearing %s", inv_name(obj, true));
			nochange = false;
			ringfood = ring_eat();
		}
	}


	/*
	* toss_ring:
	*	Remove a ring and stop its effects
	*/
	this.toss_ring = function(what)
	//struct object *what;
	{
		bool okring;

		/*
		* okring = false break;case:
		* 1) ring is cursed and benefit = plus
		* 2) ring is blessed and benefit = minus
		*/
		okring = !((what.o_ac > 0 && o_on(what, ISCURSED)) ||
				(what.o_ac < 0 && o_on(what, ISBLESS)));

		cur_ring[what == cur_ring[LEFT] ? LEFT : RIGHT] = null;
		if (okring) {
			switch (what.o_which) {
				case R_SPEED:
					extinguish(nohaste);
					nohaste(false);
				break;case R_BLIND:
					sight(false);
				break;case R_SLOW:
					player.t_flags &= ~ISSLOW;
				break;case R_SAPEM:
					extinguish(sapem);
				break;case R_GIANT:
					him.s_ef = him.s_re;
					ringabil();
				break;case R_ADDSTR:
					chg_abil(STR,-what.o_ac,false);
				break;case R_KNOW:
					chg_abil(WIS,-what.o_ac,false);
				break;case R_DEX:
					chg_abil(DEX,-what.o_ac,false);
				break;case R_CONST:
					chg_abil(CON,-what.o_ac,false);
				break;case R_SEEINVIS:
					player.t_flags &= ~CANSEE;
					extinguish(unsee);
					light(&hero);
					mvwaddch(cw, hero.y, hero.x, PLAYER);
			}
		}
	}


	/*
	* gethand:
	*	Get a hand to wear a ring
	*/
	function gethand(isrmv)
	//bool isrmv;
	{
		reg int c;
		char *ptr;
		struct object *obj;

		while(1) {
			addmsg("Left or Right ring");
			if (isrmv)
				addmsg(starlist);
			addmsg("? ");
			endmsg();
			c = readchar();
			if (isupper(c))
				c = tolower(c);
			if (c == '*' && isrmv) {
				wclear(hw);
				obj = cur_ring[LEFT];
				if (obj != null)
					ptr = inv_name(obj, true);
				else
					ptr = "none";
				wprintw(hw, "L)  %s\n\r",ptr);
				obj = cur_ring[RIGHT];
				if (obj != null)
					ptr = inv_name(obj, true);
				else
					ptr = "none";
				wprintw(hw, "R)  %s\n\r", ptr);
				wprintw(hw, "\n\r\nWhich hand? ");
				draw(hw);
				c = readchar();
				if (isupper(c))
					c = tolower(c);
				restscr(cw);
			}
			if (c == 'l')
				return LEFT;
			else if (c == 'r')
				return RIGHT;
			else if (c == ESCAPE)
				return -1;
			mpos = 0;
			msg("L or R");
		}
	}

	/*
	* ring_eat:
	*	How much food do the hero's rings use up?
	*/
	function ring_eat()
	{
		reg struct object *lb;
		reg int hand, i, howmuch;
		bool addit;

		howmuch = 0;
		addit = true;
		for (i = LEFT; i <= RIGHT ; i += 1) {
			lb = cur_ring[i];
			if (lb != null) {
				switch (lb.o_which) {
					case R_REGEN:
					case R_GIANT:
						howmuch += 2;
					break;case R_SPEED:
					case R_SUSTSTR:
					case R_SUSAB:
						howmuch += 1;
					break;case R_SEARCH:
						howmuch += (rnd(100) < 33);
					break;case R_DIGEST:
						switch(lb.o_ac) {
							case -3: if (rnd(100) < 25)
										howmuch += 3;
							break;case -2: if (rnd(100) < 50)
										howmuch += 2;
							break;case -1: howmuch += 1;
							break;case  0: howmuch -= (rnd(100) < 50);
							break;case  3: if (rnd(100) < 25)
										howmuch -= 3;
							break;case  2: if (rnd(100) < 50)
										howmuch -= 2;
							default: howmuch -= 1;
						}
					break;default:
						addit = false;
				}
				if (addit) {
					if (o_on(lb, ISBLESS))
						howmuch -= 1;
					else if (o_on(lb, ISCURSED))
						howmuch += 1;
				}
			}
		}
		return howmuch;
	}


	/*
	* ring_num:
	*	Print ring bonuses
	*/
	//char *
	this.ring_num = function(what)
	//struct object *what;
	{
		static char number[5];

		number[0] = '\0';
		if (o_on(what,ISKNOW) || o_on(what,ISPOST)) {
			if (magring(what)) {	/* only rings with numbers */
				number[0] = ' ';
				strcpy(&number[1], num(what.o_ac, 0));
			}
		}
		return number;
	}


	/*
	* magring:
	*	Returns true if a ring has a number, i.e. +2
	*/
	this.magring = function(what)
	//struct object *what;
	{
		switch(what.o_which) {
			case R_SPEED:
			case R_ADDSTR:
			case R_PROTECT:
			case R_ADDHIT:
			case R_ADDDAM:
			case R_DIGEST:
			case R_CONST:
			case R_KNOW:
			case R_DEX:
				return true;
			default:
				return false;
		}
	}


	/*
	* ringabil:
	*	Compute effective abilities due to rings
	*/
	this.ingabil = function()
	{
		reg struct object *rptr;
		reg int i;

		for(i = LEFT; i <= RIGHT; i++) {
			rptr = cur_ring[i];
			if (rptr != null) {
				switch(rptr.o_which) {
					case R_ADDSTR:
						chg_abil(STR,rptr.o_ac,FROMRING);
					break;case R_DEX: 
						chg_abil(DEX,rptr.o_ac,FROMRING);
					break;case R_KNOW:
						chg_abil(WIS,rptr.o_ac,FROMRING);
					break;case R_CONST:
						chg_abil(CON,rptr.o_ac,FROMRING);
				}
			}
		}
	}


	/*
	* init_ring:
	*	Initialize a ring
	*/
	this.init_ring = function(what,fromwiz)
	//struct object *what;
	//bool fromwiz;			/* true when from wizards */
	{
		reg int much;

		switch (what.o_which) {
			case R_DIGEST:		/* -3 to +3 rings */
			case R_ADDSTR:
			case R_PROTECT:
			case R_ADDHIT:
			case R_ADDDAM:
			case R_DEX:
			case R_KNOW:
			case R_CONST:
				if (fromwiz) {
					much = getbless();		/* get wizards response */
				}
				else {						/* normal users */
					if (rnd(100) < 25)
						much = -rnd(3) - 1;
					else
						much = rnd(3) + 1;
				}
				what.o_ac = much;
				if (much < 0)
					setoflg(what,ISCURSED);
			break;case R_SPEED:
				what.o_ac = rnd(4) + 1;
			break;case R_AGGR:
			case R_DELUS:
			case R_HEAVY:
			case R_BLIND:
			case R_SLOW:
			case R_SAPEM:
			case R_TELEPORT:
				what.o_ac = 0;
				setoflg(what,ISCURSED);	
			break;case R_GIANT:
				what.o_ac = 25;		/* lots !! of STR */
			break;default:
				what.o_ac = 1;
		}
		what.o_type = RING;
		what.o_weight = things[TYP_RING].mi_wght;
		what.o_typname = things[TYP_RING].mi_name;
		what.o_vol = itemvol(what);
	}

	/*
	* ringex:
	*	Get extra gains from rings
	*/
	this.ringex = function(rtype)
	//int rtype;
	{
		reg int howmuch = 0;

		if (isring(LEFT, rtype))
			howmuch += cur_ring[LEFT].o_ac;
		if (isring(RIGHT, rtype))
			howmuch += cur_ring[RIGHT].o_ac;
		return howmuch;
	}

	/*
	* iswearing:
	*	Returns true when the hero is wearing a certain type of ring
	*/
	this.iswearing = function(ring)
	//int ring;
	{
		return (isring(LEFT,ring) || isring(RIGHT,ring));
	}

	/*
	* isring:
	*	Returns true if a ring is on a hand
	*/
	this.isring = function(hand,ring)
	//int hand, ring;
	{
		if (cur_ring[hand] != null && cur_ring[hand].o_which == ring)
			return true;
		return false;
	}
}