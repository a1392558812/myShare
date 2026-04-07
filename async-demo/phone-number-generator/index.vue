<template>
  <div class="phone-number-generator">
    <app-container>
      <layout-com style="width: 400px" title="电话号码生成器" type="panel">
        <control-item label="号码类型:">
          <select-com
            :options="phoneTypes"
            :modelValue="phoneType"
            @update:modelValue="handlePhoneTypeChange"
          />
        </control-item>

        <control-item v-if="phoneType === 'mobile'" label="供应商:">
          <select-com
            :disabled="isRandomCarrier"
            :options="carriers"
            :modelValue="selectedCarrier"
            @update:modelValue="handleCarrierChange"
          />
          <div style="display: flex; gap: 5px; align-items: center">
            <div>是否随机供应商：</div>
            <inputCom
              type="checkbox"
              :modelValue="isRandomCarrier"
              @update:modelValue="isRandomCarrier = Boolean($event)"
            />
          </div>
        </control-item>

        <control-item label="号码段:">
          <select-com
            :disabled="isRandomPrefix || isRandomCarrier"
            :options="filteredPrefixes"
            :modelValue="selectedPrefix"
            @update:modelValue="selectedPrefix = $event"
          />
          <div style="display: flex; gap: 5px; align-items: center">
            <div>是否随机号码段：</div>
            <inputCom
              type="checkbox"
              :disabled="isRandomCarrier"
              :modelValue="isRandomPrefix"
              @update:modelValue="isRandomPrefix = Boolean($event)"
            />
          </div>
        </control-item>

        <control-item label="生成:">
          <div style="display: flex; flex-direction: column; gap: 1em">
            <div style="display: flex; align-items: center; gap: 0.5em">
              <span>数量:</span>
              <inputCom
                type="number"
                :modelValue="batchCount"
                @update:modelValue="batchCount = Number($event)"
                :min="1"
                :max="500"
              />
              <custom-btn-com @click="generateBatchPhoneNumbers"
                >批量生成</custom-btn-com
              >
            </div>
          </div>
        </control-item>

        <div class="usage-guide">
          <p>本工具仅用于测试和学习目的，生成的电话号码不具有实际使用价值。</p>
          <ul>
            <li>手机号码: 11位数字</li>
            <li>固定电话: 区号+电话号码</li>
            <li>随机生成的号码仅供测试使用</li>
          </ul>
        </div>
      </layout-com>

      <layout-com style="min-width: 700px" title="结果" type="preview">
        <template #preview>
          <div>
            <div
              style="
                margin-bottom: 2em;
                padding: 1em;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
              "
            >
              <h3 style="margin-top: 0; margin-bottom: 1em">电话号码解析</h3>
              <div style="display: flex; gap: 0.5em; margin-bottom: 1em">
                <inputCom
                  style="flex: 1"
                  type="text"
                  placeholder="请输入电话号码"
                  :modelValue="phoneNumberInput"
                  @update:modelValue="phoneNumberInput = $event"
                />
                <custom-btn-com @click="parsePhoneNumber">解析</custom-btn-com>
              </div>
              <div v-if="parsedInfo" class="parsed-info">
                <h4 style="margin-top: 0; margin-bottom: 1em">解析结果</h4>
                <div
                  style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5em;
                  "
                >
                  <div>
                    <strong>号码类型:</strong> {{ parsedInfo.type || "--" }}
                  </div>
                  <div>
                    <strong>运营商:</strong> {{ parsedInfo.carrier || "--" }}
                  </div>
                  <div>
                    <strong>号码长度:</strong> {{ parsedInfo.length || "--" }}
                  </div>
                </div>
              </div>
              <div v-else-if="parseError" style="color: red; margin-top: 1em">
                {{ parseError }}
              </div>
            </div>
          </div>
          <div v-if="batchResults.length > 0">
            <custom-btn-com
              @click="copyToClipboard(JSON.stringify(batchResults))"
              >一键复制所有结果-数据结构是JSON数组</custom-btn-com
            >
            <div
              style="
                margin-top: 1em;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1em;
              "
            >
              <div
                style="display: flex; align-items: center; gap: 0.5em"
                v-for="(phone, index) in batchResults"
                :key="index"
              >
                <span>{{ index + 1 }}.</span>
                <span>{{ phone }}</span>
                <custom-btn-com @click="copyToClipboard(phone)"
                  >复制</custom-btn-com
                >
              </div>
            </div>
          </div>
          <div v-else>暂无生成结果，点击左侧批量生成按钮查看</div>
        </template>
      </layout-com>
    </app-container>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";

import {
  inputCom,
  selectCom,
  customBtnCom,
  controlItem,
  layoutCom,
  appContainer,
} from "../components/form-control/index.vue";

const phoneTypes = [
  { label: "手机号码", value: "mobile" },
  { label: "固定电话", value: "landline" },
];

const mobilePrefixesData = [
  {
    server: "中国移动",
    prefix: [
      "134",
      "135",
      "136",
      "137",
      "138",
      "139",
      "150",
      "151",
      "152",
      "157",
      "158",
      "159",
      "172",
      "178",
      "182",
      "183",
      "184",
      "187",
      "188",
      "195",
      "198",
    ],
  },
  {
    server: "中国联通",
    prefix: [
      "130",
      "131",
      "132",
      "155",
      "156",
      "175",
      "176",
      "185",
      "186",
      "196",
    ],
  },
  {
    server: "中国电信",
    prefix: [
      "133",
      "153",
      "173",
      "177",
      "180",
      "181",
      "189",
      "191",
      "193",
      "199",
    ],
  },
  {
    server: "虚拟运营商",
    prefix: ["170", "171"],
  },
];

const mobilePrefixes = mobilePrefixesData.flatMap((item) =>
  item.prefix.map((prefix) => ({
    label: prefix,
    value: prefix,
    server: item.server,
  })),
);

const landlineAreas = [
  { label: "北京 (010)", value: "010" },
  { label: "上海 (021)", value: "021" },
  { label: "广州 (020)", value: "020" },
  { label: "深圳 (0755)", value: "0755" },
  { label: "杭州 (0571)", value: "0571" },
  { label: "南京 (025)", value: "025" },
  { label: "武汉 (027)", value: "027" },
  { label: "成都 (028)", value: "028" },
  { label: "重庆 (023)", value: "023" },
  { label: "西安 (029)", value: "029" },
];

const carriers = mobilePrefixesData.map((item) => ({
  label: item.server,
  value: item.server,
}));

const phoneType = ref("mobile");
const selectedCarrier = ref("中国移动");
const isRandomCarrier = ref(false);
const isRandomPrefix = ref(false);
const selectedPrefix = ref("138");
const batchCount = ref(1);
const batchResults = ref([]);

const phoneNumberInput = ref("");
const parsedInfo = ref(null);
const parseError = ref("");

const filteredPrefixes = computed(() => {
  if (phoneType.value === "mobile") {
    return mobilePrefixes.filter((prefix) => {
      return prefix.server === selectedCarrier.value;
    });
  } else {
    return landlineAreas;
  }
});

const handlePhoneTypeChange = (type) => {
  phoneType.value = type;
  if (type === "mobile") {
    selectedCarrier.value = carriers[0].value;
    const filtered = filteredPrefixes.value;
    if (
      filtered.length > 0 &&
      !filtered.find((p) => p.value === selectedPrefix.value)
    ) {
      selectedPrefix.value = filtered[0].value;
    }
  } else {
    const areas = landlineAreas;
    if (
      areas.length > 0 &&
      !areas.find((a) => a.value === selectedPrefix.value)
    ) {
      selectedPrefix.value = areas[0].value;
    }
  }
};

const handleCarrierChange = (carrier) => {
  selectedCarrier.value = carrier;
  const filtered = filteredPrefixes.value;
  if (
    filtered.length > 0 &&
    !filtered.find((p) => p.value === selectedPrefix.value)
  ) {
    selectedPrefix.value = filtered[0].value;
  }
};

watch(isRandomCarrier, (newValue) => {
  if (newValue) {
    isRandomPrefix.value = true;
  }
});

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomDigits = (length) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += getRandomNumber(0, 9).toString();
  }
  return result;
};

const generatePhoneNumber = () => {
  if (phoneType.value === "mobile") {
    let prefix;
    if (isRandomPrefix.value) {
      let availablePrefixes;

      if (isRandomCarrier.value) {
        const carrierOptions = carriers;
        const randomCarrierIndex = getRandomNumber(
          0,
          carrierOptions.length - 1,
        );
        const randomCarrier = carrierOptions[randomCarrierIndex].value;

        availablePrefixes = mobilePrefixes.filter(
          (p) => p.server === randomCarrier,
        );
      } else {
        availablePrefixes = mobilePrefixes.filter(
          (p) => p.server === selectedCarrier.value,
        );
      }

      const randomIndex = getRandomNumber(0, availablePrefixes.length - 1);
      prefix = availablePrefixes[randomIndex].value;
    } else {
      prefix = selectedPrefix.value;
    }
    const suffix = generateRandomDigits(8);
    return prefix + suffix;
  } else {
    let areaCode;
    if (isRandomPrefix.value) {
      const randomIndex = getRandomNumber(0, landlineAreas.length - 1);
      areaCode = landlineAreas[randomIndex].value;
    } else {
      areaCode = selectedPrefix.value;
    }
    const numberLength = getRandomNumber(7, 8);
    const number = generateRandomDigits(numberLength);
    return areaCode + number;
  }
};

const generateBatchPhoneNumbers = () => {
  const results = [];
  for (let i = 0; i < batchCount.value; i++) {
    results.push(generatePhoneNumber());
  }
  batchResults.value = results;
};

const parsePhoneNumber = () => {
  const phoneNumber = phoneNumberInput.value.trim();

  if (!phoneNumber) {
    parseError.value = "请输入电话号码";
    parsedInfo.value = null;
    return;
  }

  try {
    let type = "";
    let location = "";
    let carrier = "";
    let length = phoneNumber.length;

    if (/^1[3-9]\d{9}$/.test(phoneNumber)) {
      type = "手机号码";
      const prefix = phoneNumber.substring(0, 3);
      const prefixInfo = mobilePrefixes.find((p) => p.value === prefix);
      carrier = prefixInfo?.server || "未知";
    } else if (/^0\d{2,4}\d{7,8}$/.test(phoneNumber)) {
      type = "固定电话";
      const areaCode = phoneNumber.match(/^0\d{2,4}/)[0];
      location =
        landlineAreas.find((area) => area.value === areaCode)?.label || "未知";
      carrier = "中国电信/中国联通";
    } else {
      parseError.value = "请输入有效的电话号码";
      parsedInfo.value = null;
      return;
    }

    parsedInfo.value = {
      type,
      location,
      carrier,
      length,
    };

    parseError.value = "";
  } catch (error) {
    console.error("解析电话号码失败:", error);
    parseError.value = "解析失败，请检查输入的电话号码";
    parsedInfo.value = null;
  }
};

const copyToClipboard = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("复制成功！");
    })
    .catch((err) => {
      console.error("复制失败:", err);
      alert("复制失败，请手动复制");
    });
};
</script>

<style scoped lang="scss">
.phone-number-generator {
  padding: 20px;
}

.usage-guide {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;

  p {
    margin-top: 0;
    margin-bottom: 10px;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 5px;
  }
}

.parsed-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
</style>
