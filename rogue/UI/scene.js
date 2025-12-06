function scene(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

    const cw = d.DSP_MAIN_FG;
    const mw = d.DSP_MAIN_BG;
    const hw = d.DSP_WINDOW;

    let select_cur = 0;
    this.setcur = (num)=>{ select_cur = num;}
    this.getcur = ()=>{ return select_cur;  }

    let purpose;
    let type;
    this.set_gi_param =(pur, t )=>{
        purpose = pur;
        type = t;
    }

    //scene key_wait
    this.keywait = function(){

        let ki = r.UI.readchar();

		if (ki.includes("Enter") ||
            ki.includes("NumpadEnter")){

            r.item.reset_mi_probs();
            r.main();
            r.setScene(0);
        }
    }

    //scene_inventry
    this.inventry = function(){

        const curItem =(cur)=>{
            packcount = 0;
            for (pk = pack; pk != null; pk = f.next(pk)){
                if (packcount == cur) return pk.l_data; 
                packcount++;
            }
            return null
        }

        const pack = r.player.get_pack();
        let cur = r.UI.scene.getcur();

        let pk, packcount = 0;

        r.UI.setDsp(hw);
        for (pk = pack; pk != null; pk = f.next(pk)){
			r.UI.mvaddch(packcount ,2, " ");
            packcount++;
        }

    	let ki = r.UI.readchar();   

		if (ki.includes("Enter")    || ki.includes("NumpadEnter")||
            ki.includes("Numpad4")  || ki.includes("Numpad6")   ||
			ki.includes("ArrowLeft")|| ki.includes("ArrowRight")||
            ki.includes("KeyI")     || ki.includes("Numpad5") 
        ){
            //selectReturn
            r.player.set_select(curItem(cur));
            r.UI.io.status();
            r.UI.overlapview(false);
            r.setScene(0);
        }
		if (ki.includes("Numpad8")||ki.includes("Numpad2")||
            ki.includes("NumpadSubtract")||ki.includes("NumpadAdd")||
			ki.includes("ArrowUp")||ki.includes("ArrowDown")
        ){
            cur += 
                (ki.includes("NumpadSubtract") || ki.includes("ArrowUp") || ki.includes("Numpad8"))
                ?-1:+1;
            
            if (cur < 0)  cur = packcount-1;
            if (cur >= packcount)  cur = 0;
            r.UI.scene.setcur(cur);
        }
		if (ki.includes("Numpad0")){
            console.log("UseItem")
            r.UI.overlapview(false);
            r.setScene(0);
        }
        if (ki.includes("KeyD")){
            console.log("Drop/ThrowItem")
            r.UI.overlapview(false);
            r.setScene(0);
        }
        r.UI.mvaddch(cur ,2, ">");
    }

    //scene get_item
    this.get_item = ()=>{

        const curItem =(cur)=>{
            packcount = 0;
            for (pk = pack; pk != null; pk = f.next(pk)){
                pob = f.OBJPTR(pk);
                if (type == 0 || type == pob.o_type) {
                    if (packcount == cur) return pob; 
                    packcount++;
                }
            }
            return null
        }

        const pack = r.player.get_pack();
        let cur = r.UI.scene.getcur();

        let pk, pob, packcount = 0;

        r.UI.setDsp(hw);
        for (pk = pack; pk != null; pk = f.next(pk)){
            pob = f.OBJPTR(pk);
            if (type == 0 || type == pob.o_type) {
    			r.UI.mvaddch(packcount ,2, " ");
                packcount++;
            }
        }

    	let ki = r.UI.readchar();   

        //select
		if (ki.includes("Enter")    || ki.includes("NumpadEnter")||
            ki.includes("Numpad0")  || ki.includes("KeyD")
        ){
            console.log(purpose);
            //selectReturn
            r.player.set_dest(curItem(cur));
            r.UI.io.status();
            r.UI.overlapview(false);
            r.setScene(0);
        }
       
        //escape
		if (ki.includes("Numpad4")  || ki.includes("Numpad6")   ||
			ki.includes("ArrowLeft")|| ki.includes("ArrowRight")||
            ki.includes("Numpad5")  || ki.includes("KeyI")
        ){
            r.UI.msg("get_item select cansel.")
            r.UI.io.status();
            r.UI.overlapview(false);
            r.setScene(0);
        }
        //movecursur
		if (ki.includes("Numpad8")||ki.includes("Numpad2")||
            ki.includes("NumpadSubtract")||ki.includes("NumpadAdd")||
			ki.includes("ArrowUp")||ki.includes("ArrowDown")
        ){
            cur += 
                (ki.includes("NumpadSubtract") || ki.includes("ArrowUp") || ki.includes("Numpad8"))
                ?-1:+1;
            
            if (cur < 0)  cur = packcount-1;
            if (cur >= packcount)  cur = 0;
            r.UI.scene.setcur(cur);
        }
        r.UI.mvaddch(cur ,2, ">");
    }
}