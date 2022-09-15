//https://ordersystem-c18b3-default-rtdb.firebaseio.com/
(()=>{
    var Ex = {
        id:"OrderSystem",
        cfg:{},
        func:{},
        flag:{},
        temp:{},
        init:()=>{


            document.querySelector(`textarea`).value = `window.innerHeight:${window.innerHeight}\nwindow.innerWidth:${window.innerWidth}`;


        }
    }

    

    window.onload = ()=>{

        Ex.init();


    }
    

})();