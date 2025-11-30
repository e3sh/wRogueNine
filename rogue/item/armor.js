/*
 * This file contains misc functions for dealing with armor
 *
  */

function armor(r){
    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	/*
	* wear:
	*	The player wants to wear something, so let the hero try
	*/
	this.wear = function()
	{
		let item; //reg struct linked_list *item;
		let obj; //reg struct object *obj;

		if (cur_armor != null) {
			msg("You are already wearing some.");
			after = false;
			return;
		}
		if ((item = get_item("wear", d.ARMOR)) == null)
			return;
		obj = OBJPTR(item);
		if (obj.o_type != d.ARMOR) {
			msg("You can't wear that.");
			return;
		}
		waste_time();
		msg("Wearing %s.", a_magic[obj.o_which].mi_name);
		cur_armor = obj;
		setoflg(obj,d.ISKNOW);
		r.nochange = false;
	}


	/*
	* take_off:
	*	Get the armor off of the players back
	*/
	this.take_off = function()
	{
		let obj; //reg struct object *obj;

		if ((obj = cur_armor) == null) {
			msg("Not wearing any armor.");
			return;
		}
		if (!dropcheck(cur_armor))
			return;
		cur_armor = null;
		msg("Was wearing %c) %s",pack_char(obj),inv_name(obj,true));
		r.nochange = false;
	}

	/*
	* initarmor:
	*		Initialize some armor.
	*/
	this.initarmor = function(obj, what)
	//struct object *obj;
	//int what;
	{
		const armors = v.armors;
		const a_magic = v.a_magic;
		const things = v.things;

		let iwa; //struct init_armor *iwa;
		let mi; //struct magic_item *mi;

		obj.o_type = d.ARMOR;
		obj.o_which = what;
		iwa = armors[what];
		mi = a_magic[what];
		obj.o_vol = iwa.a_vol;
		obj.o_ac = iwa.a_class;
		obj.o_weight = iwa.a_wght;
		obj.o_typname = things[d.TYP_ARMOR].mi_name;

		return obj;
	}

	/*
	* hurt_armor:
	*	Returns true if armor is damaged
	*/
	this.hurt_armor = function(obj)
	//struct object *obj;
	{
		const o_on = r.o_on;

		let type, ac;

		if (obj != null) {
			if (o_on(obj, d.ISPROT) || (o_on(obj, d.ISBLESS) && r.rnd(100) < 10))
				return false;
			ac = obj.o_ac;
			type = obj.o_which;
			if (type != d.PADDED && type != d.LEATHER)
				if ((type == d.STUDDED && ac < 8) || (type != d.STUDDED && ac < 9))
					return true;
		}
		return false;
	}
}