function UIManager(r, g){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

	//const m = document.getElementById("memo");
	let dspmode = 0;
    this.texwork = "";

    this.io = new io(r);
    this.command = new command(r);
    this.scene = new scene(r);
    this.wizard = new wizard(r);

    const cw = d.DSP_MAIN_FG;
    const mw = d.DSP_MAIN_BG;
    const hw = d.DSP_WINDOW;

    //effect
    const sceneC = g.task.read("scene")
    const moveEffect = sceneC.moveEffect;
    this.setEffect = moveEffect.setEffect; 

    let battledmg = 0;
    this.set_battledmg = function(num){battledmg = num}
    this.battleEffect = function(asch, x ,y){
        for (let i=0; i<(2*Math.PI); i+=0.3){
            this.setEffect(asch, {x:x,y:y} ,{x: x+Math.cos(i)*2.5, y: y+Math.sin(i)*2.5});
        }
        this.setEffect(`${battledmg}`, {x:x,y:y} ,{x: x, y: y-1},120);

    } 
    this.damageEffect = function(asch, x ,y){
        for (let i=0; i<(2*Math.PI); i+=0.3){
            this.setEffect(asch, {x: x+Math.cos(i)*2, y: y+Math.sin(i)*2}, {x:x,y:y});
        }     
        this.setEffect(`${battledmg}`, {x:x,y:y} ,{x: x, y: y+1},120);
    } 
    this.hitEffect = function(asch, x ,y){
        for (let i=0; i<(2*Math.PI); i+=0.3){
            this.setEffect(asch, {x:x,y:y}, {x: x+Math.cos(i)*1.5, y: y+Math.sin(i)*1.5});
        }        
        this.setEffect(`${battledmg}`, {x:x,y:y} ,{x: x, y: y-1},120);
    } 

    //dispaly functions
    //cursus bridge    
	this.setDsp =(num)=>{dspmode = num;}

	this.move    = function(y, x){     g.console[ dspmode ].move(x, y); }
    this.printw  = function(text){     g.console[ dspmode ].printw(text); }
    this.mvaddch = function(y, x, ch){ 
        g.console[ dspmode ].mvprintw(ch, x, y); 
    }
    this.mvaddstr = this.mvaddch;
    this.addch   = function(ch){ g.console[ dspmode ].printw(ch); }
	this.insertLine = ()=>{g.console[ dspmode ].insertln(); }
 	this.clear = function(){ g.console[ dspmode ].clear();}

    //rogue bridge
    this.msg =(text)=>{
        if (!Boolean(text)) {
            console.trace(); //undefinedのメッセージが表示される場合の呼び出し元調査用
        }
        text = `${this.texwork + text}`;
        if (!Boolean(text)) return;
        if (text.length >0){
            g.console[d.DSP_MESSAGE].move(0,0);
            g.console[d.DSP_MESSAGE].insertln(); g.console[d.DSP_MESSAGE].printw(text);

            let cl = 1;
            for (let i=0; i<text.length; i++){
                cl += (text.charCodeAt(i) < 128)?1:2;
            }
            g.console[d.DSP_MESSAGE].move(cl, 0);
        } 
        this.texwork = "";
    }

    this.addmsg =(text)=>{
        this.texwork += text;
    }
    this.endmsg = this.msg;

    this.doadd =()=>{};//?

    /*
    * doadd:
    *	Perform a printf into a buffer
    */
    /*
    doadd(char *fmt, va_list ap)
    {
        vsprintf(&msgbuf[newpos], fmt, ap);
        newpos = strlen(msgbuf);
    }
    */
    this.comment =(text)=>{
        g.console[d.DSP_COMMENT].insertln(); 
        g.console[d.DSP_COMMENT].printw(text);
    }

    /*
    * readchar:
    */
    this.overlapview =(flg)=>{
        const io = g.task.read("io");
        io.overlapview = flg;        
    }

    /*
    * readchar:
    *	flushes stdout so that screen is up to date and then returns
    *	getchar.
    */
    this.readchar =()=>{
        let ki = g.task.read("io").input.keylist;
        //if (ki.includes("KeyQ")) r.mapcheckTest();
        //keylistを返す
        return ki;

        let c;
        fflush(stdout);
            return( wgetch(cw) );
    }

    this.wait_for =(ch)=>{
        let ki = g.task.read("io").input.keylist;
        return (ki.includes(ch))?true: false;
    }

    //buffer read
    const read_buff =(surf, x, y)=>{
        let buff = g.console[surf].buffer;

        let res = ' '; 
        if (buff.length >= y){
            if (buff[y].length >= x){
                res = buff[y].substring(x,x+1);
            }
        }
        return res;
    }

    this.inch    = function(){
        return read_buff(
            d.DSP_MAIN,
            g.console[d.DSP_MAIN].cursor.x,
            g.console[d.DSP_MAIN].cursor.y,
        );
    }

    this.mvinch    = (y, x)=>{
        //let nowpos = this.getyx();
        g.console[ d.DSP_MAIN].move(x, y); 
        let res = this.inch();
        //g.console[ d.DSP_MAIN].move(nowpos.x, nowpos.y); 
        return res;
    }

    this.mvgetch = this.mvinch;//		mvwgetch(stdscr,y,x,ch)
    this.mvgetstr = this.mvinch;//	mvwgetstr(stdscr,y,x,str)
    //this.mvinch =(y,x)=>{};//		mvwinch(stdscr,y,x)

    /*
    * mv w functions
    */
    this.wclear =(win) =>{g.console[ win ].clear()};
    this.wmove =(win, y, x)=>{ g.console[ win ].move(x, y); } 
   	this.waddch =(win, ch)=>{ g.console[ win ].printw(ch);};//	VOID(wmove(win,y,x)==ERR?ERR:waddch(win,ch))
   	this.waddstr = this.waddch;
     this.mvwaddch =(win,y,x,ch)=>{ g.console[ win ].mvprintw(ch, x, y);};//	VOID(wmove(win,y,x)==ERR?ERR:waddch(win,ch))
    
    //this.mvwgetch =(win)=>{ 
    //    let cx = g.console[win].cursor.x;
    //    let cy = g.console[win].cursor.y;
    //    return {x:cx, y:cy};
    // };//	VOID(wmove(win,y,x)==ERR?ERR:wgetch(win,ch))
    this.mvwaddstr = this.mvwaddch;//	VOID(wmove(win,y,x)==ERR?ERR:waddstr(win,str))
    //this.mvwgetstr = this.mvwgetch;//	VOID(wmove(win,y,x)==ERR?ERR:wgetstr(win,str))
    this.mvwinch =(win,y,x)=>{
        let buff = g.console[win].buffer;

        let res = ' '; 
        if (buff.length >= y){
            if (buff[y].length >= x){
                res = buff[y].substring(x,x+1);
            }
        }
        return res;
    };//	VOID(wmove(win,y,x) == ERR ? ERR : winch(win))

    /*
    * psuedo functions
    */
    this.clearok =(win,bf)=>{};//	 (win._clear = bf)
    this.leaveok =(win,bf)=>{};//	 (win._leave = bf)
    this.scrollok =(win,bf)=>{};// (win._scroll = bf)
    this.getyx =(win,y,x)=>{
        let cx = g.console[d.DSP_MAIN].cursor.x;
        let cy = g.console[d.DSP_MAIN].cursor.y;
        return {x:cx, y:cy};
    };//	 y = win._cury, x = win._curx
    
    //this.winch =(win)=>{};//	 (win._y[win._cury][win._curx])

    this.initscr =()=>{};
    this.newwin =()=>{};

	this.comment("UI");

    this.displevl = function()
    {
        const find_mons = r.monster.chase.find_mons;
        const isatrap = r.player.move.isatrap;
        const trap_at = r.player.move.trap_at;
        const illeg_ch = r.UI.io.illeg_ch;
        const THINGPTR = f.THINGPTR;
        const isalpha =(ch)=>{ return /^[a-zA-Z]+$/.test(ch); };

        let ch, mch;//reg char ch, mch;
        let i,j;//reg int i,j;
        let rp;//reg struct room *rp;

        //for (rp = rooms; rp < r.dungeon.rooms[d.MAXROOMS]; rp++)
        for (let i in r.dungeon.rooms)
            r.dungeon.rooms[i].r_flags &= ~d.ISDARK;

        for (i = 0; i < d.LINES - 2; i++) {
            for (j = 0; j < d.COLS - 1; j++) {
                ch = r.UI.mvinch(i,j);
                if (isatrap(ch)) {
                    let what;//struct trap *what;

                    what = trap_at(i, j);
                    if (what != null)
                        what.tr_flags |= d.ISFOUND;
                }
                else if (ch == d.SECRETDOOR) {
                    ch = d.DOOR;
                    r.UI.mvaddch(i, j, ch);
                }
                else if (illeg_ch(ch)) {
                    ch = d.FLOOR;
                    r.UI.mvaddch(i, j, ch);
                }
                if (r.UI.mvwinch(mw, i, j) != ' ') {
                    let what;//struct linked_list *what;
                    let it;//struct thing *it;

                    what = find_mons(i, j);
                    if (what == null) {
                        ch = d.FLOOR;
                        r.UI.mvaddch(i, j, ch);
                    }
                    else {
                        it = THINGPTR(what);
                        it.t_oldch = ch;
                    }
                }
                mch = r.UI.mvwinch(cw, i, j);
                if (isalpha(mch))
                    ch = mch;
                r.UI.mvwaddch(cw, i, j, ch);
            }
        }
        r.nochange = false;	/* display status again */
        //draw(cw);
    }

    /*
    * dispmons:
    *	Show monsters for wizard and potion
    */
    this.dispmons = function()
    {
        let ch, y, x;//reg int ch, y, x;
        let it;//reg struct thing *it;
        let item;//reg struct linked_list *item;

        for (item = r.dungeon.mlist; item != null; item = f.next(item)) {
            it = f.THINGPTR(item);
            y = it.t_pos.y;
            x = it.t_pos.x;
            r.UI.mvwaddch(cw, y, x, it.t_type);
            it.t_flags |= d.ISFOUND;
            if (it.t_type == 'M')			/* if a mimic */
                it.t_disguise = 'M';		/* give it away */
        }
        //draw(cw);
    }

    /*
    * winat:
    *	Get whatever character is at a location on the screen
    */
    this.winat = (y, x)=>
    //int x, y;
    {
        const mvwinch = this.mvwinch;
        const mvinch = this.mvinch;
        //const winch = this.winch;

        let ch = " "; //reg char ch;

        if (mvwinch(mw,y,x) == ' ')
            ch = mvinch(y, x);			/* non-monsters */
        else
            ch = mvwinch(mw, y, x);		//inch(mw);		/* monsters */
        return ch;
    }

    /*
    * cordok:
    *	Returns true if coordinate is on usable screen
    */
    this.cordok = function(y, x)
    //int y, x;
    {
        if (x < 0 || y < 0 || x >= d.COLS || y >= d.LINES - 1)
            return false;
        return true;
    }

    //
    this.get_delta =(delta)=>{
        const up = String.fromCharCode(24);
        const dw = String.fromCharCode(25);
        const lf = String.fromCharCode(27);
        const ri = String.fromCharCode(26);
        const sp = " ";

        let resd = {};
        switch (Number(delta))
        {
            case 7: resd.y = -1; resd.x = -1; break;
            case 8: resd.y = -1; resd.x =  0; break;
            case 9: resd.y = -1; resd.x =  1; break;
            case 4: resd.y =  0; resd.x = -1; break;
            case 6: resd.y =  0; resd.x =  1; break;
            case 1: resd.y =  1; resd.x = -1; break;
            case 2: resd.y =  1; resd.x =  0; break;
            case 3: resd.y =  1; resd.x =  1; break;
            default:  return {x:0, y:0, t:" + "}; 
        }

        resd.t = `${(resd.x <0)?lf:sp}${(resd.y <0)?up:dw}${(resd.x >0)?ri:sp}`;

        return resd;
    }

    this.get_deltaText =(vx,vy)=>{

        const up = String.fromCharCode(24);
        const dw = String.fromCharCode(25);
        const lf = String.fromCharCode(27);
        const ri = String.fromCharCode(26);
        const sp = " ";

        return `${(vx <0)?lf:sp}${(vy==0)?"-":(vy <0)?up:dw}${(vx >0)?ri:sp}`;
    }

}