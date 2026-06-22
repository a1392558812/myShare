<template>
  <div class="load-more">
    <button class="load-more-btn">
      <span class="btn-rivet rivet-tl"></span>
      <span class="btn-rivet rivet-tr"></span>
      <span class="btn-rivet rivet-bl"></span>
      <span class="btn-rivet rivet-br"></span>
      &#9881; 加载更多文章 &#9881;
    </button>
  </div>
</template>

<style lang="scss" scoped>
$bili-pink: #FB7299;
$steampunk-brass-light: #e0c88e;
$border-brass: rgba(201, 169, 110, 0.5);

.load-more {
  margin-top: 32px;
  text-align: center;
}

.load-more-btn {
  position: relative;
  padding: 12px 40px;
  font-size: 14px;
  font-weight: 500;
  color: $steampunk-brass-light;
  background: transparent;
  border: 1px solid $border-brass;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 2px;

  &:hover {
    color: $bili-pink;
    border-color: $bili-pink;
    background: rgba(251, 114, 153, 0.06);
    box-shadow: 0 0 20px rgba(251, 114, 153, 0.15);
  }
}

.btn-rivet {
  position: absolute;
  width: 5px;
  height: 5px;
  background: #c9a96e;
  border-radius: 50%;
}

.rivet-tl {
  top: 4px;
  left: 4px;
}

.rivet-tr {
  top: 4px;
  right: 4px;
}

.rivet-bl {
  bottom: 4px;
  left: 4px;
}

.rivet-br {
  bottom: 4px;
  right: 4px;
}
</style>
