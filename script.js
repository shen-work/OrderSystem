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

//餐點數量調整UI


//(()=>{
    var Ex = {
        id:"OrderSystem",
        cfg:{
            db_url:"https://ordersystem-c18b3-default-rtdb.firebaseio.com/",
            db_time:firebase.database.ServerValue.TIMESTAMP,
            storage:"local",
            order_status:{
                0:"準備中",
                1:"可取餐",
                2:"已取餐",
                3:"取消",
                4:"驗證中"
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
            AddEvent:(selector,type,event)=>{

                var element = document.querySelectorAll(selector);

                if(element.length===0)
                {
                    setTimeout(()=>{
                        Ex.func.AddEvent(selector,type,event);
                    },0);
                    return;
                }

                for(var i=0;i<element.length;i++)
                {
                    if(element[i]===null || element[i]===undefined)
                    {
                        setTimeout(()=>{
                            Ex.func.AddEvent(selector,type,event);
                        },0);
                        break;
                    }
                    element[i].addEventListener(type,event);
                }

            },
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
            SpeakMsg:(e)=>{

                e = e||{};

                if(e.type==="click")
                {
                    Ex.flag.speak_on = !Ex.flag.speak_on;
                    e.target.value = (Ex.flag.speak_on)?"關閉語音通知":"開啟語音通知";

                    return;
                }
                

                if(Ex.flag.speak_on)
                {
                    speechSynthesis.speak(new SpeechSynthesisUtterance(Ex.flag.msg||'測試語音'));
                }

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

                        Ex.flag.day = Ex.func.IOSDate(new Date(Ex.flag.db_time)).split(" ")[0];


                        if( typeof(func)==="function" ) func();
                    });

                });

            },
            System:(e)=>{

                var mode = e.target.dataset.mode;

                switch (mode)
                {
                    case "Clear":

                        Ex.flag[Ex.cfg.storage] = {};

                        Ex.func.StorageUpd();

                        location.reload();

                    break;

                }


            },
            ShopRegister:(e)=>{

                var mode = e.target.dataset.mode;

                var data = {};

                document.querySelectorAll(`[data-input]`).forEach(o=>{

                    data[ o.id ] = ( isNaN(parseInt(o.value)) )?o.value:parseInt(o.value);
                    o.value = '';
                    
                });

                switch (mode)
                {
                    case "Register":

                        Ex.DB.ref("shop").push({

                            shop_name:data.shop_name

                        }).then(r=>{

                            Ex.flag.storage.ShopId = r.key;
                            Ex.func.StorageUpd();

                            location.reload();

                        });

                    break;

                }


            },
            OrderStatus:(e)=>{

                var mode = e.target.dataset.mode;


                switch (mode)
                {
                    case "OrderStatusSelect":

                        Ex.flag.storage.OrderStatusSelect = parseInt(e.target.value);
                        Ex.func.StorageUpd();
                        

                    break;


                    case "OrderStatusSet":

                        var upd = {
                            status:parseInt(e.target.dataset.value),
                        };
        
                        /*
                        Ex.DB.ref(`shop/${Ex.flag.storage.ShopId}/order/${Ex.flag.day}/${e.target.dataset.db_id}/status`).set( status );
                        */

                        if(upd.status===0) upd.time = Ex.flag.db_time;
                       
        
                        if(upd.status===1)
                        {
                            
                            Ex.flag.msg = `編號${e.target.dataset.order_id}的餐點可以取餐了`;
        
                            Ex.func.SpeakMsg();
                        }

                        Ex.DB.ref(`shop/${Ex.flag.storage.ShopId}/order/${Ex.flag.day}/${e.target.dataset.db_id}`).update(upd);

                    break;

                    case "OrderRest":

                        delete Ex.flag.storage.BuyId;
                        Ex.func.StorageUpd();

                    break;

                    case "Verify":

                        var code = document.querySelector("#VerifyCode");

                        if(code!==null)
                        {
                            if( parseInt(Ex.flag.storage.order[Ex.flag.day][Ex.flag.storage.BuyId].verify) === parseInt(code.value) )
                            {

                                Ex.DB.ref(`shop/${Ex.flag.storage.ShopId}/order/${Ex.flag.day}/${Ex.flag.storage.BuyId}`).update( {
                                    time:Ex.flag.db_time,
                                    status:0
                                } );
                            }
                            
                            return;
                        }

                        
                        Ex.func.PopWindow(`

                        <input type="number" id="VerifyCode" placeholder="驗證碼">
                        <input type="button" 
                        data-event="OrderStatus" 
                        data-mode="Verify" value=" 驗 證 ">

                        `,`Verify`,e);

                    

                    break;
                }

                document.body.innerHTML = Ex.temp.ShopPage();

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

                    case "ShowOrderMode":


                    break;

                    
                }

                if(Object.keys(shop.menu).length>0 && mode!=="ShopMode")
                {
                    Ex.flag.storage.shop_name = data.shop_name;

                    Ex.func.DBTime(()=>{

                        shop.order[ Ex.flag.day ] = shop.order[ Ex.flag.day ]||{};

                        

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

                            return;
                        }


                    break;

                    case "End":
                        if(Object.keys(buy_order).length>0)
                        {
                            Ex.DB.ref(`shop/${Ex.flag.storage.ShopId}/order/${Ex.flag.day}`).push({
                                id:Object.keys(Ex.flag.storage.order[Ex.flag.day]||{}).length+1,
                                list:buy_order,
                                verify:(new Date().getTime()).toString().substr(-4),
                                //time:Ex.cfg.db_time,
                                status:4
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

                document.body.innerHTML = Ex.temp.BuyPage();


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

                if(IOSDate===undefined) return opt.msg||``;

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
            ShopRegister:()=>{

                return `<div id="Main">

                    

                    <input data-input id="shop_name" placeholder="店名" type="text" value="">

                    <input 
                    data-event="ShopRegister" 
                    data-mode="Register" type="button" value="新增店家">
                
                </div>`;

            },
            ShopPage:()=>{

                
                var Buy = btoa(JSON.stringify({
                    id:Ex.flag.storage.ShopId,
                    day:Ex.func.IOSDate(new Date(Ex.flag.db_time)).split(" ")[0]
                }));


                setTimeout(()=>{
                    Ex.func.AddEvent("#ShowOrderMode","change",Ex.func.OrderStatus);
                },100);
                

                return `<div id="Main">

                    <input 
                    data-event="System" 
                    data-mode="Clear" type="button" value="清除資料">
                 

                    <input 
                    data-event="Menu" 
                    data-mode="ShopMode" type="button" value="${(Ex.flag.storage.ShopMode!=='ShowOrder')?`顯示定單`:"顯示菜單"}">

                    

                    <input type="button" data-txt="${location.origin}${location.pathname}?ShopId=${Ex.flag.storage.ShopId}" data-event="QrCode" value="店家用QRCODE">

                    <input type="button" data-txt="${location.origin}${location.pathname}?Buy=${Buy}" data-event="QrCode" value="客人用QRCODE">

                    <input type="button" data-event="SpeakMsg" value="${(Ex.flag.speak_on)?"關閉語音通知":"開啟語音通知"}">

                    ${(Ex.flag.storage.ShopMode==='ShowOrder')?`<select id="ShowOrderMode" data-mode="OrderStatusSelect"><option value="-1">全部</option>${Object.values(Ex.cfg.order_status).map((v,k)=>{return `<option ${(parseInt(Ex.flag.storage.OrderStatusSelect)===k)?`selected="selected`:``} value="${k}">${v}</option>`;}).join("")}</select>`:``}

                    ${(Ex.flag.storage.ShopMode!=='ShowOrder')?Ex.temp.ShowMenu():Ex.temp.OrderList()}
                
                </div>`;


            },
            ShowMenu:()=>{

                return `
                    <input 
                    data-event="Menu" 
                    data-mode="AddFood" type="button" value="新增菜單">

                    <input data-input placeholder="名稱" id="name" type="text" value="">
                    <input data-input placeholder="價錢" id="price" type="number" value="">

                    <input data-input id="shop_name" placeholder="店名" type="text" value="${Ex.flag.storage.shop_name||``}">
                
                
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


                html += `</table>`;

                return html;

            },
            OrderList:()=>{


                Ex.flag.storage.order = Ex.flag.storage.order||{};

                var list = Ex.flag.storage.order[Ex.flag.day]||{};

                if(list===undefined || list===null) return `undefined`;
                if(Object.keys(list).length===0) return ``;
                if(list===1) return `1`;



                Ex.flag.storage.OrderStatusSelect = (Ex.flag.storage.OrderStatusSelect===undefined)?-1:Ex.flag.storage.OrderStatusSelect;


                for(var db_id in list) list[db_id].db_id = db_id;

                list = Object.values(list);
                list.sort( (a,b)=>{

                    return b.id - a.id  ;

                });
                
                
                var html = `<table>`;

                for(var i=0;i<list.length;i++)
                {

                    if(Ex.flag.storage.OrderStatusSelect!==list[i].status && Ex.flag.storage.OrderStatusSelect!==-1) continue;

                    
                    html += Ex.temp.OrderDetail(list[i],{db_id:list[i].db_id});

                }


                html += `</table>`;

                return html;

            },
            BuyPage:()=>{

                Ex.flag.storage.OrderStatusSelect = 0;

                return `<div id="Main">


                    ${(Ex.flag.storage.BuyId!==undefined)?Ex.temp.BuyOrder():Ex.temp.SelectFood()}
                        

                    <div id="OrderList">

                    ${Ex.temp.OrderList()}

                    </div>



                </div>

                    
                `;
            },
            BuyOrder:()=>{


                if(Ex.flag.storage.order[Ex.flag.day]===undefined)
                {
                    delete Ex.flag.storage.BuyId;
                    Ex.func.StorageUpd();
                    setTimeout(()=>{location.reload();},0);
                    return;
                }

                var order = Ex.flag.storage.order[Ex.flag.day][ Ex.flag.storage.BuyId ];

                if(order===undefined)
                {
                    delete Ex.flag.storage.BuyId;
                    Ex.func.StorageUpd();
                    setTimeout(()=>{location.href = location.pathname;},0);
                    return;
                }

                return `
                <table>

                ${Ex.temp.OrderDetail(order,{db_id:Ex.flag.storage.BuyId})}

                
                
                </table>
                
                
                `;
            },
            SelectFood:()=>{

                var disabled = (Ex.flag.storage.menu===undefined)?`disabled="disabled"`:``;


                return `
                    <input 
                    data-event="Buy" 
                    data-mode="AddFood" ${disabled} type="button" value="點餐">
                    <select id="food">
                        ${Object.values(Ex.flag.storage.menu||{}).map(food=>{return `<option value="${food.name}">${food.name},${food.price}</option>`;}).join("")}
                    </select>
                    <div id="Order">
                        ${Ex.temp.Order()}
                    </div>
                    <input 
                    data-event="Buy" 
                    data-mode="End" ${disabled} type="button" value="結帳">
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
            OrderDetail:(data,opt)=>{


                var detail = `餐點：<BR><div class="order_detail">`;
                var total_price = 0;
                for(var name in data.list)
                {
                    
                    var food = data.list[name];
                    detail += `${name} * ${food.count} = ${food.count*food.price}<BR>`;

                    total_price+=food.count*food.price
                }
                detail += `</div>`



                var verify_menu = ``;

                if(Ex.flag.storage.user==="shop")
                {
                    verify_menu = `<input type="button" value="驗證碼：${data.verify}">`;

                }
                else{

                    if(Ex.flag.storage.BuyId===opt.db_id && data.status===4){

                        verify_menu = `<input type="button" 
                        data-event="OrderStatus" 
                        data-mode="Verify" value="輸入驗證碼">`;
                    }
                }

                


                return `

                ${(Ex.flag.storage.user==="shop")?`
                <tr>
                    <td class="order_menu">

                    ${Object.values(Ex.cfg.order_status).map((v,k)=>{return `<input type="button" 
                    data-mode="OrderStatusSet" 
                    data-event="OrderStatus" 
                    data-db_id="${opt.db_id}" 
                    data-order_id="${data.id}" 
                    data-value="${k}" value="${v}">`;}).join("")}


                    
                    </td>
                </tr>`:``}

                
                <tr>
                    <td>編號：${data.id}</td>
                </tr>
                <tr>
                    <td>時間：${Ex.func.IOSDate(data.time,{Y:false,msg:'驗證中'})}</td>
                </tr>
                <tr>
                    <td>${detail}總價：${total_price}</td>
                </tr>
                <tr>
                    <td>狀態：${Ex.cfg.order_status[data.status||0]}<BR>

                    ${verify_menu}
                    
                    ${((data.status===2 || data.status===3) && Ex.flag.storage.user==="buy")?`
                    <input type="button" 
                        data-mode="OrderRest" 
                        data-event="OrderStatus" value="再次點餐">
                    `:``}
                    
                    
                    <hr></td>
                </tr>
                
                
                
                `;
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


                if(Ex.flag.url.get("Buy")===null )
                {
                    if(Ex.flag.storage.ShopId===undefined)
                    {
                        document.body.innerHTML = Ex.temp.ShopRegister();

                    }
                    else
                    {
                        Ex.DB.ref(`shop/${Ex.flag.storage.ShopId}`).on("value",r=>{

                            r = r.val()||{};
                            r.order = r.order||{};
                            r.memu = r.memu||{};

                            /*
                            if(r===null)
                            {
                                delete Ex.flag.storage.ShopId;
                                Ex.func.StorageUpd();
                                setTimeout(()=>{location.href = location.pathname;},0);
                                return;
                            }
                            */

    
                            var online_order = Object.values(r.order[Ex.flag.day]||{});
                            
                            
                            var time = Ex.func.IOSDate(Ex.flag.db_time,{
                                Y:false,M:false,D:false
                            });
                            
                            
                            var new_order = online_order.pop()||{};
    
                            if(new_order.status===0)
                            {
                                Ex.flag.msg = `${time}有新定單,`;
    
                                for(var food in new_order.list)
                                {
                                    Ex.flag.msg+= `${food}${new_order.list[food].count}份,`;
                                }
    
                                Ex.func.SpeakMsg();
                            }
                            
    
    
                            for(var key in r) Ex.flag.storage[key] = r[key];
                            Ex.flag.storage.user = "shop";
                            Ex.func.StorageUpd();
    
    
                            document.body.innerHTML = Ex.temp.ShopPage();
                            
                            
                        });

                    }

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