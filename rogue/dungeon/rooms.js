/*
 * Draw the nine rooms on the screen
 *
 */

function room(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	/*
	* do_rooms:
	*	Place the rooms in the dungeon
	*/
	this.do_rooms = function()
	{
		const rnd_room = r.dungeon.new_level.rnd_room;
		const rf_on = this.rf_on;
		const GOLDCALC = ()=>{ return (r.rnd(50 + 10 * r.dungeon.level) + 2) };
		const add_mon = this.add_mon;
		const fatal = console.log;
		
		let mloops, mchance, nummons, left_out, roomtries;
		let treas = false;
		let i;
		let rp; //reg struct room *rp;
		let item; //reg struct linked_list *item;
		let tp;//reg struct thing *tp;
		let top, bsze, mp;//struct coord top, bsze, mp;

		/*
		* bsze is the maximum room size
		*/
		bsze = {
			x: Math.floor(d.COLS / 3),
			y: Math.floor((d.LINES - 1) / 3)
		}
		
		/*
		* Clear things for a new level
		*/
		//for (rp = rooms; rp < r.dungeon.rooms[d.MAXROOMS]; rp++)
		for (let i in r.dungeon.rooms){
			rp = r.dungeon.rooms[i];
			rp.r_goldval = rp.r_nexits = rp.r_flags = 0;
			r.dungeon.rooms[i] = rp;
		}
		/*
		* Put the gone rooms, if any, on the level
		*/
		left_out = r.rnd(4);
		for (i = 0; i < left_out; i++)
			r.dungeon.rooms[rnd_room()].r_flags |= d.ISGONE;
		/*
		* dig and populate all the rooms on the level
		*/
		//for (i = 0, rp = rooms; i < MAXROOMS; rp++, i++) {
		for (let i in r.dungeon.rooms) {
			rp = r.dungeon.rooms[i];
			/*
			* Find upper left corner of box that this room goes in
			*/
			top = { x: Math.floor((Number(i)%3) * bsze.x + 1),
					y: Math.floor(Number(i)/3 * bsze.y) };
			if (rf_on(rp,d.ISGONE)) {
				/*
				* Place a gone room.  Make certain that there is a
				* blank line for passage drawing.
				*/
				roomtries = 0;
				do {
					
					rp.r_pos.x = top.x + r.rnd(bsze.x-2) + 1;
					rp.r_pos.y = top.y + r.rnd(bsze.y-2) + 1;
					rp.r_max.x = -d.COLS;
					rp.r_max.y = -d.LINES;
					if (++roomtries > 250){
						fatal("failed to place a gone room");
						r.playing = false;	
						break;
					}
				} while(!(rp.r_pos.y > 0 && rp.r_pos.y < d.LINES-2));
				//console.log(rp);
				continue;
			}
			if (r.rnd(10) < r.dungeon.level-1)
				rp.r_flags |= d.ISDARK;
			/*
			* Find a place and size for a random room
			*/
			roomtries = 0;	
			do {
				
				rp.r_max.x = r.rnd(bsze.x - 4) + 4;
				rp.r_max.y = r.rnd(bsze.y - 4) + 4;
				rp.r_pos.x = top.x + r.rnd(bsze.x - rp.r_max.x);
				rp.r_pos.y = top.y + r.rnd(bsze.y - rp.r_max.y);
				if (++roomtries > 250) {
					fatal("failed to place a good room");
					r.playing = false;	
					break;
				}
			} while(!(rp.r_pos.y != 0));

			if (r.dungeon.level < r.dungeon.max_level)
				mchance = 30;	/* 30% when going up (all monsters) */
			else
				mchance = 3;	/* 3% when going down */
			treas = false;
			if (r.rnd(100) < mchance && (rp.r_max.x * rp.r_max.y) >
			((bsze.x * bsze.y * 55) / 100)) {
				treas = true;
				rp.r_flags |= d.ISTREAS;
				rp.r_flags |= d.ISDARK;
			}
			/*
			* Put the gold in
			*/
			if ((r.rnd(100) < 50 || treas) && (!r.amulet || r.dungeon.level >= r.dungeon.max_level)) {
				rp.r_goldval = GOLDCALC();
				if (treas)
					rp.r_goldval += 200 + (15 * (r.rnd(r.dungeon.level) + 2));
				rp.r_gold.y = rp.r_pos.y + r.rnd(rp.r_max.y - 2) + 1;
				rp.r_gold.x = rp.r_pos.x + r.rnd(rp.r_max.x - 2) + 1;
			}
			draw_room(rp);
			/*
			* Put the monster in
			*/
			if (treas) {
				mloops = r.rnd(r.dungeon.level / 3) + 6;
				mchance = 1;
			}
			else {
				mloops = 1;
				mchance = 100;
			}
			for (nummons = 0; nummons < mloops; nummons++) {
				if (r.rnd(mchance) < (rp.r_goldval > 0 ? 80 : 25))
					add_mon(rp, treas);
			}
			//console.log(rp);
			r.dungeon.rooms[i] = rp;
		}
	}

	/*
	* add_mon:
	*	Add a monster to a room
	*/
	this.add_mon = (rm, treas)=>
	//struct room *rm;
	//bool treas;
	{
		let tp;//reg struct thing *tp;
		let item;//reg struct linked_list *item;
		let mp;//struct coord mp;
		let chance;

		const rnd_pos = this.rnd_pos;
		const new_monster = r.monster.new_monster;
		const rnd_mon = r.monster.rnd_mon;
		const monsters = v.monsters;

		mp = rnd_pos(rm);
		item = new_monster(rnd_mon(false,false), mp, treas);
		tp = f.THINGPTR(item);
		chance = r.rnd(100);
		if (r.levtype == d.MAZELEV)
			chance = r.rnd(50);
		/*
		* See if monster has a treasure
		*/
		if (r.levtype == d.MAZELEV && r.rnd(100) < 20) {
			let fd; //reg struct linked_list *fd;

			fd = r.item.things_f.new_thing(false, d.FOOD, 0);
			tp.t_pack = r.attach(tp.t_pack, fd);
		}
		else {
			if (chance < monsters[tp.t_indx].m_carry)
				tp.t_pack = r.attach(tp.t_pack,  r.item.things_f.new_thing(false, d.ANYTHING));
		}
	}

	/*
	* draw_room:
	*	Draw a box around a room
	*/
	function draw_room(rp)
	//struct room *rp;
	{
		let j, k;

		const move = r.UI.move;
		const addch = r.UI.addch;
		const mvaddch = r.UI.mvaddch;

		r.UI.setDsp(d.DSP_MAIN);

		move(rp.r_pos.y, rp.r_pos.x+1);
		vert(rp.r_max.y-2);			/* Draw left side */
		move(rp.r_pos.y+rp.r_max.y-1, rp.r_pos.x);
		horiz(rp.r_max.x);				/* Draw bottom */
		move(rp.r_pos.y, rp.r_pos.x);
		horiz(rp.r_max.x);			/* Draw top */
		move(rp.r_pos.y, rp.r_pos.x+rp.r_max.x);
		vert(rp.r_max.y-2);			/* Draw right side */
		/*
		* Put the floor down
		*/
		for (j = 1; j < rp.r_max.y - 1; j++) {
			//move(rp.r_pos.y + j, rp.r_pos.x + k);
			for (k = 1; k < rp.r_max.x - 1; k++) {
				move(rp.r_pos.y + j, rp.r_pos.x + k);
				addch(d.FLOOR);
			}
		}
		/*
		* Put the gold there
		*/
		if (rp.r_goldval > 0)
			mvaddch(rp.r_gold.y, rp.r_gold.x, d.GOLD);
	}

	/*
	* horiz:
	*	draw a horizontal line
	*/
	function horiz(cnt)
	//int cnt;
	{
		const addch = r.UI.addch;

		//while (cnt-- > 0)
		addch('-'.repeat(cnt));
	}


	/*
	* vert:
	*	draw a vertical line
	*/
	function vert(cnt)
	//int cnt;
	{
		const move = r.UI.move;
		const addch = r.UI.addch;

		let x, y;

		//getyx(stdscr, y, x);
		let pos = r.UI.getyx();
		x = pos.x;
		y = pos.y;

		x--;
		while (cnt-- > 0) {
			move(++y, x);
			addch('|');
		}
	}

	/*
	* rnd_pos:
	*	pick a random spot in a room
	*/
	//struct coord *
	this.rnd_pos = function(rp)
	//struct room *rp;
	{
		let y, x, i;
		let spot; //static struct coord spot;

		i = 0;
		do {
			x = rp.r_pos.x + r.rnd(rp.r_max.x - 2) + 1;
			y = rp.r_pos.y + r.rnd(rp.r_max.y - 2) + 1;
			i += 1;
		} while(r.UI.winat(y, x) != d.FLOOR && i < 1000);
		//spot.x = x;
		//spot.y = y;
		return {x: x, y: y};//spot;
	}

	/*
	* rf_on:
	* 	Returns true if flag is set for room stuff
	*/
	this.rf_on = function(rm, bit)
	//struct room *rm;
	//long bit;
	{
		return (rm.r_flags & bit);
	}
}