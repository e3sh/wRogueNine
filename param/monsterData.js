function monsterData(r){
   
	const d = r.define;
	const f = r.func;
	const t = r.types;
	const v = r.globalValiable;

    v.mtlev = [];//struct monster *mtlev[MONRANGE];

	const _r = [10,10,10,10];	/* real ability (unused) */
	const _p = 0; // 0,0,0,0	/* hit points, pack, carry (unused) */
	const _c = 10;				/* constitution (unused) */

    const setupMonster =(data)=>{
		let item = [];

		for (let i in data){
			let o = new t.monster();
			o.m_name  = data[i][0];
			o.m_show  = data[i][1];
			o.m_carry = data[i][2];
			o.m_lev   = setupMonlev(data[i][3]);
			o.m_flags = data[i][4];
			o.m_stats = setupStats(data[i][5]);
			item.push(o); 
		}
		return item;
    }

    const setupMonlev =(ary)=>{
			let o = new t.monlev();
			o.l_lev = ary[0];
			o.h_lev = ary[1];
			o.d_wand= ary[2];
  		return o;
    }

    const setupStats = (ary)=>{
			let o = new t.stats();
			o.s_re  = setupReal(ary[0]);
			o.s_ef  = setupReal(ary[1]);
			o.s_exp = ary[2];
			o.s_lvl = ary[3];
			o.s_arm = ary[4];
			o.s_hpt = ary[5]; //_p 0
			o.s_maxhp = ary[5];//_p 0
			o.s_pack  = ary[5];//_p 0
			o.s_carry = ary[5];//_p 0
			o.s_dmg = ary[6];
  		return o;
    }

    const setupReal =(ary)=>{

      let o = new t.real();
			o.a_str = ary[0];
			o.a_dex = ary[1];
			o.a_wis = ary[2];
			o.a_con = ary[3];

  		return o;
    }

	/*
	* NAME SHOW CARRY [LEVEL] FLAGS _r [STR DEX WIS _c] EXP LVL ARM _p DMG
	*/
	//truct monster monsters[MAXMONS + 1] =
    v.monsters = setupMonster( 
        [
            ["giant ant"    ,'A',0  ,[3,12,1]   ,d.ISMEAN           ,[_r,[10,16,5,_c]   ,10     ,2  ,3, _p  ,"1d6"]],
            ["bat"          ,'B',0  ,[1,6,1]    ,d.ISHUH            ,[_r,[10,10,10,_c]  ,1      ,1  ,3, _p  ,"1d2"]],
            ["centaur"      ,'C',15 ,[8,17,1]   ,0                  ,[_r,[16,10,15,_c]  ,15     ,4  ,4, _p  ,"1d6/1d6"]],
            ["red dragon"   ,'D',100,[21,500,0] ,d.ISGREED          ,[_r,[17,10,17,_c]  ,9000  ,11 ,-1, _p  ,"1d8/1d8/3d10"]],
            ["floating eye" ,'E',0  ,[2,11,0]   ,0                  ,[_r,[10,10,10,_c]  ,5      ,1  ,9, _p  ,"0d0"]],
            ["violet fungi" ,'F',0  ,[15,24,0]  ,d.ISMEAN|d.ISSTUCK ,[_r,[10,5,3,_c]    ,85     ,8  ,2, _p  ,"000d0"]],
            ["gnome"        ,'G',10 ,[6,15,1]   ,0                  ,[_r,[10,10,11,_c]  ,8      ,1  ,5, _p  ,"1d6"]],
            ["hobgoblin"    ,'H',0  ,[1,8,1]    ,d.ISMEAN           ,[_r,[10,10,10,_c]  ,3      ,1  ,5, _p  ,"1d8"]],
            ["invisible stalker",'I',0,[16,25,1],d.ISINVIS|d.ISHUH  ,[_r,[10,15,15,_c]  ,120    ,8  ,2, _p  ,"4d4"]],
            ["jackal"       ,'J',0  ,[1,6,1]    ,d.ISMEAN           ,[_r,[10,10,10,_c]  ,2      ,1  ,7, _p  ,"1d2"]],
            ["kobold"       ,'K',0  ,[1,6,1]    ,d.ISMEAN           ,[_r,[10,10,10,_c]  ,1      ,1  ,8, _p  ,"1d4"]],
            ["leprechaun"   ,'L',0  ,[7,16,0]   ,0                  ,[_r,[10,15,16,_c]  ,10     ,3  ,8, _p  ,"1d1"]],
            ["mimic"        ,'M',30 ,[19,500,0] ,0                  ,[_r,[10,10,10,_c]  ,140    ,8  ,7, _p  ,"3d4"]],
            ["nymph"        ,'N',100,[11,20,0]  ,0                  ,[_r,[10,18,18,_c]  ,40     ,3  ,9, _p  ,"0d0"]],
            ["orc"          ,'O',15 ,[4,13,1]   ,0                  ,[_r,[10,10,10,10]  ,5      ,1  ,6, _p  ,"1d8"]],
            ["purple worm"  ,'P',70 ,[22,500,0] ,0                  ,[_r,[18,5,10,_c]   ,7000   ,15 ,6, _p  ,"2d12/2d4"]],
            ["quasit"       ,'Q',30 ,[10,19,1]  ,d.ISMEAN           ,[_r,[10,15,16,_c]  ,35     ,3  ,2, _p  ,"1d2/1d2/1d4"]],
            ["rust monster" ,'R',0  ,[9,18,1]   ,d.ISMEAN           ,[_r,[10,10,10,_c]  ,25     ,5  ,2, _p  ,"0d0/0d0"]],
            ["snake"        ,'S',0  ,[1,7,1]    ,d.ISMEAN           ,[_r,[10,10,10,_c]  ,3      ,1  ,5, _p  ,"1d3"]],
            ["troll"        ,'T',50 ,[13,22,0]  ,d.ISMEAN|d.ISREGEN ,[_r,[10,10,11,_c]  ,55     ,6  ,4, _p  ,"1d8/1d8/2d6"]],
            ["umber hulk"   ,'U',40 ,[18,500,1] ,d.ISMEAN           ,[_r,[17,10,10,_c]  ,130    ,8  ,2, _p  ,"3d4/3d4/2d5"]],
            ["vampire"      ,'V',20 ,[20,500,1] ,d.ISMEAN|d.ISREGEN ,[_r,[21,16,16,_c]  ,380    ,8  ,1, _p  ,"1d10"]],
            ["wraith"       ,'W',0  ,[14,23,1]  ,d.ISMEAN           ,[_r,[10,10,10,_c]  ,55     ,5  ,4, _p  ,"1d6"]],
            ["xorn"         ,'X',0  ,[17,26,1]  ,d.ISMEAN           ,[_r,[17,6,11,_c]   ,120    ,7 ,-2, _p  ,"1d3/1d3/1d3/4d6"]],
            ["yeti"         ,'Y',30 ,[12,21,1]  ,d.ISMEAN           ,[_r,[10,10,10,_c]  ,50     ,4  ,6, _p  ,"1d6/1d6"]],
            ["zombie"       ,'Z',0  ,[5,14,1]   ,d.ISMEAN           ,[_r,[10,10,10,_c]  ,7      ,2  ,8, _p  ,"1d8"]],
            ["anhkheg"      ,'a',10 ,[7,16,1]   ,d.ISMEAN           ,[_r,[10,15,3,_c]   ,20     ,3  ,2, _p  ,"3d6"]],
            ["giant beetle" ,'b',0  ,[9,18,1]   ,d.ISMEAN           ,[_r,[10,15,10,_c]  ,30     ,5  ,3, _p  ,"4d4"]],
            ["cockatrice"   ,'c',100,[8,17,0]   ,0                  ,[_r,[10,10,11,_c]  ,200    ,5  ,6, _p  ,"1d3"]],
            ["bone devil"   ,'d',0  ,[27,500,1] ,d.ISMEAN           ,[_r,[18,10,16,_c]  ,8000   ,12,-1, _p  ,"5d4"]],
            ["elasmosaurus" ,'e',0  ,[28,500,1] ,d.ISMEAN           ,[_r,[17,5,3,_c]    ,4500   ,12 ,7, _p  ,"4d6"]],
            ["killer frog"  ,'f',0  ,[3,8,1]    ,d.ISMEAN           ,[_r,[10,10,10,_c]  ,4      ,3  ,8, _p  ,"2d3/1d4"]],
            ["green dragon" ,'g',50 ,[25,500,1] ,0                  ,[_r,[18,10,18,_c]  ,7500   ,10 ,2, _p  ,"1d6/1d6/2d10"]],
            ["hell hound"   ,'h',20 ,[10,19,1]  ,d.ISMEAN           ,[_r,[10,15,10,_c]  ,30     ,5  ,4, _p  ,"1d10"]],
            ["imp"          ,'i',20 ,[2,9,1]    ,d.ISMEAN|d.ISREGEN ,[_r,[10,14,11,_c]  ,6      ,2  ,1, _p  ,"1d4"]],
            ["jaguar"       ,'j',0  ,[10,19,0]  ,0                  ,[_r,[10,10,11,_c]  ,25     ,8  ,6, _p  ,"2d3/2d5"]],
            ["koppleganger" ,'k',20 ,[8,17,1]   ,d.ISMEAN           ,[_r,[10,10,16,_c]  ,35     ,4  ,5, _p  ,"1d12"]],
            ["lonchu"       ,'l',15 ,[2,9,1]    ,d.ISMEAN           ,[_r,[10,4,18,_c]   ,5      ,2  ,1, _p  ,"1d4/1d4"]],
            ["minotaur"     ,'m',0  ,[12,21,1]  ,d.ISMEAN           ,[_r,[10,10,11,_c]  ,40     ,8  ,6, _p  ,"1d3/2d4"]],
            ["neotyugh"     ,'n',10 ,[14,23,1]  ,d.ISMEAN           ,[_r,[10,6,4,_c]    ,50     ,6  ,3, _p  ,"1d8/1d8/2d3"]],
            ["ogre"         ,'o',50 ,[7,16,1]   ,0                  ,[_r,[20,10,10,_c]  ,15     ,4  ,5, _p  ,"2d6"]],
            ["pseudo dragon",'p',50 ,[9,18,1]   ,0                  ,[_r,[10,10,16,_c]  ,20     ,4  ,2, _p  ,"2d3/1d6"]],
            ["quellit"      ,'q',85 ,[30,500,1] ,0                  ,[_r,[17,10,10,_c]  ,12500  ,17 ,0, _p  ,"2d10/2d6"]],
            ["rhynosphinx"  ,'r',40 ,[26,500,0] ,0                  ,[_r,[19,6,18,_c]   ,5000   ,13,-1, _p  ,"2d10/2d8"]],
            ["shadow"       ,'s',15 ,[5,14,1]   ,d.ISMEAN|d.ISREGEN|d.ISINVIS,[_r,[10,17,18,_c] ,6,3,5, _p  ,"1d6"]],
            ["titanothere"  ,'t',0  ,[19,500,0] ,0                  ,[_r,[17,6,3,_c]    ,750    ,14 ,6, _p  ,"2d8/1d6"]],
            ["ulodyte"      ,'u',10 ,[2,8,1]    ,d.ISMEAN           ,[_r,[10,10,10,_c]  ,3      ,2  ,5, _p  ,"1d3/1d3"]],
            ["vrock"        ,'v',0  ,[4,13,1]   ,d.ISMEAN           ,[_r,[10,10,11,_c]  ,8      ,3  ,2, _p  ,"1d4/1d6"]],
            ["wuccubi"      ,'w',0  ,[14,23,1]  ,d.ISMEAN           ,[_r,[10,10,10,_c]  ,90     ,6  ,0, _p  ,"1d4/1d10"]],
            ["xonoclon"     ,'x',0  ,[20,500,0] ,0                  ,[_r,[19,10,4,_c]   ,1750   ,14 ,0, _p  ,"3d8"]],
            ["yeenoghu"     ,'y',10 ,[15,24,1]  ,d.ISMEAN           ,[_r,[17,15,10,_c]  ,250    ,8  ,1, _p  ,"3d6"]],
            ["zemure"       ,'z',0  ,[1,6,1]    ,d.ISMEAN|d.ISREGEN ,[_r,[10,10,10,_c]  ,4      ,2  ,7, _p  ,"1d4"]],
            ["devil Asmodeus",'A',-1,[1,500,1]  ,d.ISMEAN|d.ISREGEN ,[_r,[24,18,18,_c]  ,500000 ,40,-10,_p  ,"4d10/4d10"]],
        ]
    );

    d.MAXMONS = v.monsters.length-1;
	//#undef _p		/* erase these definitions */
	//#undef _c
	//#undef _r
}