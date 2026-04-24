<template>
<div class="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">

<h1 class="text-3xl font-bold mb-6">
  Thêm phụ kiện công nghệ
</h1>

<form @submit.prevent="submit" class="space-y-6">

<!-- ================= BASIC ================= -->

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">

<input v-model="form.name" required placeholder="Tên sản phẩm" class="input"/>
<input v-model="form.slug" required placeholder="Slug" class="input"/>

<input v-model="form.shortDescription" placeholder="Mô tả ngắn" class="input"/>
<input v-model="form.description" placeholder="Mô tả chi tiết" class="input"/>

<input v-model.number="form.price" type="number" placeholder="Giá gốc" class="input"/>
<input v-model.number="form.salePrice" type="number" placeholder="Giá KM" class="input"/>

<input v-model="form.sku" placeholder="SKU" class="input"/>
<input v-model.number="form.stock" type="number" placeholder="Tồn kho" class="input"/>

<input v-model="form.brand" placeholder="Hãng" class="input"/>

<!-- ===== CATEGORY SELECT ===== -->
<select v-model="form.category" class="input">
<option disabled value="">-- Chọn danh mục --</option>

<option
v-for="(cat,key) in CATEGORY_CONFIG"
:key="key"
:value="key"
>
{{ cat.label }}
</option>

</select>

<input v-model="form.origin" placeholder="Xuất xứ" class="input"/>
<input v-model.number="form.warrantyMonths" type="number" placeholder="Bảo hành" class="input"/>

</div>

<!-- ================= COMPATIBILITY ================= -->

<div>
<h2 class="font-semibold mb-2">Thiết bị tương thích</h2>

<input
v-model="compatibilityInput"
class="input"
placeholder="Enter để thêm"
@keydown.enter.prevent="addCompatibility"
/>

<div class="flex flex-wrap gap-2 mt-3">
<span
v-for="(item,index) in form.compatibility"
:key="index"
class="px-3 py-1 bg-gray-200 rounded-full cursor-pointer"
@click="removeCompatibility(index)"
>
{{ item }} ✕
</span>
</div>
</div>

<!-- ================= DYNAMIC SPECS ================= -->

<div v-if="categorySpecs.length">
<h2 class="font-semibold mb-2">
Thông số kỹ thuật
</h2>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">

<div
v-for="field in categorySpecs"
:key="field.key"
>

<input
v-model="form.specs[field.key]"
:placeholder="field.label"
class="input"
/>

</div>

</div>
</div>

<!-- ================= OPTION ================= -->

<div class="flex gap-6">
<label class="flex items-center gap-2">
<input type="checkbox" v-model="form.isFeatured"/>
Nổi bật
</label>

<label class="flex items-center gap-2">
<input type="checkbox" v-model="form.isActive"/>
Hiển thị
</label>
</div>

<!-- ================= IMAGE ================= -->

<div>
<h2 class="font-semibold mb-2">Ảnh sản phẩm</h2>

<div
class="border-2 border-dashed rounded-lg p-4 flex flex-wrap gap-4 cursor-pointer hover:border-blue-500"
@click="$refs.fileInput.click()"
@drop.prevent="handleDrop"
@dragover.prevent
>

<div
v-for="(img,index) in form.images"
:key="index"
class="relative w-24 h-24 border rounded overflow-hidden"
>
<img :src="img" class="w-full h-full object-cover"/>

<button
type="button"
class="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full"
@click.stop="removeImage(index)"
>
×
</button>

</div>

<div class="w-24 h-24 flex items-center justify-center text-gray-400">
+ Thêm
</div>

<input
ref="fileInput"
type="file"
multiple
accept="image/*"
class="hidden"
@change="handleFileSelect"
/>

</div>
</div>

<!-- ================= SUBMIT ================= -->

<button
type="submit"
class="w-full bg-green-600 text-white py-3 rounded-lg text-xl hover:bg-green-700"
>
THÊM PHỤ KIỆN
</button>

</form>
</div>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import ProductService from "@/services/product.service";

const router = useRouter();

/* ================= CATEGORY CONFIG ================= */

const CATEGORY_CONFIG = {

tai_nghe:{
label:"Tai nghe",
specs:[
{key:"type",label:"Loại tai nghe"},
{key:"connectivity",label:"Kết nối"},
{key:"batteryLife",label:"Thời lượng pin"},
{key:"noiseCancelling",label:"Chống ồn"}
]
},

cu_sac:{
label:"Củ sạc",
specs:[
{key:"power",label:"Công suất"},
{key:"ports",label:"Cổng sạc"},
{key:"fastCharge",label:"Sạc nhanh"}
]
},

op_lung:{
label:"Ốp lưng",
specs:[
{key:"material",label:"Chất liệu"},
{key:"compatibleModel",label:"Dòng máy"},
{key:"color",label:"Màu sắc"}
]
},

cap_sac:{
label:"Cáp sạc",
specs:[
{key:"length",label:"Chiều dài"},
{key:"connectorType",label:"Loại đầu"},
{key:"fastChargeSupport",label:"Hỗ trợ sạc nhanh"}
]
}

};

/* ================= FORM ================= */

const form = reactive({
name:"",
slug:"",
shortDescription:"",
description:"",
price:0,
salePrice:0,
sku:"",
stock:0,
brand:"",
category:"",
compatibility:[],
images:[],
specs:{},
origin:"Việt Nam",
warrantyMonths:12,
isFeatured:false,
isActive:true
});

/* ================= CATEGORY WATCH ================= */

const categorySpecs = ref([]);

watch(()=>form.category,(newCategory)=>{

const config=CATEGORY_CONFIG[newCategory];

if(!config){
categorySpecs.value=[];
form.specs={};
return;
}

categorySpecs.value=config.specs;

form.specs={};
config.specs.forEach(f=>{
form.specs[f.key]="";
});

});

/* ================= COMPATIBILITY ================= */

const compatibilityInput=ref("");

const addCompatibility=()=>{
if(!compatibilityInput.value)return;
form.compatibility.push(compatibilityInput.value);
compatibilityInput.value="";
};

const removeCompatibility=index=>{
form.compatibility.splice(index,1);
};

/* ================= IMAGE ================= */

const handleFileSelect=e=>{
processFiles([...e.target.files]);
};

const handleDrop=e=>{
processFiles([...e.dataTransfer.files]);
};

const processFiles=files=>{

files.forEach(file=>{

const img=new Image();
const reader=new FileReader();

reader.onload=e=>img.src=e.target.result;

img.onload=()=>{

const canvas=document.createElement("canvas");
const ctx=canvas.getContext("2d");

const MAX_WIDTH=800;
const scale=MAX_WIDTH/img.width;

canvas.width=MAX_WIDTH;
canvas.height=img.height*scale;

ctx.drawImage(img,0,0,canvas.width,canvas.height);

const compressed=canvas.toDataURL("image/jpeg",0.6);

form.images.push(compressed);
};

reader.readAsDataURL(file);

});
};

const removeImage=index=>{
form.images.splice(index,1);
};

/* ================= SUBMIT ================= */

const submit=async()=>{

if(!form.images.length)
return alert("Phải có ít nhất 1 ảnh");

try{
await ProductService.create(form);
alert("Thêm phụ kiện thành công!");
router.push("/products");
}catch(err){
alert(err.response?.data?.message||err.message);
}

};
</script>

<style scoped>
.input{
@apply border border-gray-300 rounded-lg px-4 py-3 w-full
focus:outline-none focus:border-blue-500;
}
</style>