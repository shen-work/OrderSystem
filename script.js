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
        func:{
            SelectHtml:(obj,val)=>{
                var html = ``;

                for(var v in obj)
                {
                    html += `<option value="${v}">${v},${obj[v]}</option>`
                }

                return html;
            }

        },
        flag:{},
        temp:{
            body:()=>{
                return `
                    <div id="Main">
                        <input type="button" value="點餐">
                        <select>
                        ${Ex.func.SelectHtml(Ex.cfg._menu)}
                        </select>
                        
                        <input type="button" value="結帳">

                        <textarea></textarea>
                    </div>
                `;
            }


        },
        init:()=>{


            
            Ex.DB = firebase;
            Ex.DB.initializeApp({databaseURL:Ex.cfg.db_url});
            Ex.DB = Ex.DB.database();


            document.body.innerHTML = Ex.temp.body();


            navigator.geolocation.getCurrentPosition(function(p) {
                document.querySelector("textarea").value = `latitude:${p.coords.latitude}\nlongitude:${p.coords.longitude}`;
            });



        }
    }

    

    window.onload = ()=>{

        Ex.init();


    }
    

//})();