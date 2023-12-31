//使用数据:
//https://github.com/nk2028/qieyun-data

var guangyunData,wangsanData,yunjingData;
const onlyZiCheckbox = document.getElementById("onlyZiCheckbox");
const yjTab = document.getElementById("yj");

function loadCSVFiles() {
  const guangyunXhr = new XMLHttpRequest();
  guangyunXhr.open("GET", "guangyun.csv", true);
  guangyunXhr.onload = function () {
    if (guangyunXhr.status === 200) {
		guangyunData = guangyunXhr.responseText.split('\n');
guangyunData.shift();
if (guangyunData[guangyunData.length - 1].trim() === '') {
    guangyunData.pop();
}
    }
  };
  guangyunXhr.send();

  const wangsanXhr = new XMLHttpRequest();
  wangsanXhr.open("GET", "wangsan.csv", true);
  wangsanXhr.onload = function () {
    if (wangsanXhr.status === 200) {
      let wangsan = wangsanXhr.responseText;
    wangsan = wangsan.replace(/〻〈/g, '');
    wangsan = wangsan.replace(/〉/g, '');
    wangsan = wangsan.replace(/【〻】/g, '？');
	
			
            wangsanData = wangsan.split('\n');
wangsanData.shift();
if (wangsanData[wangsanData.length - 1].trim() === '') {
    wangsanData.pop();
}

    }
  };
  wangsanXhr.send();
  
  const yunjingXhr = new XMLHttpRequest();
  yunjingXhr.open("GET", "yunjing-gycs.csv", true);
  yunjingXhr.onload = function () {
    if (yunjingXhr.status === 200) {
      let yunjing = yunjingXhr.responseText;

for (const key in weiMap) {
  const regex = new RegExp(key, "g");
  yunjing = yunjing.replace(regex, weiMap[key]);
}

let yunjingDataOri = yunjing.split('\n');
yunjingDataOri.shift();
if (yunjingDataOri[yunjingDataOri.length - 1].trim() === '') {
    yunjingDataOri.pop();
}
	  
yunjingData = yunjingDataOri.sort((a0,b0) => {
	const a = a0.split(',');
	const b = b0.split(',');
	return Number(a[3]) - Number(b[3]) + (dengMap[a[6]] - dengMap[b[6]])*100 + (toneMap[a[4]] - toneMap[b[4]])*1000 + (Number(a[1]) - Number(b[1]))*10000;
});
	
displayYunjing(currentPage,"");
    }
  };
  yunjingXhr.send();
}

loadCSVFiles();

function searchCSV(searchText) {
	searchGuangyun(searchText);
	searchWangsan(searchText);
}

function searchGuangyun(searchText) {
	if (guangyunData) {
            let results = [];
				const xiaoyuns = [];
				let haveSearchedYunjing = false;
				
            for (let i = 0; i < guangyunData.length; i++) {
                const line = guangyunData[i].split(',');
                let weight = -1;
				
				//字
                if (line[6].includes(searchText) ||(line[7] === searchText && line[7]!=='')) {
                    weight = 0;
                }
				//反切
				else if (!onlyZiCheckbox.checked && (line[4].includes(searchText) || line[5].includes(searchText))) {
                    weight = 2;
                }
				//释义
				else if (!onlyZiCheckbox.checked && (line[8].includes(searchText) || line[9].includes(searchText))) {
                    weight = 3;
                }

                if (weight >= 0) {
                    const groupNumber = line[0]+",";
                    const groupItems = guangyunData
                        .slice(1, i)
                        .filter((item) => item.startsWith(groupNumber));

                    let headOri = line[6];
                    let head = line[7];

                    if (groupItems.length > 0) { //数据中没有小韵字头，需要先寻找
                        const firstGroupItem = groupItems[0].split(',');
                        headOri = firstGroupItem[6];
                        head = firstGroupItem[7];
                    }
					
                    results.push({
                        line: line,
                        weight: weight,
                        headOri: headOri,
                        head: head,
                    });
					
					//小韻 (搜索项为小韵首字时显示该小韵所有项)
					if(weight === 0 &&( headOri.includes(searchText) || (head.includes(searchText) && head !== ''))){
						haveSearchedYunjing = searchYunjing(searchText, true);
						
results.push(
  ...guangyunData
    .slice(i)
    .filter((item) => item.startsWith(groupNumber) && item.split(',')[6] !== headOri)
    .map((item) => {
      const l = item.split(',');

      if (!haveSearchedYunjing) {
        haveSearchedYunjing = searchYunjing(l[7] === '' ? l[6] : l[7], false);
      }

      return {
        line: l,
        weight: 1,
        headOri: headOri,
        head: head,
      };
    })
);
	
	xiaoyuns.push(headOri);

						
					}
                }
            }

            results = results.filter((a) => a.weight === 0 || a.weight === 1 || !xiaoyuns.includes(a.headOri))
				.sort((a, b) => a.weight - b.weight); //去除其他搜索和小韵搜索重叠的部分

            const guangyunDiv = document.getElementById("guangyun");
            guangyunDiv.innerHTML = "";

            for (const result of results) {
                const itemDiv = document.createElement("div");
                itemDiv.className = "item";
				guangyunDiv.appendChild(itemDiv);
				
				const line = result.line;
				const diwei = splitGuangyunDiwei(line[3]);
				const diweiDiv = document.createElement("div");
                diweiDiv.className = "item-diwei";
                itemDiv.appendChild(diweiDiv);

                const shengmuP = document.createElement("p");
                shengmuP.className = "item-diwei-shengmu";
                shengmuP.innerHTML = diwei.shengmu;
                diweiDiv.appendChild(shengmuP);

                const shengdiaoP = document.createElement("p");
                shengdiaoP.className = "item-diwei-shengdiao";
                shengdiaoP.innerHTML = diwei.shengdiao;
                diweiDiv.appendChild(shengdiaoP);

/*
                const dengP = document.createElement("p");
                dengP.className = "item-diwei-deng";
                dengP.innerHTML = diwei.deng;
                diweiDiv.appendChild(dengP);*/

                const yunmuP = document.createElement("p");
                yunmuP.className = "item-diwei-yunmu";
                yunmuP.innerHTML = line[2];
                diweiDiv.appendChild(yunmuP);
				
				const xiaoyunA = document.createElement("a");
                xiaoyunA.className = "item-diwei-xiaoyun";
				xiaoyunA.href = "javascript:void(0);";
				if(result.head === ""){
                xiaoyunA.innerHTML = result.headOri;
					}else{
                xiaoyunA.innerHTML = `<span><ruby>${result.headOri}<rt>${result.head}</rt></ruby></span>`;
					}
					
				let xiaoyun = result.head === "" ? result.headOri : result.head;
				 xiaoyunA.addEventListener("click", function () {
            searchInput.value = xiaoyun;
            searchButton.click();
			yj.click();
    });
                diweiDiv.appendChild(xiaoyunA);

                const ziDiv = document.createElement("div");
                ziDiv.className = "item-zi";
				if(line[7] === ""){
                ziDiv.innerHTML = `<p>${line[6]}</p>`;
					}else{
                ziDiv.innerHTML = `<p><span><ruby>${line[6]}<rt>${line[7]}</rt></ruby></span></p>`;
					}
                itemDiv.appendChild(ziDiv);
								if(result.weight === 0){
					ziDiv.querySelector('p').classList.add("text-match");
				}else{
				 ziDiv.querySelector('p').innerHTML = `<a href="javascript:void(0);">${ziDiv.querySelector('p').innerHTML}</a>`;
				 ziDiv.querySelector('p').addEventListener("click", function () {
            searchInput.value = line[7] === "" ? line[6] : line[7];
            searchButton.click();
    });
				}
				
                const fanqieP = document.createElement("p");
                fanqieP.className = "item-fanqie qie";
				if(line[5] === ""){
                fanqieP.textContent = line[4];
					}else{
                fanqieP.innerHTML = `<span><ruby>${line[4]}<rt>${line[5]}</rt></ruby></span>`;
					}
                ziDiv.appendChild(fanqieP);

                const shiP = document.createElement("div");
                shiP.className = "item-shi";
                shiP.textContent = line[8];
                itemDiv.appendChild(shiP);
				
				if(line[9] !== ""){
                const shiP2 = document.createElement("div");
                shiP2.className = "item-shi buchong";
                shiP2.textContent = line[9];
                itemDiv.appendChild(shiP2);
				}
            }
        }
}

function searchWangsan(searchText) {
            const results = [];

if(searchText !== '〈'){
            for (let i = 0; i < wangsanData.length; i++) {
                const line = wangsanData[i].split(',');
                let weight = -1;

                if (line[12].includes(searchText)) {
                    weight = 0;
                }
				//小韻
				 else if (!onlyZiCheckbox.checked && line[7].includes(searchText)) {
                    weight = 1;
                }
				else if (!onlyZiCheckbox.checked && line[8].includes(searchText) && searchText !== "反") {
                    weight = 2;
                } else if (line[12].includes(searchText) || (!onlyZiCheckbox.checked && line[13].includes(searchText))) {
                    weight = 3;
                }

                if (weight >= 0) {
                    results.push({ line: line, weight: weight });
                }
            }

            results.sort((a, b) => a.weight - b.weight);
}

            const wangsanDiv = document.getElementById("wangsan");
            wangsanDiv.innerHTML = "";

            for (const result of results) {
                const itemDiv = document.createElement("div");
                itemDiv.className = "item";
				wangsanDiv.appendChild(itemDiv);
				
				const line = result.line;
				const diwei = splitDiwei(line[9]);
				const diweiDiv = document.createElement("div");
                diweiDiv.className = "item-diwei";
                itemDiv.appendChild(diweiDiv);

                const shengmuP = document.createElement("p");
                shengmuP.className = "item-diwei-shengmu";
                shengmuP.innerHTML = diwei.shengmu;
                diweiDiv.appendChild(shengmuP);

                const shengdiaoP = document.createElement("p");
                shengdiaoP.className = "item-diwei-shengdiao";
                shengdiaoP.innerHTML = diwei.shengdiao;
                diweiDiv.appendChild(shengdiaoP);

                const dengP = document.createElement("p");
                dengP.className = "item-diwei-deng";
                dengP.innerHTML = diwei.deng;
                diweiDiv.appendChild(dengP);

                const yunmuP = document.createElement("p");
                yunmuP.className = "item-diwei-yunmu";
                yunmuP.innerHTML = line[6];
                diweiDiv.appendChild(yunmuP);
				
				const xiaoyunA = document.createElement("a");
                xiaoyunA.className = "item-diwei-xiaoyun";
				xiaoyunA.href = "javascript:void(0);";
                    const xiaoyun_parts = line[7].split('〈');
				
					if(xiaoyun_parts.length===1){
                xiaoyunA.innerHTML = xiaoyun_parts[0];
					}else if(xiaoyun_parts.length===2){
                xiaoyunA.innerHTML = `<span><ruby>${xiaoyun_parts[0]}<rt>${xiaoyun_parts[1]}</rt></ruby></span>`;
					}
					
				let xiaoyun = xiaoyun_parts.length===1 ? xiaoyun_parts[0] : xiaoyun_parts[1];
				 xiaoyunA.addEventListener("click", function () {
            searchInput.value = xiaoyun;
            searchButton.click();
			yj.click();
    });
                diweiDiv.appendChild(xiaoyunA);

                const ziDiv = document.createElement("div");
                ziDiv.className = "item-zi";
                ziDiv.innerHTML = `<p>${line[12]}</p>`;
                itemDiv.appendChild(ziDiv);
								if(result.weight === 0){
					ziDiv.querySelector('p').classList.add("text-match");
				}else{
				 ziDiv.querySelector('p').innerHTML = `<a href="javascript:void(0);">${ziDiv.querySelector('p').innerHTML}</a>`;
				 ziDiv.querySelector('p').addEventListener("click", function () {
            searchInput.value = line[12];
            searchButton.click();
    });
				}
				
                const fanqieP = document.createElement("p");
                fanqieP.className = "item-fanqie";
				                    const fanqie_parts = line[8].split('〈');
				
					if(fanqie_parts.length===1){
                fanqieP.innerHTML = fanqie_parts[0];
					}else if(fanqie_parts.length===2){
						const rubyHTML = `<span><ruby>${fanqie_parts[0][fanqie_parts[0].length-1] }<rt>${fanqie_parts[1][0]}</rt></ruby></span>`;

                fanqieP.innerHTML = fanqie_parts[0].slice(0, -1) + rubyHTML + fanqie_parts[1].slice(1);
}
                ziDiv.appendChild(fanqieP);

                const shiP = document.createElement("div");
                shiP.className = "item-shi";
                shiP.textContent = line[13];
                itemDiv.appendChild(shiP);
            }
	}

function splitDiwei(text) {
    const regex = /(.*?)([一二三四]?)(.)([^一二三四]*)$/;
    const match = text.match(regex);

    if (match) {
        return {
            shengmu: match[1],
            deng: match[2] || "",
            yunmu: match[3],
            shengdiao: match[4] || ""
        };
    }

    return {
        shengmu: "",
        deng: "",
        yunmu: "",
        shengdiao: ""
    };
}

function splitGuangyunDiwei(text) {
    const regex = /^(.*?)(.)(.)$/;
    const match = text.match(regex);

    if (match) {
        return {
            shengmu: match[1],
            shengdiao: match[3],
            yunmu: match[2]
        };
    }

    return {
        shengmu: "",
        shengdiao: "",
        yunmu: ""
    };
}

  const titles = ["內轉第一開", "內轉第二開合", "外轉第三開合", "內轉第四開合", "內轉第五合", "內轉第六開", "內轉第七合", "內轉第八開", "內轉第九開", "內轉第十合", "內轉第十一開", "內轉第十二開合", "外轉第十三開", "外轉第十四合", "外轉第十五開", "外轉第十六合", "外轉第十七開", "外轉第十八合", "外轉第十九開", "外轉第二十合", "外轉第二十一開", "外轉第二十二合", "外轉第二十三開", "外轉第二十四合", "外轉第二十五開", "外轉第二十六合", "外轉第二十七合", "內轉第二十八合", "內轉第二十九開", "外轉第三十合", "內轉第三十一開", "內轉第三十二合", "外轉第三十三開", "外轉第三十四合", "外轉第三十五開", "外轉第三十六合", "內轉第三十七開", "內轉第三十八合", "外轉第三十九開", "外轉第四十合", "外轉第四十一合", "內轉第四十二開", "內轉第四十三合"];
	  const weiMap = {
  "舌齒音第二位": "1",
  "舌齒音第一位": "2",
  "喉音第四位": "3",
  "喉音第三位": "4",
  "喉音第二位": "5",
  "喉音第一位": "6",
  "齒音第五位": "7",
  "齒音第四位": "8",
  "齒音第三位": "9",
  "齒音第二位": "10",
  "齒音第一位": "11",
  "牙音第四位": "12",
  "牙音第三位": "13",
  "牙音第二位": "14",
  "牙音第一位": "15",
  "舌音第四位": "16",
  "舌音第三位": "17",
  "舌音第二位": "18",
  "舌音第一位": "19",
  "脣音第四位": "20",
  "脣音第三位": "21",
  "脣音第二位": "22",
  "脣音第一位": "23"
};
      const toneMap = {
        '平': 1,
        '上': 2,
        '去': 3,
        '入': 4,
      };
      const dengMap = {
        '一': 1,
        '二': 2,
        '三': 3,
        '四': 4,
      };
	    const tones = Object.keys(toneMap);
		const weis = Object.keys(weiMap);
	  
function searchYunjing(searchText, isSearchText) {
	let pages = [];
	let lingjianAs = [];
  const yunjingSearch = document.getElementById("yunjingSearch");
  for (let i = 0; i < yunjingData.length; i++) {
    const data = yunjingData[i].split(',');
    if (data[0] === searchText) {
	  pages.push(data);
    }
  }
  
  if(pages.length >0){
	  
	  pages.forEach((data)=>{
      const page = Number(data[1]);
	  
                const lingjianA = document.createElement("a");
				lingjianA.textContent = page;
				lingjianA.href = "javascript:void(0);";
				lingjianA.id = page;
				
		  				 lingjianA.addEventListener("click", function () {
							 yunjingSearch.textContent = `${isSearchText ? '' : "【同小韵字】"}${searchText}：${titles[page-1]} ${weis[Number(data[3])-1]} ${data[4]}聲 ${data[5]}韻 ${data[6]}等`;
								   const otherA = lingjianAs.filter((a) => a.id != page);
								   if(otherA.length>0){
								   yunjingSearch.appendChild(...otherA);
								   }
								   displayYunjing(page, searchText);
    });
	lingjianAs.push(lingjianA);
	  });
	  
	  lingjianAs[0].click();
	  
	  return true;
  }
  yunjingSearch.textContent = "未找到";
  return false;
}

function displayYunjing(page,searchText) {
  if (page > 43)
    return;

currentPage = page;
    updatePageButtons();
	
  const lines = yunjingData.filter(row => row.split(',')[1] == page);
  console.log(lines);

  const yunjingTitle = document.getElementById("yunjingTitle");
  if(lines.length !== 0 && lines[0].split(',')[2] !== ""){ //开合修正
	  const regex = /(開合|開|合)/;
  const match = titles[page - 1].match(regex);
  if (match) {
    const zhuan = titles[page - 1].split(match[0])[0];
	yunjingTitle.innerHTML = `${zhuan}<span><ruby>${match[0]}<rt>${lines[0].split(',')[2]}</rt></ruby></span>`;
  }
  }else{
  yunjingTitle.textContent = titles[page - 1];
  }
  
  const yunjingTable = document.getElementById('yunjingTable');
  yunjingTable.innerHTML = '<thead class="table-rowhead"><tr class="table-rowhead-place"><th></th><th colspan="2">舌齒音</th><th colspan="4">喉音</th><th colspan="5">齒音</th><th colspan="4">牙音</th><th colspan="4">舌音</th><th colspan="4">唇音</th><tr class="table-rowhead-manner"><th></th><th>清濁</th><th>清濁</th><th>清濁</th><th>濁</th><th>清</th><th>清</th><th>濁</th><th>清</th><th>濁</th><th>次清</th><th>清</th><th>清濁</th><th>濁</th><th>次清</th><th>清</th><th>清濁</th><th>濁</th><th>次清</th><th>清</th><th>清濁</th><th>濁</th><th>次清</th><th>清</th></tr></tr></thead>';

  const tbody = document.createElement('tbody');
  let sd,yun;
  
  for (let i = 0; i < 16; i++) {
	const contains  = lines.length !== 0 && dengMap[lines[0].split(',')[6]] === i % 4 + 1;
    const tr = document.createElement('tr');
	if(i%4 === 0){	
	tr.className = "table-topline";
	}
	else if(!contains || lines[0].split(',')[5] !== yun){
		sd.rowSpan = sd.rowSpan - 4 + i%4;
	}
	
	if(i % 4 === 0 || (!contains || lines[0].split(',')[5] !== yun)){
      sd = document.createElement('td');
      sd.rowSpan = 4 - i % 4;
	  if(contains){
      sd.className = "table-colhead-contains";
		  yun = lines[0].split(',')[5];
      sd.innerHTML = `<span>${yun}</span>`;
	  }else{
      sd.className = "table-colhead-uncontains";
		  yun='';
		  sd.innerHTML = `<span>${i%4===0 ? tones[i/4] : ""}</span>`;
	  }
      tr.appendChild(sd);
	}

    for (let j = 1; j < 24; j++) {
      const cell = document.createElement('td');
      if (lines.length === 0 || lines[0].split(',')[3] != j || !contains) {
        cell.textContent = '◯';
      } else {
        cell.textContent = lines[0].split(',')[0];
		if(searchText !== "" && searchText === cell.textContent){
			cell.className="text-match";
		}
        lines.shift();
      }
      tr.appendChild(cell);
    }

    tbody.appendChild(tr);
	  
  }

  yunjingTable.appendChild(tbody);
}

let currentPage = 1;

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
  const yunjingSearch = document.getElementById("yunjingSearch");
  yunjingSearch.textContent = '';
    displayYunjing(currentPage-1,"");
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  if (currentPage < 43) {
  const yunjingSearch = document.getElementById("yunjingSearch");
  yunjingSearch.textContent = '';
    displayYunjing(currentPage+1,"");
  }
});

function updatePageButtons() {
  const prevButton = document.getElementById("prev-page");
  const nextButton = document.getElementById("next-page");
  const pageNumber = document.getElementById("page-number");

  pageNumber.textContent = currentPage;

  if (currentPage === 1) {
    prevButton.disabled = true;
  } else {
    prevButton.disabled = false;
  }

  if (currentPage === 43) {
    nextButton.disabled = true;
  } else {
    nextButton.disabled = false;
  }
}
