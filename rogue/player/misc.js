/*
 * all sorts of miscellaneous routines
 */

function misc(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;
		
    const cw = d.DSP_MAIN_FG;
    const mw = d.DSP_MAIN_BG;
	
	//const pl_on =(what)=> { return (player.t_flags & what); }
	const tolower = (text)=>{return text.toLowerCase();};
	const extras = r.item.things_f.extras;
	
	let inwhgt = false;
	this.inwhgt = (flg)=>{ inwhgt = flg;}
	this.get_inwhgt =()=>{return inwhgt;}

	/*
	* waste_time:
	*	Do nothing but let other things happen
	*/
	this.waste_time = ()=>
	{
		const do_daemons = r.daemon.do_daemons;
		const do_fuses = r.daemon.do_fuses;
		const get_inwhgt = r.player.misc.get_inwhgt;
		
		if (get_inwhgt())		/* if from wghtchk, then done */
			return;
		do_daemons(d.BEFORE);
		do_daemons(d.AFTER);
		do_fuses();
	}

	/*
	* getindex:
	*	Convert a type into an index for the things structures
	*/
	this.getindex = function(what)
	//char what;
	{
		let index = -1;

		switch (what) {
			case d.POTION:
				index = d.TYP_POTION;
				break;
			case d.SCROLL:	
				index = d.TYP_SCROLL;
				break;
			case d.FOOD:		
				index = d.TYP_FOOD;
				break;
			case d.RING:		
				index = d.TYP_RING;
				break;
			case d.AMULET:	
				index = d.TYP_AMULET;
				break;
			case d.ARMOR:		
				index = d.TYP_ARMOR;
				break;
			case d.WEAPON:	
				index = d.TYP_WEAPON;
				break;
			case d.STICK:		
				index = d.TYP_STICK;
		}
		return index;
	}

	/*
	* tr_name:
	*	print the name of a trap
	*/
	//char *
	this.tr_name = function(ch)
	//char ch;
	{
		let s;

		switch (ch) {
			case d.TRAPDOOR:
				s = "A trapdoor.";
				break;
			case d.BEARTRAP:
				s = "A beartrap.";
				break;
			case d.SLEEPTRAP:
				s = "A sleeping gas trap.";
				break;
			case d.ARROWTRAP:
				s = "An arrow trap.";
				break;
			case d.TELTRAP:
				s = "A teleport trap.";
				break;
			case d.DARTTRAP:
				s = "A dart trap.";
				break;
			case d.POOL:
				s = "A magic pool.";
				break;
			case d.POST:
				s = "A trading post.";
				break;
			case d.MAZETRAP:
				s = "A maze trap.";
				break;
			default:
				s = "A bottomless pit.";		/* shouldn't get here */
		}
		return s;
	}

	/*
	* Look:
	*	A quick glance all around the player
	*/
	this.look = function(wakeup)
	//bool wakeup;
	{
		
		const pl_on = r.player.pl_on;
		const show = r.player.move.show;
		const isalpha = (ch)=>{ return /^[a-zA-Z]+$/.test(ch); }
		const mvwinch = r.UI.mvwinch;
		const wake_monster = r.monster.wake_monster;
		const THINGPTR = f.THINGPTR;
		const isatrap = r.player.move.isatrap;
		const trap_at = r.player.move.trap_at;
		const rf_on = r.dungeon.rooms_f.rf_on;
		const wmove = r.UI.wmove;
		const waddch = r.UI.waddch;
		const find_mons = r.monster.chase.find_mons;
	
		const player = r.player.get_player();
		const hero = r.player.get_hero();

		let ch;
		let oldx, oldy, y, x;
		let rp; //reg struct room *rp;
		let ey, ex, oex, oey;
		let passcount = 0;
		let inpass, blind;

		let wp = r.UI.getyx();
		oldy = wp.y;
		oldx = wp.x;

		oex = player.t_oldpos.x;
		oey = player.t_oldpos.y;
		blind = pl_on(d.ISBLIND);
		if ((r.oldrp != null && rf_on(r.oldrp,d.ISDARK)) || blind) {
			for (x = oex - 1; x <= oex + 1; x += 1)
				for (y = oey - 1; y <= oey + 1; y += 1)
					if ((y != hero.y || x != hero.x) && show(y, x) == d.FLOOR)
						r.UI.mvwaddch(cw, y, x, ' ');
		}
		rp = player.t_room;
		inpass = (rp == null);				/* true when not in a room */
		ey = hero.y + 1;
		ex = hero.x + 1;
		for (x = hero.x - 1; x <= ex; x += 1) {
			if (x >= 0 && x <= d.COLS - 1) {
				for (y = hero.y - 1; y <= ey; y += 1) {
					if (y <= 0 || y >= d.LINES )//- 2)
						continue;
					if (isalpha(mvwinch(mw, y, x))) {
						let it; //reg struct linked_list *it;
						let tp; //reg struct thing *tp;

						if (wakeup || (!inpass && rf_on(rp, d.ISTREAS)))
							it = wake_monster(y, x);
						else
							it = find_mons(y, x);
						if (it == null)				/* lost monster */
							r.UI.mvaddch(y, x, d.FLOOR);
						else {
							tp = THINGPTR(it);
							if (isatrap(tp.t_oldch = r.UI.mvinch(y, x))) {
								let trp; //struct trap *trp;

								if ((trp = trap_at(y,x)) == null)
									break;
								if (trp.tr_flags & d.ISFOUND)
									tp.t_oldch = trp.tr_type;
								else
									tp.t_oldch = d.FLOOR;
							}
							if (tp.t_oldch == d.FLOOR && rf_on(rp,d.ISDARK))
								if (!blind)
									tp.t_oldch = ' ';
						}
					}
					/*
					* Secret doors show as walls
					*/
					if ((ch = show(y, x)) == d.SECRETDOOR) {
						if (inpass || y == rp.r_pos.y || y == rp.r_pos.y + rp.r_max.y - 1)
							ch = '-';
						else
							ch = '|';
					}
					/*
					* Don't show room walls if he is in a passage
					*/
					if (!blind) {
						if ((y == hero.y && x == hero.x) || (inpass && (ch == '-' || ch == '|')))
							continue;
					}
					else
						ch = ' ';
					wmove(cw, y, x);
					waddch(cw, ch);
					if (r.door_stop && !r.firstmove && r.running) {
						switch (runch) {
							case 'h':
								if (x == ex)
									continue;
								break;
							case 'j':
								if (y == hero.y - 1)
									continue;
								break;
							case 'k':
								if (y == ey)
									continue;
								break;
							case 'l':
								if (x == hero.x - 1)
									continue;
								break;
							case 'y':
								if ((x + y) - (hero.x + hero.y) >= 1)
									continue;
								break;
							case 'u':
								if ((y - x) - (hero.y - hero.x) >= 1)
									continue;
								break;
							case 'n':
								if ((x + y) - (hero.x + hero.y) <= -1)
									continue;
								break;
							case 'b':
								if ((y - x) - (hero.y - hero.x) <= -1)
									continue;
						}
						switch (ch) {
							case d.DOOR:
								if (x == hero.x || y == hero.y)
									r.running = false;
								break;
							case d.PASSAGE:
								if (x == hero.x || y == hero.y)
									passcount += 1;
								break;
							case d.FLOOR:
							case '|':
							case '-':
							case ' ':
								break;
							default:
								r.running = false;
								break;
						}
					}
				}
			}
		}
		if (r.door_stop && !r.firstmove && r.passcount > 1)
			r.running = false;
		r.UI.mvwaddch(cw, hero.y, hero.x, d.PLAYER);
		wmove(cw, oldy, oldx);
		player.t_oldpos = {x:hero.x, y:hero.y};
		r.oldrp = rp;
		r.player.set_player(player);
	}

	/*
	* find_obj:
	*	find the unclaimed object at y, x
	*/
	//struct linked_list *
	this.find_obj = function(y, x)
	//int y, x;
	{
		let obj; //reg struct linked_list *obj;
		let op; //reg struct object *op;

		for (obj = r.dungeon.lvl_obj; obj != null; obj = f.next(obj)) {
			op = f.OBJPTR(obj);
			if (op.o_pos.y == y && op.o_pos.x == x)
				return obj;
		}
		return null;
	}

	/*
	* eat:
	*	Let the hero eat some food.
	*/
	this.eat = function()
	{
		const updpack = r.player.encumb.updpack;
		const check_level = r.monster.battle.check_level;
		const del_pack = r.item.pack_f.del_pack;
		const get_item = r.item.pack_f.get_item;
		const o_on = r.o_on;

		const him = r.player.get_him();

		let item; //reg struct linked_list *item;
		let obj; //reg struct object *obj;
		let goodfood, cursed; //reg int goodfood, cursed;

		if ((item = get_item("eat", d.FOOD)) == null)
			return;
		obj = f.OBJPTR(item);
		if (obj.o_type != d.FOOD) {
			r.UI.msg(ms.EAT_1);
			r.after = false;
			return;
		}
		cursed = 1;
		if (o_on(obj, d.ISCURSED))
			cursed += 1;
		else if (o_on(obj, d.ISBLESS))
			cursed -= 1;
		if (obj.o_which == d.FRUITFOOD) {
			r.UI.msg(ms.EAT_2(ms.FRUIT));
			goodfood = 100;
		}
		else {
			if (r.rnd(100) > 80 || o_on(obj, d.ISCURSED)) {
				r.UI.msg(ms.EAT_3);
				goodfood = 300;
				him.s_exp += 1;
				check_level();
				r.player.set_him(him);
			}
			else {
				r.UI.msg(ms.EAT_4);
				goodfood = 200;
			}
		}
		goodfood *= cursed;
		if ((r.player.food_left += d.HUNGERTIME + r.rnd(400) - goodfood) > d.STOMACHSIZE)
			r.player.food_left = d.STOMACHSIZE;
		r.player.hungry_state = d.F_OKAY;
		updpack();					/* update pack */
		if (obj == r.player.get_cur_weapon())
			r.player.set_cur_weapon(null);
		del_pack(item);		/* get rid of the food */
	}

	/*
	* aggravate:
	*	aggravate all the monsters on this level
	*/
	this.aggravate = function()
	{
		const runto = r.monster.chase.runto;


		let mi; //reg struct linked_list *mi;

		for (mi = mlist; mi != null; mi = f.next(mi))
			runto((f.THINGPTR(mi)).t_pos, hero);
	}

	/*
	* vowelstr:
	* 	If string starts with a vowel, return "n" for an "an"
	*/
	//char *
	this.vowelstr = function(str)
	//char *str;
	{
		switch (tolower(str)) {
			case 'a':
			case 'e':
			case 'i':
			case 'o':
			case 'u':
				return "n";
			default:
				return "";
		}
	}

	/* 
	* is_current:
	*	See if the object is one of the currently used items
	*/
	this.is_current = function(obj)
	//struct object *obj;
	{
		const cur_ring = r.player.get_cur_ring();

		if (obj == null)
			return false;
		if (obj == r.player.get_cur_armor() || obj == r.player.get_cur_weapon() 
		|| obj == cur_ring[d.LEFT]
		|| obj == cur_ring[d.RIGHT]) {
			r.UI.msg("Already in use.");
			return true;
		}
		return false;
	}

	/*
	* get_dir:
	*	Set up the direction coordinates
	*/
	this.get_dir = function()
	{
		const pl_on = r.player.pl_on;

		let prompt; //reg char *prompt;
		let gotit; //reg bool gotit;

		prompt = "Direction: ";
		do {

			gotit = true;
			//switch (readchar()) {
			//	case 'h': case'H': delta.y =  0; delta.x = -1;
			//		break;
			//	case 'j': case'J': delta.y =  1; delta.x =  0;
			//		break;
			//	case 'k': case'K': delta.y = -1; delta.x =  0;
			//		break;
			//	case 'l': case'L': delta.y =  0; delta.x =  1;
			//		break;
			//	case 'y': case'Y': delta.y = -1; delta.x = -1;
			//		break;
			//	case 'u': case'U': delta.y = -1; delta.x =  1;
			//		break;
			//	case 'b': case'B': delta.y =  1; delta.x = -1;
			//		break;
			//	case 'n': case'N': delta.y =  1; delta.x =  1;
			//		break;
			//	case d.ESCAPE: return false;
			//		break;
			//	default:
			//		mpos = 0;
			//		msg(prompt);
			//		gotit = false;
			//}
		} while(!gotit);
		if (pl_on(d.ISHUH) && r.rnd(100) > 80) {
			do {
				r.delta.y = r.rnd(3) - 1;
				r.delta.x = r.rnd(3) - 1;
			} while (r.delta.y == 0 && r.delta.x == 0);
		}
		//mpos = 0;
		return true;
	}

	/*
	* initfood:
	*	Set up stuff for a food-type object
	*/
	this.initfood = function(what)
	//struct object *what;
	{
		const things = v.things;
		//const itemvol = r.player.encumb.itemvol;

		what.o_type = d.FOOD;
		what.o_group = d.NORMFOOD;
		if (r.rnd(100) < 15)
			what.o_group = d.FRUITFOOD;
		what.o_which = what.o_group;
		what.o_count = 1 + extras();
		what.o_flags = d.ISKNOW;
		what.o_weight = things[d.TYP_FOOD].mi_wght;
		what.o_typname = things[d.TYP_FOOD].mi_name;
		what.o_hplus = what.o_dplus = 0;
		what.o_vol = r.player.encumb.itemvol(what);

		return what;
	}
}