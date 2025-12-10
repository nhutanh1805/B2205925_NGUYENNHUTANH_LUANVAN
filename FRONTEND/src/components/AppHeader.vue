<template>
  <header class="bg-blue-600 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold">PhoneStore</h1>
        </div>
        <nav class="flex space-x-8">
          <router-link to="/" class="hover:text-blue-200">Trang chủ</router-link>
          <router-link to="/products" class="hover:text-blue-200">Sản phẩm</router-link>
          <router-link to="/cart" class="hover:text-blue-200">Giỏ hàng</router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
</style>