//https://ordersystem-c18b3-default-rtdb.firebaseio.com/
/*phone
width:500
height:900
*/
//(()=>{
    var Ex = {
        id:"OrderSystem",
        cfg:{
            db_url:"https://ordersystem-c18b3-default-rtdb.firebaseio.com/",
            _menu:{
                "牛肉蓋飯":100,
                "豬肉蓋飯":85,
                "親子蓋飯":85,
                "味噌湯":25
            }
        },
        flag:{},
        func:{
            StorageUpd:()=>{

                if(Ex.flag.local===undefined || Ex.flag.session===undefined)
                {
                    Ex.flag.local = JSON.parse(localStorage[Ex.id]||`{}`);
                    Ex.flag.session = JSON.parse(sessionStorage[Ex.id]||`{}`);
                }
                else
                {
                    localStorage[Ex.id] = JSON.stringify(Ex.flag.local);
                    sessionStorage[Ex.id] = JSON.stringify(Ex.flag.session);
                }
            },
            SelectHtml:(obj)=>{
                var html = ``;

                for(var v in obj)
                {
                    html += `<option value="${v}">${v},${obj[v]}</option>`
                }

                return html;
            },
            ClickEvent:(e)=>{
                
                if(Ex.func[e.target.dataset.event]!==undefined)
                {
                    Ex.func[e.target.dataset.event](e);
                }
            },
            Order:(e)=>{

                var mode = e.target.dataset.mode;

                switch (mode)
                {
                    case "AddFood":
                        Ex.flag.session.order = Ex.flag.session.order||{}

                        var food = document.querySelector("#food").value;


                        Ex.flag.session.order[food] = Ex.flag.session.order[food]||{count:0};

                        Ex.flag.session.order[food] = {
                            price:Ex.cfg._menu[food],
                            count:Ex.flag.session.order[food].count+=1
                        }

                        
                    break;

                    case "DelFood":

                        delete Ex.flag.session.order[e.target.id];

                    break;

                    case "CountFodd":

                        Ex.flag.session.order[e.target.id].count = parseInt(prompt("輸入數量",'1'))||1


                    break;

                    case "End":

                    break;
                }


                Ex.func.StorageUpd();
                document.querySelector("#Order").innerHTML = Ex.temp.OrderList();

            }

        },
        temp:{
            body:()=>{
                return `
                    <div id="Main">
                        <input 
                        data-event="Order" 
                        data-mode="AddFood" type="button" value="點餐">
                        <select id="food">
                            ${Ex.func.SelectHtml(Ex.cfg._menu)}
                        </select>
                        <div id="Order">
                            ${Ex.temp.OrderList()}
                        </div>
                        <input 
                        data-event="Order" 
                        data-mode="End" type="button" value="結帳">

                    </div>
                `;
            },
            OrderList:(list = Ex.flag.session.order)=>{

                if(list===undefined) return ``;
                if(Object.keys(list).length===0) return ``;
                

                var total_price = 0;
                var html = `<table><tr>
                    <td>餐點</td>
                    <td>單價</td>
                    <td>數量</td>
                    <td>總價</td>
                    <td></td>
                </tr>`;

                for(var name in list)
                {
                    var food = list[name];

                    html += `<tr>
                        <td>${name}</td>
                        <td>${food.price}</td>
                        <td>
                        <input id="${name}" 
                        data-event="Order" 
                        data-mode="CountFodd" type="button" value="${food.count}">
                        </td>
                        <td>${food.count*food.price}</td>
                        <td>
                        <input id="${name}" 
                        data-event="Order" 
                        data-mode="DelFood" type="button" value="刪除">
                        </td>
                    </tr>`;

                    total_price+=food.count*food.price;
                }

                html += `<tr>
                    <td>合計</td>
                    <td>${total_price}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>`;

                html += `</table>`;

                return html;

            }


        },
        init:()=>{

            document.querySelector("#script").src = `${document.querySelector("#script").src}?t=${new Date().getTime()}`

            Ex.func.StorageUpd();
            
            Ex.DB = firebase;
            Ex.DB.initializeApp({databaseURL:Ex.cfg.db_url});
            Ex.DB = Ex.DB.database();


            document.body.innerHTML = Ex.temp.body();

            document.addEventListener("click",Ex.func.ClickEvent);


            


            /*
            navigator.geolocation.getCurrentPosition(function(p) {
                document.querySelector("textarea").value = `latitude:${p.coords.latitude}\nlongitude:${p.coords.longitude}`;
            });
            */



        }
    }

    

    window.onload = ()=>{

        Ex.init();


    }
    

//})();