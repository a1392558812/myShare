<template>
  <div class="steampunk-corner-ornament">
    <div class="corner corner-tl">
      <div class="bracket"></div>
      <svg class="micro-gear" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" />
        <rect x="10" y="1" width="4" height="5" rx="1" fill="currentColor" />
        <rect x="10" y="18" width="4" height="5" rx="1" fill="currentColor" />
        <rect x="1" y="10" width="5" height="4" rx="1" fill="currentColor" />
        <rect x="18" y="10" width="5" height="4" rx="1" fill="currentColor" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.8" />
      </svg>
    </div>
    <div class="corner corner-tr">
      <div class="bracket"></div>
      <svg class="micro-gear" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" />
        <rect x="10" y="1" width="4" height="5" rx="1" fill="currentColor" />
        <rect x="10" y="18" width="4" height="5" rx="1" fill="currentColor" />
        <rect x="1" y="10" width="5" height="4" rx="1" fill="currentColor" />
        <rect x="18" y="10" width="5" height="4" rx="1" fill="currentColor" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.8" />
      </svg>
    </div>
    <div class="corner corner-bl">
      <div class="bracket"></div>
      <svg class="micro-gear" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" />
        <rect x="10" y="1" width="4" height="5" rx="1" fill="currentColor" />
        <rect x="10" y="18" width="4" height="5" rx="1" fill="currentColor" />
        <rect x="1" y="10" width="5" height="4" rx="1" fill="currentColor" />
        <rect x="18" y="10" width="5" height="4" rx="1" fill="currentColor" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.8" />
      </svg>
    </div>
    <div class="corner corner-br">
      <div class="bracket"></div>
      <svg class="micro-gear" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" />
        <rect x="10" y="1" width="4" height="5" rx="1" fill="currentColor" />
        <rect x="10" y="18" width="4" height="5" rx="1" fill="currentColor" />
        <rect x="1" y="10" width="5" height="4" rx="1" fill="currentColor" />
        <rect x="18" y="10" width="5" height="4" rx="1" fill="currentColor" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.8" />
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$steampunk-brass: #c9a96e;
$steampunk-copper: #b87333;
$steampunk-brass-light: #e0c88e;
$steampunk-brass-dark: #a08040;

.steampunk-corner-ornament {
  position: absolute;
  inset: 20px;
  pointer-events: none;
  z-index: 2;
}

.corner {
  position: absolute;
  width: 32px;
  height: 32px;
}

.bracket {
  position: absolute;
  inset: 0;
}

.corner-tl {
  top: -2px;
  left: -2px;

  .bracket {
    border-top: 3px solid $steampunk-brass;
    border-left: 3px solid $steampunk-brass;
    border-radius: 4px 0 0 0;
    box-shadow:
      inset 2px 2px 0 rgba($steampunk-brass-light, 0.3),
      2px 2px 6px rgba(0, 0, 0, 0.4);
  }

  .micro-gear {
    position: absolute;
    width: 20px;
    height: 20px;
    top: -6px;
    left: -6px;
    color: $steampunk-copper;
    animation: microSpin 5s linear infinite;
    filter: drop-shadow(0 1px 2px rgba(184, 115, 51, 0.4));
  }
}

.corner-tr {
  top: -2px;
  right: -2px;

  .bracket {
    border-top: 3px solid $steampunk-brass;
    border-right: 3px solid $steampunk-brass;
    border-radius: 0 4px 0 0;
    box-shadow:
      inset -2px 2px 0 rgba($steampunk-brass-light, 0.3),
      -2px 2px 6px rgba(0, 0, 0, 0.4);
  }

  .micro-gear {
    position: absolute;
    width: 20px;
    height: 20px;
    top: -6px;
    right: -6px;
    color: $steampunk-copper;
    animation: microSpin 6s linear infinite reverse;
    filter: drop-shadow(0 1px 2px rgba(184, 115, 51, 0.4));
  }
}

.corner-bl {
  bottom: -2px;
  left: -2px;

  .bracket {
    border-bottom: 3px solid $steampunk-brass;
    border-left: 3px solid $steampunk-brass;
    border-radius: 0 0 0 4px;
    box-shadow:
      inset 2px -2px 0 rgba($steampunk-brass-light, 0.3),
      2px -2px 6px rgba(0, 0, 0, 0.4);
  }

  .micro-gear {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: -6px;
    left: -6px;
    color: $steampunk-brass;
    animation: microSpin 7s linear infinite;
    filter: drop-shadow(0 1px 2px rgba(201, 169, 110, 0.4));
  }
}

.corner-br {
  bottom: -2px;
  right: -2px;

  .bracket {
    border-bottom: 3px solid $steampunk-brass;
    border-right: 3px solid $steampunk-brass;
    border-radius: 0 0 4px 0;
    box-shadow:
      inset -2px -2px 0 rgba($steampunk-brass-light, 0.3),
      -2px -2px 6px rgba(0, 0, 0, 0.4);
  }

  .micro-gear {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: -6px;
    right: -6px;
    color: $steampunk-brass;
    animation: microSpin 5.5s linear infinite reverse;
    filter: drop-shadow(0 1px 2px rgba(201, 169, 110, 0.4));
  }
}

@keyframes microSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
