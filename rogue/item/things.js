/*
 * Contains functions for dealing with things like
 * potions and scrolls
 */
function things_f(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const o_on = r.o_on;
	const new_item = r.new_item;
	const OBJPTR = f.OBJPTR;
	const pick_one = this.pick_one;
	//const getindex = r.player.misc.getindex;
	//const itemvol = r.player.encumb.itemvol;
	//const initfood = r.player.misc.initfood;
	const init_weapon = ()=>{};//r.item.init_weapon;
	const initarmor = ()=>{};
	const init_ring = ()=>{};
	const fix_stick = ()=>{};
	//const setoflg = r.setoflg;
	const extras = this.extras;

	const things = v.things;
	const a_magic = v.a_magic;
	const w_magic = v.w_magic;
	const p_magic = v.p_magic;
	const s_magic = v.s_magic;
	const r_magic = v.r_magic;
	const ws_magic = v.ws_magic;
	const thnginfo = v.thnginfo; 

	const rnd = r.rnd;

	let group = v.group;;

	this.newgrp =()=>{ return ++group;}

	/*
	 * inv_name:
	*	Return the name of something as it would appear in an inventory.
	*/
	this.inv_name = (obj, drop)=>
	//struct object *obj;
	//bool drop;
	{
		const vowelstr = r.player.misc.vowelstr;
		const num = ()=>{return ""}//r.item.weapons.num
		const o_on = r.o_on;
		const charge_str =()=>{return 0}//r.item.sticks.charge_str
		const ring_num = ()=>{} //item.ring.ring_num

		const s_names = r.item.s_names;
		const p_colors = r.item.p_colors;
		const r_stones = r.item.r_stones;
		const ws_stuff = r.item.ws_stuff;

		const s_guess = r.item.s_guess; 
		const p_guess = r.item.p_guess; 
		const r_guess = r.item.r_guess; 
		const ws_guess = r.item.ws_guess;

		const s_know = r.item.s_know;	
		const p_know = r.item.p_know;	
		const r_know = r.item.r_know;	
		const ws_know = r.item.ws_know;

		const armors = r.item.armors;

		const fruit = r.player.fruit;

		const cur_weapon = r.player.get_cur_weapon();
		const cur_armor = r.player.get_cur_armor();
		const cur_ring = r.player.get_cur_ring();

		let pb, tn, pl;//reg char *pb, *tn, *pl;
		let wh, knowit;//reg int wh, knowit;
		let nm, inm, q;//char nm[3], *inm, *q;
				
		wh = obj.o_which; console.log(wh);
		knowit = false;
		if (obj.o_count > 1)
			pl = "s";
		else
			pl = "";
		if (obj.o_count > 1)
			nm =`${obj.o_count}`;
		else
			nm = "A";
		tn = obj.o_typname;
		q = "";
		switch(obj.o_type) {
		case d.SCROLL:
			//sprintf(prbuf, "%s %s%s ",`${nm} ${tn}${pl}`);
			pb = `${nm} ${tn}${pl}`;
			if (s_know[wh] || o_on(obj,d.ISPOST)) {
				knowit = true;
				pb += `of ${s_magic[wh].mi_name}`;
			}
			else if (s_guess[wh])
				pb += `called ${s_guess[wh]}`;
			else
				pb += `titled '${s_names[wh]}'`;
			break;
		case d.POTION:
			//sprintf(prbuf, "%s %s%s ", nm, tn, pl);
			pb = `${nm} ${tn}${pl}`;
			if (p_know[wh] || o_on(obj, d.ISPOST)) {
				pb = `of ${p_magic[wh].mi_name}`;
				knowit = true;
				if (p_know[wh]) {
					pb += `(${p_colors[wh]})`;
				}
			}
			else if (p_guess[wh])
				pb += `called ${p_guess[wh]}(${p_colors[wh]})`;
			else
				pb += `${nm}${vowelstr(p_colors[wh])} ${p_colors[wh]} ${tn}${pl}`;
			break;
		case d.FOOD:
			if (wh == 1) {
				if (obj.o_count == 1)
					q = vowelstr(fruit);
				pb = `${nm}${q} ${fruit}${pl}`;
			}
			else {
				if (obj.o_count == 1)
					pb = `Some ${tn}`;
				else
					pb = `${nm} rations of ${tn}`;
			}
			knowit = true;
			break;
		case d.WEAPON:
			inm = w_magic[wh].mi_name;
			//strcpy(prbuf, nm);
			if (obj.o_count == 1)
				q = vowelstr(inm);
			//pb = &prbuf[strlen(prbuf)];
			if (o_on(obj,d.ISKNOW | d.ISPOST)) {
				knowit = true;
				pb = `${num(obj.o_hplus, obj.o_dplus)} ${inm}${pl}`;
			}
			else
				pb = `${q} ${inm}${pl}`;
			//strcat(prbuf, pl);
			break;
		case d.ARMOR:
			inm = a_magic[wh].mi_name;
			if (o_on(obj,d.ISKNOW | d.ISPOST)) {
				knowit = true;
				pb = `${num(armors[wh].a_class - obj.o_ac, 0)} ${inm}`;
			}
			else
				pb = `${inm}`;
			break;
		case d.AMULET:
			pb  = "The Amulet of Yendor";
			break;
		case d.STICK: {
			let rd;//struct rod *rd;

			rd = ws_stuff[wh];
			pb = `A ${rd.ws_type}`;
			//pb = &prbuf[strlen(prbuf)];
			if (ws_know[wh] || o_on(obj, d.ISPOST)) {
				knowit = true;
				pb += `of ${ws_magic[wh].mi_name}${charge_str(obj)}`;
				if (ws_know[wh]) {
					pb += `(${rd.ws_made})`;
				}
			}
			else if (ws_guess[wh])
				pb += `called ${ws_guess[wh]}(${rd.ws_made})`;
			else
				pb += `A${vowelstr(rd.ws_made)} ${rd.ws_made} ${rd.ws_type}`;
			}
			break;
		case d.RING:
			if (r_know[wh] || o_on(obj, d.ISPOST)) {
				knowit = true;
				pb = `A${ring_num(obj)} ${tn} of ${r_magic[wh].mi_name}`;
				if (r_know[wh]) {
					pb += `(${r_stones[wh]})`;
				}
			}
			else if (r_guess[wh])
				pb = `A ${tn} called ${r_guess[wh]}(${r_stones[wh]})`;
			else
				pb = `A${vowelstr(r_stones[wh])} ${r_stones[wh]} ${tn}`;
			break;
		default:
			pb = `Something bizarre ${obj.o_type}`;//unctrl(obj.o_type)}`;
		}
		if (obj == cur_armor)
			pb += " (being worn)";
		if (obj == cur_weapon)
			pb += " (weapon in hand)";
		if (obj == cur_ring[d.LEFT])
			pb += " (on left hand)";
		else if (obj == cur_ring[d.RIGHT])
			pb += " (on right hand)";
		//if (drop && isupper(prbuf[0]))
		//	prbuf[0] = tolower(prbuf[0]);
		//else if (!drop && islower(*prbuf))
		//	*prbuf = toupper(*prbuf);
		if (o_on(obj, d.ISPROT))
			pb += " [!]";
		if (o_on(obj, d.ISPOST))
			pb += " [$]";
		if (knowit) {
			if (o_on(obj, d.ISCURSED))
				pb += " [-]";
			else if (o_on(obj, d.ISBLESS))
				pb += " [+]";
		}
		if (!drop)
			pb += ".";
		return pb;
	}

	/*
	* money:
	*	Add to characters purse
	*/
	this.money = function()
	{
		const ce = f.ce;
		const iswearing = ()=>{return false;}
		const runto = r.monster.chase.runto;
		const cmov = (xy)=>{r.UI.move(xy.y, xy.x)};
		const next = f.next;
	
		const player = r.player.get_player();
		const hero = r.player.get_hero();

		let rp;	//reg struct room *rp;
		let item;//reg struct linked_list *item;
		let tp;	//reg struct thing *tp;

		rp = player.t_room;
		if (rp != null && ce(hero, rp.r_gold)) {
			r.UI.msg(`${rp.r_goldval} gold pieces.`);
			r.player.purse += rp.r_goldval;
			rp.r_goldval = 0;
			cmov(rp.r_gold);
			r.UI.addch(d.FLOOR);
			/*
			* once gold is taken, all monsters will chase him
			*/
			for (item = r.dungeon.mlist; item != null; item = next(item)) {
				tp = f.THINGPTR(item);
				if (r.rnd(100) < 70 && tp.t_room == rp && !iswearing(d.R_STEALTH)
				&& ((tp.t_flags & (d.ISMEAN | d.ISGREED)) || r.rnd(1000) < 20))
					runto(tp.t_pos, hero);
			}
		}
		else
			r.UI.msg("That gold must have been counterfeit.");
	}

	/*
	* drop:
	*	put something down
	*/
	this.drop = function(item)
	//struct linked_list *item;
	{
		let ch;//reg char ch;
		let ll, nll;//reg struct linked_list *ll, *nll;
		let op;//reg struct object *op;

		if (item == null) {
			ch = mvinch(hero.y, hero.x);
			if (ch != FLOOR && ch != PASSAGE && ch != POOL) {
				msg("There is something there already.");
				after = false;
				return SOMTHERE;
			}
			if ((ll = get_item("drop", 0)) == null)
				return false;
		}
		else {
			ll = item;
		}
		op = OBJPTR(ll);
		if (!dropcheck(op))
			return CANTDROP;
		/*
		* Take it out of the pack
		*/
		if (op.o_count >= 2 && op.o_type != WEAPON) {
			nll = new_item(new t.object());//sizeof *op);
			op.o_count--;
			op.o_vol = itemvol(op);
			op = OBJPTR(nll);
			op = (OBJPTR(ll));
			op.o_count = 1;
			op.o_vol = itemvol(op);
			ll = nll;
		}
		else {
			pack = r.detach(pack, ll);
		}
		if (ch == POOL) {
			msg("%s sinks out of sight.",inv_name(op, true));
			discard(ll);
		}
		else {			/* put on dungeon floor */
			if (levtype == POSTLEV) {
				op.o_pos = hero;	/* same place as hero */
				fall(ll,false);
				if (item == null)	/* if item wasn't sold */
					msg("Thanks for your donation to the Fiend's flea market.");
			}
			else {
				r.dungeon.lvl_obj = r.attach(r.dungeon.lvl_obj , ll);
				mvaddch(hero.y, hero.x, op.o_type);
				op.o_pos = hero;
				msg("Dropped %s", inv_name(op, true));
			}
		}
		updpack();			/* new pack weight */
		return true;
	}

	/*
	* dropcheck:
	*	Do special checks for dropping or unweilding|unwearing|unringing
	*/
	this.dropcheck = function(op)
	//struct object *op;
	{
		if (op == null)
			return true;
		if (levtype == POSTLEV) {
			if (o_on(op,ISCURSED) && o_on(op,ISKNOW)) {
				msg("The trader does not accept shoddy merchandise.");
				return false;
			}
			else {
				cur_null(op);	/* update cur_weapon, etc */
				return true;
			}
		}
		if (op != cur_armor && op != cur_weapon
		&& op != cur_ring[LEFT] && op != cur_ring[RIGHT])
			return true;
		if (o_on(op,ISCURSED)) {
			msg("You can't.  It appears to be cursed.");
			return false;
		}
		if (op == cur_weapon)
			cur_weapon = null;
		else if (op == cur_armor) {
			waste_time();
			cur_armor = null;
		}
		else if (op == cur_ring[LEFT] || op == cur_ring[RIGHT])
			toss_ring(op);
		return true;
	}

	/*
	* new_thing:
	*	Return a new thing
	*/
	//struct linked_list *
	this.new_thing = (treas, type, which)=>
	//int type, which;
	//bool treas;
	{
		const new_item = r.new_item;
		const getindex = r.player.misc.getindex;
		const initfood = r.player.misc.initfood;
		const pick_one = this.pick_one;
		const itemvol = r.player.encumb.itemvol;
		const extras = this.extras;
		const init_weapon = r.item.weapon_f.init_weapon;
		const initarmor = (cur)=>{cur.o_type = d.ARMOR; console.log("initarmor"); return cur;}
		const init_ring = (cur)=>{cur.o_type = d.RING; console.log("initring"); return cur;}
		const fix_stick = (cur)=>{cur.o_type = d.STICK; console.log("fixstick"); return cur;}

		let item;//struct linked_list *item;
		let mi; //struct magic_item *mi;
		let cur; //struct object *cur;
		let chance, whi;

		item = new_item(new t.object());//sizeof *cur);
		cur = OBJPTR(item);
		cur = basic_init(cur);
		if (type == d.DONTCARE) {
			if (++r.player.no_food > 4 && !treas)
				whi = d.TYP_FOOD;
			else
				whi = pick_one(things);
		}
		else {
			whi = getindex(type);
		}
		mi = thnginfo[whi].mf_magic;
		if (which == d.DONTCARE) {
			which = 0;
			if (mi != null)
				which = pick_one(mi);
		}
		cur.o_typname = things[whi].mi_name;
		cur.o_weight = things[whi].mi_wght;
		console.log(`whi:${whi} which:${which} type:${type} mi`);
		console.log(mi);
		switch (Number(whi)) {
			case d.TYP_AMULET:
				cur.o_type = d.AMULET;
				cur.o_hplus = 500;
				cur.o_hurldmg = "80d8";	/* if thrown, WOW!!! */
				cur.o_vol = itemvol(cur);
				break;
			case d.TYP_POTION:
				cur.o_type = d.POTION;
				cur.o_which = which;
				cur.o_count += extras();
				cur.o_vol = itemvol(cur);
				break;
			case d.TYP_SCROLL:
				cur.o_type = d.SCROLL;
				cur.o_which = which;
				cur.o_count += extras();
				cur.o_vol = itemvol(cur);
				break;
			case d.TYP_FOOD:
				no_food = 0;
				cur = initfood(cur);
				break;
			case d.TYP_WEAPON:
				cur.o_which = which;
				cur = init_weapon(cur, which);
				if ((chance = r.rnd(100)) < 10) {
					r.setoflg(cur,d.ISCURSED);
					cur.o_hplus -= r.rnd(3)+1;
					cur.o_dplus -= r.rnd(3)+1;
				}
				else if (chance < 15) {
					cur.o_hplus += r.rnd(3)+1;
					cur.o_dplus += r.rnd(3)+1;
				}
				break;
			case d.TYP_ARMOR:
				cur.o_which = which;
				cur = initarmor(cur, which);
				if ((chance = r.rnd(100)) < 20) {
					r.setoflg(cur,d.ISCURSED);
					cur.o_ac += r.rnd(3)+1;
				}
				else if (chance < 30)
					cur.o_ac -= r.rnd(3)+1;
				break;
			case d.TYP_RING:
				cur.o_which = which;
				cur = init_ring(cur, false);
				break;
			case d.TYP_STICK:
			default:
				cur.o_which = which;
				cur = fix_stick(cur);
		}
		item.l_data = cur;
		console.log(cur);
		return item;
	}

	/*
	* basic_init:
	*	Set all params of an object to the basic values.
	*/
	function basic_init(cur)
	//struct object *cur;
	{
		cur.o_ac = 11;
		cur.o_count = 1;
		cur.o_launch = 0;
		cur.o_typname = null;
		cur.o_group = ++group;// newgrp();
		cur.o_weight = cur.o_vol = 0;
		cur.o_hplus = cur.o_dplus = 0;
		cur.o_damage = "0d0";
		cur.o_hurldmg = "0d0";
		cur.o_flags = cur.o_type = cur.o_which = 0;

		return cur;
	}

	/*
	* extras:
	*	Return the number of extra items to be created
	*/
	this.extras = function()
	{
		//reg int i;

		let i = r.rnd(100);
		if (i < 4)			/* 4% for 2 more */
			return 2;
		else if (i < 11)	/* 7% for 1 more */
			return 1;
		else				/* otherwise no more */
			return 0;
	}


	/*
	* pick_one:
	* 	Pick an item out of a list of nitems possible magic items
	*/
	this.pick_one = function(mag)
	//struct magic_item *mag;
	{
		let start; //reg struct magic_item *start;
		let i; //reg int i;

		start = mag;
		for (i in mag){
			let rn = r.rnd(1000);
		//for (i = r.rnd(1000); mag.mi_name != null; mag++) {
		//	if (i < mag.mi_prob)
			if (rn < mag[i].mi_prob)
				break;
			if (mag[i].mi_name == null) {
				//if (author() || wizard) {
					//for (mag = start; mag.mi_name != null; mag++)
				for(let j in mag)
					console.log(`${mag[j].mi_name}: ${mag[j].mi_prob}`);
				//msg("%s: %d%%", mag.mi_name, mag.mi_prob);
				//}
				i = 0;
				//mag = start;
			}
		}
		console.log("pickone:" + i);
		return i;// - start;
	}
}