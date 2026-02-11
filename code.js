let items=document.querySelector(".items");
function createitem(ele){
    let template=document.querySelector(".item");

    let copy=template.cloneNode(true);
    copy.style.display="block";
    copy.id=ele.category+"2";
    let bimage=copy.querySelector(".bimage");

    let p1=copy.querySelector(".p1");
    p1.textContent=ele.category;

    let p2=copy.querySelector(".p2");
    p2.textContent=ele.name;

    let p3=copy.querySelector(".p3")
    p3.textContent="$"+ele.price;

    items.append(copy);
}
let hasitems=new Map();
let hasOrderItems=new Set();
let orderItems=document.querySelector(".orderItems");
let cart=document.querySelector(".cart");
let total=0;
function createOrderItem(ele){
    let orderItem=document.querySelector(".orderItem");
    let rate=ele[1].rate;
    rate=rate.replace("$","");
    rate=Number(rate);
    if(!hasOrderItems.has(ele[0])){
        let copy=orderItem.cloneNode(true);
        copy.style.display="block";
        copy.id=ele[0];
        hasOrderItems.add(ele[0]);
        
        let p=copy.querySelector(".orderName");
        p.textContent=ele[1].name;

        console.log(ele);
        let span1=copy.querySelector(".orderAmount");
        let span2=copy.querySelector(".orderRate");
        let span3=copy.querySelector(".orderTotal");

        span1.textContent=ele[1].number+"x";
        span2.textContent="@ "+Number(rate).toFixed(2);
        span3.textContent="$"+Number(rate*ele[1].number).toFixed(2);

        orderItems.append(copy);
        cart.children[4].style.display="flex";
        cart.children[5].style.display="flex";
        cart.children[6].style.display="flex";

        total+=rate*ele[1].number;
        cart.children[4].children[1].textContent="$"+Number(total).toFixed(2);
    }
    else{
        let id=orderItems.querySelector("#"+CSS.escape(ele[0]));
        let span1=id.querySelector(".orderAmount");
        let span3=id.querySelector(".orderTotal");

        let prevnumber=span1.textContent;
        prevnumber=Number(prevnumber.replace("x",""));

        if(ele[1].number>prevnumber){
            total+=(ele[1].number-prevnumber)*rate;
        }
        else{
            total-=(prevnumber-ele[1].number)*rate;
        }

        span1.textContent=ele[1].number+"x";
        span3.textContent="$"+Number(rate*ele[1].number).toFixed(2);

        cart.children[4].children[1].textContent="$"+Number(total).toFixed(2);
    }
}
function addItems(){
    let numberOfItems=document.querySelector(".heading span");
    let totalItems=0;
    let cart=document.querySelector(".cart");
    if(hasitems.size===0){
        cart.children[1].style.display="block";
        cart.children[2].style.display="block";
        numberOfItems.textContent="("+totalItems+")";
        cart.children[4].style.display="none";
        cart.children[5].style.display="none";
        cart.children[6].style.display="none";
        return
    }
    else{
        for(let i of hasitems.values()){
            totalItems+=i.number;
        }
        numberOfItems.textContent="("+totalItems+")";
        if(totalItems>0){
            cart.children[1].style.display="none";
            cart.children[2].style.display="none";
        }
        for(let k of hasitems){
            //console.log(k);
            createOrderItem(k);
        }
    }
}
function displayItems(orderItem,thumbnail,name){
    let temp=null;
    for(let i of orderItem){
        if(i.hasAttribute("id")){
            let template=document.querySelector(".itemDisplay");
            let copy=template.cloneNode(true);
            let image=thumbnail.get(i.id);
            copy.children[0].style.backgroundImage=`url(${image})`;
            copy.children[1].children[0].textContent=name.get(i.id);
            copy.children[1].children[1].textContent=i.children[1].textContent;
            copy.children[1].children[2].textContent=i.children[2].textContent;
            copy.children[2].children[0].textContent=i.children[3].textContent;
            copy.style.display="flex";
            if(!temp){
                template.insertAdjacentElement("afterend",copy);
                temp=template.nextElementSibling;
            }
            else{
                temp.insertAdjacentElement("afterend",copy);
                temp=temp.nextElementSibling;
            }
        }
    }
    let finalDisplay=document.querySelector(".finalDisplay");
    finalDisplay.textContent="$"+Number(total).toFixed(2);
}
function updateBackgrounds(data) {
    document.querySelectorAll('.bimage').forEach((bimage, index) => {
        if(bimage.parentElement.hasAttribute("id")){
            const ele=data[index-1];
            if (window.innerWidth < 800) {
                bimage.style.backgroundImage = `url(${ele.image.mobile})`;
            } 
            else if (window.innerWidth>=800 && window.innerWidth < 1200) {
                bimage.style.backgroundImage = `url(${ele.image.tablet})`;
            } 
            else {
                bimage.style.backgroundImage = `url(${ele.image.desktop})`;
            }
        }
    });
}
fetch("data.json")
    .then(res => res.json())
    .then(data => {
        let thumbnail=new Map();
        let name=new Map();
        for(let k of data){
            thumbnail.set(k.category,k.image.thumbnail);
            name.set(k.category,k.name);
            createitem(k);
        }
        updateBackgrounds(data);
        window.addEventListener('resize',()=>updateBackgrounds(data));
        let notAdded=document.querySelectorAll(".notAdded");
        notAdded.forEach(ele=>{
            let parent=ele.parentElement.parentElement;
            let key=parent.children[2].textContent;
            let rate=parent.children[4].textContent;
            let name=parent.children[3].textContent;
            ele.addEventListener("click",()=>{
                ele.style.display="none";
                ele.nextElementSibling.style.display="flex";
                ele.parentElement.previousElementSibling.style.outline="2px solid hsl(14, 86%, 42%)";
                hasitems.set(key,{"rate":rate,"number":1,"name":name});
                addItems();
            })
        });
        let added=document.querySelectorAll(".added");
        added.forEach(ele=>{
            let first=ele.firstElementChild;
            let key=ele.parentElement.nextElementSibling.textContent;
            first.addEventListener("click",()=>{
                if(first.nextElementSibling.textContent==="1"){
                    ele.style.display="none";
                    ele.parentElement.previousElementSibling.style.outline="none";
                    ele.previousElementSibling.style.display="flex";
                    let id=orderItems.querySelector("#"+CSS.escape(key));
                    let r=hasitems.get(key).rate;
                    r=Number(r.replace("$",""));
                    total-=r;
                    id.remove();
                    hasOrderItems.delete(key);
                    hasitems.delete(key);    
                    addItems();
                }
                else{
                    first.nextElementSibling.textContent=Number(first.nextElementSibling.textContent)-1;
                    const item=hasitems.get(key);
                    if(item){
                        item.number-=1;
                    }
                    addItems();
                }
            });
            let last=ele.lastElementChild;
            last.addEventListener("click",()=>{
                last.previousElementSibling.textContent=Number(last.previousElementSibling.textContent)+1;
                const item=hasitems.get(key);
                if(item){
                    item.number+=1;
                }
                addItems();
            })
        })
        let orderItems=document.querySelector(".orderItems");
        orderItems.addEventListener("click",(e)=>{
            if(e.target.closest(".addedimg2")){
                let ele=e.target.closest(".addedimg2").parentElement;
                hasitems.delete(ele.id);
                hasOrderItems.delete(ele.id);
                let deduction=ele.querySelector((".orderTotal"));
                let number=deduction.textContent
                number=Number(number.replace("$",""));
                total-=number;
                let undo=document.querySelector("#"+CSS.escape(ele.id+"2"));
                undo.children[0].style.outline="none";
                undo.children[1].children[0].style.display="flex";
                undo.children[1].children[1].style.display="none";
                undo.children[1].children[1].children[1].textContent=1;
                ele.remove();
                addItems();
            }
        })
        cart.addEventListener("click",(e)=>{
            if(e.target.closest(".confirm")){
                const overlay = document.createElement("div");
                overlay.classList.add("overlay");
                document.body.appendChild(overlay);
                let confirmation=document.querySelector(".confirmation");
                confirmation.style.display="block";
                let orderItem=document.querySelectorAll(".orderItem");
                displayItems(orderItem,thumbnail,name);
            }
        })
        let main=document.querySelector("main");
        main.addEventListener("click",(e)=>{
            if(e.target.closest(".startNew")){
                const itemDisplay=document.querySelectorAll(".itemDisplay");
                itemDisplay.forEach((ele,index)=>{
                    if(index!==0){
                        ele.remove();
                    }
                });
                const orderItem=document.querySelectorAll(".orderItem");
                orderItem.forEach((ele,index)=>{
                    if(index!==0){
                        ele.remove();
                    }
                })
                for(let i of hasOrderItems){
                    let choosen=document.querySelector("#"+CSS.escape(i)+"2");
                    choosen.children[0].style.outline="none";
                    const a=choosen.querySelector(".added");
                    a.children[1].textContent=1;
                    a.style.display="none";
                    a.previousElementSibling.style.display="flex";
                }
                hasitems.clear();
                hasOrderItems.clear();
                total=0;
                const overlay = document.querySelector(".overlay");
                overlay.remove();
                let confirmation=document.querySelector(".confirmation");
                confirmation.style.display="none";
                addItems();
            }
        })
    })
    .catch(err => console.error(err));

