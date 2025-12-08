/*
 * Do anything associated with a new dungeon level
 */

function new_level(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const cw = d.DSP_MAIN_FG;
    const mw = d.DSP_MAIN_BG;

	/*
	* new_level:
	*	Dig and draw a new level 
	*/
	this.create = (ltype)=>
	//int ltype;
	{
		const wclear = r.UI.wclear;
		const clear = r.UI.clear;

		const rnd_pos = r.dungeon.rooms_f.rnd_pos;
		const put_things = this.put_things;
		const rnd_room = this.rnd_room;
		const light = r.player.move.light;
		const do_post = r.dungeon.trader.do_post;
		const do_maze = r.dungeon.trader.do_maze;

		let i;
		let ch;
		let traploc;//struct coord traploc;
		let rp; //struct room *rp;

		if (r.dungeon.level > r.dungeon.max_level)
			r.dungeon.max_level = r.dungeon.level;

		r.UI.setDsp(d.DSP_MAIN);

		wclear(cw);
		wclear(mw);
		clear();

		r.isfight = false;
		r.levtype = ltype;

		r.dungeon.mlist = r.free_list(r.dungeon.mlist);			/* free monster list */

		if (r.levtype == d.POSTLEV)
			do_post();
		else {
			r.monster.lev_mon();			/* fill in monster list */

			if (r.levtype == d.MAZELEV)
				do_maze();
			else {				/* normal levels */
				r.dungeon.rooms_f.do_rooms();		/* Draw rooms */
				r.dungeon.passage.do_passages();		/* Draw passages */
			}
			r.player.no_food++;
			put_things();			/* Place objects (if any) */
		}
		/*
		* Place the staircase down.
		*/
		r.dungeon.stairs = rnd_pos(r.dungeon.rooms[rnd_room()]);
		r.UI.setDsp(d.DSP_MAIN);
		r.UI.mvaddch(
			r.dungeon.stairs.y, 
			r.dungeon.stairs.x, 
			d.STAIRS
		);
		r.dungeon.ntraps = 0;

		if (r.levtype == d.NORMLEV)
		{
			let trp, maxtrp; //struct trap *trp, *maxtrp;

			/* Place the traps for normal levels only */

			if (r.rnd(10) < r.dungeon.level)
			{
				r.dungeon.ntraps = r.rnd(r.dungeon.level / 4) + 1;

				if (r.dungeon.ntraps > d.MAXTRAPS)
					r.dungeon.ntraps = d.MAXTRAPS;

				//maxtrp = r.dungeon.traps[r.dungeon.ntraps];
				//for (trp = &traps[0]; trp < maxtrp; trp++)
				const again =()=>{
					switch(r.rnd(d.TYPETRAPS + 1))
					{
						case 0:
							if (r.rnd(100) > 25)
								ch = again();
							else
								ch = d.POST;
							break;
						case 1: ch = d.TRAPDOOR;
							break;
						case 2: ch = d.BEARTRAP;
							break;
						case 3: ch = d.SLEEPTRAP;
							break;
						case 4: ch = d.ARROWTRAP;
							break;
						case 5: ch = d.TELTRAP;
							break;
						case 6: ch = d.DARTTRAP;
							break;
						case 7: ch = d.MAZETRAP;
							break;
						case 8:
						case 9:
							if (r.rnd(100) > 80)
								ch = again();
							else
								ch = d.POOL;
					}
					return ch;
				}

				//for (let i in r.dungeon.traps)
				for (let i=0; i< r.dungeon.ntraps; i++)
				{
					ch = again();
					trp = new t.trap();//r.dungeon.traps[i];

					trp.tr_flags = 0;
					traploc = rnd_pos(r.dungeon.rooms[rnd_room()]);
					r.UI.mvaddch(traploc.y,traploc.x,ch); //CW
					trp.tr_type = ch;
					trp.tr_pos = traploc;

					if (ch == d.POOL || ch == d.POST)
						trp.tr_flags |= d.ISFOUND;

					if (ch== d.TELTRAP && r.rnd(100)<20)// && trp<maxtrp-1)
					{
						let newloc; //struct coord newloc;

						newloc = rnd_pos(r.dungeon.rooms[rnd_room()]);
						trp.tr_goto = newloc;
						trp++;
						trp.tr_goto = traploc;
						trp.tr_type = d.TELTRAP;
						trp.tr_pos = newloc;
						r.UI.mvaddch(newloc.y, newloc.x, d.TELTRAP); 
					}
					else
						trp.tr_goto = r.rndspot;

					r.dungeon.traps[i] = trp;
				}
				console.log(`trap${ch} ${r.dungeon.traps.length}`);
			}
		}

		const stairs = r.dungeon.stairs;
		let hero = r.player.get_hero();
		do
		{
			rp = r.dungeon.rooms[rnd_room()];
			hero = rnd_pos(rp);
		} while(r.levtype==d.MAZELEV&&f.DISTANCE(hero.y,hero.x,stairs.y,stairs.x)<10);
		r.player.set_hero(hero);

		let player = r.player.get_player();
		player.t_room = rp;
		player.t_oldch = r.UI.mvinch(hero.y, hero.x);
		r.player.set_player(player);

		light(hero);
		r.UI.mvwaddch(cw,hero.y,hero.x,d.PLAYER);  //CW
		r.nochange = false;

		r.UI.comment("new_level");
	}

	/*
	* rnd_room:
	*	Pick a room that is really there
	*/
	this.rnd_room = function()
	{
		const rf_on = r.dungeon.rooms_f.rf_on;

		let rm;

		if (r.levtype != d.NORMLEV)
			rm = 0;
		else
		{
			do {
				rm = r.rnd(d.MAXROOMS);
			} while (rf_on(r.dungeon.rooms[rm],d.ISGONE));
		}
		return rm;
	}


	/*
	* put_things:
	*	put potions and scrolls on this level
	*/

	this.put_things = ()=>
	{
		const goingup = ()=>{return (r.dungeon.level < r.dungeon.max_level)};
		const new_thing = r.item.things_f.new_thing;
		const rnd_room = this.rnd_room;
		const rnd_pos = r.dungeon.rooms_f.rnd_pos;
		const rf_on = r.dungeon.rooms_f.rf_on;

		let i, cnt, rm;
		let item; //struct linked_list *item;
		let cur; //struct object *cur;
		let tp; //struct coord tp;

		/* Throw away stuff left on the previous level (if anything) */

		r.dungeon.lvl_obj = r.free_list(r.dungeon.lvl_obj);

		/* The only way to get new stuff is to go down into the dungeon. */

		if (goingup())
			return;

		/* Do MAXOBJ attempts to put things on a level */

		for (i = 0; i < d.MAXOBJ; i++)
		{
			if (r.rnd(100) < 40)
			{
				item = new_thing(false, d.ANYTHING);
				r.dungeon.lvl_obj =r.attach(r.dungeon.lvl_obj, item);
				cur = f.OBJPTR(item);
				cnt = 0;
				do {
					/* skip treasure rooms */
					rm = rnd_room();
					if (++cnt > 500)
						break;
				} while(rf_on(r.dungeon.rooms[rm],d.ISTREAS) && r.levtype!=d.MAZELEV);

				tp = rnd_pos(r.dungeon.rooms[rm]);
				r.UI.setDsp(d.DSP_MAIN);
				r.UI.mvaddch(tp.y, tp.x, cur.o_type);
				cur.o_pos = tp;
			}
		}
		/*
		* If he is really deep in the dungeon and he hasn't found the
		* amulet yet, put it somewhere on the ground
		*/
		if (r.dungeon.level >= d.AMLEVEL && !r.amulet && r.rnd(100) < 70)
		{
			item = new_thing(false, d.AMULET, 0);
			r.dungeon.lvl_obj = r.attach(r.dungeon.lvl_obj , item);
			cur = f.OBJPTR(item);
			rm = rnd_room();
			tp = rnd_pos(r.dungeon.rooms[rm]);
			r.UI.setDsp(d.DSP_MAIN);
			r.UI.mvaddch(tp.y, tp.x, cur.o_type);
			cur.o_pos = tp;
		}

		for (i = 0; i < d.MAXROOMS; i++)		/* loop through all */
		{
			if (rf_on(r.dungeon.rooms[i],d.ISTREAS))	/* treasure rooms */
			{
				let numthgs, isfood;

				numthgs = r.rnd(r.dungeon.level / 3) + 6;
				while (numthgs-- >= 0)
				{
					isfood = true;
					do {
						item = new_thing(true, d.ANYTHING);
						cur = f.OBJPTR(item);

						/* dont create food for */
						if (cur.o_type == d.FOOD)
							r.discard(item);

						/* treasure rooms */
						else
							isfood = false;

					} while (isfood);

					r.dungeon.lvl_obj = r.attach(r.dungeon.lvl_obj , item);
					tp = rnd_pos(r.dungeon.rooms[i]);
					r.UI.setDsp(d.DSP_MAIN);
					r.UI.mvaddch(tp.y, tp.x, cur.o_type);
					cur.o_pos = tp;
				}
			}
		}
	}
}