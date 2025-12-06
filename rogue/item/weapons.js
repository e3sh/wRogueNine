/*
 * Functions for dealing with weapons
 *
 */

function weapons(r){
	    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const cw = d.DSP_MAIN_FG;
	const hw = d.DSP_WINDOW;

	/*
	* missile:
	*	Fire a missile in a given direction
	*/
	this.missile = function(ydelta, xdelta)
	//int ydelta, xdelta;
	{
		const get_item = get_item;
		const OBJPTR = f.OBJPTR;
		const dropcheck = r.item.things_f.dropcheck;
		const is_current = r.player.misc.is_current;

		let obj, nowwield; //reg struct object *obj, *nowwield;
		let item, nitem; //reg struct linked_list *item, *nitem;

		/*
		* Get which thing we are hurling
		*/
		nowwield = cur_weapon;		/* must save current weap */
		if ((item = get_item("throw", d.WEAPON)) == null)
			return;
		obj = OBJPTR(item);
		if (!dropcheck(obj) || is_current(obj))
			return;
		if (obj == nowwield || obj.o_type != d.WEAPON) {
			let c;

			msg("Do you want to throw that %s? (y or n)",obj.o_typname);
			do {
				c = readchar();
				if (isupper(c))
					c = tolower(c);
				if (c == ESCAPE || c == 'n') {
					msg("");
					cur_weapon = nowwield;
					after = false;		/* ooops, a mistake */
					return;
				}
			} while (c != 'y');	/* keep looking for good ans */
		}
		/*
		* Get rid of the thing.  If it is a non-multiple item object, or
		* if it is the last thing, just drop it.  Otherwise, create a new
		* item with a count of one.
		*/
		if (obj.o_count < 2) {
			pack = r.detach(pack, item);
		}
		else {
			obj.o_count--;
			obj.o_vol = itemvol(obj);
			nitem = new_item(sizeof *obj);
			obj = OBJPTR(nitem);
			obj = (OBJPTR(item));
			obj.o_count = 1;
			obj.o_vol = itemvol(obj);
			item = nitem;
		}
		updpack();						/* new pack weight */
		do_motion(obj, ydelta, xdelta);
		if (!isalpha(mvwinch(mw, obj.o_pos.y, obj.o_pos.x))
		|| !hit_monster(obj.o_pos, obj))
			fall(item, true);
		mvwaddch(cw, hero.y, hero.x, d.PLAYER);
	}

	/*
	* do the actual motion on the screen done by an object traveling
	* across the room
	*/
	this.do_motion = function(obj, ydelta, xdelta)
	//struct object *obj;
	//int ydelta, xdelta;
	{
		let ch, y, x;

		obj.o_pos = hero;
		while (1) {
			y = obj.o_pos.y;
			x = obj.o_pos.x;
			if (!ce(obj.o_pos, hero) && cansee(unc(obj.o_pos)) &&
			mvwinch(cw, y, x) != ' ')
				mvwaddch(cw, y, x, show(y, x));
			/*
			* Get the new position
			*/
			obj.o_pos.y += ydelta;
			obj.o_pos.x += xdelta;
			y = obj.o_pos.y;
			x = obj.o_pos.x;
			ch = winat(y, x);
			if (step_ok(ch) && ch != d.DOOR) {
				if (cansee(unc(obj.o_pos)) && mvwinch(cw, y, x) != ' ') {
					mvwaddch(cw, y, x, obj.o_type);
					draw(cw);
				}
				continue;
			}
			break;
		}
	}

	/*
	* fall:
	*	Drop an item someplace around here.
	*/

	this.fall = (item, pr)=>
	//struct linked_list *item;
	//bool pr;
	{
		const fallpos = this.fallpos;
		const rf_on = r.dungeon.rooms_f.rf_on;
		const light = r.player.move.light;
		const inv_name = r.item.things_f.inv_name;

		const w_magic = v.w_magic;
		const player = r.player.get_player();
		const hero = r.player.get_hero();

		let obj; //reg struct object *obj;
		let rp; //reg struct room *rp;
		let fpos = {}; //static struct coord fpos;

		obj = f.OBJPTR(item);
		if (fallpos(obj.o_pos, fpos, true)) {
			r.UI.mvaddch(fpos.y, fpos.x, obj.o_type);
			obj.o_pos = fpos;
			rp = player.t_room;
			if (rp != null && !rf_on(rp,d.ISDARK)) {
				light(hero);
				r.UI.mvwaddch(cw, hero.y, hero.x, d.PLAYER);
			}
			r.dungeon.lvl_obj = r.attach(r.dungeon.lvl_obj, item);
			return;
		}

		if (pr)
			if (obj.o_type == d.WEAPON) /* BUGFIX: Identification trick */
				r.UI.msg(`Your ${w_magic[obj.o_which].mi_name} vanishes as it hits the ground.`);
			else
				r.UI.msg(`${inv_name(obj,true)} vanishes as it hits the ground.`);

		r.discard(item);
	}

	/*
	* init_weapon:
	*	Set up the initial goodies for a weapon
	*/

	this.init_weapon = function(weap, type)
	//struct object *weap;
	//int type;
	{
		const o_on = r.o_on;
		const itemvol = r.player.encumb.itemvol;
		const things = v.things;
		const newgrp = r.item.things_f.newgrp;
		const weaps = v.weaps;

		let iwp //reg struct init_weps *iwp;

		weap.o_type = d.WEAPON;
		weap.o_which = type;
		iwp = weaps[type];

		weap.o_damage = iwp.w_dam;
		weap.o_hurldmg = iwp.w_hrl;
		weap.o_launch = iwp.w_launch;
		weap.o_flags = iwp.w_flags;
		weap.o_weight = iwp.w_wght;
		weap.o_typname = things[d.TYP_WEAPON].mi_name;
		if (o_on(weap,d.ISMANY))
			weap.o_count = r.rnd(8) + 8;
		else
			weap.o_count = 1;
		weap.o_group = newgrp();
		weap.o_vol = itemvol(weap);

		return weap;
	}

	/*
	* hit_monster:
	*	Does the missile hit the monster
	*/
	this.hit_monster = function(mp, obj)
	//struct coord *mp;
	//struct object *obj;
	{
		return fight(mp, obj, true);
	}

	/*
	* num:
	*	Figure out the plus number for armor/weapons
	*/
	//char *
	this.num = function(n1, n2)
	//int n1, n2;
	{
		let numbuf;//static char numbuf[LINLEN];

		if (n1 == 0 && n2 == 0)
			return "+0";
		if (n2 == 0)
			numbuf = `${n1 < 0 ? "" : "+"}${n1}`;
		else
			numbuf = `${n1<0 ? "":"+"}${n1},${n2<0 ? "":"+"}${n2}`;  
		return numbuf;
	}

	/*
	* wield:
	*	Pull out a certain weapon
	*/
	this.wield = function()
	{
		const dropcheck = r.item.things_f.dropcheck;
		const get_item = r.item.pack_f.get_item;
		const OBJPTR = f.OBJPTR;
		const is_current =r.player.misc.is_current;

		const inv_name = r.item.things_f.inv_name;

		const cur_weapon = r.player.get_cur_weapon();

		let item;//reg struct linked_list *item;
		let obj, oweapon; //reg struct object *obj, *oweapon;

		oweapon = cur_weapon;
		if (!dropcheck(cur_weapon)) {
			cur_weapon = oweapon;
			return;
		}
		cur_weapon = oweapon;
		if ((item = get_item("wield", d.WEAPON)) == null)
			return;
		obj = OBJPTR(item);
		if (is_current(obj)) {
			r.after = false;
			return;
		}
		r.UI.msg(`Wielding ${inv_name(obj, true)}`);
		r.player.set_cur_weapon(obj);
	}

	/*
	* fallpos:
	*	Pick a random position around the give (y, x) coordinates
	*/
	this.fallpos = function(pos, newpos, passages)
	//struct coord *pos, *newpos;
	//bool passages;
	{
		const winat = r.UI.winat;

		const hero = r.player.get_hero();

		let y, x, ch;

		for (y = pos.y - 1; y <= pos.y + 1; y++) {
			for (x = pos.x - 1; x <= pos.x + 1; x++) {
				/*
				* check to make certain the spot is empty, if it is,
				* put the object there, set it in the level list
				* and re-draw the room if he can see it
				* 該当箇所が空いているか確認し、空いている場合は、
				* そこにオブジェクトを配置し、レベルリストに設定します。
				* プレイヤーがオブジェクトを見ることができる場合は、部屋を再描画します。
				*/
				if (y == hero.y && x == hero.x)
					continue;
				ch = winat(y, x);
				if (ch == d.FLOOR || (passages && ch == d.PASSAGE)) {
					newpos.y = y;
					newpos.x = x;
					return true;
				}
			}
		}
		return false;
	}
}