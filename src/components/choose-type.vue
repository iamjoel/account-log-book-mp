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

<script>
import {inType, outType} from '@/dict.js'
export default {
  props: {
    type: String,
    value: Object
  },
  data() {
    return {
      typeList: [],
      selectedType: {id: 5}
    }
  },
  mounted() {
    this.typeList = this.type === 'in' ? inType : outType
    if(this.value) {
      this.selectedType = {...this.value}
    }
  },
  methods: {
    select(type) {
      this.selectedType = type
      this.$emit('input', type)
    },
    update(value) {
      this.selectedType = value
    }
  }
}
</script>

<style scoped>
.inputSty {
  display: inline-block;
  width: 100%;
  height: 40px;
  line-height: 40px;
  border: none;
  border-bottom: 1px solid #eee;
}

.btn {
  margin: 10px auto;
  width: 90%;
  font-size: 14px;
}
</style>