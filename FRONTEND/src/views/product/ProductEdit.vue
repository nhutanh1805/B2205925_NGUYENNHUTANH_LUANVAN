<template>
<div v-if="product" class="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">

<h1 class="text-3xl font-bold mb-6">
Chỉnh sửa sản phẩm
</h1>

<form @submit.prevent="submit" class="space-y-6">

<!-- ================= BASIC ================= -->

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">

<input v-model="product.name" required placeholder="Tên sản phẩm" class="input"/>
<input v-model="product.slug" required placeholder="Slug" class="input"/>

<input v-model="product.shortDescription" placeholder="Mô tả ngắn" class="input"/>
<input v-model="product.description" placeholder="Mô tả chi tiết" class="input"/>

<input v-model.number="product.price" type="number" placeholder="Giá gốc" class="input"/>
<input v-model.number="product.salePrice" type="number" placeholder="Giá KM" class="input"/>

<input v-model="product.sku" placeholder="SKU" class="input"/>
<input v-model.number="product.stock" type="number" placeholder="Tồn kho" class="input"/>

<input v-model="product.brand" placeholder="Hãng" class="input"/>

<select v-model="product.category" class="input">
<option disabled value="">-- Chọn danh mục --</option>

<option
v-for="(cat,key) in CATEGORY_CONFIG"
:key="key"
:value="key"
>
{{ cat.label }}
</option>

</select>

<input v-model="product.origin" placeholder="Xuất xứ" class="input"/>
<input v-model.number="product.warrantyMonths" type="number" placeholder="Bảo hành" class="input"/>

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
v-for="(item,index) in product.compatibility"
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
v-model="product.specs[field.key]"
:placeholder="field.label"
class="input"
/>
</div>

</div>
</div>

<!-- ================= OPTION ================= -->

<div class="flex gap-6">
<label class="flex items-center gap-2">
<input type="checkbox" v-model="product.isFeatured"/>
Nổi bật
</label>

<label class="flex items-center gap-2">
<input type="checkbox" v-model="product.isActive"/>
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
v-for="(img,index) in product.images"
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
class="w-full bg-blue-600 text-white py-3 rounded-lg text-xl hover:bg-blue-700"
>
CẬP NHẬT
</button>

</form>
</div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductService from "@/services/product.service";

const route = useRoute();
const router = useRouter();

const product = ref(null);
const categorySpecs = ref([]);
const compatibilityInput = ref("");

/* ================= CATEGORY CONFIG ================= */

const CATEGORY_CONFIG = window.CATEGORY_CONFIG || {}; 
// 👉 dùng chung config với Add (có thể import file riêng)

/* ================= LOAD PRODUCT ================= */

onMounted(async () => {

const data = await ProductService.get(route.params.id);

data.images ||= [];
data.specs ||= {};
data.compatibility ||= [];

product.value = data;

initSpecs(data.category);

});

/* ================= INIT SPECS ================= */

const initSpecs = (category) => {

const config = CATEGORY_CONFIG[category];

if(!config){
categorySpecs.value=[];
return;
}

categorySpecs.value=config.specs;

config.specs.forEach(s=>{
if(!product.value.specs[s.key])
product.value.specs[s.key]="";
});

};

/* ================= WATCH CATEGORY ================= */

watch(()=>product.value?.category,(newCat)=>{

if(!product.value) return;

product.value.specs={};
initSpecs(newCat);

});

/* ================= COMPATIBILITY ================= */

const addCompatibility=()=>{
if(!compatibilityInput.value.trim())return;
product.value.compatibility.push(compatibilityInput.value.trim());
compatibilityInput.value="";
};

const removeCompatibility=i=>{
product.value.compatibility.splice(i,1);
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
const reader=new FileReader();
reader.onload=e=>{
product.value.images.push(e.target.result);
};
reader.readAsDataURL(file);
});
};

const removeImage=i=>{
product.value.images.splice(i,1);
};

/* ================= SUBMIT ================= */

const submit = async () => {

if(!product.value.images.length)
return alert("Phải có ít nhất 1 ảnh");

try{
await ProductService.update(route.params.id,product.value);
alert("Cập nhật thành công!");
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