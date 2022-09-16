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
            ClickEvent:(e)=>{
                
                if(Ex.func[e.target.dataset.event]!==undefined)
                {
                    Ex.func[e.target.dataset.event](e);
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
            Menu:(e)=>{
                
                var mode = e.target.dataset.mode;
                var menu = Ex.flag[Ex.cfg.storage].menu||{};
                var data = {};

                document.querySelectorAll(`[data-input]`).forEach(o=>{

                    data[ o.id ] = ( isNaN(parseInt(o.value)) )?o.value:parseInt(o.value);
                    o.value = '';
                });




                switch (mode){

                    case "AddFood":

                        if(data.name==='' || data.price==='') return;

                        menu[ data.name ] = {
                            name:data.name,
                            price:data.price
                        }
                    break;

                    case "DelFood":

                        delete menu[e.target.id];

                    break;

                    case "SetFood":

                        if(e.target.dataset.edit_id!==undefined)
                        {
                            var edit_id = e.target.dataset.edit_id;
                            
                            if(data.name!==menu[ edit_id ].name) delete menu[ edit_id ];

                            menu[ data.name ] = {
                                name:data.name,
                                price:data.price
                            }

                            e.target.dataset.mode = "AddFood";
                            e.target.value = "新增菜單";
                            e.target.removeAttribute("dataset-edit_id");

                            
                        }
                        else
                        {
                            document.querySelectorAll(`[data-input]`).forEach(o=>{
                                o.value = menu[ e.target.id ][ o.id ];
                            });
    
                            document.querySelector(`[data-mode="AddFood"]`).value = "修改菜單";
    
                            document.querySelector(`[data-mode="AddFood"]`).dataset.edit_id = e.target.id;
    
                            document.querySelector(`[data-mode="AddFood"]`).dataset.mode = "SetFood";

                            setTimeout(()=>{

                                document.querySelectorAll(`table [data-event="Menu"]`).forEach(o=>{
                                    o.setAttribute("disabled","disabled");
                                });
                            },0);

                        }

                    break;


                    case "End":

                        if(Object.keys(menu).length===0) return;

                        if(Ex.flag[Ex.cfg.storage].ShopId!==undefined)
                        {

                            Ex.DB.ref(`shop/${Ex.flag[Ex.cfg.storage].ShopId}/menu`).set(menu);
    

    
    

                        }
                        else
                        {


                            Ex.DB.ref("shop").push({
                                menu:menu
                            }).then(r=>{
    
                                Ex.flag[Ex.cfg.storage].ShopId = r.key;
                                Ex.func.StorageUpd();
    
                            });

                            /*
                            Ex.DB.ref("menu").push({
                                list:menu,
                                time:Ex.cfg.db_time
                            }).then(r=>{
    
                                Ex.flag[Ex.cfg.storage].ShopId = r.key;
                                Ex.func.StorageUpd();
    
                            });
                            */
                            
                        }


                    break;


                }


                Ex.flag[Ex.cfg.storage].menu = menu;

                Ex.func.StorageUpd();
                document.querySelector("#Order").innerHTML = Ex.temp.Menu();


            },
            Buy:(e)=>{

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
                            Ex.func.PopWindow(
                                Ex.temp.CountFood(e.target.id),
                                'CountFood',
                                e);
                          
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
            ShopPage:()=>{
                return `<div id="Main">

                    <input 
                    data-event="Menu" 
                    data-mode="AddFood" type="button" value="新增菜單">

                    <input data-input placeholder="名稱" id="name" type="text" value="">
                    <input data-input placeholder="價錢" id="price" type="number" value="">
                
                
                    <div id="Order">
                        ${Ex.temp.Menu()}
                    </div>

                    <input 
                    data-event="Menu" 
                    data-mode="End" type="button" value="儲存">
                    <input type="button" data-txt="${location.pathname}?ShopId=${Ex.flag[Ex.cfg.storage].ShopId}" data-event="QrCode" value="顯示QRCODE">
                
                
                </div>`;
            },
            BuyPage:()=>{
                return `<div id="Main">

                    <input 
                    data-event="Buy" 
                    data-mode="AddFood" type="button" value="點餐">
                    <select id="food">
                        ${Ex.temp.SelectHtml(Ex.cfg._menu)}
                    </select>
                    <div id="Order">
                        ${Ex.temp.Order()}
                    </div>
                    <input 
                    data-event="Buy" 
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
            Menu:(list = Ex.flag[Ex.cfg.storage].menu)=>{

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
                        ${name}
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
            
            Ex.DB = firebase;
            Ex.DB.initializeApp({databaseURL:Ex.cfg.db_url});
            Ex.DB = Ex.DB.database();

            if(Ex.flag.url.get("ShopId")!==null)
            {
                Ex.flag.local.ShopId = Ex.flag.url.get("ShopId");

                Ex.func.StorageUpd();
            }


            if(Ex.flag.url.get("buy")===null)
            {
                document.body.innerHTML = Ex.temp.ShopPage();

                Ex.DB.ref(`shop/${Ex.flag.local.ShopId}`).on("value",r=>{

                    if(r.val()===null)
                    {
                        delete Ex.flag.local.ShopId;
                        Ex.func.StorageUpd();
                        location.href = location.pathname;
                        return;
                    }

                    Ex.flag[Ex.cfg.storage].menu = r.val().menu;
    
    
                    document.querySelector("#Order").innerHTML = Ex.temp.Menu();
    
                });
            }
            else
            {
                document.body.innerHTML = Ex.temp.BuyPage();

                Ex.DB.ref("order").on("value",r=>{

                    if(r.val()===null) return;

                    Ex.flag.OrderList = r.val();
    
    
                    document.querySelector("#OrderList").innerHTML = Ex.temp.OrderList();
    
                });
            }

            

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