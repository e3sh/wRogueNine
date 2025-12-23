/*
 * Anything to do with trading posts & mazes
 *
 */

function trader(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const cw = d.DSP_MAIN_FG;
	const mw = d.DSP_MAIN_BG;

	const NOTPRICED = -1;
	const scol = 20; //d.COLS - 40;

	let trader;
	this.market = ()=>{ return open_market()};

	/*
	* do_post:
	*	Put a trading post room and stuff on the screen
	*/
	this.do_post = function()
	{
		const rnd_pos = r.dungeon.rooms_f.rnd_pos;
		const draw_room = r.dungeon.rooms_f.draw_room;
		const new_thing = r.item.things_f.new_thing;
		const OBJPTR = f.OBJPTR;

		const cw = d.DSP_MAIN_FG;
		const mw = d.DSP_MAIN_BG;

		let tp; //struct coord tp;
		let i;
		let rp;//reg struct room *rp;
		let op;//reg struct object *op;
		let ll;//reg struct linked_list *ll;

		const rooms = r.dungeon.rooms;

		r.dungeon.lvl_obj = r.free_list(r.dungeon.lvl_obj);		/* throw old items away */

		//for (rp = rooms; rp < rooms[d.MAXROOMS]; rp++) {
		for (let i in rooms){
			rooms[i].r_goldval = 0;			/* no gold */
			rooms[i].r_nexits = 0;			/* no exits */
			rooms[i].r_flags = d.ISGONE;		/* kill all rooms */
		}
		rp = rooms[0];					/* point to only room */
		rp.r_flags = 0;				/* this room NOT gone */
		rp.r_max.x = 40;
		rp.r_max.y = 10;				/* 10 * 40 room */
		rp.r_pos.x = (d.COLS - rp.r_max.x) / 2;	/* center horizontal */
		rp.r_pos.y = 1;				/* 2nd line */
		draw_room(rp);					/* draw the only room */
		i = r.roll(4,10);					/* 10 to 40 items */
		for (; i > 0 ; i--) {			/* place all the items */
			ll = new_thing(false, d.ANYTHING);		/* get something */
			r.dungeon.lvl_obj = r.attach(r.dungeon.lvl_obj, ll);
			op = OBJPTR(ll);
			r.setoflg(op, d.ISPOST);		/* object in trading post */
			tp = rnd_pos(rp);
			op.o_pos = tp;
			r.UI.mvaddch(tp.y,tp.x,op.o_type);
		}
		trader = 0;
		r.UI.wmove(cw,12,0);
		r.UI.mvwaddch(cw,12, scol, "Welcome to Friendly Fiend's Flea Market");
		r.UI.mvwaddch(cw,13, scol, "=======================================");
		r.UI.mvwaddch(cw,14, scol, "Auto: Prices object that you stand upon.");
		r.UI.mvwaddch(cw,15, scol, "5(A): Buys the object that you stand upon.");
		r.UI.mvwaddch(cw,16, scol, "D(Y): Trades in something in your pack for gold.");

		r.UI.msg(ms.DO_POST);
		trans_line();

	}

	/*
	* price_it:
	*	Price the object that the hero stands on
	*/
	this.price_it = ()=>
	{
		const find_obj = r.player.misc.find_obj;
		const OBJPTR = f.OBJPTR;
		const get_worth = this.get_worth;

		const hero = r.player.get_hero();

		const  bargain = [
			ms.BARGAIN_1,
			ms.BARGAIN_2,
			ms.BARGAIN_3,
		];
		let item; //reg struct linked_list *item;
		let obj; //reg struct object *obj;
		let worth;

		if (!open_market())		/* after buying hours */
			return false;
		if ((item = find_obj(hero.y,hero.x)) == null)
			return false;
		obj = OBJPTR(item);
		if (r.curprice == NOTPRICED) {
			worth = get_worth(obj);
			worth += 50 - r.rnd(100);
			if (worth < 25)
				worth = 25;
			worth *= 3;							/* slightly expensive */
			r.curprice = worth;					/* save price */
			r.curpurch = obj.o_typname;	/* save item */
		}
		r.UI.msg( ms.PRICEIT(r.curpurch ,bargain[r.rnd(3)] ,r.curprice) );
		//r.UI.setEffect(`${r.curprice}`,{x:hero.x,y:hero.y},{x:hero.x,y:hero.y-1},120);
		return true;
	}

	/*
	* buy_it:
	*	Buy the item on which the hero stands
	*/
	this.buy_it = ()=>
	{
		const price_it = this.price_it;
		const add_pack = r.item.pack_f.add_pack;

		let  wh;

		if (r.player.purse <= 0) {
			r.UI.msg( ms.BUYIT_1 );
			return;
		}
		if (r.curprice < 0) {		/* if not yet priced */
			wh = price_it();
			if (!wh)			/* nothing to price */
				return;
			//r.UI.msg("Do you want to buy it? ");
			//do {
			//	wh = readchar();
			//	if (isupper(wh))
			//		wh = tolower(wh);
			//	if (wh == d.ESCAPE || wh == 'n') {
			//		r.UI.msg("");
			//		return;
			//	}
			//} while(wh != 'y');
		}
		//mpos = 0;
		if (r.curprice > r.player.purse) {
			r.UI.msg( ms.BUYIT_2(r.curpurch) );
			return;
		}
		/*
		* See if the hero has done all his transacting
		*/
		if (!open_market())
			return;
		/*
		* The hero bought the item here
		*/
		//mpos = 0;
		wh = add_pack(null,false);	/* try to put it in his pack */
		if (wh) {/* he could get it */
			const hero = r.player.get_hero();
			r.UI.setEffect("buy",{x:hero.x,y:hero.y},{x:hero.x,y:hero.y-1},120);

			r.player.purse -= r.curprice;		/* take his money */
			++trader;				/* another transaction */
			trans_line();			/* show remaining deals */
			r.curprice = NOTPRICED;
			r.curpurch = '';
		}
	}

	/*
	* sell_it:
	*	Sell an item to the trading post
	*/
	this.sell_it = ()=>
	{
		const find_obj = r.player.misc.find_obj;
		const OBJPTR = f.OBJPTR;
		const get_worth = this.get_worth;
		const get_item = r.item.pack_f.get_item;
		const drop = r.item.things_f.drop;
		const inv_name = r.item.things_f.inv_name;
				
		let item; //reg struct linked_list *item;
		let obj; //reg struct object *obj;
		let wo, ch;

		if (!open_market())		/* after selling hours */
			return;

		if ((item = get_item("sell",0)) == null)
			return;
		obj = OBJPTR(item);
		wo = get_worth(obj);
		if (wo <= 0) {
			//mpos = 0;
			r.UI.msg( ms.SELLIT_1 );
			return;
		}
		if (wo < 25)
			wo = 25;
		r.UI.msg( ms.SELLIT_2(obj.o_typname, wo) );
		//r.UI.msg("Do you want to sell it? ");
		//do {
		//	ch = readchar();
		//	if (isupper(ch))
		//		ch = tolower(ch);
		//	if (ch == ESCAPE || ch == 'n') {
		//		msg("");
		//		return;
		//	}
		//} while (ch != 'y');
		//mpos = 0;
		if (drop(item) == true) {		/* drop this item */
			const hero = r.player.get_hero();
			r.UI.setEffect("sold",{x:hero.x,y:hero.y},{x:hero.x,y:hero.y-1},120);

			r.nochange = false;		/* show gold value */
			r.player.purse += wo;			/* give him his money */
			++trader;			/* another transaction */
			wo = obj.o_count;
			obj.o_count = 1;
			r.UI.msg( ms.SELLIT_3(inv_name(obj,true)) );
			obj.o_count = wo;
			trans_line();			/* show remaining deals */
		}
	}

	/*
	* open_market:
	*	Retruns true when ok do to transacting
	*/
	function open_market()
	{
		if (trader >= d.MAXPURCH) {
			r.UI.msg( ms.OP_MARKET );
			return false;
		}
		else
			return true;
	}

	/*
	* get_worth:
	*	Calculate an objects worth in gold
	*/
	this.get_worth = function(obj)
	//struct object *obj;
	{
		const o_on = r.o_on;
		const a_magic = v.a_magic;
		const w_magic = v.w_magic;
		const p_magic = v.p_magic;
		const s_magic = v.s_magic;
		const r_magic = v.r_magic;
		const ws_magic = v.ws_magic;
		const armors = v.armors;
		const magring = r.item.ring_f.magring;

		let worth, wh;

		worth = 0;
		wh = obj.o_which;
		switch (obj.o_type) {
		case d.FOOD:
			worth = 2;
		break;
		case d.WEAPON:
			if (wh < d.MAXWEAPONS) {
				worth = w_magic[wh].mi_worth;
				worth *= (2 + (4 * obj.o_hplus + 4 * obj.o_dplus));
			}
		break;
		case d.ARMOR:
			if (wh < d.MAXARMORS) {
				worth = a_magic[wh].mi_worth;
				worth *= (1 + (10 * (armors[wh].a_class - obj.o_ac)));
			}
		break;
		case d.SCROLL:
			if (wh < d.MAXSCROLLS)
				worth = s_magic[wh].mi_worth;
		break;
		case d.POTION:
			if (wh < d.MAXPOTIONS)
				worth = p_magic[wh].mi_worth;
		break;
		case d.RING:
			if (wh < d.MAXRINGS) {
				worth = r_magic[wh].mi_worth;
				if (magring(obj)) {
					if (obj.o_ac > 0)
						worth += obj.o_ac * 40;
					else
						worth = 50;
				}
			}
		break;
		case d.STICK:
			if (wh < d.MAXSTICKS) {
				worth = ws_magic[wh].mi_worth;
				worth += 20 * obj.o_charges;
			}
		break;
		case d.AMULET:
			worth = 1000;
		break;
		default:
			worth = 0;
		}
		if (worth < 0)
			worth = 0;
		if (o_on(obj, d.ISPROT))		/* 300% more for protected */
			worth *= 3;
		if (o_on(obj, d.ISBLESS))		/* 50% more for blessed */
			worth = worth * 3 / 2;
		return worth;
	}

	/*
	* trans_line:
	*	Show how many transactions the hero has left
	*/
	function trans_line()
	{
		let prbuf = `You have ${d.MAXPURCH-trader} transactions remaining.`;
		r.UI.mvwaddstr(cw, d.LINES - 4, scol, prbuf);
		r.UI.msg(ms.TRANS_LINE(d.MAXPURCH-trader));
	}

	/*
	* domaze:
	*	Draw the maze on this level.
	*/
	this.do_maze = function()
	{
		const rnd_pos = r.dungeon.rooms_f.rnd_pos;
		const add_mon = r.dungeon.rooms_f.add_mon;
		const GOLDCALC = ()=>{ return (r.rnd(50 + 10 * r.dungeon.level) + 2) };		

		let tp; //struct coord tp;
		let i, least;
		let rp; //reg struct room *rp;
		let treas;

		const rooms = r.dungeon.rooms;
		//for (rp = rooms; rp < rooms[d.MAXROOMS]; rp++) {

		for (let i in rooms){
		//for (rp = rooms; rp < r.dungeon.rooms[d.MAXROOMS]; rp++) {
			rooms[i].r_goldval = 0;
			rooms[i].r_nexits = 0;			/* no exits */
			rooms[i].r_flags = d.ISGONE;		/* kill all rooms */
		}
		rp = r.dungeon.rooms[0];					/* point to only room */
		rp.r_flags = d.ISDARK;			/* mazes always dark */
		rp.r_pos.x = 0;				/* room fills whole screen */
		rp.r_pos.y = 1;
		rp.r_max.x = d.COLS - 1;
		rp.r_max.y = d.LINES - 2;
		rp.r_goldval = 500 + (r.rnd(10) + 1) * GOLDCALC();
		draw_maze();				/* put maze into window */
		rp.r_gold = rnd_pos(rp);
		r.UI.mvaddch(rp.r_gold.y, rp.r_gold.x, d.GOLD);
		if (r.rnd(100) < 3) {			/* 3% for treasure maze level */
			treas = true;
			least = 6;
			rp.r_flags |= d.ISTREAS;
		}
		else {						/* normal maze level */
			least = 1;
			treas = false;
		}
		for (i = 0; i < r.dungeon.level + least; i++)
			if (treas || r.rnd(100) < 50)		/* put in some little buggers */
				add_mon(rp, treas);

		//console.log(bm);
		//console.log(fm);
	}

	class cell {
		y_pos;
		x_pos;
	};
	class bordercells {
		num_pos;			/* number of frontier cells next to you */
		conn;//struct cell conn[4];	/* the y,x position of above cell */
		constructor(){
			this.conn = [];
			for (let i=0; i<4; i++){
				this.conn[i] = new cell();
			}
		}
	};

	let mborder = new bordercells();
	let frontier, bits;//*frontier, *bits;
	//char *moffset(), *foffset();
	let tlines, tcols;
	let bm, fm; //ALLOC buuffer
	/*
	* draw_maze:
	*	Generate and draw the maze on the screen
	*/
	function draw_maze()
	{
	    const ALLOC = (x) =>{const arr = []; for (let i=0; i<x; i++) arr[i]=true; return arr;} // malloc((unsigned int) x)

		let  i, j, more;
		let  ptr;

		tlines = Math.floor((d.LINES - 3) / 2);
		tcols = Math.floor((d.COLS - 1) / 2);
		bm = ALLOC((d.LINES - 3) * (d.COLS - 1));
		fm = ALLOC(tlines * tcols)

		bits = 0;//bits = ALLOC((LINES - 3) * (COLS - 1));
		frontier = 0;//frontier = ALLOC(tlines * tcols);
		ptr = 0;//ptr = frontier;
		while (ptr < (frontier + (tlines * tcols)))
			fm[ptr++] = true;  
		for (i = 0; i < d.LINES - 3; i++) {
			for (j = 0; j < d.COLS - 1; j++) {
				if ((i % 2 == 1) && (j % 2 == 1))
					bm[moffset(i, j)] = false;		/* floor */
				else
					bm[moffset(i, j)] = true;		/* wall */
			}
		}
		for (i = 0; i < tlines; i++) {
			for (j = 0; j < tcols; j++) {
				do{
					more = findcells(i,j);
					//console.log(`i${i} j${j}`);
				}while(more != 0);
			}
		}
		crankout();
		//FREE(frontier);
		//FREE(bits);
	}

	/*
	* moffset:
	*	Calculate memory address for bits
	*/
	//char *
	function moffset(y, x)
	//int y, x;
	{
		let ptr;

		ptr = bits + (y * (d.COLS - 1)) + x;
		//console.log(`mo${ptr}`);
		return ptr;
	}

	/*
	* foffset:
	*	Calculate memory address for frontier
	*/
	//char *
	function foffset(y, x)
	//int y, x;
	{
		let ptr;

		ptr = frontier + (y * tcols) + x;

		//console.log(`fo${ptr}`);
		return ptr;

	}

	/*
	* findcells:
	*	Figure out cells to open up 
	*/
	function findcells(y,x)
	//int x, y;
	{
		let rtpos, i;

		fm[foffset(y, x)] = false;
		mborder.num_pos = 0;
		if (y < tlines - 1) {				/* look below */
			if (fm[foffset(y + 1, x)]) {
				mborder.conn[mborder.num_pos].y_pos = y + 1;
				mborder.conn[mborder.num_pos].x_pos = x;
				mborder.num_pos += 1;
			}
		}
		if (y > 0) {						/* look above */
			if (fm[foffset(y - 1, x)]) {
				mborder.conn[mborder.num_pos].y_pos = y - 1;
				mborder.conn[mborder.num_pos].x_pos = x;
				mborder.num_pos += 1;

			}
		}
		if (x < tcols - 1) {					/* look right */
			if (fm[foffset(y, x + 1)]) {
				mborder.conn[mborder.num_pos].y_pos = y;
				mborder.conn[mborder.num_pos].x_pos = x + 1;
				mborder.num_pos += 1;
			}
		}
		if (x > 0) {						/* look left */
			if (fm[foffset(y, x - 1)]) {
				mborder.conn[mborder.num_pos].y_pos = y;
				mborder.conn[mborder.num_pos].x_pos = x - 1;
				mborder.num_pos += 1;

			}
		}
		if (mborder.num_pos == 0)			/* no neighbors available */
			return 0;
		else {
			i = r.rnd(mborder.num_pos);
			rtpos = mborder.num_pos - 1;
			rmwall(mborder.conn[i].y_pos, mborder.conn[i].x_pos, y, x);
			//console.log(`mnp${mborder.num_pos} i:${i} conniy:${mborder.conn[i].y_pos} connix:${mborder.conn[i].x_pos} y:${y} x:${x}`);

			return rtpos;
		}
	}

	/*
	* rmwall:
	*	Removes appropriate walls from the maze
	*/
	function rmwall(newy, newx, oldy, oldx)
	//int newy, newx, oldy, oldx;
	{
		let xdif,ydif;
		
		xdif = newx - oldx;
		ydif = newy - oldy;

		bm[moffset((oldy * 2) + ydif + 1, (oldx * 2) + xdif + 1)] = false;
		findcells(newy, newx);

		//console.log(`xdif:${xdif} ydif:${ydif} newx:${newx} newy:${newy} oldx:${oldx} oldy:${oldy}`);

	}

	/*
	* crankout:
	*	Does actual drawing of maze to window
	*/
	function crankout()
	{
		let x, y, i;
		let wst;

		r.UI.setDsp(d.DSP_MAIN);
		for (y = 0; y < d.LINES - 3; y++) {
			r.UI.move(y + 1, 0);
			wst = "";
			for (x = 0; x < d.COLS - 1; x++) {
				if (bm[moffset(y, x)]) {				/* here is a wall */
					if (y == 0 || y == d.LINES - 4)	/* top or bottom line */
						wst += "-";//r.UI.addch('-');
					else if (x == 0 || x == d.COLS - 2)	/* left | right side */
						wst += "|";//r.UI.addch('|');
					else if (y % 2 == 0 && x % 2 == 0) {
						if (bm[moffset(y, x - 1)] || bm[moffset(y, x + 1)])
							wst += "-";//r.UI.addch('-');
						else
							wst += "|";//r.UI.addch('|');
					}
					else if (y % 2 == 0)
						wst += "-";//r.UI.addch('-');
					else
						wst += "|";//r.UI.addch('|');
				}
				else
					wst += d.FLOOR;//r.UI.addch(d.FLOOR);
			}
			r.UI.addch(wst);
		}
	}
}