/*
 * Routines to deal with the pack
 *
 */

function pack_f(r){
	
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	const cw = d.DSP_MAIN_FG;
	const hw = d.DSP_WINDOW;

	/*
	* add_pack:
	* Pick up an object and add it to the pack.  If the argument
	* is non-null use it as the linked_list pointer instead of
	* getting it off the ground.
	*/
	this.add_pack = (item, silent)=>
	//struct linked_list *item;
	//bool silent;
	{
		/*
		const picked_up =()=>{
			//console.log(item);
			obj = OBJPTR(item);
			if (!silent){
				let pach = pack_char(obj);
				r.UI.msg(`${inv_name(obj,false)} ${(pach =='%')?"":`(${pach})`}`);
			}
			if (obj.o_type == d.AMULET)
				r.amulet = true;
			updpack();
		}
		*/
		const find_obj = r.player.misc.find_obj;
		const OBJPTR = f.OBJPTR;
		const o_on = r.o_on;
		const itemweight = r.player.encumb.itemweight;
		const setoflg = r.setoflg; 
		const next = f.next;
		const updpack = r.player.encumb.updpack;
		const inv_name = r.item.things_f.inv_name;
		const pack_char = this.pack_char;

		const player = r.player.get_player();
		const him = r.player.get_him();
		const hero = r.player.get_hero();
		const pack = r.player.get_pack();

		let ip, lp; //reg struct linked_list *ip, *lp;
		let obj, op;//reg struct object *obj, *op;
		let from_floor;
		let delchar;
		let pack_result;

		if (player.t_room == null)
			delchar = d.PASSAGE;
		else
			delchar = d.FLOOR;
		if (item == null) {
			from_floor = true;
			if ((item = find_obj(hero.y, hero.x)) == null) {
				//mpos = 0;
				r.UI.msg(ms.ADDPACK_1);
				r.UI.mvaddch(hero.y, hero.x, delchar);
				return false;
			}
			/*
			* Check for scare monster scrolls
			*/
			obj = OBJPTR(item);
			if (obj.o_type == d.SCROLL && obj.o_which ==d.S_SCARE) {
				if (o_on(obj,d.ISFOUND)) {
					r.UI.msg(ms.ADDPACK_2);
					r.dungeon.lvl_obj = r.detach(r.dungeon.lvl_obj, item);
					r.discard(item);
					r.UI.mvaddch(hero.y, hero.x, delchar);	
					return false;
				}
			}
		}
		else
			from_floor = false;
		obj = OBJPTR(item);
		/*
		* See if this guy can carry any more weight
		*/
		if (itemweight(obj) + him.s_pack > him.s_carry) {
			r.UI.msg(ms.ADDPACK_3(obj.o_typname));
			return false;
		}
		/*
		* Check if there is room
		*/
		if (r.packvol + obj.o_vol > d.V_PACK) {
			r.UI.msg(ms.ADDPACK_4(obj.o_typname));
			return false;
		}
		if (from_floor) {
			r.dungeon.lvl_obj = r.detach(r.dungeon.lvl_obj, item);
			r.UI.mvaddch(hero.y, hero.x, delchar);
		}
		item.l_prev = null;
		item.l_next = null;
		setoflg(obj, d.ISFOUND);
		/*
		* start looking thru pack to find the start of items
		* with the same type.
		* パック内を調べて、同じ種類のアイテムの先頭を探します。
		*/
		lp = pack;
		for (ip = pack; ip != null; ip = next(ip)) {
			op = OBJPTR(ip);
			/*
			* If we find a matching type then quit.
			*/
			if (op.o_type == obj.o_type)
				break;
			if (next(ip) != null)
				lp = next(lp);		/* update "previous" entry */
		}
		/*
		* If the pack was empty, just stick the item in it.
		* パックが空の場合は、アイテムをそのままパックに入れます。
		*/
		if (pack == null) {
			r.player.set_pack(item);
			item.l_prev = null;
			pack_result = "empty-new";
		}
		/*
		* If we looked thru the pack, but could not find an
		* item of the same type, then stick it at the end,
		* unless it was food, then put it in front.
		* パック内を調べても同じ種類のアイテムが見つからなかった場合
		* は、それを最後に入れます。
		* 食べ物でない場合は、それを前に入れます。
		*/
		else if (ip == null) {
			if (obj.o_type == d.FOOD) {	/* insert food at front */
				item.l_next = pack;
				pack.l_prev = item;
				r.player.set_pack(item);
				item.l_prev = null;
				//r.player.set_pack(item);
				pack_result = "new-food";
			}
			else {						/* insert other stuff at back */
				lp.l_next = item;
				item.l_prev = lp;
				pack_result = "new";
			}

		}
		/*
		* Here, we found at least one item of the same type.
		* Look thru these items to see if there is one of the
		* same group. If so, increment the count and throw the
		* new item away. If not, stick it at the end of the
		* items with the same type. Also keep all similar
		* objects near each other, like all identify scrolls, etc.
		* ここでは、同じ種類のアイテムが少なくとも1つ見つかりました。
		* これらのアイテムを調べて、同じグループのアイテムがあるかどうかを確認します。
		* もしあれば、カウントをインクリメントし、新しいアイテムを捨てます。
		* なければ、同じ種類のアイテムの最後に入れます。
		* また、類似のオブジェクト（識別の巻物など）は、すべて互いに近くに置いてください。
		*/
		else {
			let save;//struct linked_list **save;
			let picked_up = false;

			while (ip != null && op.o_type == obj.o_type) {

				const around =()=>{
					ip = next(ip);
					if (ip != null) {
						op = OBJPTR(ip);
						lp = next(lp);
					}
				}
				
				if (op.o_group == obj.o_group) {
					if (op.o_flags == obj.o_flags) {
						op.o_count++;
						r.discard(item);
						item = ip;
						picked_up = true;
						pack_result = "add";
						break;
						//picked_up();
						//return true;
						//goto picked_up;
					}
					else {
						around();
						continue;
						//goto around;
					}
				}
				if (op.o_which == obj.o_which) {
					if (obj.o_type == d.FOOD)
						ip = next(ip);
					break;
				}
	around:
				around();
				//ip = next(ip);
				//if (ip != null) {
				//	op = OBJPTR(ip);
				//	lp = next(lp);
				//}
			}

			if (!picked_up){
				/*
				* If inserting into last of group at end of pack,
				* just tack on the end.
				* パックの末尾のグループの最後に挿入する場合は、
				* 単に末尾を貼り付けます。
				*/
				if (ip == null) {
					lp.l_next = item;
					item.l_prev = lp;
					pack_result = "tail";
				}
				/*
				* Insert into the last of a group of objects
				* not at the end of the pack.
				* オブジェクトのグループの最後に挿入します。
				* パックの末尾ではありません。
				*/
				else {
					//item 挿入するリンクリストオブジェクト
					//ip　現時点で挿入位置にあるリンクリストオブジェクト
					//console.log("og-tail_before");

					//debug_llcheck(ip.l_prev,"ip.l_prev");
					//debug_llcheck(item, "item");
					//debug_llcheck(ip,"ip");
					let old_iplprev = ip.l_prev; //ip.l_prev は、新しいアイテムが挿入される直前のアイテム
	
					item.l_next = ip;	//挿入するアイテムの位置の「次」のアイテムを ip に設定
					item.l_prev = ip.l_prev; //挿入するアイテムの位置の「前」のアイテムを ip-.l_prev に設定
					ip.l_prev = item; // 挿入位置の「次」のアイテム ip の前のアイテムを itemへ設定

					old_iplprev.l_next = item; //直前のアイテムの「次」のアイテムをitemに設定

					//save = item;
					pack_result = "og-tail";
					//debug_llcheck(save,"save");
					//debug_llcheck(item, "item");
					//debug_llcheck(ip,"ip");
					//console.log((item.l_data == ip.l_prev.l_data)?"ok":"ng");
				}
			}
		}
	picked_up:
		//picked_up();
		obj = OBJPTR(item);
		if (!silent){
			let pach = pack_char(obj);
			r.UI.msg(`${inv_name(obj,false)} ${(pach =='%')?"":`(${pach})`}`);
		}
		if (obj.o_type == d.AMULET)
			r.amulet = true;
		updpack();	/* new pack weight & volume */

		r.UI.comment(`add_pack(${pack_result})`);
		return true;
	}

	function debug_llcheck(item, label){

		const OBJPTR = f.OBJPTR;
		const pack_char = r.item.pack_f.pack_char;
		const inv_name = r.item.things_f.inv_name;

		let ent = r.on_entity(item)?"y":"n";
		let obj = OBJPTR(item);
		let pre = Boolean(item.l_prev)?pack_char(OBJPTR(item.l_prev)):"-";
		let nex = Boolean(item.l_next)?pack_char(OBJPTR(item.l_next)):"-"; 
		console.log(`${ent} p[${pre}]-[${label} ${inv_name(obj, false)} ${pack_char(obj)}]-n[${nex}]`);
	}

	/*
	* inventory:
	*	Show what items are in a specific list
	*/
	this.inventory = function(list, type)
	//struct linked_list *list;
	//int type;
	{
		const OBJPTR = f.OBJPTR;
		const next = f.next;
		const inv_name = r.item.things_f.inv_name;
		const npch = r.UI.io.npch;

		let pc; //reg struct linked_list *pc;
		let obj; //reg struct object *obj;
		let ch;
		let cnt;
		
		//r.player.set_dest(null);

		if (list == null) {			/* empty list */
			r.UI.msg(type == 0 ? "Empty handed." : "Nothing appropriate.");
			return false;
		}
		else if (next(list) == null) {	/* only 1 item in list */
			obj = OBJPTR(list);
			r.UI.msg("a) %s", inv_name(obj, false));
			return true;
		}
		cnt = 0;
		r.UI.wclear(hw);
		let buf = [];
		for (ch = 'a', pc = list; pc != null; pc = next(pc), ch = npch(ch)) {
			obj = OBJPTR(pc);
			buf.push(`${ch}) ${inv_name(obj, false)}`);
			//wprintw(hw,"%c) %s\n\r",ch,inv_name(obj, false));
			//if (++cnt > LINES - 2 && next(pc) != null) {
			//	dbotline(hw, morestr);
			//	cnt = 0;
			//	wclear(hw);
			//}
		}
		r.UI.setDsp(hw);
		for (let i in buf){
			r.UI.mvaddch(i ,0, buf[i]);
		}
		//dbotline(hw,spacemsg);
		//restscr(cw);
		r.UI.setDsp(d.DSP_MAIN);

		r.setScene(d.SCE_INVENT);
		r.UI.overlapview(true);

		return true;
	}

	/*
	* pick_up:
	*	Add something to characters pack.
	*/
	this.pick_up = (ch)=>
	//char ch;
	{
		const money = r.item.things_f.money;
		const add_pack = this.add_pack;

		r.change = false;
		switch(ch) {
			case d.GOLD:
				money();
			break;case d.ARMOR:
			case d.POTION:
			case d.FOOD:
			case d.WEAPON:
			case d.SCROLL:	
			case d.AMULET:
			case d.RING:
			case d.STICK:
				add_pack(null, false);
			break;
			default:
				r.UI.msg("That item is ethereal !!!");
		}
	}

	/*
	* picky_inven:
	*	Allow player to inventory a single item
	*/
	this.picky_inven = function()
	{
		const npch = r.UI.io.npch;
		const inv_name = r.item.things_f.inv_name;
		const pack = r.player.get_pack(); 

		let item; //reg struct linked_list *item;
		let ch, mch;

		if (pack == null)
			r.UI.msg("You aren't carrying anything.");
		else if (f.next(pack) == null)
			r.UI.msg(`a) ${inv_name(f.OBJPTR(pack), false)}`);
		else {
			r.UI.msg("Item: ");
			//mpos = 0;
			if ((mch = readchar()) == ESCAPE) {
				r.UI.msg("");
				return;
			}
			for (ch='a',item=pack; item != null; item=f.next(item),ch=npch(ch))
				if (ch == mch) {
					r.UI.msg(`${ch}) ${inv_name(f.OBJPTR(item), false)}`);
					return;
				}
			if (ch == 'A')
				ch = 'z';
			else
				ch -= 1;
			r.UI.msg(`Range is 'a' to '${ch}'`);
		}
	}

	/*
	* get_item:
	*	pick something out of a pack for a purpose
	*/
	//struct linked_list *
	this.get_item = (purpose, type)=>
	//char *purpose;
	//int type;
	{
		//pp
		//quaff pot
		//sell  0
		//wear  arm
		//put on ring
		//read scroll 
		//protect 0
		//enchant 0
		//zap with stick
		//drop 0  
		//throw wea
		//wield wea
		//eat food
		//dip 0
		//charge stick
		//call 0
		//identify 0

		const npch = r.UI.io.npch;
		const inv_name = r.item.things_f.inv_name;

		const pack = r.player.get_pack(); 

		let obj, pit, savepit;// reg struct linked_list *obj, *pit, *savepit;
		let pob; //struct object *pob;
		let ch, och, anr, cnt;
		let buf = [];

		if (pack == null) {
			r.UI.msg("You aren't carrying anything.");
			return null;
		}
		if (type != d.WEAPON && (type != 0 || f.next(pack) == null)) {
			/*
			* see if we have any of the type requested
			*/
			pit = pack;
			anr = 0;
			for (ch = 'a'; pit != null; pit = f.next(pit), ch = npch(ch)) {
				pob = f.OBJPTR(pit);
				if (type == pob.o_type || type == 0) {
					++anr;
					savepit = pit;	/* save in case of only 1 */
				}
			}
			if (anr == 0) {
				r.UI.msg(`Nothing to ${purpose}`);
				r.after = false;
				return null;
			}
			else if (anr == 1) {	/* only found one of 'em */
				//r.player.set_dest( f.OBJPTR(savepit) );	
				return savepit;		/* return this item */
			}
		}
		
		if (purpose != "protect" && purpose != "enchant" 
			&& purpose != "identify"){ //} && purpose != "drop"){
			if (r.player.get_select() != null) {
				for (pit = pack; pit != null; pit = f.next(pit)) {
					pob = f.OBJPTR(pit);
					if (pob == r.player.get_select()) {
						console.log("getitem_select")
						return pit;
					}
				}
			}
		} else {

			//if (r.player.get_dest() != null) {
			//	for (pit = pack; pit != null; pit = f.next(pit)) {
			//		pob = f.OBJPTR(pit);
			//		if (pob == r.player.get_dest()) {
			//			r.player.set_dest(null);
			//			console.log("getitem_dest")
			//			return pit;
			//		}
			//	}
			//}

			//for (;;) {
			r.UI.msg(`${purpose} what?`);// (* for list): ",purpose);

			//ch = readchar();
			//mpos = 0;
			//if (ch == d.ESCAPE) {		/* abort if escape hit */
			//	after = false;
			//	r.UI.msg("");			/* clear display */
			//	return null;
			//}
			//if (false){
			//if (ch == '*') {
			r.UI.wclear(hw);

			pit = pack;		/* point to pack */
			cnt = 0;
			for (ch='a'; pit != null; pit=f.next(pit), ch=npch(ch)) {
				pob = f.OBJPTR(pit);
				if (type == 0 || type == pob.o_type) {
					buf.push(`${ch}) ${inv_name(pob, false)}`);
					//wprintw(hw,"%c) %s\n\r",ch,inv_name(pob,false));
					cnt++;
					//if (++cnt > LINES - 2 && next(pit) != null) {
					//	cnt = 0;
					//	dbotline(hw, morestr);
					//	wclear(hw);
					//}
				}
			}
			buf.push("");
			buf.push(`${purpose} what?`);
			//wmove(hw, LINES - 1,0);
			//wprintw(hw,"%s what? ",purpose);
			r.UI.setDsp(hw);
			for (let i in buf){
				r.UI.mvaddch(i ,0, buf[i]);
			}

			r.UI.scene.set_gi_param(purpose, type);
			//r.castspell = true;
			r.nextScene = d.SCE_GETITEM; 
			//r.UI.overlapview(true);
			console.log(`gi-op-end ${purpose}`);
		}
	}
	
	/*
	* pack_char:
	*	Get the character of a particular item in the pack
	*/
	//char
	this.pack_char = function(obj)
	//struct object *obj;
	{
		let item; //reg struct linked_list *item;
		let c; //reg char c;

		c = 'a';
		for (item = r.player.get_pack(); item != null; item = f.next(item))
			if (f.OBJPTR(item) == obj)
				return c;
			else
				c = r.UI.io.npch(c);
		return '%';
	}

	/*
	* idenpack:
	*	Identify all the items in the pack
	*/
	this.idenpack = function()
	{
		const whatis = r.UI.wizard.whatis;

		let pc; //reg struct linked_list *pc;

		for (pc = r.player.get_pack() ; pc != null ; pc = f.next(pc))
			whatis(pc);
	}


	/* 
	* del_pack:
	*	Take something out of the hero's pack
	*/
	this.del_pack = (what)=>
	//struct linked_list *what;
	{
		const updpack = r.player.encumb.updpack;

		let op; //reg struct object *op;

		op = f.OBJPTR(what);
		this.cur_null(op);		/* check for current stuff */
		if (op.o_count > 1) {
			op.o_count--;
		}
		else {
			r.player.set_pack( r.detach(r.player.get_pack(),what) );
			r.discard(what);
		}
		updpack();
	}

	/*
	* cur_null:
	*	This updates cur_weapon etc for dropping things
	*/
	this.cur_null = function(op)
	//struct object *op;
	{
		const cur_ring = r.player.get_cur_ring;

		if (op == r.player.get_cur_weapon())
			r.player.set_cur_weapon(null);
		else if (op == r.player.get_cur_armor())
			r.player.set_cur_armor(null);
		else if (op == cur_ring[d.LEFT])
			cur_ring[d.LEFT] = null;
		else if (op == cur_ring[d.RIGHT])
			cur_ring[d.RIGHT] = null;
	
		r.player.set_cur_ring(cur_ring);
	}
}