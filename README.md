# wRogueNineClone
```
wRogueNine (Porting study)
Base SuperRogue9.0

```
* [wRogueNine](https://e3sh.github.io/wRogueNine/rogue9.html)　playGame
* [wRogueNine(jp)](https://e3sh.github.io/wRogueNine/rogue9_jp.html)

# References
* [SuperRogue9.0](http://rogue.rogueforge.net/super-rogue-9-0/) original rogue source code
* [wGCs](https://github.com/e3sh/WebGameCoreSystem) Display and Input Control
* [↑Document](https://e3sh.github.io/WebGameCoreSystem/documents/) Documents

* [wRogueClone](https://github.com/e3sh/wRogueClone) rogue5.4.4base porting  
```
##　移植による変更点
* 移動・操作の簡略化
- ・操作系の見直し:GamePad対応
- ・アクションは選択アイテムにより自動判定
- ・自分を中心にマップをスクロールする　
- ・回数指定でのコマンド指示や部屋・通路の自動移動は機能削除
- ・任意の名前を割り当てる機能削除
- ・スコアボード未実装
2025/12/22
```

The large middle section of the screen displays the player's surroundings using the following symbols:
```
|	    A wall of a room.
-	 	A wall of a room.
*	 	A pile of gold.
%	 	A way to another level.
+	 	A doorway.
.	 	The floor in a room
@	 	The player.
_	 	The player, when invisible.
#	 	The floor in a passageway
!	 	A flask containing a potion.
?	 	A sealed scroll.
:	 	Some food.
)	 	A weapon.
 	 	Solid rock (denoted by a space)
]	 	Some armor.
;	 	A miscellaneous magic item.
,	 	An artifact.
=	 	A ring.
/	 	A wand or a staff.
^	 	The entrance to a trading post.
>	 	A trapdoor leading to the next level.
{	 	An arrow trap.
$	 	A sleeping gas trap.
}	 	A beartrap.
~	 	A trap that teleports you somewhere else.
`	 	A poison dart trap.
"	 	a shimmering magic pool.
'	 	An entrance to a maze.
$	 	Any magical item. (During magic detection)
>	 	A blessed magical item. (Duriing magic detection)
<	 	A cursed magical item. (During magic detection)
A letter
	 	A monster. Note that a given letter may signify
                multiple monsters, depending on the level of the dungeon. 

```
