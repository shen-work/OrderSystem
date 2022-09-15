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
            db_time:firebase.database.ServerValue.TIMESTAMP,
            storage:"local",
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
            ClickEvent:(e)=>{
                
                if(Ex.func[e.target.dataset.event]!==undefined)
                {
                    Ex.func[e.target.dataset.event](e);
                }
            },
            Order:(e)=>{

                var mode = e.target.dataset.mode;
                var order = Ex.flag[Ex.cfg.storage].order||{};

                switch (mode)
                {
                    case "AddFood":

                        var food = document.querySelector("#food").value;

                        order[food] = order[food]||{count:0};

                        order[food] = {
                            price:Ex.cfg._menu[food],
                            count:order[food].count+=1
                        }
                        
                    break;

                    case "DelFood":

                        delete order[e.target.id];

                    break;

                    case "CountFood":


                        document.querySelectorAll("#CountFood").forEach(o=>o.remove());

                        if(e.target.value==="-" || e.target.value==="+")
                        {
                            var food = e.target.parentElement.id;

                            (e.target.value==="-")?order[food].count-=1:order[food].count+=1;

                            if(order[food].count<=0)
                            delete order[food];

                        }
                        else
                        {
                            document.body.prepend(
                                Ex.func.PopWindow(Ex.temp.CountFodd(e.target.id),'CountFood',e)
                            );
                        }


                    break;

                    case "End":
                        if(Object.keys(order).length===0) return;

                        Ex.DB.ref("order").push({
                            list:order,
                            time:Ex.cfg.db_time
                        });

                        order = {};

                    break;
                }


                Ex.flag[Ex.cfg.storage].order = order;

                Ex.func.StorageUpd();
                document.querySelector("#Order").innerHTML = Ex.temp.Order();

            },
            PopWindow:(html,id,e)=>{

                var div = document.createElement("div");
                div.className = "pop";
                div.id = id;
                
                if(e!==undefined)
                {
                    div.style.left = e.x + 'px';
                    div.style.top = e.y + 'px';
                }

                div.innerHTML = html;


                return div;
            },
            IOSDate:(IOSDate,opt)=>{

                opt.Y = (opt.Y!==undefined)?opt.Y:true;
                opt.M = (opt.M!==undefined)?opt.M:true;
                opt.D = (opt.D!==undefined)?opt.D:true;
                opt.h = (opt.h!==undefined)?opt.h:true;
                opt.m = (opt.m!==undefined)?opt.m:true;
                opt.s = (opt.s!==undefined)?opt.s:true;
                   

                var str = ``;

                str += (opt.Y)?new Date(IOSDate).getFullYear()+'-':'';
                str += (opt.M)?(new Date(IOSDate).getMonth()+1).toString().padStart(2,'0')+'-':'';
                str += (opt.D)?(new Date(IOSDate).getDate()).toString().padStart(2,'0')+' ':'';

                str += (opt.h)?new Date(IOSDate).getHours().toString().padStart(2,'0')+':':'';
                str += (opt.m)?new Date(IOSDate).getMinutes().toString().padStart(2,'0')+':':'';
                str += (opt.s)?new Date(IOSDate).getSeconds().toString().padStart(2,'0'):'';

                return str;
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
                            ${Ex.temp.SelectHtml(Ex.cfg._menu)}
                        </select>
                        <div id="Order">
                            ${Ex.temp.Order()}
                        </div>
                        <input 
                        data-event="Order" 
                        data-mode="End" type="button" value="結帳">
                        <div id="OrderList">
                        </div>

                    </div>
                `;
            },
            SelectHtml:(list)=>{
                var html = ``;

                for(var v in list)
                {
                    html += `<option value="${v}">${v},${list[v]}</option>`
                }

                return html;
            },
            Order:(list = Ex.flag[Ex.cfg.storage].order)=>{

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
                        data-mode="CountFood" type="button" value="${food.count}">
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

            },
            OrderList:(list = Ex.flag.OrderList )=>{

                if(list===undefined || list===null) return ``;
                if(Object.keys(list).length===0) return ``;

                
                var total_price = 0;
                var html = `<table>`;

                for(var id in list)
                {
                    var order = list[id];
                    var detail = ``;

                    for(var name in order.list)
                    {
                        
                        var food = order.list[name];
                        detail += `${name} X ${food.count}<BR>`;

                        total_price+=food.count*food.price
                    }

                    html += `<tr>
                            <td>${Ex.func.IOSDate(order.time,{Y:false})}</td>
                        </tr>
                        <tr>
                            <td>${detail}${total_price}</td>
                        </tr>
                        <tr>
                            <td><hr></td>
                        </tr>`;

                        

                }


                html += `</table>`;

                return html;

            },
            CountFodd:(food)=>{
                var html = ``;

                    html = `
                    <div id="${food}" style="display: grid;">
                    <input type="button" data-event="Order" 
                    data-mode="CountFood" value="+">
                    <input type="button" data-event="Order" 
                    data-mode="CountFood" value="-">
                    </div>`;

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


            Ex.DB.ref("order").on("value",r=>{

                Ex.flag.OrderList = r.val();


                document.querySelector("#OrderList").innerHTML = Ex.temp.OrderList();
                console.log('test');

            });

            


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