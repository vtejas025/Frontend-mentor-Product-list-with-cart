const items=document.querySelector(".items");
const template=items.querySelector(".item");
const totalItems=document.querySelector(".totalItems");
const empty=document.querySelector(".empty");
const order=document.querySelector(".order");
const card=document.querySelector(".card");
const totalAmount=document.querySelector(".totalAmount");
const cartItems=document.querySelector(".cartItems");
const cartTemplate=cartItems.children[0];
const confirmation=document.querySelector(".confirmation");
const overlay=document.querySelector(".overlay");
const confirmationOrderAmount=document.querySelector(".confirmation .totalAmount");
const orderItems=document.querySelector(".orderItems");
const orderTemplate=orderItems.children[0];
const wrapper=confirmation.children[0];
const newOrder=document.querySelector("#newOrder");
let fixedSize=null;
let flag=false;
let state={
    total:0,
    totalAmount:0,
}
let itemState={
    name:null,
    count:0,
    price:0
}
function createItem(ele){
    let copy = template.cloneNode(true);
    let img=copy.children[0];
    let category=copy.children[2];
    let name=copy.children[3];
    let price=copy.children[4];

    copy.id=ele.category;
    img.src=ele["image"]["mobile"];
    category.textContent=ele.category;
    name.textContent=ele.name;
    price.textContent="$" + ele.price;

    copy.classList.add("display");
    items.appendChild(copy);
}
function addNewItem(ele){
    let name=ele.children[3].textContent;
    let price=ele.children[4].textContent;

    let finalPrice=Number(price.replace("$",""));

    state[ele.id]={...itemState};
    state[ele.id].name=name;
    state[ele.id].price=finalPrice;
    state[ele.id].count=1;
    state.total+=1;


    state.totalAmount+=Number(finalPrice);
}
function renderItem(ele,value){
    const sibling=ele.nextElementSibling;
    const bgImage=ele.parentElement.parentElement.children[0];
    
    ele.classList.toggle("display",value);
    sibling.classList.toggle("display",value);
    bgImage.classList.toggle("selected",value);
}
function updateItem(ele,value){
    if(value==="add"){
        state[ele.id].count+=1;
        state.total+=1;
        state.totalAmount+=Number(state[ele.id].price);
    }
    else{
        state[ele.id].count-=1;
        state.total-=1;
        state.totalAmount-=Number(state[ele.id].price);
        if(state[ele.id].count===0){
            delete state[ele.id];
        }
    }
}
function renderUpdatedItem(eTarget,ele){
    if(state[ele.id]){
        let count=eTarget.parentElement.children[1];
        count.textContent=state[ele.id].count;
    }
    else{
        const passedValue=eTarget.parentElement.previousElementSibling;
        renderItem(passedValue,false);
    }
}
function renderCart(){
    totalItems.textContent=state.total;
    empty.classList.toggle("display",state.total!==0);
    order.classList.toggle("display",state.total!==0);

    totalAmount.textContent="$"+state.totalAmount;
}
function addCartItem(ele){
    let copy=cartTemplate.cloneNode(true);
    copy.id=ele.id+"2";
    
    const orderName=copy.children[0];
    const orderNumber=copy.children[1];
    const orderRate=copy.children[2];
    const orderAmount=copy.children[3];

    orderName.textContent=state[ele.id].name;
    orderNumber.textContent=state[ele.id].count+"x";
    orderRate.textContent="@ $" +state[ele.id].price;
    orderAmount.textContent="$" +(state[ele.id].count*state[ele.id].price);

    copy.classList.add("display");
    cartItems.appendChild(copy);
}
function updateCartItem(ele){
    let id=ele.id;
    let cartItem=cartItems.querySelector(`#${CSS.escape(id)}2`);
    
    if(state[ele.id]){
        const orderNumber=cartItem.children[1];
        const orderAmount=cartItem.children[3];

        orderNumber.textContent=state[ele.id].count+"x";
        orderAmount.textContent="$" +(state[ele.id].count*state[ele.id].price);
    }
    else{
        cartItem.remove();
    }
}
function removeCartItem(ele){
    let idCartItem=ele.id;

    let idItem=idCartItem.replace("2","");
    let item=items.querySelector(`#${CSS.escape(idItem)}`);

    state.total-=state[item.id].count;
    state.totalAmount-=state[item.id].count*state[item.id].price;

    delete state[item.id];

    ele.remove();

    return item;
}
function renderRemovedCartItem(item){
    let count=item.querySelector(".count");
    count.textContent=1;

    let passedEle=item.children[1].children[0];
    renderItem(passedEle,false);
}
function createOrderItem(ele,data){
    let copy=orderTemplate.cloneNode(true);
    let newId=ele.id;
    newId=newId.replace("2","");

    let img=copy.children[0];
    let name=copy.children[1].children[0];
    let number=copy.children[1].children[1];
    let rate=copy.children[1].children[2];
    let amount=copy.children[2];

    let result=data.find(obj => obj.category === newId);
    let string=result.image.thumbnail;

    img.style.backgroundImage=`url(${CSS.escape(string)})`;
    name.textContent=state[newId].name;
    number.textContent=state[newId].count + "x";
    rate.textContent="@ $" + state[newId].price;
    amount.textContent="$" + Number(state[newId].price*state[newId].count).toFixed(2);

    copy.classList.add("display");
    orderItems.appendChild(copy);
}
function orderConfirmed(data){

    confirmationOrderAmount.textContent="$"+state.totalAmount.toFixed(2);

    cartItems.childNodes.forEach(ele=>{
        if(ele.id){
            createOrderItem(ele,data);
        }
    });

    overlay.classList.add("display");
    confirmation.classList.add("display");
}
function resize(){

    if(window.innerWidth < 700){
        if(!fixedSize){
        fixedSize=wrapper.offsetHeight;
        }
        if(wrapper.offsetHeight > confirmation.offsetHeight*0.9){
            wrapper.style.maxHeight=confirmation.offsetHeight*0.8+"px";
            wrapper.classList.add("scroll");
        }
        else if(fixedSize < confirmation.offsetHeight*0.9){
            wrapper.style.maxHeight=fixedSize+"px";
            wrapper.classList.remove("scroll");
        }
        else{
            wrapper.style.maxHeight=confirmation.offsetHeight*0.8+"px";
            wrapper.classList.add("scroll");
        }
    }
    else{
        wrapper.style.maxHeight="unset";
        wrapper.classList.remove("scroll");
    }
}
function restart(){

    for(let i of Object.keys(state)){
        if(i!=="total" && i!=="totalAmount"){
            let item=items.querySelector(`#${CSS.escape(i)}`);
            let passedValue=item.children[1].children[0];
            renderItem(passedValue,false);
            delete state[i];
        }
    }

    state.total=0;
    state.totalAmount=0;

    orderItems.innerHTML='';
    orderItems.appendChild(orderTemplate);

    cartItems.innerHTML='';
    cartItems.appendChild(cartTemplate);

    overlay.classList.remove("display");
    confirmation.classList.remove("display");
    
}
function resizeImage(data){

    let pointer=items.children[1];
    for(let i of data){
        let img=pointer.children[0];
        if(window.innerWidth <= 700){
            img.src=i.image.mobile;
        }
        else if(window.innerWidth >= 1300){
            img.src=i.image.desktop;
        }
        else if(window.innerWidth >= 700){
            img.src=i.image.tablet;
        }
        pointer=pointer.nextElementSibling;
    }
    
}
fetch("data.json")
    .then(res=>res.json())
    .then(data=>{

        for(let i of data){
            createItem(i);
        }

        resizeImage(data);

        card.addEventListener("click",(e)=>{

            if(e.target.closest(".notAdded")){
                const ele=e.target.closest(".notAdded");
                addNewItem(ele.parentElement.parentElement);
                renderItem(ele,true);
                renderCart();
                addCartItem(ele.parentElement.parentElement);
            }
            if(e.target.closest(".plus")){
                const ele=e.target.closest(".item");
                updateItem(ele,"add");
                renderUpdatedItem(e.target.closest(".plus"),ele);
                renderCart();
                updateCartItem(ele);
            }
            if(e.target.closest(".minus")){
                const ele=e.target.closest(".item");
                updateItem(ele,"minus");
                renderUpdatedItem(e.target.closest(".minus"),ele);
                renderCart();
                updateCartItem(ele);
            }
            if(e.target.closest(".close")){
                let ele=e.target.closest(".close").parentElement;
                let item=removeCartItem(ele);
                renderCart();
                renderRemovedCartItem(item);
            }
            if(e.target.closest("#confirm")){
                orderConfirmed(data);
                resize();
                flag=true;
            }

        });

        newOrder.addEventListener("click",()=>{
            restart();
            renderCart();
        });

        window.addEventListener("resize",()=>{
            if(flag){
                resize();
            }
            resizeImage(data);
        });
    });
