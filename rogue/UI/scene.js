function scene(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;
	const ms = r.messages;

    const cw = d.DSP_MAIN_FG;
    const mw = d.DSP_MAIN_BG;
    const hw = d.DSP_WINDOW;

    this.keywait = function(){

        let ki = r.UI.readchar();

		if (ki.includes("Enter") ||
            ki.includes("NumpadEnter")){

            r.main();
            r.setScene(0);
        }
    }

    this.inventry = function(){

    	let ki = r.UI.readchar();   

		if (ki.includes("Enter")    || ki.includes("NumpadEnter")||
            ki.includes("Numpad4")  || ki.includes("Numpad6")   ||
			ki.includes("ArrowLeft")|| ki.includes("ArrowRight")||
            ki.includes("KeyI")     || ki.includes("NumpadEnter") 
        ){
            r.UI.overlapview(false);
            r.setScene(0);
        }
    }
}