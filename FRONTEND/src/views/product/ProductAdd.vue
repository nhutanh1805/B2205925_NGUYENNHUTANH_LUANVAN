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
<input v-model.number="form.warrantyMonths" type="number" placeholder="Bảo hành (tháng)" class="input"/>

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
/* ⭐ GIỐNG BACKEND 100% */

const CATEGORY_CONFIG = {

tai_nghe:{
label:"Tai nghe",
specs:[
{key:"loai",label:"Loại"},
{key:"ket_noi",label:"Kết nối"},
{key:"thoi_luong_pin",label:"Thời lượng pin"},
{key:"chong_on",label:"Chống ồn"},
{key:"kich_thuoc_driver",label:"Driver"},
{key:"day_tan_so",label:"Dải tần"},
{key:"tro_khang",label:"Trở kháng"},
{key:"micro",label:"Micro"},
{key:"phien_ban_bluetooth",label:"Bluetooth"},
{key:"trong_luong",label:"Trọng lượng"}
]
},

op_lung:{
label:"Ốp lưng",
specs:[
{key:"chat_lieu",label:"Chất liệu"},
{key:"tuong_thich_model",label:"Model"},
{key:"mau_sac",label:"Màu sắc"},
{key:"do_day",label:"Độ dày"},
{key:"chong_soc",label:"Chống sốc"},
{key:"chong_tray",label:"Chống trầy"},
{key:"trong_luong",label:"Trọng lượng"},
{key:"kieu_dang",label:"Kiểu dáng"},
{key:"do_bam",label:"Độ bám"},
{key:"tan_nhiet",label:"Tản nhiệt"}
]
},

cu_sac:{
label:"Củ sạc",
specs:[
{key:"cong_suat",label:"Công suất"},
{key:"so_cong",label:"Số cổng"},
{key:"ho_tro_sac_nhanh",label:"Sạc nhanh"},
{key:"dien_ap_vao",label:"Điện áp vào"},
{key:"dien_ap_ra",label:"Điện áp ra"},
{key:"chat_lieu",label:"Chất liệu"},
{key:"chuan_sac",label:"Chuẩn sạc"},
{key:"an_toan",label:"An toàn"},
{key:"kich_thuoc",label:"Kích thước"},
{key:"trong_luong",label:"Trọng lượng"}
]
},

cap_sac:{
label:"Cáp sạc",
specs:[
{key:"do_dai",label:"Độ dài"},
{key:"loai_dau_cam",label:"Đầu cắm"},
{key:"ho_tro_sac_nhanh",label:"Sạc nhanh"},
{key:"toc_do_truyen",label:"Tốc độ truyền"},
{key:"chat_lieu",label:"Chất liệu"},
{key:"do_ben",label:"Độ bền"},
{key:"chong_dut",label:"Chống đứt"},
{key:"tuong_thich",label:"Tương thích"},
{key:"loi_day",label:"Lõi dây"},
{key:"cong_suat_toi_da",label:"Công suất tối đa"}
]
},

pin_du_phong:{
label:"Pin dự phòng",
specs:[
{key:"dung_luong",label:"Dung lượng"},
{key:"cong_suat_ra",label:"Công suất ra"},
{key:"ho_tro_sac_nhanh",label:"Sạc nhanh"},
{key:"so_cong",label:"Số cổng"},
{key:"dung_luong_thuc",label:"Dung lượng thực"},
{key:"loai_pin",label:"Loại pin"},
{key:"cong_sac_vao",label:"Cổng sạc vào"},
{key:"den_led",label:"Đèn LED"},
{key:"trong_luong",label:"Trọng lượng"},
{key:"an_toan",label:"An toàn"}
]
},

kinh_cuong_luc:{
label:"Kính cường lực",
specs:[
{key:"do_cung",label:"Độ cứng"},
{key:"do_day",label:"Độ dày"},
{key:"chong_vet_van_tay",label:"Chống vân tay"},
{key:"tuong_thich_model",label:"Model"},
{key:"do_trong_suot",label:"Độ trong suốt"},
{key:"chong_vo",label:"Chống vỡ"},
{key:"phu_oleophobic",label:"Phủ oleophobic"},
{key:"vien_kinh",label:"Viền kính"},
{key:"do_phu_man_hinh",label:"Độ phủ màn"},
{key:"do_cong",label:"Độ cong"}
]
},

sac_khong_day:{
label:"Sạc không dây",
specs:[
{key:"cong_suat",label:"Công suất"},
{key:"chuan_sac",label:"Chuẩn sạc"},
{key:"ho_tro_magsafe",label:"MagSafe"},
{key:"hieu_suat",label:"Hiệu suất"},
{key:"khoang_cach_sac",label:"Khoảng cách sạc"},
{key:"nhiet_do_hoat_dong",label:"Nhiệt độ"},
{key:"den_bao",label:"Đèn báo"},
{key:"chat_lieu",label:"Chất liệu"},
{key:"tuong_thich",label:"Tương thích"},
{key:"toc_do_sac",label:"Tốc độ sạc"}
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
salePrice:null,
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

watch(()=>form.category,(category)=>{

const config=CATEGORY_CONFIG[category];

if(!config){
categorySpecs.value=[];
form.specs={};
return;
}

categorySpecs.value=config.specs;

form.specs={};
config.specs.forEach(s=>{
form.specs[s.key]="";
});

});

/* ================= COMPATIBILITY ================= */

const compatibilityInput=ref("");

const addCompatibility=()=>{
if(!compatibilityInput.value.trim())return;
form.compatibility.push(compatibilityInput.value.trim());
compatibilityInput.value="";
};

const removeCompatibility=i=>{
form.compatibility.splice(i,1);
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
form.images.push(e.target.result);
};
reader.readAsDataURL(file);
});
};

const removeImage=i=>{
form.images.splice(i,1);
};

/* ================= SUBMIT ================= */

const submit=async()=>{

if(!form.images.length)
return alert("Phải có ít nhất 1 ảnh");

try{
await ProductService.create({...form});
alert("Thêm sản phẩm thành công!");
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