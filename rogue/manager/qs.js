/*
 * Special wizard command mode
 */
function quick_storage(r){

	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;


    this.save = function(){

        const OBJPTR = f.OBJPTR;
		const next = f.next;

        const s_know = r.item.s_know;	
        const p_know = r.item.p_know;	
        const r_know = r.item.r_know;	
        const ws_know = r.item.ws_know;

        let obj, pc;

        let sl = [];
		for (pc = r.player.get_pack(); pc != null; pc = next(pc)) {
			obj = OBJPTR(pc);
            sl.push({data: obj, equip: r.player.equipcheck(obj)})
		}
        let jsontext = JSON.stringify(sl);
        
        let json2 = JSON.stringify(r.player.get_player(), (key, value)=>{
            //custum
            const rejectKeys = ["t_pack", "t_room"];
            if (rejectKeys.includes(key)) return null; 
            return value;
        });
        
        let savedata = {
            level: r.dungeon.level,
            scr: s_know,
            pot: p_know,
            ws: ws_know,
            ring: r_know,
            food_left: r.player.food_left,
            purse: r.player.purse,
            maxstats: r.player.get_max_stats()
        }

        let svd = JSON.stringify(savedata);

        //console.log(jsontext);
        //console.log(json2);
        //console.log(svd);

        localStorage.setItem("rogue9.save", true);
        localStorage.setItem("rogue9.inventry", jsontext);
        localStorage.setItem("rogue9.player", json2);
        localStorage.setItem("rogue9.params", svd);

        r.UI.comment("quick_save");
    }

    this.reset = function(){
        if (r.wizard) return;

        localStorage.removeItem("rogue9.save");
        localStorage.removeItem("rogue9.inventry");
        localStorage.removeItem("rogue9.player");
        localStorage.removeItem("rogue9.params");

        r.UI.comment("quick_remove");
    }

    this.check = function(){
        return (Boolean(localStorage.getItem("rogue9.save")));
    }

    this.load = function(){

        const add_pack = r.item.pack_f.add_pack;

        let inv;
        let pobj;
        let param;

        if (Boolean(localStorage.getItem("rogue9.save"))){
            //localStorage.removeItem("rogue.Save");
            if (Boolean(localStorage.getItem("rogue9.inventry"))) {
                inv = JSON.parse(localStorage.getItem("rogue9.inventry"));
                r.UI.comment("inv_load comp");

            }
            if (Boolean(localStorage.getItem("rogue9.player"))) {
                pobj = JSON.parse(localStorage.getItem("rogue9.player"));
                r.UI.comment("player_load comp");

            }
            if (Boolean(localStorage.getItem("rogue9.params"))) {
                param = JSON.parse(localStorage.getItem("rogue9.params"));
                r.UI.comment("param_load comp");
            }

            r.item.s_know = param.scr;	
            r.item.p_know = param.pot;	
            r.item.r_know = param.ring;	
            r.item.ws_know = param.ws;

            r.dungeon.level = param.level;
            r.player.food_left = param.food_left;
            r.player.purse = param.purse;

            r.player.set_player(pobj);
            r.player.set_max_stats(param.maxstats);

            for (let i in inv){

                let obj = inv[i].data;
                let eq = inv[i].equip;

                let pl = r.new_item(obj);

                if (eq){
                    switch(obj.o_type){
                        case d.WEAPON:
                            r.player.set_cur_weapon(obj);
                        break;
                        case d.ARMOR:
                            r.player.set_cur_armor(obj);
                        break;
                        case d.RING:
                            if (r.player.get_cur_ring(d.LEFT) == null){
                                r.player.set_cur_ring(d.LEFT, obj);
                            } else {
                                r.player.set_cur_ring(d.RIGHT, obj);
                            }
                        break;
                    }
                }
                add_pack(pl, true);
            }
            r.UI.comment("quick_load");
        }else{
            r.UI.comment("quick_load(nodata)");
        }
    }
}