<template>
  <div class="steampunk-bg">
    <div class="gear gear-1"></div>
    <div class="gear gear-2"></div>
    <div class="gear gear-3"></div>
    <div class="gear gear-4"></div>
    <div class="gear gear-5"></div>
    <div class="gear gear-6"></div>
    <div class="steam-line steam-line-1"></div>
    <div class="steam-line steam-line-2"></div>
  </div>
</template>

<style lang="scss" scoped>
$steampunk-brass: #c9a96e;

.steampunk-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.gear {
  position: absolute;
  border: 2px solid rgba(201, 169, 110, 0.08);
  border-radius: 50%;
  animation: gearSpin 30s linear infinite;

  &::before {
    content: '';
    position: absolute;
    inset: 8px;
    border: 1px solid rgba(201, 169, 110, 0.06);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 20px;
    border: 1px solid rgba(201, 169, 110, 0.04);
    border-radius: 50%;
  }
}

.gear-1 {
  width: 300px;
  height: 300px;
  top: -80px;
  left: -60px;
  animation-duration: 40s;
}

.gear-2 {
  width: 200px;
  height: 200px;
  bottom: -40px;
  right: -30px;
  animation-duration: 25s;
  animation-direction: reverse;
}

.gear-3 {
  width: 400px;
  height: 400px;
  top: 40%;
  left: -120px;
  animation-duration: 50s;
}

.gear-4 {
  width: 250px;
  height: 250px;
  top: 15%;
  right: -80px;
  animation-duration: 35s;
  animation-direction: reverse;
}

.gear-5 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-duration: 20s;
}

.gear-6 {
  width: 180px;
  height: 180px;
  bottom: 15%;
  left: 20%;
  animation-duration: 28s;
  animation-direction: reverse;
}

@keyframes gearSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.steam-line {
  position: absolute;
  width: 1px;
  height: 120px;
  background: linear-gradient(to bottom, rgba(201, 169, 110, 0.15), transparent);

  &.steam-line-1 {
    top: 15%;
    left: 10%;
  }

  &.steam-line-2 {
    top: 55%;
    right: 8%;
    height: 80px;
  }
}
</style>
