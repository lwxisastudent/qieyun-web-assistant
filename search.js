//使用数据:
//https://github.com/nk2028/qieyun-data

const onlyZiCheckbox = document.getElementById("onlyZiCheckbox");

function searchCSV(searchText) {
	searchGuangyun(searchText);
	searchWangsan(searchText);
}

function searchGuangyun(searchText) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "guangyun.csv", true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            const lines = xhr.responseText.split('\n');
lines.shift();
if (lines[lines.length - 1].trim() === '') {
    lines.pop();
}
            const results = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].split(',');
                let weight = -1;
				
				//字
                if (line[6] === searchText) {
                    weight = 0;
                }
				//释义
				else if (!onlyZiCheckbox.checked && (line[8].includes(searchText) || line[9].includes(searchText))) {
                    weight = 1;
                }
				//反切
				else if (!onlyZiCheckbox.checked && (line[4].includes(searchText) || line[5].includes(searchText))) {
                    weight = 2;
                }

                if (weight >= 0) {
                    const groupNumber = line[0]+",";
                    const groupItems = lines
                        .slice(1, i)
                        .filter((item) => item.startsWith(groupNumber));

                    let headOri = line[6];
                    let head = line[7];

                    if (groupItems.length > 0) { //小韵字头
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
                }
            }

            results.sort((a, b) => a.weight - b.weight);

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
				
				const xiaoyunP = document.createElement("p");
                xiaoyunP.className = "item-diwei-xiaoyun";
				if(result.head === ""){
                xiaoyunP.innerHTML = result.headOri;
					}else{
                xiaoyunP.innerHTML = `<span><ruby>${result.headOri}<rt>${result.head}</rt></ruby></span>`;
					}
                diweiDiv.appendChild(xiaoyunP);

                const ziDiv = document.createElement("div");
                ziDiv.className = "item-zi";
				if(line[7] === ""){
                ziDiv.innerHTML = `<p>${line[6]}</p>`;
					}else{
                ziDiv.innerHTML = `<p><span><ruby>${line[6]}<rt>${line[7]}</rt></ruby></span></p>`;
					}
                itemDiv.appendChild(ziDiv);
				
                const fanqieP = document.createElement("p");
                fanqieP.className = "item-fanqie qie";
				if(line[5] === ""){
                fanqieP.textContent = line[4];
					}else{
                fanqieP.textContent = `<span><ruby>${line[4]}<rt>${line[5]}</rt></ruby></span>`;
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
    };

    xhr.send();
}

function searchWangsan(searchText) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "wangsan.csv", true);
    xhr.onload = function () {
        if (xhr.status === 200) {
			let wangsan = xhr.responseText;
    wangsan = wangsan.replace(/〻〈/g, '');
    wangsan = wangsan.replace(/〉/g, '');
    wangsan = wangsan.replace(/【〻】/g, '？');
			
            const lines = wangsan.split('\n');
lines.shift();
if (lines[lines.length - 1].trim() === '') {
    lines.pop();
}

            const results = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].split(',');
                let weight = -1;

                if (line[12] === searchText) {
                    weight = 0;
                } else if (!onlyZiCheckbox.checked && line[13].includes(searchText)) {
                    weight = 1;
                } else if (!onlyZiCheckbox.checked && line[8].includes(searchText) && searchText !== "反") {
                    weight = 2;
                }

                if (weight >= 0) {
                    results.push({ line: line, weight: weight });
                }
            }

            results.sort((a, b) => a.weight - b.weight);

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
				
				const xiaoyunP = document.createElement("p");
                xiaoyunP.className = "item-diwei-xiaoyun";
                    const xiaoyun_parts = line[7].split('〈');
				
					if(xiaoyun_parts.length===1){
                xiaoyunP.innerHTML = xiaoyun_parts[0];
					}else if(xiaoyun_parts.length===2){
                xiaoyunP.innerHTML = `<span><ruby>${xiaoyun_parts[0]}<rt>${xiaoyun_parts[1]}</rt></ruby></span>`;
					}
                diweiDiv.appendChild(xiaoyunP);

                const ziDiv = document.createElement("div");
                ziDiv.className = "item-zi";
                ziDiv.innerHTML = `<p>${line[12]}</p>`;
                itemDiv.appendChild(ziDiv);
				
                const fanqieP = document.createElement("p");
                fanqieP.className = "item-fanqie";
                fanqieP.textContent = line[8];
                ziDiv.appendChild(fanqieP);

                const shiP = document.createElement("div");
                shiP.className = "item-shi";
                shiP.textContent = line[13];
                itemDiv.appendChild(shiP);
            }
        }
    };

    xhr.send();
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
