<template>
  <div class="id-number-generator">
    <app-container>
      <layout-com style="width: 400px" title="身份id数字生成器" type="panel">
        <control-item :label="`省份:${selectValue.provinceId}`">
          <select-com
            :disabled="selectValue.provinceIdIfRandom"
            :options="provinces || []"
            :modelValue="selectValue.provinceId"
            @update:modelValue="handleProvinceChange"
          />
          <div style="display: flex; gap: 5px; align-items: center">
            <div>是否随机省份（{{ selectValue.provinceIdIfRandom }}）：</div>
            <inputCom
              type="checkbox"
              :modelValue="selectValue.provinceIdIfRandom"
              @update:modelValue="
                selectValue.provinceIdIfRandom = Boolean($event)
              "
            />
          </div>
        </control-item>

        <control-item :label="`城市:${selectValue.cityId}`">
          <select-com
            :disabled="computedCityIdIfRandom"
            :options="computedCities || []"
            :modelValue="selectValue.cityId"
            @update:modelValue="handleCityChange"
          />
          <div style="display: flex; gap: 5px; align-items: center">
            <div>是否随机城市（{{ selectValue.cityIdIfRandom }}）：</div>
            <inputCom
              :disabled="selectValue.provinceIdIfRandom"
              type="checkbox"
              :modelValue="computedCityIdIfRandom"
              @update:modelValue="selectValue.cityIdIfRandom = Boolean($event)"
            />
          </div>
        </control-item>

        <control-item :label="`区县:${selectValue.districtId}`">
          <select-com
            :disabled="computedDistrictIdIfRandom"
            :options="computedDistrict || []"
            :modelValue="selectValue.districtId"
            @update:modelValue="handleDistrictChange"
          />
          <div style="display: flex; gap: 5px; align-items: center">
            <div>是否随机城市（{{ selectValue.districtIdIfRandom }}）：</div>
            <inputCom
              :disabled="
                selectValue.provinceIdIfRandom || selectValue.cityIdIfRandom
              "
              type="checkbox"
              :modelValue="computedDistrictIdIfRandom"
              @update:modelValue="
                selectValue.districtIdIfRandom = Boolean($event)
              "
            />
          </div>
        </control-item>

        <control-item label="出生日期:">
          <div
            style="
              width: 100%;
              display: flex;
              flex-direction: column;
              gap: 10px;
            "
          >
            <div
              style="
                width: 100%;
                display: flex;
                gap: 5px;
                align-items: center;
                justify-content: center;
              "
              v-for="(key, index) in Object.keys(birthDate)"
            >
              <span>{{ birthDate[key].label }}:</span>
              <inputCom
                style="flex: 1"
                :key="index"
                type="number"
                :disabled="birthDate[key].ifRandom"
                :modelValue="birthDate[key].value"
                @update:modelValue="birthDate[key].value = Number($event)"
                :min="birthDate[key].slotProps.min"
                :max="birthDate[key].slotProps.max"
              />
              <div style="display: flex; gap: 5px; align-items: center">
                <div>
                  是否随机{{ birthDate[key].label }}（{{
                    birthDate[key].ifRandom
                  }}）：
                </div>
                <inputCom
                  type="checkbox"
                  :modelValue="birthDate[key].ifRandom"
                  @update:modelValue="birthDate[key].ifRandom = Boolean($event)"
                />
              </div>
            </div>
          </div>
        </control-item>

        <control-item label="性别:">
          <div style="display: flex; gap: 1em">
            <label
              v-for="(item, index) in gender.options"
              :key="index"
              style="
                display: flex;
                align-items: center;
                gap: 0.5em;
                cursor: pointer;
              "
            >
              <input
                type="radio"
                :disabled="gender.ifRandom"
                :value="item.value + ''"
                v-model="gender.value"
              />
              <span>{{ item.label }}</span>
            </label>
            <div style="display: flex; gap: 5px; align-items: center">
              <div>是否随机性别：</div>
              <inputCom
                type="checkbox"
                :modelValue="gender.ifRandom"
                @update:modelValue="gender.ifRandom = Boolean($event)"
              />
            </div>
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
              <custom-btn-com @click="generateBatchIdNumbers"
                >批量生成</custom-btn-com
              >
            </div>
          </div>
        </control-item>

        <div class="usage-guide">
          <p>本工具仅用于测试和学习目的，生成的身份id数字不具有法律效力。</p>
          <ul>
            <li>第1-6位: 行政区划代码</li>
            <li>第7-14位: 出生日期 (YYYYMMDD)</li>
            <li>第15-17位: 顺序码 (奇数为男，偶数为女)</li>
            <li>第18位: 校验码</li>
          </ul>
        </div>
      </layout-com>

      <layout-com style="min-width: 700px" title="结果" type="preview">
        <template #preview>
          <div>
            <!-- 逆向解析 -->
            <div
              style="
                margin-bottom: 2em;
                padding: 1em;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
              "
            >
              <h3 style="margin-top: 0; margin-bottom: 1em">身份id数字解析</h3>
              <div style="display: flex; gap: 0.5em; margin-bottom: 1em">
                <inputCom
                  style="flex: 1"
                  type="text"
                  placeholder="请输入身份id数字"
                  :modelValue="idNumberInput"
                  @update:modelValue="idNumberInput = $event"
                />
                <custom-btn-com @click="parseIdNumber">解析</custom-btn-com>
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
                    <strong>省份:</strong> {{ parsedInfo.province || "--" }}-{{
                      parsedInfo.provinceCode || "--"
                    }}
                  </div>
                  <div>
                    <strong>城市:</strong> {{ parsedInfo.city || "--" }}-{{
                      parsedInfo.cityCode || "--"
                    }}
                  </div>
                  <div>
                    <strong>区县:</strong> {{ parsedInfo.district || "--" }}-{{
                      parsedInfo.districtCode || "--"
                    }}
                  </div>
                  <div>
                    <strong>出生日期:</strong>
                    {{ parsedInfo.birthDate || "--" }}
                  </div>
                  <div>
                    <strong>性别:</strong> {{ parsedInfo.gender || "--" }}-{{
                      parsedInfo.genderCode || "--"
                    }}
                  </div>
                  <div>
                    <strong>校验码:</strong> {{ parsedInfo.checkCode || "--" }}
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
                v-for="(id, index) in batchResults"
                :key="index"
              >
                <span>{{ index + 1 }}.</span>
                <span>{{ id }}</span>
                <custom-btn-com @click="copyToClipboard(id)"
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
import { ref, reactive, computed, onBeforeMount } from "vue";
import { citys as listArr } from "./js/index-array.js";

import {
  inputCom,
  selectCom,
  customBtnCom,
  controlItem,
  layoutCom,
  appContainer,
} from "../components/form-control/index.vue";

const selectValue = reactive({
  provinceId: "110000",
  provinceIdIfRandom: false,
  cityId: "110100",
  cityIdIfRandom: false,
  districtId: "110101",
  districtIdIfRandom: false,
});

const computedCityIdIfRandom = computed(() => {
  if (selectValue.provinceIdIfRandom) return true;
  return selectValue.cityIdIfRandom;
});

const computedDistrictIdIfRandom = computed(() => {
  if (selectValue.provinceIdIfRandom) return true;
  if (selectValue.cityIdIfRandom) return true;
  return selectValue.districtIdIfRandom;
});

const provinces = ref(listArr);

const computedCities = computed(() => {
  const province = provinces.value.find(
    (p) => p.value === selectValue.provinceId,
  );
  const res = province ? province.children || [] : [];
  return res;
});

const computedDistrict = computed(() => {
  const city = computedCities.value.find((c) => c.value === selectValue.cityId);
  const res = city ? city.children || [] : [];
  return res;
});

const birthDate = reactive({
  year: {
    label: "年",
    value: 2000,
    ifRandom: false,
    slotProps: (() => {
      const maxYear = new Date().getFullYear();
      return { min: 1900, max: maxYear };
    })(),
  },
  month: {
    label: "月",
    value: 1,
    ifRandom: false,
    slotProps: { min: 1, max: 12 },
  },
  day: {
    label: "日",
    value: 1,
    ifRandom: false,
    slotProps: computed(() => {
      const day = new Date(
        birthDate.year.value,
        birthDate.month.value,
        0,
      ).getDate();
      return { min: 1, max: day };
    }),
  },
});

const gender = reactive({
  value: "0",
  ifRandom: false,
  options: [
    { label: "男", value: "0" },
    { label: "女", value: "1" },
  ],
});

const batchCount = ref(1);
const batchResults = ref([]);

const idNumberInput = ref("");
const parsedInfo = ref(null);
const parseError = ref("");

const findRegionName = (code) => {
  try {
    let provinceCode = "";
    let cityCode = "";
    let districtCode = "";

    let province = "";
    let city = "";
    let district = "";

    let flag = false;

    for (let j = 0; j < listArr.length; j++) {
      for (let m = 0; m < listArr[j].children.length; m++) {
        for (let n = 0; n < listArr[j].children[m].children.length; n++) {
          if (listArr[j].children[m].children[n].value === code) {
            provinceCode = listArr[j].value;
            cityCode = listArr[j].children[m].value;
            districtCode = listArr[j].children[m].children[n].value;

            province = listArr[j].label;
            city = listArr[j].children[m].label;
            district = listArr[j].children[m].children[n].label;

            flag = true;
            break;
          }
        }
        if (flag) {
          break;
        }
        if (listArr[j].children[m].value === code) {
          provinceCode = listArr[j].value;
          cityCode = listArr[j].children[m].value;
          districtCode = "";

          province = listArr[j].label;
          city = listArr[j].children[m].label;
          district = "";

          flag = true;
          break;
        }
      }
      if (flag) {
        break;
      }
      if (listArr[j].value === code) {
        provinceCode = listArr[j].value;
        cityCode = "";
        districtCode = "";

        province = listArr[j].label;
        city = "";
        district = "";

        flag = true;
        break;
      }
    }

    return {
      province,
      city,
      district,
      provinceCode,
      cityCode,
      districtCode,
    };
  } catch (error) {
    console.error("地区代码查找失败:", error);
    return {
      province: "未知省份",
      city: "未知城市",
      district: "未知区域",
      provinceCode: "",
      cityCode: "",
      districtCode: "",
    };
  }
};

const parseIdNumber = () => {
  const idNumber = idNumberInput.value.trim();

  if (
    !/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(
      idNumber,
    )
  ) {
    parseError.value = "请输入有效的18位身份id数字";
    parsedInfo.value = null;
    return;
  }

  try {
    const areaCode = idNumber.substring(0, 6);
    const birthYear = idNumber.substring(6, 10);
    const birthMonth = idNumber.substring(10, 12);
    const birthDay = idNumber.substring(12, 14);
    const genderCode = idNumber.substring(16, 17);
    const checkCode = idNumber.substring(17);

    const result = findRegionName(areaCode);

    parsedInfo.value = {
      ...result,
      birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
      gender: parseInt(genderCode) % 2 === 1 ? "男" : "女",
      genderCode,
      checkCode,
    };

    parseError.value = "";
  } catch (error) {
    console.error("解析身份id数字失败:", error);
    parseError.value = "解析失败，请检查输入的身份id数字";
    parsedInfo.value = null;
  }
};

const padZero = (num, length) => {
  return num.toString().padStart(length, "0");
};

const handleProvinceChange = (provinceId) => {
  console.log("provinceId", provinceId, provinces.value);
  const target = provinces.value.find((p) => p.value === provinceId);
  if (!provinceId || !target) {
    selectValue.provinceId = "";
    selectValue.cityId = "";
    selectValue.districtId = "";
    return;
  }

  selectValue.provinceId = provinceId;

  if (target.children && target.children.length) {
    handleCityChange(target.children[0].value);
  } else {
    selectValue.cityId = "";
    selectValue.districtId = "";
  }
};

const handleCityChange = (cityId) => {
  console.log("cityId", cityId, computedCities.value);
  const target = computedCities.value.find((c) => c.value === cityId);
  if (!cityId || !target) {
    selectValue.cityId = "";
    selectValue.districtId = "";
    return;
  }

  selectValue.cityId = cityId;
  if (target.children && target.children.length) {
    handleDistrictChange(target.children[0].value);
  } else {
    selectValue.districtId = "";
  }
};

const handleDistrictChange = (districtId) => {
  console.log("districtId", districtId, computedDistrict.value);
  if (!districtId) {
    selectValue.districtId = "";
    return;
  }
  selectValue.districtId = districtId;
};

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const calculateCheckCode = (idNumber) => {
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const codes = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idNumber[i]) * weights[i];
  }

  const remainder = sum % 11;
  return codes[remainder];
};

const generateIdNumber = ({ areaCode, birth, gender }) => {
  try {
    let sequenceCode = getRandomNumber(0, 999).toString().padStart(3, "0");

    if (`${gender}` === "0") {
      if (parseInt(sequenceCode[2]) % 2 === 0) {
        let lastDigit = parseInt(sequenceCode[2]) + 1;
        if (lastDigit > 9) {
          lastDigit = 1;
        }
        sequenceCode = sequenceCode.substring(0, 2) + lastDigit.toString();
      }
    } else {
      if (parseInt(sequenceCode[2]) % 2 === 1) {
        let lastDigit = parseInt(sequenceCode[2]) + 1;
        if (lastDigit > 9) {
          lastDigit = 0;
        }
        sequenceCode = sequenceCode.substring(0, 2) + lastDigit.toString();
      }
    }

    const first17 = areaCode + birth + sequenceCode;

    const checkCode = calculateCheckCode(first17);
    const result = first17 + checkCode;
    if (result.length !== 18) {
      console.log("generateIdNumber", {
        areaCode,
        birth,
        gender,
        checkCode,
        sequenceCode,
        result,
      });
    }
    return result;
  } catch (error) {
    console.error("生成身份id数字失败:", error);
    alert("生成身份id数字失败，请检查输入");
    return null;
  }
};

const generateAreaCode = () => {
  try {
    const generateProvinceId = () => {
      if (!selectValue.provinceIdIfRandom) {
        const provinceIndex = provinces.value.findIndex(
          (p) => p.value === selectValue.provinceId,
        );
        return {
          provinceId: selectValue.provinceId,
          provinceIndex,
        };
      }

      const provinceIndex = getRandomNumber(0, provinces.value.length - 1);
      return {
        provinceId: provinces.value[provinceIndex].value || "",
        provinceIndex,
      };
    };

    const generateCityId = (provinceIndex) => {
      if (!computedCityIdIfRandom.value) {
        const cityIndex = computedCities.value.findIndex(
          (c) => c.value === selectValue.cityId,
        );
        return {
          cityId: selectValue.cityId,
          cityIndex,
        };
      }

      if (provinceIndex === -1) {
        return {
          cityId: "",
          cityIndex: -1,
        };
      }

      const cityList = provinces.value[provinceIndex].children || [];
      console.log(
        "cityList",
        provinces.value[provinceIndex].children,
        cityList,
      );
      if (!cityList.length) {
        return {
          cityId: "",
          cityIndex: -1,
        };
      }

      const cityIndex = getRandomNumber(0, cityList.length - 1);
      return {
        cityId: cityList[cityIndex].value,
        cityIndex,
      };
    };

    const generateDistrictId = (provinceIndex, cityIndex) => {
      if (!computedDistrictIdIfRandom.value) return selectValue.districtId;
      if (provinceIndex === -1 || cityIndex === -1) return "";

      const districtList =
        provinces.value[provinceIndex].children[cityIndex].children || [];
      if (!districtList.length) return "";

      const districtRandomIndex = getRandomNumber(0, districtList.length - 1);
      return districtList[districtRandomIndex].value || "";
    };

    const generateProvinceIdRes = generateProvinceId();
    const provinceId = generateProvinceIdRes.provinceId;
    const provinceIndex = generateProvinceIdRes.provinceIndex;

    const generateCityIdRes = generateCityId(provinceIndex);
    const cityId = generateCityIdRes.cityId;
    const cityIndex = generateCityIdRes.cityIndex;

    const districtId = generateDistrictId(provinceIndex, cityIndex);

    const result = {
      provinceId,
      cityId,
      districtId,
      provinceIndex,
      cityIndex,
    };
    console.log("generateAreaCode", result);

    return result;
  } catch (error) {
    console.error("生成身份id数字失败:", error);
    return null;
  }
};

const generateBirthDate = () => {
  let year = birthDate.year.value;
  let month = birthDate.month.value;
  let day = birthDate.day.value;

  if (birthDate.year.ifRandom) {
    year = getRandomNumber(
      birthDate.year.slotProps.min,
      birthDate.year.slotProps.max,
    );
  }

  if (birthDate.month.ifRandom) {
    month = getRandomNumber(
      birthDate.month.slotProps.min,
      birthDate.month.slotProps.max,
    );
  }

  if (birthDate.day.ifRandom) {
    const maxDay = new Date(year, month, 0).getDate();
    day = getRandomNumber(birthDate.day.slotProps.min, maxDay);
  }

  return {
    year,
    month,
    day,
  };
};

const generateGender = () => {
  if (!selectValue.genderIfRandom) return gender.value;
  return getRandomNumber(0, 1);
};

const generateBatchIdNumbers = () => {
  try {
    const results = [];
    for (let i = 0; i < batchCount.value; i++) {
      const areaCodeRes = generateAreaCode();
      const birthDateRes = generateBirthDate();
      const gender = generateGender();

      results.push(
        generateIdNumber({
          areaCode:
            areaCodeRes.districtId ||
            areaCodeRes.cityId ||
            areaCodeRes.provinceId,
          birth: `${birthDateRes.year}${padZero(birthDateRes.month, 2)}${padZero(birthDateRes.day, 2)}`,
          gender,
        }),
      );
    }
    batchResults.value = results;
  } catch (error) {
    console.error("生成身份id数字失败:", error);
    return;
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

<style scoped lang="scss"></style>
