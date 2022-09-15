//https://ordersystem-c18b3-default-rtdb.firebaseio.com/
/*phone
width:500
height:900
*/
//(()=>{
    var Ex = {
        id:"OrderSystem",
        cfg:{
            db_url:"https://ordersystem-c18b3-default-rtdb.firebaseio.com/"
        },
        func:{},
        flag:{},
        temp:{
            body:()=>{
                return `
                    <div id="Main">
                        <input type="button" value="點餐">
                    </div>
                `;
            }


        },
        init:()=>{


            
            Ex.DB = firebase;
            Ex.DB.initializeApp({databaseURL:Ex.cfg.db_url});
            Ex.DB = Ex.DB.database();


            document.body.innerHTML = Ex.temp.body();



        }
    }

    

    window.onload = ()=>{

        Ex.init();


    }
    

//})();