function ItemManager(r){
    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	this.s_names = [];//char *s_names[MAXSCROLLS];		/* Names of the scrolls */
	this.p_colors = [];//char *p_colors[MAXPOTIONS];		/* Colors of the potions */
	this.r_stones = [];//char *r_stones[MAXRINGS];		/* Stone settings of the rings */
	this.ws_stuff = [];//struct rod ws_stuff[MAXSTICKS];	/* Stuff for sticks */
	
	this.s_guess = [];//MAXSCROLLS];		/* his guess at what scroll is */
	this.p_guess = [];//MAXPOTIONS];		/* his guess at what potion is */
	this.r_guess = [];//MAXRINGS];		/* his guess at what ring is */
	this.ws_guess = [];//MAXSTICKS];		/* his guess at what wand is */

	this.s_know = [];	//[MAXSCROLLS];		/* Does he know about a scroll */
	this.p_know = [];	//[MAXPOTIONS];		/* Does he know about a potion */
	this.r_know = [];	//[MAXRINGS];		/* Does he know about a ring */
	this.ws_know = [];	//[MAXSTICKS];		/* Does he know about a stick */

	const s_names = this.s_names;
	const p_colors = this.p_colors;
	const r_stones = this.r_stones;
	const ws_stuff = this.ws_stuff;
	
	const s_guess = this.s_guess; 
	const p_guess = this.p_guess; 
	const r_guess = this.r_guess; 
	const ws_guess = this.ws_guess;

	const s_know = this.s_know;	
	const p_know = this.p_know;	
	const r_know = this.r_know;	
	const ws_know = this.ws_know;


	v.rainbow = [
		"Red",		"Blue",		"Green",	"Yellow",
		"Black",	"Brown",	"Orange",	"Pink",
		"Purple",	"Grey",		"White",	"Silver",
		"Gold",		"Violet",	"Clear",	"Vermilion",
		"Ecru",		"Turquoise","Magenta",	"Amber",
		"Topaz",	"Plaid",	"Tan",		"Tangerine",
		"Aquamarine", "Scarlet","Khaki",	"Crimson",
		"Indigo",	"Beige",	"Lavender",	"Saffron",
	];
	d.NCOLORS = v.rainbow.length;
	const rainbow = ms.RAINBOW; //v.rainbow;

	v.sylls = [
		"a", "ab", "ag", "aks", "ala", "an", "ankh", "app", "arg", "arze",
		"ash", "ban", "bar", "bat", "bek", "bie", "bin", "bit", "bjor",
		"blu", "bot", "bu", "byt", "comp", "con", "cos", "cre", "dalf",
		"dan", "den", "do", "e", "eep", "el", "eng", "er", "ere", "erk",
		"esh", "evs", "fa", "fid", "for", "fri", "fu", "gan", "gar",
		"glen", "gop", "gre", "ha", "he", "hyd", "i", "ing", "ion", "ip",
		"ish", "it", "ite", "iv", "jo", "kho", "kli", "klis", "la", "lech",
		"man", "mar", "me", "mi", "mic", "mik", "mon", "mung", "mur",
		"nej", "nelg", "nep", "ner", "nes", "nes", "nih", "nin", "o", "od",
		"ood", "org", "orn", "ox", "oxy", "pay", "pet", "ple", "plu", "po",
		"pot","prok","re", "rea", "rhov", "ri", "ro", "rog", "rok", "rol",
		"sa", "san", "sat", "see", "sef", "seh", "shu", "ski", "sna",
		"sne", "snik", "sno", "so", "sol", "sri", "sta", "sun", "ta",
		"tab", "tem", "ther", "ti", "tox", "trol", "tue", "turs", "u",
		"ulk", "um", "un", "uni", "ur", "val", "viv", "vly", "vom", "wah",
		"wed", "werg", "wex", "whon", "wun", "xo", "y", "yot", "yu",
		"zant", "zap", "zeb", "zim", "zok", "zon", "zum",
	];
	d.NSYLS = v.sylls.length;
	const sylls = ms.SYLLS; //v.sylls;

	v.stones = [
		"Agate",		"Alexandrite",	"Amethyst",
		"Azurite",		"Carnelian",	"Chrysoberyl",
		"Chrysoprase",	"Citrine",		"Diamond",
		"Emerald",		"Garnet",		"Hematite",
		"Jacinth",		"Jade",			"Kryptonite",
		"Lapus lazuli",	"Malachite",	"Moonstone",
		"Obsidian",		"Olivine",		"Onyx",
		"Opal",			"Pearl",		"Peridot",
		"Quartz",		"Rhodochrosite","Ruby",
		"Sapphire",		"Sardonyx",		"Serpintine",
		"Spinel",		"Tiger eye",	"Topaz",
		"Tourmaline",	"Turquoise",
	];
	const stones = ms.STONES; //v.stones;

	v.wood = [
		"Avocado wood",	"Balsa",	"Banyan",		"Birch",
		"Cedar",		"Cherry",	"Cinnibar",		"Dogwood",
		"Driftwood",	"Ebony",	"Eucalyptus",	"Hemlock",
		"Ironwood",		"Mahogany",	"Manzanita",	"Maple",
		"Oak",			"Pine",		"Redwood",		"Rosewood",
		"Teak",			"Walnut",	"Zebra wood", 	"Persimmon wood",
	];
	d.NWOOD = v.wood.length;
	const wood = ms.WOOD; //v.wood;

	v.metal = [
		"Aluminium",	"Bone",		"Brass",	"Bronze",
		"Copper",		"Chromium",	"Iron",		"Lead",
		"Magnesium",	"Pewter",	"Platinum",	"Steel",
		"Tin",			"Titanium",	"Zinc",
	];
	d.NMETAL = v.metal.length;
	const metal = ms.METAL; //v.metal;

	const things = v.things;
	const a_magic = v.a_magic;
	const w_magic = v.w_magic;
	const p_magic = v.p_magic;
	const s_magic = v.s_magic;
	const r_magic = v.r_magic;
	const ws_magic = v.ws_magic;

	this.things_f = new things_f(r);
	this.pack_f = new pack_f(r);
	this.weapon_f = new weapons(r);
	this.armor_f = new armor(r);
	this.potion_f = new potions(r);
	this.scroll_f = new scrolls(r);
	this.ring_f = new rings(r);
	this.stick_f = new sticks(r);

	const shuffle =(ary)=>{
        //console.log(ary);
        for (let j =0; j <100; j++){ //shuffle count
            for (let i = 0; i < ary.length; i++){
                let s = r.rnd(ary.length);
                let w = ary[s];
                ary[s] = ary[i];
                ary[i] = w;
            } 
        }
        //console.log(ary);
        return ary;
    }

    r.UI.comment("item");

	this.reset_mi_probs = ()=>{

		for (let i in things) things[i].mi_prob = things[i].mi_prob_bup;
		for (let i in a_magic) a_magic[i].mi_prob = a_magic[i].mi_prob_bup;
		for (let i in w_magic) w_magic[i].mi_prob = w_magic[i].mi_prob_bup;
		for (let i in p_magic) p_magic[i].mi_prob = p_magic[i].mi_prob_bup;
		for (let i in s_magic) s_magic[i].mi_prob = s_magic[i].mi_prob_bup;
		for (let i in r_magic) r_magic[i].mi_prob = r_magic[i].mi_prob_bup;
		for (let i in ws_magic) ws_magic[i].mi_prob = ws_magic[i].mi_prob_bup;
	}

	this.item_flagcheck = function(obj){
		const o_on = r.o_on;

		let res = "";
		if (o_on(obj, d.ISCURSED)) res += "/CURSED";
		if (o_on(obj, d.ISKNOW))  res += "/KNOW";
		if (o_on(obj, d.ISPOST))  res += "/POST";
		if (o_on(obj, d.ISPROT))  res += "/PROT";
		if (o_on(obj, d.ISBLESS)) res += "/BLESS";
		if (o_on(obj, d.ISMISL))  res += "/MISL";
		if (o_on(obj, d.ISMANY))  res += "/MANY";
		
		let count = "";//(obj.o_count != 1)?`x${obj.o_count}`:"";
		res += ` ${obj.o_group} ${count}`;	
		//-----1:ISCURSED:
		//-----2:ISKNOW :
		//-----4:ISPOST :
		//----1-:ISPROT :
		//----4-:ISBLESS:
		//-2----:ISMISL :
		//-4----:ISMANY :

		return res;
	}

	/*
	* init_everything:
	*	Set up all important stuff.
	*/
	this.init_everything = function()
	{
		init_player();			/* Roll up the rogue */
		init_things();			/* Set up probabilities */
		init_names();			/* Set up names of scrolls */
		init_colors();			/* Set up colors of potions */
		init_stones();			/* Set up stones in rings */
		init_materials();		/* Set up materials of wands */
	}

	/*
	* init_things:
	*	Initialize the probabilities for types of things
	*/
	function init_things()
	{
		//struct magic_item *mi;
		
		/*
		* init general things
		*/
		//for (mi = &things[1]; mi < &things[NUMTHINGS]; mi++)
		for (let i=0; i<d.NUMTHINGS; i++)
			things[i+1].mi_prob += things[i].mi_prob;
		badcheck("things", things);
		/*
		* init armor things
		*/
		//for (mi = &a_magic[1]; mi < &a_magic[MAXARMORS]; mi++)
		for (let i=0; i<d.MAXARMORS; i++)
			a_magic[i+1].mi_prob += a_magic[i].mi_prob;
		badcheck("armor", a_magic);
		/*
		* init weapon stuff
		*/
		//for (mi = &w_magic[1]; mi < &w_magic[MAXWEAPONS]; mi++)
		for (let i=0; i<d.MAXWEAPONS; i++)
			w_magic[i+1].mi_prob += w_magic[i].mi_prob;
		badcheck("weapon", w_magic);
	}

	/*
	* init_colors:
	*	Initialize the potion color scheme for this time
	*/
	function init_colors()
	{
		//reg int i, j;
		//reg char *str;
		//bool used[NCOLORS];
		let nums = [];

		for (i = 0; i < d.NCOLORS; i++)
			nums[i] = i;
		nums = shuffle(nums);
		for (i = 0; i < d.MAXPOTIONS; i++) {
			p_colors[i] = String.fromCharCode(Number(d.COLORCHIP[v.rainbow[nums[i]]]));
			p_colors[i] += rainbow[nums[i]]
			p_know[i] = false;
			p_guess[i] = null;
			//if (i > 0)
				p_magic[i+1].mi_prob += p_magic[i].mi_prob;
		}
		badcheck("potions", p_magic);
	}


	/*
	* init_names:
	*	Generate the names of the various scrolls
	*/
	function init_names()
	{
		let nsyl;
		let cp, sp;
		let i, nwords;

		for (i = 0; i < d.MAXSCROLLS; i++) {
			cp = "";
			nwords = r.rnd(3)+1;
			while(nwords--)	{
				nsyl = r.rnd(3)+2;
				while(nsyl--) {
					sp = sylls[r.rnd(d.NSYLS)];
					cp += sp;
				}
				cp += ' ';
			}
			s_names[i] = cp;
			s_know[i] = false;
			s_guess[i] = null;
			//strcpy(s_names[i], prbuf);
			//if (i > 0)
				s_magic[i+1].mi_prob += s_magic[i].mi_prob;
		}
		badcheck("scrolls", s_magic);
	}

	/*
	* init_stones:
	*	Initialize the ring stone setting scheme for this time
	*/

	function init_stones()
	{
		//let i, j;
		//let str;
		let nums = [];
		//bool used[NSTONES];

		for (i = 0; i < d.NSTONES; i++)
			nums[i] = i;
		nums = shuffle(nums);
		for (i = 0; i < d.MAXRINGS; i++) {
			r_stones[i] = stones[nums[j]];
			r_know[i] = false;
			r_guess[i] = null;
			//if (i > 0)
				r_magic[i+1].mi_prob += r_magic[i].mi_prob;
		}
		badcheck("rings", r_magic);
	}

	/*
	* init_materials:
	*	Initialize the construction materials for wands and staffs
	*/

	function init_materials()
	{
		let i, j;
		let str;
		let rd;//struct rod *rd;
		//bool metused[NMETAL], woodused[NWOOD];
		let woodnum = [], metnum = [];
		let wc=0 , mc=0;

		for (i = 0; i < d.NWOOD; i++)
			woodnum[i] = i;
		for (i = 0; i < d.NMETAL; i++)
			metnum[i] = i;

		woodnum = shuffle(woodnum);
		metnum = shuffle(metnum);

		for (i = 0; i < d.MAXSTICKS; i++) {
			ws_stuff[i] = new t.rod();
			rd = ws_stuff[i];
			if (r.rnd(100) > 50) {
				str = metal[metnum[mc]]; mc++;
				rd.ws_type = ms.INIT_MTL1; //"wand";
				rd.ws_vol = d.V_WS_WAND;
				rd.ws_wght = d.W_WS_WAND;
				//metused[j] = true;
			}
			else {
				str = wood[woodnum[wc]]; wc++;
				rd.ws_type = ms.INIT_MTL2; //"staff";
				rd.ws_vol = d.V_WS_STAFF;
				rd.ws_wght = d.W_WS_WAND;
				//woodused[j] = true;
			}
			ws_stuff[i].ws_made = str;
			ws_know[i] = false;
			ws_guess[i] = null;
			//if (i > 0)
				ws_magic[i+1].mi_prob += ws_magic[i].mi_prob;
		}
		badcheck("sticks", ws_magic);
	}

	function badcheck(name, magic)
	//char *name;
	//struct magic_item *magic;
	{
		let mg;//struct magic_item *mg;

		//for (mg = magic; mg.mi_name != null; mg++)
		//	;
		if (magic[magic.length-1].mi_prob == 1000){
			//console.log(`OK percentages for ${name}`);
			return;
		}
		console.log(`Bad percentages for ${name}`);
		for (let i in magic)
			console.log(`${magic[i].mi_prob} ${magic[i].mi_name}`);
		//for (mg = magic; mg.mi_name != null; mg++)
			//printf("%4d%% %s\n", mg.mi_prob, mg.mi_name);

		//printf("%s", retstr);
		//fflush(stdout);
		//while (getchar() != '\n')
		//	continue;
	}


	/*
	* init_player:
	*	roll up the rogue
	*/
	function init_player()
	{
		const totalenc = r.player.encumb.totalenc;
		const player = r.player.get_player();
		let him, max_stats;
		
		player.t_flags = 0;
		player.t_nomove = 0;
		player.t_nocmd = 0;

		him = player.t_stats;
		him.s_lvl = 1;
		him.s_exp = 0;
		him.s_maxhp = him.s_hpt = pinit();		/* hit points */
		him.s_re.a_str = pinit();		/* strength */
		him.s_re.a_dex = pinit();		/* dexterity */
		him.s_re.a_wis = pinit();		/* wisdom */
		him.s_re.a_con = pinit();		/* constitution */
		him.s_ef = him.s_re;			/* effective = real */
		him.s_dmg = "1d4";
		him.s_arm = d.NORMAC;
		him.s_carry = totalenc(); //player.encumb.totalenc
		him.s_pack = 0;
		pack = null;				/* empty pack so far */
		max_stats = him;

		player.t_stats = him;
		r.player.set_player(player);
		r.player.set_max_stats(max_stats);
		r.player.set_him(him);
		r.player.set_pack(pack);
	}


	/*
	* pinit:
	*	Returns the best 3 of 4 on a 6-sided die
	*/
	function pinit()
	{
		let best = [];
		let i, min, minind, dicetot;

		for (i = 0 ; i < 4 ; i++)
			best[i] = r.roll(1,6);	/* populate array */
		min = best[0];				/* assume that 1st entry */
		minind = 0;					/* is the lowest */
		for (i = 1 ; i < 4 ; i++) {	/* find the lowest */
			if (best[i] < min) {	/* if < minimum then update */
				min = best[i];
				minind = i;			/* point to lowest value */
			}
		}
		dicetot = 0;				/* start with nothing */
		for (i = 0 ; i < 4 ; i++) {
			if (i != minind)		/* if not minimum, then add it */
				dicetot += best[i];
		}
		return(dicetot);
	}

	this.decode_cmd = function(direct){

		const o_on = r.o_on;
		const quaff = r.item.potion_f.quaff;
		const read_scroll = r.item.scroll_f.read_scroll;
		const eat = r.player.misc.eat;
		const iswearing = r.item.ring_f.iswearing;
		const ring_off = r.item.ring_f.ring_off;
		const ring_on = r.item.ring_f.ring_on;
		const take_off = r.item.armor_f.take_off;
		const wear = r.item.armor_f.wear;
		const wield = r.item.weapon_f.wield;
		const do_zap = r.item.stick_f.do_zap;
		const missile = r.item.weapon_f.missile;

		const si = r.player.get_select();

		let ch, use = false;

		if (si == null) {
			r.UI.msg("No inventory selected.");
			return;
		}
		
		switch(si.o_type){
			case d.POTION:
				ch = "q";
				if (direct){use = true; quaff();}
				break;
			case d.SCROLL:
				ch = "r";	
				if (direct){use = true; read_scroll();}
				break;
			case d.FOOD:
				ch = "e";		
				if (direct){use = true; eat();}
				break;
			case d.RING:
				if (iswearing(si)) {
					ch = "R";
					if (direct){use = true; ring_off();}
				}else{
					ch = "P";
					if (direct){use = true; ring_on();}
				}
				break;
			case d.ARMOR:
				if (r.player.get_cur_armor() != null){
					ch = "T";
					if (direct){use = true; take_off();}
				}else{
					ch = "W";
					if (direct){use = true; wear();}
				}
				break;
			case d.WEAPON:
				if (o_on(si, d.ISMANY) && o_on(si, d.ISMISL)){
					ch = "t";
					//if (direct){ use = true; missile(); }
				}else{
					ch = "w";
					if (direct){ use = true; wield(); }
				}
				break;
			case d.STICK:
				ch = "z";		
				if (direct){use = true; do_zap();}
				break;
			default:
				ch = "s";
				r.UI.msg("This item cannot be used.");
				break;
		}
		return ch;
	}

	this.decode_drop = function(direct){
		
		const o_on = r.o_on;
		const missile = r.item.weapon_f.missile;
		const trap_at = r.player.move.trap_at;
		const drop = r.item.things_f.drop;
		const dip_it = r.player.move.dip_it;
		const sell_it = r.dungeon.trader.sell_it;
		
		const hero = r.player.get_hero();
		const obj = r.player.get_select();

		let ch, done = false;;

		if (obj == null) {
			r.UI.msg("No inventory selected.");
			return;
		}

		if (r.levtype != d.POSTLEV){
			//console.log(obj.o_type == d.WEAPON);
			//console.log(obj.o_flags);
			
			if (obj.o_type == d.WEAPON && o_on(obj, d.ISMISL)){
				ch = "t"; //if (direct) done = missile();
			}else{
				let tp = trap_at(hero.y,hero.x);
				if (tp == null || r.inpool == false || (tp.tr_flags & d.ISGONE)){
					ch = "d"; if (direct) done = drop();
				}else{
					ch = "D"; if (direct) done = dip_it();
				}
			}
		}else{
			ch = "%"; if (direct) done = sell_it();
		}
		//console.log(ch);
		return ch;
	}
}