<template>
<div v-if="product" class="page">

<!-- ================= TOP ================= -->

<div class="product-layout">

<!-- ================= GALLERY ================= -->
<div>

<div class="main-image">
<img :src="currentImage"/>
</div>

<div class="thumb-list">
<div
v-for="(img,i) in product.images"
:key="i"
class="thumb"
:class="{active:currentImage===img}"
@click="currentImage=img"
>
<img :src="img"/>
</div>
</div>

</div>

<!-- ================= BUY BOX ================= -->
<div class="buybox">

<h1 class="title">{{ product.name }}</h1>

<!-- sold -->
<div class="sold">
⭐ {{ product.rating || 4.8 }}
| Đã bán {{ product.sold || 120 }}
</div>

<!-- price -->
<div class="price-box">
<span class="sale">
{{ formatPrice(product.salePrice||product.price) }}₫
</span>

<span v-if="product.salePrice" class="origin">
{{ formatPrice(product.price) }}₫
</span>

<span v-if="discountPercent" class="discount">
-{{discountPercent}}%
</span>
</div>

<!-- voucher -->
<div class="voucher">
🎫 Giảm 50K đơn từ 1tr
</div>

<!-- shipping -->
<div class="shipping">
🚚 Giao từ Cần Thơ • 2-4 ngày
</div>

<!-- stock -->
<div class="stock" :class="{out:product.stock===0}">
{{product.stock>0?"Còn hàng":"Hết hàng"}}
</div>

<!-- quantity -->
<div class="qty">
<span>Số lượng</span>

<button @click="decrease">-</button>
<b>{{quantity}}</b>
<button @click="increase">+</button>
</div>

<!-- actions -->
<div class="actions">

<button class="btn-primary"
:disabled="product.stock===0"
@click="addToCart">
🛒 Thêm vào giỏ
</button>

<button class="btn-success"
@click="buyNow">
⚡ Mua ngay
</button>

<button class="btn-outline"
@click="toggleFavorite">
❤️ Yêu thích
</button>

</div>

<!-- trust -->
<div class="trust">
✔ Hàng chính hãng  
✔ 7 ngày đổi trả  
✔ Bảo hành {{product.warrantyMonths}} tháng
</div>

</div>

</div>

<!-- ================= SHOP ================= -->

<div class="shop-card">

<div>
<b>Laptop Nhựt Anh Store</b>
<p>⭐ 4.9 | 1.2k sản phẩm</p>
</div>

<div>
<button class="btn-outline">Xem shop</button>
<button class="btn-outline">💬 Chat</button>
</div>

</div>

<!-- ================= TABS ================= -->

<div class="tabs">

<div class="tab-header">
<button
v-for="t in tabs"
:key="t"
:class="{active:tab===t}"
@click="tab=t"
>
{{t}}
</button>
</div>

<!-- DESCRIPTION -->
<div v-if="tab==='Mô tả'" class="tab-content">
<p>{{product.description}}</p>
</div>

<!-- SPECS -->
<div v-if="tab==='Thông số'" class="tab-content">

<div
v-for="([key,value]) in specEntries"
:key="key"
class="spec-row"
>
<span>{{formatKey(key)}}</span>
<b>{{value}}</b>
</div>

</div>

<!-- REVIEW -->
<div v-if="tab==='Đánh giá'" class="tab-content">

<div
v-for="r in fakeReviews"
:key="r.id"
class="review"
>
⭐ {{r.star}} — {{r.user}}
<p>{{r.content}}</p>
</div>

</div>

</div>

<!-- ================= RELATED ================= -->

<h2 class="related-title">Có thể bạn cũng thích</h2>

<div class="related">

<div
v-for="item in related"
:key="item._id"
class="card"
@click="goProduct(item._id)"
>
<img :src="item.images[0]"/>
<p>{{item.name}}</p>
<b>{{formatPrice(item.price)}}₫</b>
</div>

</div>

<!-- toast -->
<transition name="toast">
<div v-if="showToast" class="toast">
✅ Đã thêm vào giỏ hàng
</div>
</transition>

</div>
</template>

<script setup>
import {ref,onMounted,computed} from "vue";
import {useRoute,useRouter} from "vue-router";
import ProductService from "@/services/product.service";
import CartService from "@/services/cart.service";

const route=useRoute();
const router=useRouter();

const product=ref(null);
const related=ref([]);

const currentImage=ref("");
const quantity=ref(1);
const showToast=ref(false);

const tabs=["Mô tả","Thông số","Đánh giá"];
const tab=ref("Mô tả");

/* fake review demo */
const fakeReviews=[
{id:1,user:"Nguyễn A",star:5,content:"Sản phẩm rất tốt"},
{id:2,user:"Trần B",star:4,content:"Đóng gói đẹp"}
];

const discountPercent=computed(()=>{
if(!product.value?.salePrice)return 0;
return Math.round(
100-(product.value.salePrice/product.value.price)*100
);
});

const specEntries=computed(()=>{
if(!product.value?.specs)return[];
return Object.entries(product.value.specs)
.filter(([_,v])=>v);
});

const formatPrice=v=>new Intl.NumberFormat("vi-VN").format(v);

const formatKey=k=>
k.replace(/([A-Z])/g," $1")
.replace(/^./,s=>s.toUpperCase());

function increase(){
if(quantity.value<product.value.stock)
quantity.value++;
}

function decrease(){
if(quantity.value>1)
quantity.value--;
}

async function addToCart(){
await CartService.addToCart(product.value._id,quantity.value);

showToast.value=true;
setTimeout(()=>showToast.value=false,2500);
}

async function buyNow(){
await addToCart();
router.push("/checkout");
}

function toggleFavorite(){

let fav=JSON.parse(localStorage.getItem("favorite")||"[]");

fav.includes(product.value._id)
?fav=fav.filter(id=>id!==product.value._id)
:fav.push(product.value._id);

localStorage.setItem("favorite",JSON.stringify(fav));
}

function goProduct(id){
router.push(`/product/${id}`);
}

onMounted(async()=>{

const res=await ProductService.get(route.params.id);

product.value=res;

currentImage.value=
res.images?.[0] ||
"https://via.placeholder.com/600";

related.value=
await ProductService.getRelated(res.category);

});
</script>

<style scoped>

.page{max-width:1200px;margin:auto;padding:30px;}

.product-layout{
display:grid;
grid-template-columns:1.1fr 1fr;
gap:40px;
}

/* gallery */
.main-image img{
width:100%;
height:450px;
object-fit:contain;
border:1px solid #eee;
border-radius:12px;
}

.thumb-list{display:flex;gap:10px;margin-top:10px;}

.thumb{
width:70px;height:70px;
cursor:pointer;border:2px solid transparent;
border-radius:8px;overflow:hidden;
}

.thumb.active{border-color:#2563eb;}

.thumb img{width:100%;height:100%;object-fit:cover;}

/* buybox */
.buybox{
border:1px solid #eee;
padding:24px;border-radius:12px;
background:white;
}

.title{font-size:26px;font-weight:700;}

.price-box{display:flex;gap:10px;align-items:center;}

.sale{font-size:28px;color:#ef4444;font-weight:bold;}

.origin{text-decoration:line-through;color:#999;}

.discount{
background:#ef4444;color:white;
padding:3px 8px;border-radius:6px;
}

.qty{
display:flex;gap:10px;
align-items:center;margin:15px 0;
}

.qty button{
width:32px;height:32px;
border:1px solid #ddd;background:white;
cursor:pointer;
}

.actions{display:flex;gap:10px;margin-top:15px;}

.btn-primary{
flex:1;padding:12px;
background:#2563eb;color:white;border:none;
border-radius:8px;
}

.btn-success{
flex:1;padding:12px;
background:#16a34a;color:white;border:none;
border-radius:8px;
}

.btn-outline{
padding:10px;border:1px solid #ddd;
background:white;border-radius:8px;
cursor:pointer;
}

.trust{
margin-top:15px;
font-size:14px;color:#555;
}

/* shop */
.shop-card{
margin-top:30px;
display:flex;
justify-content:space-between;
border:1px solid #eee;
padding:20px;border-radius:12px;
background:white;
}

/* tabs */
.tabs{margin-top:30px;background:white;padding:20px;border-radius:12px;}

.tab-header button{
margin-right:10px;
padding:10px 15px;
border:none;background:#f3f4f6;
cursor:pointer;
}

.tab-header .active{
background:#2563eb;color:white;
}

.spec-row{
display:flex;
justify-content:space-between;
border-bottom:1px solid #eee;
padding:10px 0;
}

.review{
border-bottom:1px solid #eee;
padding:10px 0;
}

/* related */
.related-title{margin-top:40px;}

.related{
display:grid;
grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
gap:20px;
}

.card{
border:1px solid #eee;
padding:10px;border-radius:12px;
cursor:pointer;background:white;
}

.card img{
width:100%;
height:150px;
object-fit:contain;
}

.toast{
position:fixed;
top:20px;
right:20px;
background:#111827;
color:white;
padding:14px 22px;
border-radius:10px;
}

@media(max-width:900px){
.product-layout{grid-template-columns:1fr;}
}

</style>