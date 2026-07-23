extends SceneTree
const _W := 120.0
var _t := 0.0
func _process(d: float) -> bool:
    _t += d
    if _t > _W: printerr("WATCHDOG"); quit(1)
    return false

var issues: Array[String] = []
func flag(sev: String, what: String) -> void:
    issues.append("%s %s" % [sev, what])

func _init():
    var db := ContentDb.new(); db.load_all()
    var exec := EffectExecutor.new()
    var cond := ConditionEvaluator.new()
    var mk := Market.new(db)
    var travel := Travel.new(db, exec)

    # ---- 边界：金钱 ----
    var st := WorldState.new(); st.seed = "b"; st.city = "zayton"; st.coins = 100
    exec.execute(st, [{"op":"coins","value":-500,"reason":"t"}], {})
    if st.coins < 0: flag("[严重]", "金钱可为负：%d" % st.coins)

    # 极大值：整数溢出
    st.coins = 9223372036854775000  # F-2 regression
    exec.execute(st, [{"op":"coins","value":1000,"reason":"t"}], {})
    if st.coins < 0: flag("[严重]", "金钱溢出为负：%d" % st.coins)

    # ---- 边界：货格 ----
    var st2 := WorldState.new(); st2.seed="b"; st2.city="zayton"; st2.cargo_slots=1; st2.coins=999999
    var g := db.get_record("porcelain")   # bulk 2
    if mk.can_buy(g, db.get_record("zayton"), st2, 2200000)["ok"]:
        flag("[严重]", "bulk 2 的货可买进 1 格的舱")
    # 负货格
    exec.execute(st2, [{"op":"cargo_slots","value":-99,"reason":"t"}], {})
    if st2.cargo_slots < 0: flag("[严重]", "货格可为负")

    # ---- 边界：命运条 ----
    var st3 := WorldState.new(); st3.seed="b"
    exec.execute(st3, [{"op":"fate","id":"travel","value":9999,"reason":"t"}], {})
    exec.execute(st3, [{"op":"fate","id":"nonexistent","value":5,"reason":"t"}], {})
    if int(st3.fate.get("travel",0)) > 31: flag("[严重]", "命运条超过 31")
    if not st3.fate.has("nonexistent"): pass
    elif int(st3.fate["nonexistent"]) != 5: flag("[提示]", "未知命运条被静默创建")

    # ---- 边界：日期 ----
    var d1 := GameDate.from_gregorian(1253,1,1)
    var d2 := GameDate.from_gregorian(1453,12,31)
    var back := d1.to_gregorian()
    if back["year"] != 1253 or back["month"] != 1 or back["day"] != 1:
        flag("[严重]", "儒略日往返失败 1253-01-01 -> %s" % str(back))
    var back2 := d2.to_gregorian()
    if back2["year"] != 1453: flag("[严重]", "儒略日往返失败 1453 -> %s" % str(back2))
    # 闰年
    var leap := GameDate.from_gregorian(1300,2,29).to_gregorian()
    if leap["month"] != 2 or leap["day"] != 29: flag("[提示]", "1300-02-29 往返异常：%s" % str(leap))

    # ---- 逻辑：路线双向可达 ----
    var asym := 0
    for r in db.get_table("routes"):
        var a := String(r.get("from","")); var b := String(r.get("to",""))
        var fa := travel.routes_from(a).any(func(x): return x.get("id")==r.get("id"))
        var fb := travel.routes_from(b).any(func(x): return x.get("id")==r.get("id"))
        if not (fa and fb): asym += 1
    if asym > 0: flag("[严重]", "%d 条路线非双向可见" % asym)

    # ---- 逻辑：城市出口与路线一致 ----
    var mismatch := 0
    for c in db.cities():
        var declared: Array = c.get("exits", [])
        var actual := travel.routes_from(String(c.get("id",""))).map(func(r): return String(r.get("id","")))
        for e in declared:
            if not (String(e) in actual): mismatch += 1
    if mismatch > 0: flag("[严重]", "%d 处 city.exits 与路线图不符" % mismatch)

    # ---- 逻辑：孤立城市（有市集无路） ----
    var stranded := 0
    for c in db.cities():
        if travel.routes_from(String(c.get("id",""))).is_empty(): stranded += 1
    if stranded > 0: flag("[严重]", "%d 座城无任何出路" % stranded)

    # ---- 逻辑：季节全闭的路线 ----
    var never := 0
    for r in db.get_table("routes"):
        var open: Array = r.get("season",{}).get("open",[])
        if not open.is_empty() and open.size() == 0: never += 1
    if never > 0: flag("[严重]", "%d 条路线永不开放" % never)

    # ---- 边界：条件求值器 ----
    if not cond.evaluate({}, st): flag("[严重]", "空条件不为真")
    if not cond.evaluate(null, st): flag("[严重]", "null 条件不为真")
    if cond.evaluate({"any": []}, st): flag("[提示]", "any:[] 求值为真（空集应为假）")
    if not cond.evaluate({"all": []}, st): flag("[提示]", "all:[] 求值为假（空集应为真）")

    # ---- 边界：占卜未习得仍可施行？ ----
    var fresh := WorldState.new(); fresh.seed="d"; fresh.city="zayton"
    var ctx := DivinationContext.new(fresh, Rng.new("d"))
    DivinationBootstrap.register_all()
    var r2 := DivinationRegistry.cast("iching", ctx)
    if not r2.is_empty() and fresh.learned_divinations.is_empty():
        flag("[提示]", "未拜师即可起卦（内核层无门槛，靠内容层 needs 把关）")

    print("=== 逻辑与边界审计 ===")
    if issues.is_empty(): print("  未发现问题")
    for i in issues: print("  " + i)
    print("=== 共 %d 项 ===" % issues.size())
    quit(0)
