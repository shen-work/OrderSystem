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
            _menu:{
                "牛肉蓋飯":100,
                "豬肉蓋飯":85,
                "親子蓋飯":85,
                "味噌湯":25
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
            Menu:(e)=>{
                
                var mode = e.target.dataset.mode;

                var shop = Ex.flag[Ex.cfg.storage];

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

                        Ex.flag[Ex.cfg.storage].ShopMode = (Ex.flag[Ex.cfg.storage].ShopMode==="ShowOrder")?"ShowMenu":"ShowOrder";
                        
                    break;

                    
                }

                if(Object.keys(shop.menu).length>0 && mode!=="ShopMode")
                {
                    Ex.flag[Ex.cfg.storage].shop_name = data.shop_name;

                    Ex.func.DBTime(()=>{

                        var day = Ex.func.IOSDate(Ex.flag.db_time).split(" ")[0];
                        shop.order[ day ] = shop.order[ day ]||{};

                        

                        if(Ex.flag[Ex.cfg.storage].ShopId!==undefined)
                        {                            
                            Ex.DB.ref(`shop/${Ex.flag[Ex.cfg.storage].ShopId}`).set({
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
    
                                Ex.flag[Ex.cfg.storage].ShopId = r.key;
                                Ex.func.StorageUpd();
    
                            });

                        }

                    });

                }


                Ex.flag[Ex.cfg.storage] = shop;

                Ex.func.StorageUpd();

                document.body.innerHTML = Ex.temp.ShopPage();


            },
            Buy:(e)=>{

                var mode = e.target.dataset.mode;
                var day = Ex.func.IOSDate( new Date(Ex.flag.db_time) ).split(" ")[0];

                var buy_order = Ex.flag[Ex.cfg.storage].buy_order||{};
                


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
                            price:Ex.flag[Ex.cfg.storage].menu[food].price,
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
                            Ex.DB.ref(`shop/${Ex.flag[Ex.cfg.storage].ShopId}/order/${day}`).push({
                                id:Object.keys(Ex.flag[Ex.cfg.storage].order[day]||{}).length+1,
                                list:buy_order,
                                time:Ex.cfg.db_time
                            }).then(r=>{
    
                                
                                Ex.flag[Ex.cfg.storage].BuyId = r.key;
                                Ex.func.StorageUpd();
    
    
                                document.body.innerHTML = Ex.temp.BuyPage();
                                
                            });
    
                            buy_order = {};
                        }
                    break;
                }


                Ex.flag[Ex.cfg.storage].buy_order = buy_order;
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
                    div.style.left = e.x + 'px';
                    div.style.top = e.y + 'px';
                }

                div.innerHTML = html;


                document.body.prepend(div);
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
                    id:Ex.flag[Ex.cfg.storage].ShopId,
                    day:Ex.func.IOSDate(new Date(Ex.flag.db_time)).split(" ")[0]
                }));

                return `<div id="Main">


                    ${(Ex.flag[Ex.cfg.storage].ShopMode!=='ShowOrder')?Ex.temp.ShowMenu():Ex.temp.OrderList()}
                    

                    <!--
                    <input 
                    data-event="Menu" 
                    data-mode="End" type="button" value="上傳菜單">
                    -->

                    <input 
                    data-event="Menu" 
                    data-mode="ShopMode" type="button" value="${(Ex.flag[Ex.cfg.storage].ShopMode!=='ShowOrder')?`顯示定單`:"顯示菜單"}">

                    <input type="button" data-txt="${location.origin}${location.pathname}?ShopId=${Ex.flag[Ex.cfg.storage].ShopId}" data-event="QrCode" value="店家用QRCODE">

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
            BuyPage:()=>{
                return `<div id="Main">

                    ${(Ex.flag[Ex.cfg.storage].BuyId!==undefined)?Ex.temp.ShowOrder():Ex.temp.SelectFood()}
                        

                    <div id="OrderList">
                    </div>

                    </div>
                `;
            },
            OrderDetail:(data)=>{


                return `
                <tr>
                    <td>編號${data.id}</td>
                </tr>
                <tr>
                    <td>${Ex.func.IOSDate(data.time,{Y:false})}</td>
                </tr>
                <tr>
                    <td>${data.detail}總價${data.total_price}</td>
                </tr>
                <tr>
                    <td><hr></td>
                </tr>`;
            },
            ShowOrder:()=>{

                var day = Ex.func.IOSDate(new Date(Ex.flag.db_time)).split(" ")[0];

                if(Ex.flag[Ex.cfg.storage].order[day]===undefined) return ``;

                var order = Ex.flag[Ex.cfg.storage].order[day][ Ex.flag[Ex.cfg.storage].BuyId ];


                var detail = ``;
                var total_price = 0;

                for(var name in order.list)
                {
                    
                    var food = order.list[name];
                    detail += `${name} X ${food.count}<BR>`;

                    total_price+=food.count*food.price
                }

                return `
                <table>

                ${Ex.temp.OrderDetail({
                    id:order.id,
                    time:order.time,
                    detail:detail,
                    total_price:total_price
                })}

                
                </table>
                
                
                `;
            },
            SelectFood:()=>{

                return `
                    <input 
                    data-event="Buy" 
                    data-mode="AddFood" type="button" value="點餐">
                    <select id="food">
                        ${Object.values(Ex.flag[Ex.cfg.storage].menu).map(food=>{return `<option value="${food.name}">${food.name},${food.price}</option>`;}).join("")}
                    </select>
                    <div id="Order">
                        ${Ex.temp.Order()}
                    </div>
                    <input 
                    data-event="Buy" 
                    data-mode="End" type="button" value="結帳">
                `;
            },
            Menu:(list)=>{
                list = list||Ex.flag[Ex.cfg.storage].menu;

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
                    <input data-input id="shop_name" placeholder="店名" type="text" value="${Ex.flag[Ex.cfg.storage].shop_name||``}">
                    </td>
                    
                    
                </tr>
                
                </table>`;

                return html;

            },
            Order:(list)=>{

                list = list||Ex.flag[Ex.cfg.storage].buy_order;


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
                        data-event="Buy" 
                        data-mode="CountFood" type="button" value="${food.count}">
                        </td>
                        <td>${food.count*food.price}</td>
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
            OrderList:(list)=>{


                Ex.flag[Ex.cfg.storage].order = Ex.flag[Ex.cfg.storage].order||{};

                if( Ex.flag[Ex.cfg.storage].order[Ex.func.IOSDate( new Date(Ex.flag.db_time)).split(" ")[0]]===undefined ) return ``;

                list = list||Ex.flag[Ex.cfg.storage].order[Ex.func.IOSDate( new Date(Ex.flag.db_time) ).split(" ")[0]];

                if(list===undefined || list===null) return ``;
                if(Object.keys(list).length===0) return ``;
                if(list===1) return ``;

                
                
                var html = `<table>`;

                for(var id in list)
                {
                    var order = list[id];
                    var detail = ``;
                    var total_price = 0;

                    for(var name in order.list)
                    {
                        
                        var food = order.list[name];
                        detail += `${name} X ${food.count}<BR>`;

                        total_price+=food.count*food.price
                    }

                    html += Ex.temp.OrderDetail({
                        id:list[id].id,
                        time:order.time,
                        detail:detail,
                        total_price:total_price
                    });

                    /*
                    html += `
                        <tr>
                            <td>編號${list[id].id}</td>
                        </tr>
                        <tr>
                            <td>${Ex.func.IOSDate(order.time,{Y:false})}</td>
                        </tr>
                        <tr>
                            <td>${detail}總價${total_price}</td>
                        </tr>
                        <tr>
                            <td><hr></td>
                        </tr>`;
                    */

                        

                }


                html += `</table>`;

                return html;

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


            if(Ex.flag.url.get("ShopId")!==null)
            {
                Ex.flag[Ex.cfg.storage].ShopId = Ex.flag.url.get("ShopId");
                Ex.func.StorageUpd();
                setTimeout(()=>{location.href = location.pathname;},0);
                return;
            }
            

            Ex.DB = firebase;
            Ex.DB.initializeApp({databaseURL:Ex.cfg.db_url});
            Ex.DB = Ex.DB.database();


            Ex.func.DBTime(()=>{


                if(Ex.flag.url.get("Buy")===null)
                {
                    document.body.innerHTML = Ex.temp.ShopPage();

                    if(Ex.flag[Ex.cfg.storage].ShopId!==undefined)
                    Ex.DB.ref(`shop/${Ex.flag[Ex.cfg.storage].ShopId}`).on("value",r=>{


                        r = r.val();
                        if(r===null)
                        {
                            delete Ex.flag[Ex.cfg.storage].ShopId;
                            Ex.func.StorageUpd();
                            setTimeout(()=>{location.href = location.pathname;},0);
                            return;
                        }

                        for(var key in r) Ex.flag[Ex.cfg.storage][key] = r[key];
                        Ex.func.StorageUpd();



                        if(Ex.flag[Ex.cfg.storage].ShopMode!=='ShowOrder')
                            document.querySelector("#Order").innerHTML = Ex.temp.Menu();
        
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



                        for(var key in r) Ex.flag[Ex.cfg.storage][key] = r[key];
                        Ex.flag[Ex.cfg.storage].ShopId = Buy.id;
                        Ex.func.StorageUpd();
        
        
                        document.body.innerHTML = Ex.temp.BuyPage();
        
                        document.querySelector("#OrderList").innerHTML = Ex.temp.OrderList();
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