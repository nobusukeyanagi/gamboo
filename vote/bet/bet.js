(() => {
  "use strict";
  const ODDS_DATA = window.GAMBOO_ODDS_DATA || {};
  const riders = [
    {car:1,name:"黒川 京介",profile:"川口 33期 27歳",photo:"kurokawa.jpg",st:"10",handicap:"0",trial:"3.28",trialDeviation:".078",stRank:2,trialRank:2,good10Average:"3.348",good10Best:"3.322",good10AverageRank:1,good10BestRank:1},
    {car:2,name:"鈴木 圭一郎",profile:"浜松 32期 31歳",photo:"suzuki_keiichiro.jpg",st:"13",handicap:"0",trial:"3.31",trialDeviation:".095",good10Average:"3.375",good10Best:"3.354"},
    {car:3,name:"青山 周平",profile:"伊勢崎 31期 41歳",photo:"aoyama.jpg",st:"10",handicap:"0",trial:"3.28",trialDeviation:".086",stRank:2,trialRank:2,good10Average:"3.366",good10Best:"3.324",good10AverageRank:3,good10BestRank:2},
    {car:4,name:"金子 大輔",profile:"浜松 29期 45歳",photo:"kaneko.jpg",st:"10",handicap:"0",trial:"3.27",trialDeviation:".074",stRank:2,trialRank:1,good10Average:"3.384",good10Best:"3.368"},
    {car:5,name:"長田 稚也",profile:"飯塚 34期 25歳",photo:"osada.jpg",st:"13",handicap:"0",trial:"3.27",trialDeviation:".084",trialRank:1,good10Average:"3.374",good10Best:"3.331"},
    {car:6,name:"佐藤 励",profile:"川口 35期 25歳",photo:"sato_rei.jpg",st:"11",handicap:"0",trial:"3.28",trialDeviation:".094",stRank:3,trialRank:2,good10Average:"3.364",good10Best:"3.326",good10AverageRank:2,good10BestRank:3},
    {car:7,name:"鈴木 宏和",profile:"浜松 32期 39歳",photo:"suzuki_hirokazu.jpg",st:"08",handicap:"0",trial:"3.29",trialDeviation:".094",stRank:1,trialRank:3,good10Average:"3.384",good10Best:"3.361"},
    {car:8,name:"佐藤 摩弥",profile:"川口 31期 33歳 <span aria-label=\"女子選手\" class=\"female-mark\">♥</span>",photo:"sato_maya.jpg",st:"13",handicap:"0",trial:"3.31",trialDeviation:".078",good10Average:"3.388",good10Best:"3.359"}
  ];
  const columns = ["first","second","third","box"];
  const selected = Object.fromEntries(columns.map(key => [key,new Set()]));
  const activeTypes = new Set(["3連単"]);
  const BET_TYPE_ORDER = ["3連単","3連複","2連単","2連複","ワイド","単勝"];
  const removedSelections = new Set();
  const CONFIRM_STORAGE_KEY = "gamboo:bet-confirmation:v1";
  const body = document.getElementById("bet-table-body");
  const list = document.getElementById("selection-list");
  const count = document.getElementById("selection-count");
  const confirm = document.getElementById("bet-confirm");
  const optionCell = document.querySelector(".bet-options-cell");
  const desktopDetailQuery = window.matchMedia("(min-width:900px)");

  function syncOptionColumnSpan(){
    optionCell.colSpan = desktopDetailQuery.matches ? 6 : 2;
  }
  syncOptionColumnSpan();
  if(desktopDetailQuery.addEventListener) desktopDetailQuery.addEventListener("change",syncOptionColumnSpan);
  else desktopDetailQuery.addListener(syncOptionColumnSpan);

  function rankClass(rank){
    return Number.isInteger(rank) ? ` bet-detail-rank-${rank}` : "";
  }
  function rowHtml(rider){
    return `<tr><td class="car-number car-${rider.car}">${rider.car}</td><td class="rider-cell"><span class="rider-main">${rider.name}</span><span class="rider-profile">${rider.profile}</span></td><td class="bet-photo-cell bet-desktop-detail"><img class="bet-rider-photo" src="../photos/${rider.photo}" alt="${rider.name} 選手写真" loading="lazy" decoding="async"></td><td class="bet-detail-cell bet-desktop-detail"><span class="${rankClass(rider.stRank)}">ST${rider.st}</span><span>H${rider.handicap}</span></td><td class="bet-detail-cell bet-desktop-detail"><span class="${rankClass(rider.trialRank)}">${rider.trial}</span><span>偏 ${rider.trialDeviation}</span></td><td class="bet-detail-cell bet-good-ten-cell bet-desktop-detail"><span class="${rankClass(rider.good10AverageRank)}"><small>平均</small>${rider.good10Average}</span><span class="${rankClass(rider.good10BestRank)}"><small>最高</small>${rider.good10Best}</span></td>${columns.map((key,index)=>`<td class="pick-cell${index===3?" box-divider":""}"><button class="pick-button entry-${rider.car}" type="button" data-column="${key}" data-car="${rider.car}" aria-pressed="false">${rider.car}</button></td>`).join("")}</tr>`;
  }
  body.innerHTML = riders.map(rowHtml).join("");

  function permutations(values,length){
    const result=[];
    function walk(path,remaining){
      if(path.length===length){result.push(path.slice());return;}
      remaining.forEach((value,index)=>walk(path.concat(value),remaining.slice(0,index).concat(remaining.slice(index+1))));
    }
    walk([],values.slice());return result;
  }
  function distinctProduct(groups){
    let rows=[[]];
    groups.forEach(group=>{
      rows=rows.flatMap(row=>group.filter(value=>!row.includes(value)).map(value=>row.concat(value)));
    });
    return rows;
  }
  function normalizeUnordered(rows){
    return rows.map(row=>row.slice().sort((left,right)=>left-right));
  }
  function combosFor(type){
    const box=[...selected.box].sort((a,b)=>a-b);
    const pool=(values)=>[...new Set([...values,...box])].sort((a,b)=>a-b);
    const first=pool(selected.first);
    const second=pool(selected.second);
    const third=pool(selected.third);
    const multiReverse=document.getElementById("multi-reverse-option").checked;

    if(type==="単勝"){
      return first.map(car=>[car]);
    }
    if(type==="2連単"){
      const base=distinctProduct([first,second]);
      return multiReverse?base.concat(base.map(row=>[row[1],row[0]])):base;
    }
    if(type==="2連複"||type==="ワイド"){
      return normalizeUnordered(distinctProduct([first,second]));
    }
    if(type==="3連複"){
      return normalizeUnordered(distinctProduct([first,second,third]));
    }
    const base=distinctProduct([first,second,third]);
    return multiReverse?base.flatMap(row=>permutations(row,3)):base;
  }
  function dedupe(rows){
    const seen=new Set();
    return rows.filter(row=>{
      const key=row.join("-");
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((left,right)=>{
      for(let index=0;index<Math.max(left.length,right.length);index+=1){
        const difference=(left[index]??-1)-(right[index]??-1);
        if(difference) return difference;
      }
      return left.length-right.length;
    });
  }
  function oddsKey(type,cars){
    const values=cars.slice();
    if(type==="3連複"||type==="2連複"||type==="ワイド") values.sort((a,b)=>a-b);
    return values.join("-");
  }
  const oddsLookup=Object.fromEntries(Object.entries(ODDS_DATA).map(([type,records])=>[type,new Map((records||[]).map(record=>[oddsKey(type,record.cars),record]))]));
  function oddsRecord(type,cars){return oddsLookup[type]?.get(oddsKey(type,cars))||null;}
  function formatOdds(value){
    const number=Number(value);
    if(!Number.isFinite(number)) return "－";
    return number>=1000?String(Math.round(number)):number.toFixed(1);
  }
  function oddsToneClass(value){
    const number=Number(value);
    if(!Number.isFinite(number)) return "";
    if(number<10) return " bet-odds-low";
    if(number>=1000) return " bet-odds-high";
    return "";
  }
  function oddsValueHtml(value){
    const tone=oddsToneClass(value).trim();
    return `<span class="${tone}">${formatOdds(value)}</span>`;
  }
  function selectionOdds(type,record){
    if(!record) return "－";
    if(type==="ワイド"){
      const values=(Array.isArray(record.odds)?record.odds:[record.odds,record.odds])
        .map(Number)
        .filter(Number.isFinite)
        .sort((a,b)=>a-b);
      if(!values.length) return "－";
      const min=values[0],max=values[values.length-1];
      return `${oddsValueHtml(min)}<span class="selection-odds-range">～</span>${oddsValueHtml(max)}`;
    }
    return oddsValueHtml(record.odds);
  }
  function carBadge(car){return `<span class="selection-car car-${car}">${car}</span>`;}
  function combinationSeparator(type){
    if(["3連単","2連単"].includes(type)) return "-";
    if(["3連複","2連複","ワイド"].includes(type)) return "=";
    return "";
  }
  function selectionCombinationHtml(type,cars){
    const separator=combinationSeparator(type);
    return cars.map((car,index)=>`${index&&separator?`<span class="selection-combination-separator" aria-hidden="true">${separator}</span>`:""}${carBadge(car)}`).join("");
  }
  function selectionKey(type,cars){return `${type}:${cars.join("-")}`;}
  function selectionGroups(){
    return BET_TYPE_ORDER.filter(type=>activeTypes.has(type)).map(type=>{
      const allEntries=dedupe(combosFor(type)).map(cars=>({type,cars,record:oddsRecord(type,cars),key:selectionKey(type,cars)}));
      const entries=allEntries.filter(entry=>!removedSelections.has(entry.key));
      return {type,allEntries,entries,generatedCount:allEntries.length,removedCount:allEntries.length-entries.length};
    }).filter(group=>group.generatedCount);
  }
  function renderSelections(){
    const groups=selectionGroups();
    const total=groups.reduce((sum,group)=>sum+group.entries.length,0);
    count.textContent=`${total}点`;confirm.hidden=total===0;
    if(!total){list.innerHTML='<div class="selection-empty">買い目を選択してください</div>';return;}
    list.innerHTML=groups.filter(group=>group.entries.length).map(group=>`<section class="selection-group" data-selection-type="${group.type}" aria-label="${group.type}の選択一覧">${group.entries.map(entry=>`<div class="selection-row" data-selection-key="${entry.key}"><span class="selection-type">${entry.type}</span><span class="selection-combo">${selectionCombinationHtml(entry.type,entry.cars)}</span><span class="selection-odds${entry.type==="ワイド"?" is-wide":""}">${selectionOdds(entry.type,entry.record)}</span><button class="selection-remove" type="button" data-remove-key="${entry.key}">消</button></div>`).join("")}</section>`).join("");
    list.querySelectorAll("[data-remove-key]").forEach(button=>button.addEventListener("click",()=>{
      removedSelections.add(button.dataset.removeKey);
      renderSelections();
    }));
  }
  function confirmationPayload(){
    const formation=Object.fromEntries(columns.map(key=>[key,[...selected[key]].sort((a,b)=>a-b)]));
    const groups=selectionGroups().filter(group=>group.entries.length).map(group=>({
      type:group.type,
      generatedCount:group.generatedCount,
      removedCount:group.removedCount,
      selections:Object.fromEntries(columns.map(key=>[key,formation[key].slice()])),
      entries:group.allEntries.map(entry=>({
        cars:entry.cars.slice(),
        rank:entry.record?.rank??null,
        odds:entry.record?.odds??null,
        units:removedSelections.has(entry.key)?0:1,
        removed:removedSelections.has(entry.key)
      }))
    }));
    return {
      version:1,
      createdAt:new Date().toISOString(),
      selections:formation,
      multiReverse:document.getElementById("multi-reverse-option").checked,
      groups
    };
  }
  function savedPayload(){
    try{
      const raw=sessionStorage.getItem(CONFIRM_STORAGE_KEY);
      if(!raw) return null;
      const payload=JSON.parse(raw);
      return payload&&typeof payload==="object"?payload:null;
    }catch(error){
      console.warn("投票入力データを復元できませんでした。",error);
      return null;
    }
  }
  function restoredCars(values){
    return [...new Set((values||[]).map(Number).filter(value=>Number.isInteger(value)&&value>=1&&value<=8))];
  }
  function syncTypeTabs(){
    document.querySelectorAll(".bet-type-tab").forEach(item=>{
      const on=activeTypes.has(item.dataset.betType);
      item.classList.toggle("active",on);
      item.setAttribute("aria-pressed",String(on));
    });
  }
  function restoreSelections(){
    const payload=savedPayload();
    if(payload){
      const fallbackSelections=payload.groups?.find(group=>group?.selections)?.selections||{};
      const formation=payload.selections||fallbackSelections;
      columns.forEach(key=>{
        selected[key].clear();
        restoredCars(formation?.[key]).forEach(car=>selected[key].add(car));
      });
      activeTypes.clear();
      (payload.groups||[]).forEach(group=>{if(BET_TYPE_ORDER.includes(group?.type)) activeTypes.add(group.type);});
      removedSelections.clear();
      (payload.groups||[]).forEach(group=>{
        if(!BET_TYPE_ORDER.includes(group?.type)) return;
        (group.entries||[]).forEach(entry=>{
          const cars=restoredCars(entry?.cars);
          if(cars.length&&(entry?.removed||Number(entry?.units)===0)) removedSelections.add(selectionKey(group.type,cars));
        });
      });
      document.getElementById("multi-reverse-option").checked=Boolean(payload.multiReverse);
    }
    syncAllButtons();
    syncTypeTabs();
    renderSelections();
  }
  function syncButton(button){const key=button.dataset.column,car=Number(button.dataset.car),on=selected[key].has(car);button.classList.toggle("selected",on);button.setAttribute("aria-pressed",String(on));}
  function syncCar(car){body.querySelectorAll(`[data-car="${car}"]`).forEach(syncButton);}
  function syncAllButtons(){body.querySelectorAll(".pick-button").forEach(syncButton);}
  function selectBoxCar(car,on){
    if(on){
      selected.box.add(car);
      selected.first.add(car);
      selected.second.add(car);
      selected.third.add(car);
    }else{
      selected.box.delete(car);
      selected.first.delete(car);
      selected.second.delete(car);
      selected.third.delete(car);
    }
  }
  body.querySelectorAll(".pick-button").forEach(button=>button.addEventListener("click",()=>{
    const key=button.dataset.column,car=Number(button.dataset.car);
    if(key==="box"){
      selectBoxCar(car,!selected.box.has(car));
    }else{
      selected[key].has(car)?selected[key].delete(car):selected[key].add(car);
      if(!selected[key].has(car)) selected.box.delete(car);
    }
    syncCar(car);
    renderSelections();
  }));
  document.querySelectorAll("[data-column-all]").forEach(button=>button.addEventListener("click",()=>{
    const key=button.dataset.columnAll;
    if(key==="box") riders.forEach(r=>selectBoxCar(r.car,true));
    else riders.forEach(r=>selected[key].add(r.car));
    syncAllButtons();
    renderSelections();
  }));
  document.querySelectorAll("[data-column-clear]").forEach(button=>button.addEventListener("click",()=>{
    const key=button.dataset.columnClear;
    if(key==="box") riders.forEach(r=>selectBoxCar(r.car,false));
    else{selected[key].clear();selected.box.clear();}
    syncAllButtons();
    renderSelections();
  }));
  document.querySelectorAll(".bet-type-tab").forEach(tab=>tab.addEventListener("click",()=>{const type=tab.dataset.betType;activeTypes.has(type)?activeTypes.delete(type):activeTypes.add(type);syncTypeTabs();renderSelections();}));
  document.getElementById("multi-reverse-option").addEventListener("change",renderSelections);
  confirm.addEventListener("click",()=>{
    const payload=confirmationPayload();
    if(!payload.groups.length) return;
    try{sessionStorage.setItem(CONFIRM_STORAGE_KEY,JSON.stringify(payload));}catch(error){console.warn("投票確認データを保存できませんでした。",error);}
    window.location.href="confirm/";
  });
  restoreSelections();
})();
