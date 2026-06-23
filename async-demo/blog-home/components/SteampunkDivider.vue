<template>
  <div class="steampunk-divider-wrap">
    <div class="steampunk-divider">
      <div class="pipe pipe-left">
        <div class="rivet rivet-1"></div>
        <div class="rivet rivet-2"></div>
        <div class="rivet rivet-3"></div>
      </div>
      <div class="center-gear-wrap">
        <svg class="center-gear" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" stroke-width="3" />
          <rect x="36" y="4" width="8" height="14" rx="2" fill="currentColor" />
          <rect x="36" y="62" width="8" height="14" rx="2" fill="currentColor" />
          <rect x="4" y="36" width="14" height="8" rx="2" fill="currentColor" />
          <rect x="62" y="36" width="14" height="8" rx="2" fill="currentColor" />
          <rect x="12" y="12" width="12" height="8" rx="2" fill="currentColor" transform="rotate(45 18 16)" />
          <rect x="56" y="12" width="12" height="8" rx="2" fill="currentColor" transform="rotate(-45 62 16)" />
          <rect x="12" y="60" width="12" height="8" rx="2" fill="currentColor" transform="rotate(-45 18 64)" />
          <rect x="56" y="60" width="12" height="8" rx="2" fill="currentColor" transform="rotate(45 62 64)" />
          <circle cx="40" cy="40" r="16" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.6" />
          <circle cx="40" cy="40" r="5" fill="currentColor" opacity="0.8" />
        </svg>
        <svg class="mini-gear" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" stroke-width="2" />
          <rect x="17" y="2" width="6" height="8" rx="1" fill="currentColor" />
          <rect x="17" y="30" width="6" height="8" rx="1" fill="currentColor" />
          <rect x="2" y="17" width="8" height="6" rx="1" fill="currentColor" />
          <rect x="30" y="17" width="8" height="6" rx="1" fill="currentColor" />
          <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.7" />
        </svg>
      </div>
      <div class="pipe pipe-right">
        <div class="rivet rivet-1"></div>
        <div class="rivet rivet-2"></div>
        <div class="rivet rivet-3"></div>
      </div>
    </div>
  </div>

</template>

<style lang="scss" scoped>
$steampunk-brass: #c9a96e;
$steampunk-copper: #b87333;
$steampunk-brass-light: #e0c88e;

.steampunk-divider-wrap {
  height: 60px;
  padding-top: 10px;
  position: relative;

  .steampunk-divider {
    width: 100%;
    position: absolute;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
  }
}


.pipe {
  flex: 1;
  height: 6px;
  background: linear-gradient(180deg, $steampunk-brass-light 0%, $steampunk-brass 40%, $steampunk-copper 100%);
  position: relative;
  border-radius: 3px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    width: 14px;
    height: 10px;
    background: linear-gradient(180deg, $steampunk-brass-light, $steampunk-brass);
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
}

.pipe-left {
  &::before {
    left: 30px;
  }

  &::after {
    right: 10px;
  }
}

.pipe-right {
  &::before {
    left: 10px;
  }

  &::after {
    right: 30px;
  }
}

.rivet {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, $steampunk-brass-light, $steampunk-brass);
  top: 0;
  transform: translateY(-50%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.pipe-left .rivet-1 {
  left: 80px;
}

.pipe-left .rivet-2 {
  left: 50%;
}

.pipe-left .rivet-3 {
  right: 60px;
}

.pipe-right .rivet-1 {
  left: 60px;
}

.pipe-right .rivet-2 {
  left: 50%;
}

.pipe-right .rivet-3 {
  right: 80px;
}

.center-gear-wrap {
  width: 80px;
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.center-gear {
  width: 80px;
  height: 80px;
  color: $steampunk-brass;
  animation: gearSpin 12s linear infinite;
  filter: drop-shadow(0 2px 4px rgba(201, 169, 110, 0.4));
}

.mini-gear {
  position: absolute;
  width: 34px;
  height: 34px;
  top: -4px;
  right: -8px;
  color: $steampunk-copper;
  animation: gearSpin 8s linear infinite reverse;
  filter: drop-shadow(0 1px 3px rgba(184, 115, 51, 0.3));
}

@keyframes gearSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
