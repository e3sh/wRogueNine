/*
 * File for the fun, ends in death or a total win
 *
 */

 function rips(r){
    
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	let scoreline;// [100];

	const cw = d.DSP_MAIN_FG;
	const hw = d.DSP_WINDOW;

	const rip = [
		"                          ____________________",
		"                         /                    \\",
		"                        /  Bob Kindelberger's  \\",
		"                       /       Graveyard        \\",
		"                      /                          \\",
		"                     /       REST IN PEACE        \\",
		"                    /                              \\",
		"                    |                              |",
		"                    |                              |",
		"                    |        Destroyed by a        |",
		"                    |                              |",
		"                    |                              |",
		"                    |                              |",
		"                    |                              |",
		"                    |                              |",
		"                    |                              |",
		"                    |                              |",
		"                   *|     *     *     *     *      |*",
		"            _______)\\\\//\\\\//\\)//\\\\//)/\\\\//\\\\)/\\\\//\\\\)/\\\\//\\\\//(________",
	];

	const RIP_LINES = rip.length;// (sizeof rip / (sizeof (char *)))

	//char	*killname();

	/*
	* death:
	*	Do something really fun when he dies
	*/

	//#include <time.h>
	this.death = (monst)=>
	//char monst;
	{
		const vowelstr = r.player.misc.vowelstr;

		const whoami = "player";
		
		let purse = r.player.purse;

		let dp, killer;
		let lt; //struct tm *lt;
		let date; //time_t date;
		let buf; //char buf[LINLEN];
		let localtime;//struct tm *localtime();

		r.UI.setCameraCenter();
		r.UI.setCameraEnable(false);

		lt = new Date();
		lt.getFullYear();

		//time(&date);
		//lt = localtime(&date);
		r.UI.setDsp(d.DSP_MAIN_FG);
		r.UI.clear();
		//r.UI.move(3, 0);
		for (let i in rip){
			r.UI.mvaddstr(Number(i)+3, 0, rip[i]);
		}
		r.UI.mvaddstr(10, 36 - (whoami.length / 2), whoami);
		killer = killname(monst);
		
		//r.UI.mvaddstr(12, 43, vowelstr(killer));

		r.UI.msg(ms.DEATH(killer));
		
		r.UI.mvaddstr(14, 36 - (killer.length / 2), killer);
		purse -= purse/10;
		buf = `${purse} Gold Pieces`;
		r.UI.mvaddstr(16, 36 - (buf.length / 2), buf);
		//buf = `${lt.getDate()}/${lt.getMonth()+1}/${lt.getFullYear()}`;
		buf = `${lt.getFullYear()}/${lt.getMonth()+1}/${lt.getDate()}`;
		r.UI.mvaddstr(18, 36 - (buf.length / 2), buf);
		r.UI.move(d.LINES-1, 0);
		//refresh();
		//score(purse, d.KILLED, monst);
		//byebye(0);
		r.UI.io.status();
		r.setScene(d.SCE_KEYWAIT);
		r.nextScene = d.SCE_KEYWAIT;

	    r.rsmsg_f = false;
	    r.rstime = r.getGametime();

		if (!r.wizard) r.qs.reset();
	}

	/*
	* top ten entry structure
	*/
	class sc_ent{ //static struct sc_ent {
		sc_score;			/* gold */
		sc_name;	//char sc_name[LINLEN];		/* players name */
		sc_flags;			/* reason for being here */
		sc_level;			/* dungeon level */
		sc_uid;			/* user ID */
		sc_monster;       /* killer */
		sc_explvl;			/* experience level */
		sc_exppts;		/* experience points */
		sc_date;//time_t sc_date;			/* time this score was posted */
	} 
	const top_ten = [];//[10];

	const reason = [
		"Killed",
		"Chickened out",
		"A Total Winner"
	];
	let oldpurse;

	/*
	* score:
	*	Figure score and post it.
	*/
	this.score = function(amount, aflag, monst)
	//char monst;
	//int amount, aflag;
	{
		let scp, sc2; //reg struct sc_ent *scp, *sc2;
		let  i, fd, prflags = 0;
		let outf; //reg FILE *outf;
		let packend;

		//signal(SIGINT, byebye);
		//signal(SIGQUIT, byebye);
		if (aflag != d.WINNER) {
			if (aflag == d.CHICKEN)
				packend = "when you chickened out";
			else
				packend = "at your untimely demise";
			mvaddstr(LINES - 1, 0, retstr);
			//refresh();
			wgetnstr(stdscr,prbuf,80);
			oldpurse = purse;
			showpack(false, packend);
		}
		/*
		* Open file and read list
		*/
		if ((fd = open(scorefile, O_RDWR | O_CREAT, "0666")) < 0)
			return;
		//outf = (FILE *) fdopen(fd, "w");
		for (scp = top_ten; scp <= top_ten[9]; scp++) {
			scp.sc_score = 0;
			for (i = 0; i < 80; i++)
				scp.sc_name[i] = rnd(255);
			scp.sc_flags = rnd(255);
			scp.sc_level = rnd(255);
			scp.sc_monster = rnd(255);
			scp.sc_uid = rnd(255);
			scp.sc_date = rnd(255);
		}
		mvaddstr(LINES - 1, 0, retstr);
		refresh();
		wgetnstr(stdscr,prbuf,80);
		if (author() || wizard)
			if (strcmp(prbuf, "names") == 0)
				prflags = 1;
			for(i = 0; i < 10; i++)
			{
				let mon;

				encread(top_ten[i].sc_name, LINLEN, fd);
				encread(scoreline, 100, fd);
				sscanf(scoreline, " %d %d %d %d %u %d %ld %lx \n",
					top_ten[i].sc_score,   top_ten[i].sc_flags,
					top_ten[i].sc_level,   top_ten[i].sc_uid,
					mon,                   top_ten[i].sc_explvl,
					top_ten[i].sc_exppts,  top_ten[i].sc_date);
				top_ten[i].sc_monster = mon;
			}
		/*
		* Insert it in list if need be
		*/
		if (!waswizard) {
			for (scp = top_ten; scp <= top_ten[9]; scp++)
				if (amount > scp.sc_score)
					break;
				if (scp <= top_ten[9]) {
					for (sc2 = top_ten[9]; sc2 > scp; sc2--)
						sc2 = (sc2-1);
					scp.sc_score = amount;
					strcpy(scp.sc_name, whoami);
					scp.sc_flags = aflag;
					if (aflag == WINNER)
						scp.sc_level = max_level;
					else
						scp.sc_level = level;
					scp.sc_monster = monst;
					scp.sc_uid = playuid;
					scp.sc_explvl = him.s_lvl;
					scp.sc_exppts = him.s_exp;
					time(scp.sc_date);
			}
		}
		ignore();
		fseek(outf, 0, 0);
			for(i = 0; i < 10; i++)
			{
				memset(scoreline,0,100);
				encwrite(top_ten[i].sc_name, LINLEN, outf);
				sprintf(scoreline, " %d %d %d %d %u %d %ld %lx \n",
					top_ten[i].sc_score, top_ten[i].sc_flags,
					top_ten[i].sc_level, top_ten[i].sc_uid,
					top_ten[i].sc_monster, top_ten[i].sc_explvl,
					top_ten[i].sc_exppts, top_ten[i].sc_date);
				encwrite(scoreline, 100, outf);
			}
		fclose(outf);
		signal(SIGINT, byebye);
		signal(SIGQUIT, byebye);
		clear();
		refresh();
		endwin();
		showtop(prflags);		/* print top ten list */
	}

	/*
	* showtop:
	*	Display the top ten on the screen
	*/
	function showtop(showname)
	//int showname;
	{
		let fd, i;
		let killer;
		let scp; //struct sc_ent *scp;

		if ((fd = open(scorefile, O_RDONLY)) < 0)
			return false;
		
			for(i = 0; i < 10; i++)
			{
				let mon;
				encread(top_ten[i].sc_name, LINLEN, fd);
				encread(scoreline, 100, fd);
				sscanf(scoreline, " %d %d %d %d %u %d %ld %lx \n",
					top_ten[i].sc_score,   top_ten[i].sc_flags,
					top_ten[i].sc_level,   top_ten[i].sc_uid,
					mon,                   top_ten[i].sc_explvl,
					top_ten[i].sc_exppts,  top_ten[i].sc_date);
				top_ten[i].sc_monster = mon;
			}
		close(fd);
		printf("Top Ten Adventurers:\nRank\tScore\tName\n");
		for (scp = top_ten; scp <= top_ten[9]; scp++) {
			if (scp.sc_score > 0) {
				printf("%d\t%d\t%s: %s\t\t-. %s on level %d",
				scp - top_ten + 1, scp.sc_score, scp.sc_name,
				ctime(scp.sc_date), reason[scp.sc_flags],
				scp.sc_level);
				if (scp.sc_flags == KILLED) {
					killer = killname(scp.sc_monster);
					printf(" by a%s %s",vowelstr(killer), killer);
				}
				printf(" [Exp: %d/%ld]",scp.sc_explvl,scp.sc_exppts);
				if (showname) {
					//struct passwd *pp, *getpwuid();

					if ((pp = getpwuid(scp.sc_uid)) == null)
						printf(" (%d)\n", scp.sc_uid);
					else
						printf(" (%s)\n", pp.pw_name);
				}
				else
					printf("\n");
			}
		}
		return true;
	}

	/*
	* total_winner:
	*	The hero made it back out alive
	*/
	this.total_winner = function()
	{	
		r.UI.setCameraCenter();
		r.UI.setCameraEnable(false);
		r.UI.setDsp(cw)
		r.UI.clear();

		const winmsg = [
			"                                                               ",
			"  @   @               @   @           @          @@@  @     @  ",
			"  @   @               @@ @@           @           @   @     @  ",
			"  @   @  @@@  @   @   @ @ @  @@@   @@@@  @@@      @  @@@    @  ",
			"   @@@@ @   @ @   @   @   @     @ @   @ @   @     @   @     @  ",
			"      @ @   @ @   @   @   @  @@@@ @   @ @@@@@     @   @     @  ",
			"  @   @ @   @ @  @@   @   @ @   @ @   @ @         @   @  @     ",
			"   @@@   @@@   @@ @   @   @  @@@@  @@@@  @@@     @@@   @@   @  ",
			"                                                               ",
			"     Congratulations, you have made it to the light of day!    ",
			"You have joined the elite ranks of those who have escaped the",
			"Dungeons of Doom alive.  You journey home and sell all your loot at",
			"a great profit and are admitted to the fighters guild.",
		];

		for (let i in winmsg){
			r.UI.mvaddstr(d.LINES - winmsg.length - 1 + Number(i), 0, winmsg[i]);
		}

		for (let i in ms.TOTALWIN){
			let ln = ms.TOTALWIN.length - Number(i) -1;
			r.UI.msg(ms.TOTALWIN[ln]);
		}
		//mvaddstr(LINES - 1, 0,spacemsg);
		//refresh();
		//wait_for(stdscr, ' ');
		//clear();
		//oldpurse = purse;
		showpack(true, null);
		//score(purse, WINNER, 0);
		//byebye(0);
		r.setScene(d.SCE_RESULT);
		
	    r.rsmsg_f = false;
	    r.rstime = r.getGametime();

		if (!r.wizard) r.qs.save();
	}

	/*
	* showpack:
	*	Display the contents of the hero's pack
	*/
	function showpack(winner, howso)
	//bool winner;
	//char *howso;
	{
		const get_worth = r.dungeon.trader.get_worth;
		const idenpack = r.item.pack_f.idenpack;
		const npch = r.UI.io.npch;
		const OBJPTR = f.OBJPTR;
		const inv_name = r.item.things_f.inv_name;
		const next = f.next;
	
		let iname;
		let cnt, worth, ch;
		let item; //reg struct linked_list *item;
		let obj; ///reg struct object *obj;
		let list = [];

		idenpack();
		//cnt = 1;
		//clear();
		let oldpurse = r.player.purse;
		let before = {worth: 0, count: 0, type: 0, which: 0, iname: ""};

		// Display the contents of the hero's pack
		if (winner)
			list.push("   Worth  Item");
		else
			list.push(`Contents of your pack ${howso}`);
		ch = 'a';
		for (item = r.player.get_pack(); item != null; item = next(item)) {
			obj = OBJPTR(item);
			iname = inv_name(obj, false);

			if (obj.o_type != d.WEAPON && obj.o_type != d.ARMOR && obj.o_type != d.AMULET)
				iname = iname.slice(2);

			if (winner) {
				worth = get_worth(obj);
				if (before.worth == worth &&
					before.type == obj.o_type && 
					before.which == obj.o_which 
				) {
					before.count += obj.o_count;
					// Skip the item if it's the same as the previous one
					continue;
				}
				if (before.worth != 0){
					before.worth *= before.count;
					let st = "      " + String(before.worth);
					list.push(`  ${String(st.slice(-6))} ${before.iname} ${before.count}`);
					r.player.purse += before.worth;
				}

				before.worth = worth;
				before.count = obj.o_count;
				before.type = obj.o_type;
				before.which = obj.o_which;
				before.iname = iname;
			}
			else {
				list.push(`${ch}) ${iname}`);
				ch = npch(ch);
			}
			//if (++cnt >= LINES - 2 && next(item) != null) {
			//	cnt = 1;
			//	mvaddstr(LINES - 1, 0, morestr);
			//	refresh();
			//	wait_for(stdscr, ' ');
			//	clear();
			//}
		}
		if (winner) {
			if (before.worth != 0){
				before.worth *= before.count;
				let st = "      " + String(before.worth);
				list.push(`  ${String(st.slice(-6))} ${before.iname} ${before.count}`);
				r.player.purse += before.worth;
			}
		}

		st = "----- " + String(oldpurse);
		list.push(`--${st.slice(-6)} Gold Pieces ---`);
		st = "----- " + String(r.player.purse);
		list.push(`--${st.slice(-6)} Gold Pieces total ---`);

		//refresh();
		r.UI.setDsp(hw);
		r.UI.clear();
		for (let i in list){
			r.UI.mvaddstr(Number(i), 0, list[i]);
		}
	}

	/*
	* killname:
	*	Returns what the hero was killed by.
	*/
	//char *
	function killname(monst)
	//unsigned char monst;
	{
		if (monst < d.MAXMONS + 1)
			return v.monsters[monst].m_name;
		else		/* things other than monsters */
			switch (monst) {
				case d.K_ARROW:	return "crooked arrow";
				case d.K_DART:	return "sharp dart";
				case d.K_BOLT:	return "jagged bolt";
				case d.K_POOL:	return "magic pool";
				case d.K_ROD:	return "exploding rod";
				case d.K_SCROLL:	return "burning scroll";
				case d.K_STONE: 	return "transmogrification to stone";
				case d.K_STARVE:	return "starvation";
		}
		return "Bob Kindelberger";
	}
}