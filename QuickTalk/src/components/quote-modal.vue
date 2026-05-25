<template>
  <div>
    <van-popup v-model:show="show" closeable round>
      <div class="modal-box">
        <div class="title-block">{{ lists.file_name }}</div>
        <div class="content-block">
          <div class="list-item" v-for="(item, index) in lists.chunks" :key="index">
            <div class="item-title">参考内容{{ index + 1 }}</div>
            <div class="content-body">
              <div class="content-text" v-html="item.content || item"></div>
              <div class="img-box">
                <img v-for="img in item.images" :src="img" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from "vue";
const lists = ref({})
const show = ref(false);

const showPopup = (data) => {
  console.log('参考内容',data.item);
  lists.value = data.item;
  show.value = true;
};

defineExpose({
  showPopup,
});
</script>

<style scoped>
.modal-box {
  width: 80vw;
  border-radius: 8px;
  max-width: 520px;
}
.title-block {
  padding: 16px;
  padding-right: 40px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 1px solid #e8e8e8;
}
.content-block {
  min-height: 300px;
  padding: 16px;
  max-height: 500px;
  overflow: auto;
}
.content-block .list-item {
  margin-bottom: 24px;
}
.content-block .item-title {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #000;
}
.content-block .item-title span {
  color: #8c8c8c;
  font-weight: 400;
}
.content-block .content-body {
  background: #f0f5fc;
  padding: 8px;
  line-height: 22px;
  margin-top: 8px;
  font-size: 13px;
  color: #595959;
  white-space: pre-wrap;
}
.content-block .img-box {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.content-block .img-box img {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
