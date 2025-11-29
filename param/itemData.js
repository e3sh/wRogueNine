function itemData(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;

    const s_names = [];//char *s_names[MAXSCROLLS];		/* Names of the scrolls */
	const p_colors = [];//char *p_colors[MAXPOTIONS];		/* Colors of the potions */
	const r_stones = [];//char *r_stones[MAXRINGS];		/* Stone settings of the rings */
	const ws_stuff = [];//struct rod ws_stuff[MAXSTICKS];	/* Stuff for sticks */

	const setupItem =(data)=>{
		let item = [];

		for (let i in data){
			let o = new t.magic_item();
			o.mi_name = data[i][0];
			o.mi_prob = data[i][1];
			o.mi_worth= data[i][2];
			item.push(o); 
		}
		return item;
	}
	const setupWeapon =(data)=>{
		let item = [];

		for (let i in data){
			let o = new t.init_weps();
			o.w_dam  = data[i][0];
			o.w_hrl  = data[i][1];
			o.w_flags = data[i][2];
			o.w_wght = data[i][3];
			o.w_vol  = data[i][4];
			o.w_launch = data[i][5];
			item.push(o); 
		}
		return item;
	}
	const setupArmor =(data)=>{
		let item = [];

		for (let i in data){
			let o = new t.init_armor();
			o.a_class = data[i][0];
			o.a_wght  = data[i][1];
			o.a_vol   = data[i][2];
			item.push(o); 
		}
		return item;
	}

	const setupInfo =(data)=>{
		let item = [];

		for (let i in data){
			let o = new t.magic_info();
			o.mf_max = data[i][0];
			o.mf_vol = data[i][1];
			o.mf_show = data[i][2];
			o.magic_item = data[i][3];
			item.push(o); 
		}
		return item;
	}


	//struct magic_item things[NUMTHINGS + 1] = 
	v.things = setupItem(
		[
			[ "potion",	257,	 5, ],
			[ "scroll",	250,	30, ],
			[ "food",	185,	 7, ],
			[ "weapon",	 92,	 0, ],
			[ "armor",	 92,	 0, ],
			[ "ring",	 62,	 5, ],
			[ "stick",	 62,	 0, ],
			[ "amulet",	 0,   -250, ],
			[ null,		 0,		 0,	],
		]
	);
	d.NUMTHINGS = v.things.length -1;

	//struct magic_item a_magic[MAXARMORS + 1] = 
	v.a_magic = setupItem(
		[
			[ "leather armor",			170,   5 ],
			[ "ring mail",				130,  30 ],
			[ "studded leather armor",	130,  20 ],
			[ "scale mail",				120,   3 ],
			[ "padded armor",			100, 250 ],
			[ "chain mail",				 90,  75 ],
			[ "splint mail",			 90,  80 ],
			[ "banded mail",			 90,  90 ],
			[ "plate mail",		 		 50, 400 ],
			[ "plate armor",			 30, 650 ],
			[ null,						  0,   0 ],
		]
	);
	d.MAXARMORS = v.a_magic.length -1;

	//struct init_armor armors[MAXARMORS] = 
	v.armors = setupArmor(
		[
			[ 8,	150,	500,	],
			[ 7,	250,	650,	],
			[ 7,	200,	550,	],
			[ 6,	400,	900,	],
			[ 6,	100,	450,	],
			[ 5,	300,	650,	],
			[ 4,	400,	700,	],
			[ 4,	350,	600,	],
			[ 3,	450,	950,	],
			[ 2,	350,	750,	],
		]
	);
	d.MAXARMORS = v.armors.length;

	//struct magic_item w_magic[MAXWEAPONS + 1] = 
	v.w_magic = setupItem(
		[
			[ "mace",				 70,  25 ],
			[ "long sword",			 70,  60 ],
			[ "short bow",			 60, 150 ],
			[ "arrow",				 60,   2 ],
			[ "dagger",				 20,   5 ],
			[ "rock",				 20,   1 ],
			[ "two-handed sword",	 50, 120 ],
			[ "sling",				 20,   5 ],
			[ "dart",				 30,   3 ],
			[ "crossbow",			 60,  70 ],
			[ "crossbow bolt",		 60,   3 ],
			[ "spear",				 70,   8 ],
			[ "trident",			 70,  90 ],
			[ "spetum",				 70,  50 ],
			[ "bardiche",			 70,  30 ],
			[ "pike",				 70,  75 ],
			[ "bastard sword",		 60, 100 ],
			[ "halberd",			 70,  40 ],
			[ null,					  0,   0 ],
		]
	);
	d.MAXWEAPONS = v.w_magic.length -1;

	//struct init_weps weaps[MAXWEAPONS] = 
	v.weaps = setupWeapon(
		[
			[ "2d4",  "1d3", 0					,100, 300, d.NONE ],
			[ "1d10", "1d2", 0					, 60, 180, d.NONE ],
			[ "1d1",  "1d1", 0					, 40, 190, d.NONE ],
			[ "1d1",  "1d6", d.ISMANY|d.ISMISL	,  5,   8, d.BOW ],
			[ "1d6",  "1d4", d.ISMISL			, 10,  30, d.NONE ],
			[ "1d2",  "1d4", d.ISMANY|d.ISMISL	,  5,  10, d.SLING ],
			[ "3d6",  "1d2", 0					,250, 550, d.NONE ],
			[ "0d0",  "0d0", 0					,  5,	7, d.NONE ],
			[ "1d1",  "1d3", d.ISMANY|d.ISMISL	,  5,   5, d.NONE ],
			[ "1d1",  "1d1", 0					,100, 250, d.NONE ],
			[ "1d2", "1d10", d.ISMANY|d.ISMISL	,7	,  11, d.CROSSBOW ],
			[ "1d8",  "1d6", d.ISMISL			,50	, 200, d.NONE ],
			[ "3d4",  "1d4", 0					,50	, 220, d.NONE ],
			[ "2d5",  "1d3", 0					,50	, 200, d.NONE ],
			[ "3d3",  "1d2", 0					,125, 270, d.NONE ],
			[ "1d12", "1d8", 0					,80	, 260, d.NONE ],
			[ "2d7",  "1d2", 0					,100, 400, d.NONE ],
			[ "2d6",  "1d3", 0					,175, 370, d.NONE ],
		]
	);

	//struct magic_item s_magic[MAXSCROLLS + 1] = 
	v.s_magic = setupItem(	
		[
			[ "monster confusion",	 50, 200 ],
			[ "magic mapping",		 52, 200 ],
			[ "light",				 80, 100 ],
			[ "hold monster",		 25, 200 ],
			[ "sleep",				 41,  50 ],
			[ "enchant armor",		 75, 175 ],
			[ "identify",			211, 150 ],
			[ "scare monster",		 42, 300 ],
			[ "gold detection",		 32, 100 ],
			[ "teleportation",		 73, 200 ],
			[ "enchant weapon",		 91, 175 ],
			[ "create monster",		 34,  75 ],
			[ "remove curse",		 82, 100 ],
			[ "aggravate monsters",	 10,  50 ],
			[ "blank paper",		 11,  50 ],
			[ "genocide",			  5, 350 ],
			[ "item knowledge",		 14, 250 ],
			[ "item protection",	  9, 250 ],
			[ "demons curse",		  5,  25 ],
			[ "transport",			 11, 100 ],
			[ "enchantment",		  3, 300 ],
			[ "gods blessing",		  4, 450 ],
			[ "aquirement",			  3, 450 ],
			[ "banishment",			  5,  25 ],
			[ "recharge wand",		 14, 250 ],
			[ "locate traps",		 18, 185 ],
			[ null,					  0,   0 ],
		]
	);
	d.MAXSCROLLS = v.s_magic.length -1;

	//struct magic_item p_magic[MAXPOTIONS + 1] = 
	v.p_magic = setupItem(	
		[
			[ "confusion",			 69,  50 ],
			[ "paralysis",			 69,  50 ],
			[ "poison",				 55,  50 ],
			[ "gain strength",		130, 150 ],
			[ "see invisible",		 25, 175 ],
			[ "healing",			120, 130 ],
			[ "monster detection",	 59, 120 ],
			[ "magic detection",	 54, 105 ],
			[ "raise level",		 25, 300 ],
			[ "extra healing",		 52, 175 ],
			[ "haste self",			 41, 200 ],
			[ "restore strength",	140, 200 ],
			[ "blindness",			 25,  50 ],
			[ "thirst quenching",	 10,  50 ],
			[ "increase dexterity",	 50, 175 ],
			[ "etherealness",		 20, 150 ],
			[ "increase wisdom",	 35, 175 ],
			[ "regeneration",		 10, 175 ],
			[ "super ability",		  3, 500 ],
			[ "decrepedness",		  4,  25 ],
			[ "invincibility",		  4, 500 ],
			[ null,					  0,   0 ],
		]
	);
	d.MAXPOTIONS = v.p_magic.length -1;

	//struct magic_item r_magic[MAXRINGS + 1] = 
	v.r_magic = setupItem(		
		[
			[ "protection",			 71, 200 ],
			[ "strength",			 70, 200 ],
			[ "sustain strength",	 45, 250 ],
			[ "searching",			 70, 150 ],
			[ "see invisible",		 77, 175 ],
			[ "constitution",		 13, 350 ],
			[ "aggravate monster",	 60, 100 ],
			[ "agility",			 75, 250 ],
			[ "increase damage",	 61, 250 ],
			[ "regeneration",		 41, 250 ],
			[ "digestion",			 60, 225 ],
			[ "teleportation",		 60, 100 ],
			[ "stealth",			 75, 200 ],
			[ "speed",				 40, 225 ],
			[ "find traps",			 27, 200 ],
			[ "delusion",			 18, 100 ],
			[ "sustain ability",	  9, 450 ],
			[ "blindness",			 10,  50 ],
			[ "lethargy",			 14,  75 ],
			[ "ogre strength",		  8, 350 ],
			[ "enfeeblement",		  5,  25 ],
			[ "burden",				 10,  50 ],
			[ "illumination",		 16, 100 ],
			[ "fire protection",	  5, 225 ],
			[ "wisdom",				 25, 200 ],
			[ "dexterity",			 35, 200 ],
			[ null,					  0,   0 ],
		]
	);
	d.MAXRINGS = v.r_magic.length -1;

	//struct magic_item ws_magic[MAXSTICKS + 1] = 
	v.ws_magic = setupItem(	
		[
			[ "light",				 95, 120 ],
			[ "striking",			 75, 115 ],
			[ "lightning",			 30, 200 ],
			[ "fire",				 30, 200 ],
			[ "cold",				 30, 200 ],
			[ "polymorph",			 95, 210 ],
			[ "magic missile",		 70, 170 ],
			[ "haste monster",		 80,  50 ],
			[ "slow monster",		 90, 220 ],
			[ "drain life",			 80, 210 ],
			[ "nothing",			 10,  70 ],
			[ "teleport away",		 55, 140 ],
			[ "teleport to",		 50,  60 ],
			[ "cancellation",		 55, 130 ],
			[ "sap life",			 20,  50 ],
			[ "curing",				 25, 250 ],
			[ "pyromania",			 15,  25 ],
			[ "annihilate monster",	  5, 750 ],
			[ "paralyze monster",	 10, 650 ],
			[ "food absorption",	 10,  75 ],
			[ "regenerate monster",	 15,  25 ],
			[ "hide monster",		 10,  50 ],
			[ "anti-matter",		  5,  25 ],
			[ "clone monster",		 10,  10 ],
			[ "confuse monster",	 15, 150 ],
			[ "degenerate monster",	 15, 150 ],
			[ null,					  0,   0 ],
		]
	);
	d.MAXSTICKS = v.ws_magic.length -1;

	//struct magic_info thnginfo[NUMTHINGS] = 
	v.thnginfo = setupInfo(
		[
			[ d.MAXPOTIONS,	d.V_POTION,	d.POTION,	v.p_magic,	],
			[ d.MAXSCROLLS,	d.V_SCROLL,	d.SCROLL,	v.s_magic,	],
			[ d.MAXFOODS,	d.V_FOOD,	d.FOOD,		null,		],
			[ d.MAXWEAPONS,	d.V_WEAPON,	d.WEAPON,	v.w_magic,	],
			[ d.MAXARMORS,	d.V_ARMOR,	d.ARMOR,	v.a_magic,	],
			[ d.MAXRINGS,	d.V_RING,	d.RING,		v.r_magic,	],
			[ d.MAXSTICKS,	d.V_STICK,	d.STICK,	v.ws_magic,	],
			[ d.MAXAMULETS,	d.V_AMULET,	d.AMULET,	null,		],
		]
	);

}