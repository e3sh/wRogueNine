/*
 * Stuff to do with encumberence
 */

function encumb(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const armors = v.armors;
	const weaps = v.weaps;
	const thnginfo = v.thnginfo;
	const ws_stuff = v.ws_stuff;

	const rnd = r.rnd;
	const next = f.next;
	const OBJPTR = f.OBJPTR;
	const itemweight = this.itemweight;
	const itemvol = this.itemvol;
	const o_on = r.o_on;
	const o_off = r.o_off;
	//const getindex = r.player.misc.getindex;
	const extinguish = r.daemon.extinguish;
	const fuse = r.daemon.fuse;
	const msg = r.UI.msg;
	//const inwhgt = r.player.misc.inwhgt;
	const totalenc = this.totalenc;

	/*
	* updpack:
	*	Update his pack weight and adjust fooduse accordingly
	*/
	this.updpack = ()=>
	{
		let topcarry, curcarry;//reg int

		const him = r.player.get_him();

		him.s_carry = r.player.encumb.totalenc();			/* get total encumb */
		curcarry = packweight();			/* get pack weight */
		topcarry = him.s_carry / 5;		/* 20% of total carry */
		if (curcarry > 4 * topcarry) {
			if (r.rnd(100) < 80)
				r.player.foodlev = 3;				/* > 80% of pack */
		}
		else if (curcarry > 3 * topcarry) {
			if (r.rnd(100) < 60)
				r.player.foodlev = 2;				/* > 60% of pack */
		}
		else
			r.player.foodlev = 1;			/* <= 60% of pack */

		him.s_pack = curcarry;				/* update pack weight */
		r.packvol = pack_vol();				/* update pack volume */
		r.nochange = false;					/* also change display */

		r.player.set_him( him );
	}

	/*
	* packweight:
	*	Get the total weight of the hero's pack
	*/
	function packweight()
	{
		const itemweight = r.player.encumb.itemweight;

		let obj; //reg struct object *obj;
		let pc; //reg struct linked_list *pc;
		let weight, i; //reg int weight, i;

		weight = 0;
		for (pc = r.player.get_pack() ; pc != null ; pc = next(pc)) {
			obj = OBJPTR(pc);
			weight += itemweight(obj) * obj.o_count;
		}
		if (weight < 0)		/* in case of amulet */
			weight = 0;
		for (i = d.LEFT; i <= d.RIGHT; i += 1) {
			let cur_ring = r.player.get_cur_ring();
			obj = cur_ring[i];
			if (obj != null) {
				if (obj.o_type == d.R_HEAVY && o_off(obj, d.ISBLESS))
					weight += weight / 4;
			}
		}
		return weight;
	}

	/*
	* itemweight:
	*	Get the weight of an object
	*/
	this.itemweight = function(wh)
	//struct object *wh;
	{
		const o_on = r.o_on;

		let weight; //reg int 

		weight = wh.o_weight;		/* get base weight */
		switch (wh.o_type) {
			case d.ARMOR:
				if ((armors[wh.o_which].a_class - wh.o_ac) > 0)
					weight /= 2;
				break;
			case d.WEAPON:
				if ((wh.o_hplus + wh.o_dplus) > 0)
					weight /= 2;
		}
		if (o_on(wh,d.ISCURSED))
			weight += weight / 5;	/* 20% more for cursed */
		if (o_on(wh, d.ISBLESS))
			weight -= weight / 5;	/* 20% less for blessed */
		return weight;
	}

	/*
	* pack_vol:
	*	Get the total volume of the hero's pack
	*/
	function pack_vol()
	{
		const itemvol = r.player.encumb.itemvol;

		let obj; //reg struct object *obj;
		let pc; //reg struct linked_list *pc;
		let volume; //reg int volume;

		volume = 0;
		for (pc = r.player.get_pack() ; pc != null ; pc = f.next(pc)) {
			obj = f.OBJPTR(pc);
			volume += itemvol(obj);
		}
		return volume;
	}

	/*
	* itemvol:
	*	Get the volume of an object
	*/
	this.itemvol = (wh)=>
	//struct object *wh;
	{
		const getindex = r.player.misc.getindex;
		const ws_stuff = r.item.ws_stuff;

		let volume, what, extra; //reg int volume, what, extra;

		extra = 0;
		what = getindex(wh.o_type);
		switch (wh.o_type) {
			case d.ARMOR:
				extra = armors[wh.o_which].a_vol;
				break;
			case d.WEAPON:	
				extra = weaps[wh.o_which].w_vol;
				break;
			case d.STICK:
				if (ws_stuff[wh.o_which].ws_type == "staff")
					extra = d.V_WS_STAFF;
				else
					extra = d.V_WS_WAND;
		}

		volume = thnginfo[what].mf_vol + extra;
		volume *= wh.o_count;
		return volume;
	}

	/*
	* playenc:
	*	Get hero's carrying ability above norm
	*/
	function playenc()
	{
		const him = r.player.get_him();
		let estr = him.s_ef.a_str;
		if (estr >= 24)
			return 3000;
		switch(him.s_ef.a_str) {
			case 23: return 2000;
			case 22: return 1500;
			case 21: return 1250;
			case 20: return 1100;
			case 19: return 1000;
			case 18: return 700;
			case 17: return 500;
			case 16: return 350;
			case 15:
			case 14: return 200;
			case 13:
			case 12: return 100;
			case 11:
			case 10:
			case  9:
			case  8: return 0;
			case  7:
			case  6: return -150;
			case  5:
			case  4: return -250;
		}
		return -350;
	}


	/*
	* totalenc:
	*	Get total weight that the hero can carry
	*/
	this.totalenc = function()
	{
		let wtotal; //reg int 

		wtotal = d.NORMENCB + playenc();
		switch(r.player.hungry_state) {
			case d.F_OKAY:
			case d.F_HUNGRY:	;						/* no change */
				break;
			case d.F_WEAK:	wtotal -= wtotal / 10;	/* 10% off weak */
				break;
			case d.F_FAINT:	wtotal /= 2;			/* 50% off faint */
		}
		return wtotal;
	}

	/*
	* whgtchk:
	*	See if the hero can carry his pack
	*/
	this.wghtchk = function(fromfuse)
	//int fromfuse;
	{
		const inwhgt = r.player.misc.inwhgt;
		const extinguish = r.daemon.extinguish;
		const fuse = r.daemon.fuse;
		const drop = r.item.things_f.drop;
		const wghtchk = r.player.encumb.wghtchk;

		const player = r.player.get_player();
		const him = r.player.get_him();	
		let  dropchk, err = true;
		let ch;

		inwhgt(true);
		if (him.s_pack > him.s_carry) {
			ch = player.t_oldch;
			extinguish(wghtchk);
			if ((ch != d.FLOOR && ch != d.PASSAGE) ||r.isfight) {
				fuse(wghtchk, true, 1);
				inwhgt(false);
				return;
			}
			r.UI.msg(ms.WGHTCHK_1);
			do {
				dropchk = drop(null);
				if (dropchk == d.SOMTHERE)
					err = false;
				else if (dropchk == false) {
					//mpos = 0;
					r.UI.msg(ms.WGHTCHK_2);
					err = false;
				}
				if (dropchk == true)
					err = false;
			} while(err);
		}
		inwhgt(false);
	}


	/*
	* hitweight:
	*	Gets the fighting ability according to current weight
	* 	This returns a  +1 hit for light pack weight
	* 			 0 hit for medium pack weight
	*			-1 hit for heavy pack weight
	*/
	this.hitweight = function()
	{
		return(2 - r.player.foodlev);
	}
}