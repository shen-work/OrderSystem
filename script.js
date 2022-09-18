//https://ordersystem-c18b3-default-rtdb.firebaseio.com/
/*phone
width:500
height:900


new QRCode( 物件 , {
    text: 網址,
    width: 寬,
    height: 高
});

*/
//(()=>{
    var Ex = {
        id:"OrderSystem",
        cfg:{
            db_url:"https://ordersystem-c18b3-default-rtdb.firebaseio.com/",
            db_time:firebase.database.ServerValue.TIMESTAMP,
            storage:"local",
            order_status:{
                0:"準備中",
                1:"等待取餐",
                2:"取餐完成",
                3:"取消"
            }
        },
        flag:{
            db_time:null,
            url:{
                get:(row)=>{
                    return new URL(location.href).searchParams.get(row);
                }
            }
        },
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
            SpeakMsg:()=>{
                
                speechSynthesis.speak(new SpeechSynthesisUtterance('說中文菜單'));

            },
            ClickEvent:(e)=>{

                if(Ex.func[e.target.dataset.event]!==undefined)
                {
                    Ex.func.DBTime(()=>{
                        Ex.func[e.target.dataset.event](e);
                    });
                }
            },
            QrCode:(e)=>{


                Ex.func.PopWindow(`<input data-selector="#Qrcode" data-event="Close" type="button" value="關閉">`,'Qrcode')
               


                var size = ((window.innerWidth<window.innerHeight)?window.innerWidth:window.innerHeight)-30;

                new QRCode( 'Qrcode' , {
                    text: e.target.dataset.txt,
                    width:size,
                    height:size,
                });
            },
            DBTime:(func)=>{

                Ex.DB.ref("DBTIME").set(Ex.cfg.db_time).then(()=>{

                    Ex.DB.ref("DBTIME").once("value",r=>{

                        Ex.flag.db_time = r.val();

                        if( typeof(func)==="function" ) func();
                    });

                });

            },
            OrderStatus:(e)=>{


                var day = Ex.func.IOSDate(new Date(Ex.flag.db_time)).split(" ")[0];

                Ex.DB.ref(`shop/${Ex.flag.storage.ShopId}/order/${day}/${e.target.id}/status`).set( parseInt(e.target.dataset.value) );

               

            },
            Menu:(e)=>{
                
                var mode = e.target.dataset.mode;

                var shop = Ex.flag.storage;

                shop.menu = shop.menu||{};
                shop.order = shop.order||{};


                var data = {};

                document.querySelectorAll(`[data-input]`).forEach(o=>{

                    data[ o.id ] = ( isNaN(parseInt(o.value)) )?o.value:parseInt(o.value);
                    o.value = '';
                    
                });


                switch (mode){

                    case "AddFood":

                        if(data.name!=='' && data.price!=='')
                        {       
                            shop.menu[ data.name ] = {
                                name:data.name,
                                price:data.price
                            }
                        }
                    break;

                    case "DelFood":

                        delete shop.menu[e.target.id];

                    break;

                    case "SetFood":

                        if(e.target.dataset.edit_id!==undefined)
                        {
                            var edit_id = e.target.dataset.edit_id;
                            
                            if(data.name!==shop.menu[ edit_id ].name) delete shop.menu[ edit_id ];

                            shop.menu[ data.name ] = {
                                name:data.name,
                                price:data.price
                            }

                            e.target.dataset.mode = "AddFood";
                            e.target.value = "新增菜單";
                            e.target.removeAttribute("dataset-edit_id");

                            
                        }
                        else
                        {
                            setTimeout(()=>{
                                
                                document.querySelectorAll(`[data-input]`).forEach(o=>{
                                    o.value = (shop.menu[ e.target.id ][ o.id ]!==undefined)?shop.menu[ e.target.id ][ o.id ]:shop[ o.id ]
                                });


                                document.querySelector(`[data-mode="AddFood"]`).value = "修改菜單";
        
                                document.querySelector(`[data-mode="AddFood"]`).dataset.edit_id = e.target.id;
        
                                document.querySelector(`[data-mode="AddFood"]`).dataset.mode = "SetFood";

                                
                                document.querySelectorAll(`table [data-event="Menu"]`).forEach(o=>{
                                    o.setAttribute("disabled","disabled");
                                });
                            },0);

                        }

                    break;

                    case "ShopMode":

                        Ex.flag.storage.ShopMode = (Ex.flag.storage.ShopMode==="ShowOrder")?"ShowMenu":"ShowOrder";
                        
                    break;

                    
                }

                if(Object.keys(shop.menu).length>0 && mode!=="ShopMode")
                {
                    Ex.flag.storage.shop_name = data.shop_name;

                    Ex.func.DBTime(()=>{

                        var day = Ex.func.IOSDate(Ex.flag.db_time).split(" ")[0];
                        shop.order[ day ] = shop.order[ day ]||{};

                        

                        if(Ex.flag.storage.ShopId!==undefined)
                        {                            
                            Ex.DB.ref(`shop/${Ex.flag.storage.ShopId}`).set({
                                menu:shop.menu,
                                order:shop.order,
                                shop_name:data.shop_name
                            });
    
                        }
                        else
                        {
                            Ex.DB.ref("shop").push({
                                menu:shop.menu,
                                order:shop.order,
                                shop_name:data.shop_name
                            }).then(r=>{
    
                                Ex.flag.storage.ShopId = r.key;
                                Ex.func.StorageUpd();
    
                            });

                        }

                    });

                }


                Ex.flag.storage = shop;

                Ex.func.StorageUpd();

                document.body.innerHTML = Ex.temp.ShopPage();


            },
            Buy:(e)=>{

                var mode = e.target.dataset.mode;
                var day = Ex.func.IOSDate( new Date(Ex.flag.db_time) ).split(" ")[0];

                var buy_order = Ex.flag.storage.buy_order||{};
                


                /*
                if(Ex.flag[Ex.cfg.storage].order[ day ]===undefined)
                {
                    console.log("no order");
                    return;
                }
                */


                switch (mode)
                {
                    case "AddFood":

                        var food = document.querySelector("#food").value;

                        buy_order[food] = buy_order[food]||{count:0};

                        buy_order[food] = {
                            price:Ex.flag.storage.menu[food].price,
                            count:buy_order[food].count+=1
                        }
                        
                    break;

                    case "DelFood":

                        delete buy_order[e.target.id];

                    break;

                    case "CountFood":


                        document.querySelectorAll("#CountFood").forEach(o=>o.remove());

                        if(e.target.value==="-" || e.target.value==="+")
                        {
                            var food = e.target.parentElement.id;

                            (e.target.value==="-")?buy_order[food].count-=1:buy_order[food].count+=1;

                            if(buy_order[food].count<=0)
                            delete buy_order[food];

                        }
                        else
                        {
                            Ex.func.PopWindow(
                                Ex.temp.CountFood(e.target.id),
                                'CountFood',
                                e);
                          
                        }


                    break;

                    case "End":
                        if(Object.keys(buy_order).length>0)
                        {
                            Ex.DB.ref(`shop/${Ex.flag.storage.ShopId}/order/${day}`).push({
                                id:Object.keys(Ex.flag.storage.order[day]||{}).length+1,
                                list:buy_order,
                                time:Ex.cfg.db_time
                            }).then(r=>{
    
                                
                                Ex.flag.storage.BuyId = r.key;
                                Ex.func.StorageUpd();
    
    
                                document.body.innerHTML = Ex.temp.BuyPage();
                                
                            });
    
                            buy_order = {};
                        }
                    break;
                }


                Ex.flag.storage.buy_order = buy_order;
                Ex.func.StorageUpd();

                document.querySelector("#Order").innerHTML = Ex.temp.Order();

            },
            Close:(e)=>{
                
                document.querySelectorAll(e.target.dataset.selector).forEach(o=>{
                    o.remove();
                });

            },
            PopWindow:(html,id,e)=>{

                var div = document.createElement("div");
                div.className = "pop";
                div.id = id;
                
                if(e!==undefined)
                {
                    div.style.left = e.x + window.scrollX + 'px';
                    div.style.top = e.y + window.scrollY +  'px';
                }

                div.innerHTML = html;

                document.body.prepend(div);


                return div;
            },
            IOSDate:(IOSDate,opt = {})=>{

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
            ShopPage:()=>{

                
                var Buy = btoa(JSON.stringify({
                    id:Ex.flag.storage.ShopId,
                    day:Ex.func.IOSDate(new Date(Ex.flag.db_time)).split(" ")[0]
                }));

                return `<div id="Main">


                    ${(Ex.flag.storage.ShopMode!=='ShowOrder')?Ex.temp.ShowMenu():Ex.temp.OrderList()}
                    

                    <!--
                    <input 
                    data-event="Menu" 
                    data-mode="End" type="button" value="上傳菜單">
                    -->

                    <input 
                    data-event="Menu" 
                    data-mode="ShopMode" type="button" value="${(Ex.flag.storage.ShopMode!=='ShowOrder')?`顯示定單`:"顯示菜單"}">

                    <input type="button" data-txt="${location.origin}${location.pathname}?ShopId=${Ex.flag.storage.ShopId}" data-event="QrCode" value="店家用QRCODE">

                    <input type="button" data-txt="${location.origin}${location.pathname}?Buy=${Buy}" data-event="QrCode" value="客人用QRCODE">
                
                
                </div>`;
            },
            ShowMenu:()=>{

                return `
                    <input 
                    data-event="Menu" 
                    data-mode="AddFood" type="button" value="新增菜單">

                    <input data-input placeholder="名稱" id="name" type="text" value="">
                    <input data-input placeholder="價錢" id="price" type="number" value="">
                
                
                    <div id="Order">
                        ${Ex.temp.Menu()}
                    </div>
                `;

            },
            Menu:()=>{

                var list = Ex.flag.storage.menu;

                if(list===undefined) return ``;
                if(Object.keys(list).length===0) return ``;

                var html = `<table><tr>
                    <td>名稱</td>
                    <td>單價</td>
                    <td></td>
                </tr>`;

                for(var name in list)
                {
                    var food = list[name];

                    html += `<tr>
                        <td>
                        ${food.name}
                        </td>
                        <td>
                        ${food.price}
                        </td>
                        <td>
                        <input id="${name}" 
                        data-event="Menu" 
                        data-mode="DelFood" type="button" value="刪除">
                        <input id="${name}" 
                        data-event="Menu" 
                        data-mode="SetFood" type="button" value="修改">
                        </td>
                    </tr>`;

                }


                html += `
                
                <tr>
                    <td colspan="3">
                    <input data-input id="shop_name" placeholder="店名" type="text" value="${Ex.flag.storage.shop_name||``}">
                    </td>
                    
                    
                </tr>
                
                </table>`;

                return html;

            },
            OrderList:(list)=>{

                Ex.flag.storage.order = Ex.flag.storage.order||{};

                if( Ex.flag.storage.order[Ex.func.IOSDate( new Date(Ex.flag.db_time)).split(" ")[0]]===undefined ) return ``;

                list = list||Ex.flag.storage.order[Ex.func.IOSDate( new Date(Ex.flag.db_time) ).split(" ")[0]];

                if(list===undefined || list===null) return `undefined`;
                if(Object.keys(list).length===0) return `0`;
                if(list===1) return `1`;

                
                
                var html = `<table>`;

                for(var id in list)
                {

                    html += Ex.temp.OrderDetail(list[id],id);

                }


                html += `</table>`;

                return html;

            },
            BuyPage:()=>{

                return `<div id="Main">

                    ${(Ex.flag.storage.BuyId!==undefined)?Ex.temp.ShowOrder():Ex.temp.SelectFood()}
                        

                    <div id="OrderList">

                    ${Ex.temp.OrderList()}

                    </div>

                    </div>
                `;
            },
            ShowOrder:()=>{

                var day = Ex.func.IOSDate(new Date(Ex.flag.db_time)).split(" ")[0];

                if(Ex.flag.storage.order[day]===undefined)
                {
                    delete Ex.flag.storage.BuyId;
                    Ex.func.StorageUpd();
                    setTimeout(()=>{location.reload();},0);
                    return;
                }

                var order = Ex.flag.storage.order[day][ Ex.flag.storage.BuyId ];

                if(order===undefined)
                {
                    delete Ex.flag.storage.BuyId;
                    Ex.func.StorageUpd();
                    setTimeout(()=>{location.href = location.pathname;},0);
                    return;
                }

                return `
                <table>

                ${Ex.temp.OrderDetail(order,Ex.flag.storage.BuyId)}

                
                
                </table>
                
                
                `;
            },
            SelectFood:()=>{

                return `
                    <input 
                    data-event="Buy" 
                    data-mode="AddFood" type="button" value="點餐">
                    <select id="food">
                        ${Object.values(Ex.flag.storage.menu).map(food=>{return `<option value="${food.name}">${food.name},${food.price}</option>`;}).join("")}
                    </select>
                    <div id="Order">
                        ${Ex.temp.Order()}
                    </div>
                    <input 
                    data-event="Buy" 
                    data-mode="End" type="button" value="結帳">
                `;
            },
            Order:(list)=>{

                list = list||Ex.flag.storage.buy_order;


                if(list===undefined) return ``;
                if(Object.keys(list).length===0) return ``;
                

                var total_price = 0;
                var html = `<table><tr>
                    <td>餐點</td>
                    <td>單價</td>
                    <td>數量</td>
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
                        data-event="Buy" 
                        data-mode="CountFood" type="button" value="${food.count}">
                        </td>
                        <td>
                        <input id="${name}" 
                        data-event="Buy" 
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
            OrderDetail:(data,db_id)=>{


                var detail = `餐點：<BR><div class="order_detail">`;
                var total_price = 0;
                for(var name in data.list)
                {
                    
                    var food = data.list[name];
                    detail += `${name} * ${food.count} = ${food.count*food.price}<BR>`;

                    total_price+=food.count*food.price
                }
                detail += `</div>`

                


                return `

                ${(Ex.flag.storage.user==="shop")?`
                <tr>
                    <td class="order_menu">

                    ${Object.values(Ex.cfg.order_status).map((v,k)=>{return `<input type="button" id="${db_id}" 
                    data-event="OrderStatus" 
                    data-value="${k}" value="${v}">`;}).join("")}


                    
                    </td>
                </tr>`:``}

                
                <tr>
                    <td>編號：${data.id}</td>
                </tr>
                <tr>
                    <td>時間：${Ex.func.IOSDate(data.time,{Y:false})}</td>
                </tr>
                <tr>
                    <td>${detail}總價：${total_price}</td>
                </tr>
                <tr>
                    <td>狀態：${Ex.cfg.order_status[data.status||0]}<BR><hr></td>
                </tr>`;
            },
            CountFood:(food)=>{
                var html = ``;

                    html = `
                    <div id="${food}" style="display: grid;">
                    <input type="button" data-event="Buy" 
                    data-mode="CountFood" value="+">
                    <input type="button" data-event="Buy" 
                    data-mode="CountFood" value="-">
                    </div>`;

                return html;
            },
            


        },
        init:()=>{

            Ex.func.StorageUpd();

            Ex.flag.storage = Ex.flag[Ex.cfg.storage];


            if(Ex.flag.url.get("ShopId")!==null)
            {
                Ex.flag.storage.ShopId = Ex.flag.url.get("ShopId");
                Ex.func.StorageUpd();
                setTimeout(()=>{location.href = location.pathname;},0);
                return;
            }
            

            Ex.DB = firebase;
            Ex.DB.initializeApp({databaseURL:Ex.cfg.db_url});
            Ex.DB = Ex.DB.database();


            Ex.func.DBTime(()=>{


                if(Ex.flag.url.get("Buy")===null || Ex.flag.storage.user==="shop")
                {
                    

                    if(Ex.flag.storage.ShopId!==undefined)
                    Ex.DB.ref(`shop/${Ex.flag.storage.ShopId}`).on("value",r=>{


                        r = r.val();
                        if(r===null)
                        {
                            delete Ex.flag.storage.ShopId;
                            Ex.func.StorageUpd();
                            setTimeout(()=>{location.href = location.pathname;},0);
                            return;
                        }

                        for(var key in r) Ex.flag.storage[key] = r[key];
                        Ex.flag.storage.user = "shop";
                        Ex.func.StorageUpd();


                        document.body.innerHTML = Ex.temp.ShopPage();

        
                    });

                    
                }
                else
                {
                    var Buy = Ex.flag.url.get("Buy");

                    Buy = JSON.parse(atob(Buy));

                    Ex.DB.ref(`shop/${Buy.id}`).on("value",r=>{

                        r = r.val();
                        if(r===null){

                            setTimeout(()=>{location.href = location.pathname;},0);
                            return;
                        }

                        


                        for(var key in r) Ex.flag.storage[key] = r[key];
                        Ex.flag.storage.ShopId = Buy.id;
                        Ex.flag.storage.user = "buy";
                        Ex.func.StorageUpd();
        
        
                        document.body.innerHTML = Ex.temp.BuyPage();
        
                    });



                }

            });

            

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