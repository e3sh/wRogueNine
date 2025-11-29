/*
 * Draw the connecting passages
 *
 */
function passage(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	/*
	* do_passages:
	*	Draw all the passages on a level.
	*/
	this.do_passages = function()
	{
		const conn = this.conn;

		let r1, r2;//reg struct rdes *r1, *r2;
		let i, j;
		let roomcount;
		//static struct rdes {
		//	bool conn[MAXROOMS];		/* possible to connect to room i */
		//	bool isconn[MAXROOMS];		/* connection was made to room i */
		//	bool	ingraph;			/* this room in graph already? */
		//} 
		const new_struct_rdes =()=>{
			return [
				{conn:[ 0, 1, 0, 1, 0, 0, 0, 0, 0 ],isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
				{conn:[ 1, 0, 1, 0, 1, 0, 0, 0, 0 ],isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
				{conn:[ 0, 1, 0, 0, 0, 1, 0, 0, 0 ],isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
				{conn:[ 1, 0, 0, 0, 1, 0, 1, 0, 0 ],isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
				{conn:[ 0, 1, 0, 1, 0, 1, 0, 1, 0 ],isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
				{conn:[ 0, 0, 1, 0, 1, 0, 0, 0, 1 ],isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
				{conn:[ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
				{conn:[ 0, 0, 0, 0, 1, 0, 1, 0, 1 ],isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
				{conn:[ 0, 0, 0, 0, 0, 1, 0, 1, 0 ],isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
			]; //MAXROOMS
		}
		const rdes = new_struct_rdes();

		/*
		* reinitialize room graph description
		*/
		//for (r1 = rdes; r1 < rdes[MAXROOMS]; r1++) {
		//	for (j = 0; j < MAXROOMS; j++)
		//		r1.isconn[j] = false;
		//	r1.ingraph = false;
		//}
		//r1 = new_struct_rdes();

		/*
		* starting with one room, connect it to a random adjacent room and
		* then pick a new room to start with.
		*/
		roomcount = 1;
		r1 = r.rnd(d.MAXROOMS);
		rdes[r1].ingraph = true;
		do {
			/*
			* find a room to connect with
			*/
			j = 0;
			for (i = 0; i < d.MAXROOMS; i++)
				if (rdes[r1].conn[i] && !rdes[i].ingraph && r.rnd(++j) == 0)
					r2 = i;
			/*
			* if no adjacent rooms are outside the graph, pick a new room
			* to look from
			*/
			if (j == 0) {
				do {
					r1 = r.rnd(d.MAXROOMS);
				} while(!rdes[r1].ingraph);
			}
			/*
			* otherwise, connect new room to the graph, and draw a tunnel
			* to it
			*/
			else {
				rdes[r2].ingraph = true;
				i = r1;
				j = r2;
				
				conn(i, j);
				rdes[r1].isconn[j] = true;
				rdes[r2].isconn[i] = true;
				roomcount++;
			}
		} while (roomcount < d.MAXROOMS);

		/*
		* attempt to add passages to the graph a random number of times so
		* that there isn't just one unique passage through it.
		*/
		for (roomcount = r.rnd(5); roomcount > 0; roomcount--) {
			r1 = r.rnd(d.MAXROOMS);	/* a random room to look from */
			/*
			* find an adjacent room not already connected
			*/
			j = 0;
			for (i = 0; i < d.MAXROOMS; i++)
				if (rdes[r1].conn[i] && !rdes[r1].isconn[i] && r.rnd(++j) == 0)
					r2 = i;
			/*
			* if there is one, connect it and look for the next added
			* passage
			*/
			if (j != 0) {
				i = r1;
				j = r2;
				
				conn(i, j);
				rdes[r1].isconn[j] = true;
				rdes[r2].isconn[i] = true;
			}
		}
		//console.log(rdes);
	}

	/*
	* conn:
	*	Cconnect two rooms.
	*/

	this.conn = (r1, r2) =>
	//int r1, r2;
	{
		const delta = r.delta;
		const rf_on = r.dungeon.rooms_f.rf_on;
		const door = this.door
		const cmov = (xy)=>{r.UI.move(xy.y, xy.x)};
		const addch = r.UI.addch;
		const ce = f.ce;
		r.UI.setDsp(d.DSP_MAIN);

		let rpf, rpt; //reg struct room *rpf, *rpt;
		let rmt, direc;
		let distance, turn_spot, turn_distance, rm;
		let curr, turn_delta, spos, epos; //struct coord curr, turn_delta, spos, epos;

		if (r1 < r2) {
			rm = r1;
			if (r1 + 1 == r2)
				direc = 'r';
			else
				direc = 'd';
		}
		else {
			rm = r2;
			if (r2 + 1 == r1)
				direc = 'r';
			else
				direc = 'd';
		}
		rpf = r.dungeon.rooms[rm];
		/*
		* Set up the movement variables, in two cases:
		* first drawing one down.
		*/
		if (direc == 'd') {
			rmt = rm + 3;				/* room # of dest */
			rpt = r.dungeon.rooms[rmt];			/* room pointer of dest */
			delta.x = 0;				/* direction of move */
			delta.y = 1;
			spos = {x:rpf.r_pos.x ,			/* start of move */
					y:rpf.r_pos.y};
			epos = {x:rpt.r_pos.x ,			/* end of move */
					y:rpt.r_pos.y};
			if (!rf_on(rpf,d.ISGONE)) {		/* if not gone pick door pos */
				spos.x += r.rnd(rpf.r_max.x-2)+1;
				spos.y += rpf.r_max.y-1;
			}
			if (!rf_on(rpt,d.ISGONE))
				epos.x += r.rnd(rpt.r_max.x-2)+1;
			distance = Math.abs(spos.y - epos.y) - 1;	/* distance to move */
			turn_delta = {y: 0,						/* direction to turn */
						x: (spos.x < epos.x ? 1 : -1)};
			turn_distance = Math.abs(spos.x - epos.x);	/* how far to turn */
			turn_spot = r.rnd(distance-1) + 1;		/* where turn starts */
		}
		else if (direc == 'r') {  /* setup for moving right */
			rmt = rm + 1;
			rpt = r.dungeon.rooms[rmt];
			delta.x = 1;
			delta.y = 0;
			spos = {x:rpf.r_pos.x ,			/* start of move */
					y:rpf.r_pos.y};
			epos = {x:rpt.r_pos.x ,			/* end of move */
					y:rpt.r_pos.y};
			if (!rf_on(rpf,d.ISGONE)) {
				spos.x += rpf.r_max.x-1;
				spos.y += r.rnd(rpf.r_max.y-2)+1;
			}
			if (!rf_on(rpt,d.ISGONE))
				epos.y += r.rnd(rpt.r_max.y-2)+1;
			distance = Math.abs(spos.x - epos.x) - 1;
			turn_delta = {y: (spos.y < epos.y ? 1 : -1) ,
						x: 0};
			turn_distance = Math.abs(spos.y - epos.y);
			turn_spot = r.rnd(distance-1) + 1;
		}
		else {
			r.UI.comment("Error in connection tables.");
		}
		/*
		* Draw in the doors on either side of the passage
		* or just put #'s if the rooms are gone. Set up
		* pointers to the connected room.
		*/
		rpf.r_ptr[rpf.r_nexits] = rpt;
		if (rf_on(rpf,d.ISGONE)) {
			cmov(spos);
			addch('#');		/* gone "from" room */
		}
		else
			door(rpf, spos);	/* add the door */
		rpt.r_ptr[rpt.r_nexits] = rpf;
		if (rf_on(rpt,d.ISGONE)) {
			cmov(epos);
			addch('#');		/* gone "to" room */
		}
		else
			door(rpt, epos);	/* add door */
		/*
		* Get ready to move...
		*/
		//curr.x = spos.x;
		//curr.y = spos.y;
		curr = {x: spos.x, y: spos.y};
		while(distance > 0) {
			/*
			* Move to new position
			*/
			curr.x += delta.x;
			curr.y += delta.y;
			/*
			* Check if we are at the turn place, if so do the turn
			*/
			if (distance == turn_spot && turn_distance > 0) {
				while(turn_distance-- > 0) {
					cmov(curr);
					addch(d.PASSAGE);
					curr.x += turn_delta.x;
					curr.y += turn_delta.y;
				}
			}
			/*
			* Continue digging along
			*/
			cmov(curr);
			addch(d.PASSAGE);
			distance--;
		}
		curr.x += delta.x;
		curr.y += delta.y;
		if (!ce(curr, epos)) {
			r.UI.comment("Warning, connectivity problem on this level.");
		}
	}

	/*
	* Add a door or possibly a secret door
	* also enters the door in the exits array of the room.
	*/

	this.door = function(rm, cp)
	//struct room *rm;
	//struct coord *cp;
	{
		const cmov = (xy)=>{r.UI.move(xy.y, xy.x)};
		const addch = r.UI.addch;

		cmov(cp);
		addch(r.rnd(10) < r.dungeon.level - 1 && r.rnd(100) < 20 ? d.SECRETDOOR : d.DOOR);
		rm.r_exit[rm.r_nexits++] = cp;
	}


	/*
	* add_pass:
	*	add the passages to the current window (wizard command)
	*/
	this.add_pass = function()
	{
		let y, x, ch;

		for (y = 1; y < d.LINES - 3; y++)
			for (x = 0; x < d.COLS; x++)
				if ((ch = r.UI.mvinch(y, x)) == d.PASSAGE || ch == d.DOOR ||
				ch == d.SECRETDOOR)
					r.UI.mvwaddch(cw, y, x, ch);
	}
}