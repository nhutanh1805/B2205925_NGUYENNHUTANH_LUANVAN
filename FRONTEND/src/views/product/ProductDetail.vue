<template>
<div v-if="product" class="page">

<div class="product-layout">

  <!-- ================= LEFT : IMAGE ================= -->
  <div class="product-gallery">

    <div class="main-image">
      <img :src="currentImage" />
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

  <!-- ================= RIGHT : INFO ================= -->
  <div class="buybox">

    <h1 class="title">{{ product.name }}</h1>

    <!-- PRICE -->
    <div class="price-box">

      <span class="sale">
        {{ formatPrice(product.salePrice || product.price) }}
      </span>

      <span
        v-if="product.salePrice"
        class="origin"
      >
        {{ formatPrice(product.price) }}
      </span>

    </div>

    <!-- STOCK -->
    <div
      class="stock"
      :class="{out:product.stock===0}"
    >
      {{ product.stock>0 ? "Còn hàng" : "Hết hàng" }}
    </div>

    <!-- MINI INFO -->
    <div class="specs-mini">

      <div class="spec-item">
        <span>Thương hiệu</span>
        <b>{{ product.brand }}</b>
      </div>

      <div class="spec-item">
        <span>Danh mục</span>
        <b>{{ product.category }}</b>
      </div>

      <div class="spec-item">
        <span>Xuất xứ</span>
        <b>{{ product.origin }}</b>
      </div>

      <div class="spec-item">
        <span>Bảo hành</span>
        <b>{{ product.warrantyMonths }} tháng</b>
      </div>

    </div>

    <!-- ACTION -->
    <div class="actions">

      <button class="btn-primary">
        Thêm vào giỏ
      </button>

      <button class="btn-success">
        Mua ngay
      </button>

    </div>

  </div>

</div>


<!-- ================= SPEC TABLE ================= -->

<div class="spec-table">

<h2>Thông số kỹ thuật</h2>

<div
  v-for="(value,key) in product.specs"
  :key="key"
  class="spec-row"
>
  <span>{{ key }}</span>
  <b>{{ value }}</b>
</div>

</div>

</div>
</template>

<script setup>
import { ref,onMounted,computed } from "vue";
import { useRoute,useRouter } from "vue-router";
import ProductService from "@/services/product.service";

const route=useRoute();
const router=useRouter();

const product=ref(null);
const currentImage=ref("");

/* ================= PRICE ================= */

const finalPrice=computed(()=>(
product.value?.salePrice||product.value?.price||0
));

const discountPercent=computed(()=>{
if(!product.value?.salePrice)return 0;
return Math.round(
100-(product.value.salePrice/product.value.price)*100
);
});

/* ================= FORMAT ================= */

const formatPrice=v=>
new Intl.NumberFormat("vi-VN").format(v);

const formatKey=k=>
k.replace(/([A-Z])/g," $1")
.replace(/^./,s=>s.toUpperCase());

/* ================= SPECS ================= */

const specEntries=computed(()=>{
if(!product.value?.specs)return[];
return Object.entries(product.value.specs)
.filter(([_,v])=>v);
});

/* ================= DELETE ================= */

const deleteProduct=async()=>{
if(!confirm("Xóa sản phẩm?"))return;
await ProductService.delete(product.value._id);
router.push("/products");
};

/* ================= LOAD ================= */

onMounted(async()=>{

const res=await ProductService.get(route.params.id);

product.value=res;

currentImage.value=
res.images?.length
?res.images[0]
:"https://via.placeholder.com/600x400";

});
</script>

<style scoped>

.page{
max-width:1200px;
margin:auto;
padding:30px;
}

/* ================= LAYOUT ================= */

.product-layout{
display:grid;
grid-template-columns:1.1fr 1fr;
gap:40px;
align-items:start;
}

/* ================= LEFT ================= */

.product-gallery{
display:flex;
flex-direction:column;
gap:14px;
}

.main-image{
border:1px solid #eee;
border-radius:10px;
overflow:hidden;
}

.main-image img{
width:100%;
height:450px;
object-fit:contain;
}

.thumb-list{
display:flex;
gap:10px;
}

.thumb{
width:70px;
height:70px;
border:2px solid transparent;
cursor:pointer;
border-radius:8px;
overflow:hidden;
}

.thumb.active{
border-color:#2563eb;
}

.thumb img{
width:100%;
height:100%;
object-fit:cover;
}

/* ================= RIGHT ================= */

.buybox{
border:1px solid #eee;
padding:24px;
border-radius:12px;
background:white;
}

.title{
font-size:26px;
font-weight:700;
margin-bottom:15px;
}

/* PRICE */

.price-box{
display:flex;
align-items:center;
gap:12px;
margin-bottom:10px;
}

.sale{
font-size:28px;
font-weight:bold;
color:#ef4444;
}

.origin{
text-decoration:line-through;
color:#999;
}

/* STOCK */

.stock{
margin-bottom:15px;
color:green;
}

.stock.out{
color:red;
}

/* MINI SPECS */

.specs-mini{
display:flex;
flex-direction:column;
gap:10px;
margin-top:15px;
}

.spec-item{
display:flex;
justify-content:space-between;
border-bottom:1px solid #f1f5f9;
padding-bottom:6px;
}

/* ACTION */

.actions{
margin-top:25px;
display:flex;
gap:12px;
}

.btn-primary{
flex:1;
padding:12px;
background:#2563eb;
color:white;
border:none;
border-radius:8px;
cursor:pointer;
}

.btn-success{
flex:1;
padding:12px;
background:#16a34a;
color:white;
border:none;
border-radius:8px;
cursor:pointer;
}

/* ================= SPEC TABLE ================= */

.spec-table{
margin-top:50px;
background:white;
padding:25px;
border:1px solid #eee;
border-radius:12px;
}

.spec-table h2{
margin-bottom:20px;
}

.spec-row{
display:flex;
justify-content:space-between;
padding:10px 0;
border-bottom:1px solid #f3f4f6;
}

/* ================= MOBILE ================= */

@media(max-width:900px){
.product-layout{
grid-template-columns:1fr;
}
}

</style>