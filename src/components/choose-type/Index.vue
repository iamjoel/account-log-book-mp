<template>
  <div class="insert m-10rem" border="false">
    <div class="ly ly-multi">
      <div v-for="item in typeList" :key="item.id" style="width: 25%">
        <van-button 
          size="small"
          class="btn"
          style="display: block;"
          round
          :type="item.id === selectedType.id ? 'primary' : 'default'"
          @click="select(item)"
          >
          {{item.name}}
        </van-button>
      </div>
      
    </div>
  </div>
</template>

<script src="./main.js">

</script>

<style scoped src="./style.css"></style>