/*
 * Mostly wizard commands. Sometimes used by players.
 *
 */

function wizard(r){
	    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const cw = d.DSP_MAIN_FG;
    const mw = d.DSP_MAIN_BG;

	//extern struct termios terminal;

	/*
	* whatis:
	*	What a certain object is
	*/
	this.whatis = function(what)
	//struct linked_list *what;
	{
		const get_item = r.item.pack_f.get_item;
		const OBJPTR = f.OBJPTR;
		const setoflg = r.setoflg; 

		const s_know = r.item.s_know;	
		const p_know = r.item.p_know;	
		const r_know = r.item.r_know;	
		const ws_know = r.item.ws_know;

		let obj; //reg struct object *obj;
		let item;//reg struct linked_list *item;
		let wh;

		if (what == null) {				/* we need to ask */
			if ((item = get_item("identify", 0)) == null)
				return;
		}
		else							/* no need to ask */
			item = what;
		obj = OBJPTR(item);
		setoflg(obj, d.ISKNOW);
		wh = obj.o_which;
		switch (obj.o_type) {
			case d.SCROLL:
				s_know[wh] = true;
			break;
			case d.POTION:
				p_know[wh] = true;
			break;
			case d.STICK:
				ws_know[wh] = true;
			break;
			case d.RING:
				r_know[wh] = true;
		}
		if (what == null)
			r.UI.msg(inv_name(obj, false));
	}

	/*
	* create_obj:
	*	Create any object for wizard or scroll (almost)
	*/
	function create_obj(fscr)
	//bool fscr;
	{
		let item; //reg struct linked_list *item;
		let obj; //reg struct object *obj;
		let wh, ch, otype;
		let newitem, newtype, msz, oname;
		let mf; //struct magic_info *mf;
		let nogood = true, inhw = false;

		if (fscr)
			msg(" ");
		else if (r.wizard) {
			msg("Create what?%s: ", starlist);
			ch = readchar();
			mpos = 0;
			if (ch == ESCAPE)
				return;
			else if (ch != '*')
				nogood = false;
		}
		if (nogood) {
			inhw = true;
			wclear(hw);
			wprintw(hw,"Item\tKey\n\n");
			for (otype = 0; otype < NUMTHINGS; otype++) {
				if (otype != TYP_AMULET || r.wizard) {
					mf = thnginfo[otype];
					wprintw(hw,"%s\t %c\n",things[otype].mi_name,mf.mf_show);
				}
			}
			if (r.wizard)
				waddstr(hw,"monster\t (A-z)");
			wprintw(hw,"\n\nWhat do you want to create? ");
			draw(hw);
			do {
				ch = readchar();
				if (ch == ESCAPE) {
					after = false;
					restscr(cw);
					return;
				}
				switch (ch) {
					case RING:		case STICK:	case POTION:
					case SCROLL:	case ARMOR:	case WEAPON:
					case FOOD:		case AMULET:
						nogood = false;
						break;
					default:
						if (isalpha(ch))
							nogood = false;
				}
			} while (nogood);
		}
		if (isalpha(ch)) {
			if (inhw)
				restscr(cw);
			makemons(ch);		/* make monster & be done with it */
			return;
		}
		otype = getindex(ch);
		if (otype == -1 || (otype == AMULET && !wizard)) {
			if (inhw)
				restscr(cw);
			mpos = 0;
			msg("You can't create that !!");
			return;
		}
		newitem = ch;
		mf = thnginfo[otype];
		oname = things[otype].mi_name;
		msz = mf.mf_max;
		nogood = true;
		if (msz == 1) {		/* if only one type of item */
			ch = 'a';
			nogood = false;
		}
		else if (!fscr && wizard) {
			if (!inhw) {
				msg("Which %s?%s: ", oname, starlist);
				ch = readchar();
				if (ch == ESCAPE)
					return;
				if (ch != '*')
					nogood = false;
			}
		}
		if (nogood) {
			let wmi; //struct magic_item *wmi;
			let ii;

			mpos = 0;
			inhw = true;
			switch(newitem) {
				case POTION:	wmi = p_magic[0];
				break;
				case SCROLL:	wmi = s_magic[0];
				break;
				case RING:		wmi = r_magic[0];
				break;
				case STICK:		wmi = ws_magic[0];
				break;
				case WEAPON:	wmi = w_magic[0];
				break;
				default:		wmi = a_magic[0];
			}
			wclear(hw);
			for (ii = 0 ; ii < msz ; ii++) {
				mvwaddch(hw,ii % 13,ii > 12 ? COLS/2 : 0, ii + 'a');
				waddstr(hw,") ");
				waddstr(hw,wmi.mi_name);
				wmi++;
			}
			sprintf(prbuf,"Which %s? ", oname);
			mvwaddstr(hw,LINES - 1, 0, prbuf);
			draw(hw);
			do {
				ch = readchar();
				if (ch == ESCAPE) {
					restscr(cw);
					msg("");
					return;
				}
			} while (!isalpha(ch));
		}
		if (inhw)			/* restore screen if need be */
			restscr(cw);

		newtype = tolower(ch) - 'a';
		if (newtype < 0 || newtype >= msz) {	/* if an illegal value */
			mpos = 0;
			after = false;
			if (inhw)
				restscr(cw);
			msg("There is no such %s", oname);
			return;
		}
		mpos = 0;
		item = new_thing(false, newitem, newtype);
		obj = OBJPTR(item);
		wh = obj.o_type;
		if (wh == WEAPON || wh == ARMOR || wh == RING) {
			if (fscr)					/* users get +3 to -3 */
				ch = rnd(7) - 3;
			else {						/* wizard gets to choose */
				if (wh == RING)
					init_ring(obj, true);
				else
					ch = getbless();
			}
			if (wh == WEAPON)
				obj.o_hplus = obj.o_dplus = ch;
			else if (wh == ARMOR)
				obj.o_ac = armors[obj.o_which].a_class - ch;
			if (ch < 0)
				setoflg(obj, ISCURSED);
			else
				resoflg(obj, ISCURSED);
		}
		mpos = 0;
		if (fscr)
			whatis(item);			/* identify for aquirement scroll */
		wh = add_pack(item, false);
		if (wh == false)			/* won't fit in pack */
			discard(item);
	}


	/*
	* getbless:
	*	Get a blessing for a wizards object
	*/
	function getbless()
	{
		let bless;

		msg("Blessing: ");
		prbuf[0] = '\0';
		bless = get_str(prbuf, cw);
		if (bless == NORM)
			bless = atoi(prbuf);
		else
			bless = 0;
		return bless;
	}

	/*
	* makemons:
	*	Make a monster
	*/
	function makemons(what)
	//int what;
	{
		const look = r.player.misc.look;

		let x, y, oktomake = false, appear = 1;
		let mp; //struct coord mp;

		oktomake = false;
		for (x = hero.x - 1 ; x <= hero.x + 1 ; x++) {
			for (y = hero.y - 1 ; y <= hero.y + 1 ; y++) {
				if (x != hero.x || y != hero.y) {
					if (step_ok(winat(y, x)) && rnd(++appear) == 0) {
						mp.x = x;
						mp.y = y;
						oktomake = true;
						break;
					}
				}
			}
		}
		if (oktomake) {
			new_monster(midx(what), mp, false);
			look(false);
		}
		return oktomake;
	}

	/*
	* telport:
	*	Bamf the thing someplace else
	*/
	this.teleport = function(spot, th)
	//struct coord spot;
	//struct thing *th;
	{
		const roomin = r.monster.chase.roomin;	
		const step_ok = r.UI.io.step_ok;
		const winat = r.UI.winat;
		const rnd_room = r.dungeon.new_level.rnd_room;
		const rnd_pos = r.dungeon.rooms_f.rnd_pos;
		const light = r.player.move.light;
		const pl_on = r.player.pl_on;
		const unhold = r.monster.unhold;

		const rooms = r.dungeon.rooms;
		const hero = r.player.get_hero();

		let  rm, y, x;
		let oldspot; //struct coord oldspot;
		let rp; //struct room *rp;
		let ishero;

		ishero = (th == r.player.get_player());
		oldspot = th.t_pos;
		y = th.t_pos.y;
		x = th.t_pos.x;
		r.UI.mvwaddch(cw, y, x, th.t_oldch); 
		if (!ishero)
			r.UI.mvwaddch(mw, y, x, ' ');
		rp = roomin(spot);
		if (spot.y < 0 || !step_ok(winat(spot.y, spot.x))) {
			rp = rooms[rnd_room()];
			th.t_pos = rnd_pos(rp);
		}
		else
			th.t_pos = spot;
		rm = rp;// - &rooms[0];
		th.t_room = rp;
		th.t_oldch = r.UI.mvwinch(cw, th.t_pos.y, th.t_pos.x);
		light(oldspot);
		th.t_nomove = 0;
		if (ishero) {
			light(hero);
			r.UI.mvwaddch(cw, hero.y, hero.x, d.PLAYER);
			/*
			* turn off ISHELD in case teleportation was done
			* while fighting a Fungi or Bone Devil.
			*/
			if (pl_on(d.ISHELD))
				unhold('F');
			r.count = 0;
			r.running = false;
			//flushinp();			/* flush typeahead */
			r.nochange = false;
		}
		else
			r.UI.mvwaddch(mw, th.t_pos.y, th.t_pos.x, th.t_type);
		return rm;
	}

	/*
	* passwd:
	*	See if user knows password
	*/
	function passwd()
	{
		let sp, c;
		let passok;
		//char buf[LINLEN], *xcrypt();

		msg(wizstr);
		mpos = 0;
		sp = buf;
		while ((c = getchar()) != '\n' && c != '\r' && c != ESCAPE)
		if (c == terminal.c_cc[VKILL])
			sp = buf;
		else if (c == terminal.c_cc[VERASE] && sp > buf)
			sp--;
		else
			sp++// = c;
		if (sp == buf)
			passok = false;
		else {
			sp = '\0';
			passok = (strcmp(PASSWD, xcrypt(buf, "mT")) == 0);
		}
		return passok;
	}
}