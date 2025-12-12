// ----------------------------------------------------------------------
// GameTask
class sceneControl extends GameTask {
	
	constructor(id){
		super(id);

		let io, stf, waitc 
		let keyon;
		const keywait = 100; //0.10s

		this.init = function(g){
			//create
		}

		this.pre = function(g){
			io = g.task.read("io");
			this.moveEffect = new moveEffect(g);
			this.moveEffect.setDrawIndex(160, 0);

			//let mode = document.getElementById("lang").checked;

			const r = new GameManager(g);// ,mode? "jp":"en"); 
			g.rogue = r;

			const wName = ["0:MAIN_BG","1:MAIN","2:MAIN_FG","3:STATUS","4:EQUIP","5:MESSAGE","6:WINDOW","7:COMMENT","8:ENTITY"];
			for (let i in wName){
				g.console[i].printw(`console:${wName[i]}`);
				g.console[i].insertln();
			}

			stf = false;
			waitc = 0;
			keyon = g.time();
		}

		this.step = function(g){

			waitc++;
			if (!stf && (waitc > 60)){//90
				stf = true;
				//g.console[2].insertln();
				io.debugview = false;
				io.overlapview = false;
				for (let i=0; i<=6; i++){
					g.console[i].insertln();
					g.console[i].printw(`rouge.start()`);
				}
				//g.console[3].clear();
				//                     
				g.rogue.main();
			}else{
				if ((waitc%10)==0 && !stf){
					io.debugview = true;
					io.overlapview = true;
					//g.console[2].insertln();
					//g.console[2].printw(`start-wait:${10-Math.floor(waitc/9)}`);
					//g.console[3].insertln();
					for (let i=0; i<=6; i++)
						g.console[i].printw("rogue progress wait" + "..........".substring(0,Math.floor(waitc/9)));
				}
			}

			if (stf){
				if (keyon < g.time()){
					const keys = io.input.keylist;  
					if (keys.length > 0){
						const fl = (keys.includes("ControlLeft") || keys.includes("ControlRight") || 
							keys.includes("ShiftLeft") || keys.includes("ShiftRight") || 
							keys.includes("Home") || keys.includes("End") || 
							keys.includes("PageUp") || keys.includes("PageDown") || 
							keys.includes("CapsLock") || keys.includes("Space"));
						if  (keys.length > (fl?1:0)) g.rogue.scenestep();
						if (!g.rogue.playing){
							if (keys.includes("Space"))
								g.rogue.playing = true;
						}
						keyon = g.time() + keywait;
						//if (fl) keyon += keywait*2;
 
					}
				}
			}
		}

		this.draw = function(g){
			this.moveEffect.step();
			this.moveEffect.step();
			this.moveEffect.step();
			this.moveEffect.draw(g);

			//console draw io
		}
	}
}
