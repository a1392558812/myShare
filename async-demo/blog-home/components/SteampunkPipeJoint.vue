<template>
  <div class="steampunk-pipe-joint">
    <div class="joint-pipe joint-left">
      <div class="valve-cap"></div>
      <div class="pipe-segment seg-1"></div>
      <div class="pipe-joint-flange"></div>
      <div class="pipe-segment seg-2"></div>
    </div>

    <div class="steam-emitter">
      <div class="emitter-body"></div>
      <div class="emitter-nozzle"></div>
    </div>

    <div class="joint-pipe joint-right">
      <div class="pipe-segment seg-1"></div>
      <div class="pipe-joint-flange"></div>
      <div class="pipe-segment seg-2"></div>
      <div class="valve-cap"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$steampunk-brass: #c9a96e;
$steampunk-copper: #b87333;
$steampunk-brass-light: #e0c88e;
$steampunk-brass-dark: #a08040;

.steampunk-pipe-joint {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  margin-top: 20px;
  overflow: hidden;
}

.joint-pipe {
  flex: 1;
  display: flex;
  align-items: center;
  height: 8px;
}

.pipe-segment {
  flex: 1;
  height: 6px;
  background: linear-gradient(180deg, $steampunk-brass-light 0%, $steampunk-brass 40%, $steampunk-copper 100%);
  border-radius: 3px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.pipe-joint-flange {
  width: 16px;
  height: 14px;
  background: linear-gradient(180deg, $steampunk-brass-light, $steampunk-brass-dark);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, $steampunk-brass-light, $steampunk-brass);
    top: 50%;
    transform: translateY(-50%);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  &::before {
    left: 3px;
  }

  &::after {
    right: 3px;
  }
}

.valve-cap {
  width: 20px;
  height: 20px;
  background: radial-gradient(circle at 35% 35%, $steampunk-brass-light, $steampunk-brass-dark);
  border-radius: 50%;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $steampunk-copper;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.3);
  }
}

.joint-left {
  justify-content: flex-end;
}

.joint-right {
  justify-content: flex-start;
}

.steam-emitter {
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex-shrink: 0;
}

.emitter-body {
  width: 32px;
  height: 16px;
  background: linear-gradient(180deg, $steampunk-brass-light, $steampunk-brass-dark);
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.emitter-nozzle {
  width: 14px;
  height: 8px;
  background: $steampunk-copper;
  border-radius: 2px 2px 4px 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
</style>
