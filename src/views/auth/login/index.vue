<!-- 登录页面 - Figma Design: 高速公路危害识别系统 -->
<template>
  <div class="flex w-full h-screen login-page">
    <!-- <SplashCursor
      :SIM_RESOLUTION="128"
      :DYE_RESOLUTION="1440"
      :CAPTURE_RESOLUTION="512"
      :DENSITY_DISSIPATION="3.5"
      :VELOCITY_DISSIPATION="2"
      :PRESSURE="0.1"
      :PRESSURE_ITERATIONS="20"
      :CURL="3"
      :SPLAT_RADIUS="0.2"
      :SPLAT_FORCE="6000"
      :SHADING="true"
      :COLOR_UPDATE_SPEED="10"
      :BACK_COLOR="splashBackColor"
      :TRANSPARENT="true"
    /> -->
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="login-box">
        <div class="card-frame">
          <div class="laser-border"></div>

          <div class="card-body">
            <div class="grid-overlay"></div>
            <div class="sweep"></div>

            <header class="header">
              <p class="main-title">{{ $t('login.title') }}</p>
              <span class="system-tag">{{ $t('login.subTitle') }}</span>
            </header>

            <div class="form">
              <ElForm
                ref="formRef"
                :model="formData"
                :rules="rules"
                :key="formKey"
                @keyup.enter="handleSubmit"
                style="margin-top: 25px"
              >
                <!-- <ElFormItem prop="account">
              <ElSelect v-model="formData.account" @change="setupAccount">
                <ElOption
                  v-for="account in accounts"
                  :key="account.key"
                  :label="account.label"
                  :value="account.key"
                >
                  <span>{{ account.label }}</span>
                </ElOption>
              </ElSelect>
            </ElFormItem> -->
                <ElFormItem prop="username">
                  <ElInput
                    class="custom-height"
                    :placeholder="$t('login.placeholder.username')"
                    v-model.trim="formData.username"
                  />
                </ElFormItem>
                <ElFormItem prop="password">
                  <ElInput
                    class="custom-height"
                    :placeholder="$t('login.placeholder.password')"
                    v-model.trim="formData.password"
                    type="password"
                    autocomplete="off"
                    show-password
                  />
                </ElFormItem>

                <!-- 推拽验证 -->
                <div class="relative pb-5 mt-6">
                  <div
                    class="relative z-[2] overflow-hidden select-none rounded-lg border border-transparent tad-300"
                    :class="{ '!border-[#FF4E4F]': !isPassing && isClickPass }"
                  >
                    <ArtDragVerify
                      ref="dragVerify"
                      v-model:value="isPassing"
                      :text="$t('login.sliderText')"
                      textColor="var(--art-gray-700)"
                      :successText="$t('login.sliderSuccessText')"
                      progressBarBg="var(--main-color)"
                      :background="isDark ? '#26272F' : '#F1F1F4'"
                      handlerBg="var(--default-box-color)"
                    />
                  </div>
                  <p
                    class="absolute top-0 z-[1] px-px mt-2 text-xs text-[#f56c6c] tad-300"
                    :class="{ 'translate-y-10': !isPassing && isClickPass }"
                  >
                    {{ $t('login.placeholder.slider') }}
                  </p>
                </div>

                <div class="flex-cb mt-2 text-sm">
                  <ElCheckbox v-model="formData.rememberPassword">{{
                    $t('login.rememberPwd')
                  }}</ElCheckbox>
                  <RouterLink class="text-theme" :to="{ name: 'ForgetPassword' }">{{
                    $t('login.forgetPwd')
                  }}</RouterLink>
                </div>

                <div style="margin-top: 30px">
                  <ElButton
                    class="w-full custom-height"
                    type="primary"
                    @click="handleSubmit"
                    :loading="loading"
                    v-ripple
                  >
                    {{ $t('login.btnText') }}
                  </ElButton>
                </div>

                <!-- <div class="mt-5 text-sm text-gray-600">
                  <span>{{ $t('login.noAccount') }}</span>
                  <RouterLink class="text-theme" :to="{ name: 'Register' }">{{
                    $t('login.register')
                  }}</RouterLink>
                </div> -->
              </ElForm>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { useUserStore } from '@/store/modules/user'
  import { useI18n } from 'vue-i18n'
  import { HttpError } from '@/utils/http/error'
  import { fetchLogin } from '@/api/auth'
  import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
  import { useSettingStore } from '@/store/modules/setting'

  import loginBg from '@/assets/images/login-bg.png'
  defineOptions({ name: 'Login' })

  const bgImageUrl = `url(${loginBg})`
  const settingStore = useSettingStore()
  const { isDark } = storeToRefs(settingStore)
  const { t, locale } = useI18n()
  const formKey = ref(0)

  // 监听语言切换，重置表单
  watch(locale, () => {
    formKey.value++
  })

  type AccountKey = 'super' | 'admin' | 'user'

  export interface Account {
    key: AccountKey
    label: string
    userName: string
    password: string
    roles: string[]
  }

  const accounts = computed<Account[]>(() => [
    {
      key: 'super',
      label: t('login.roles.super'),
      userName: 'Super',
      password: '123456',
      roles: ['R_SUPER']
    },
    {
      key: 'admin',
      label: t('login.roles.admin'),
      userName: 'admin',
      password: '123456',
      roles: ['R_ADMIN']
    },
    {
      key: 'user',
      label: t('login.roles.user'),
      userName: 'User',
      password: '123456',
      roles: ['R_USER']
    }
  ])

  const dragVerify = ref()

  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()
  const isPassing = ref(false)
  const isClickPass = ref(false)

  const systemName = AppConfig.systemInfo.name
  const formRef = ref<FormInstance>()

  const formData = reactive({
    account: '',
    username: '',
    password: '',
    rememberPassword: true
  })

  const rules = computed<FormRules>(() => ({
    username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }]
  }))

  const loading = ref(false)

  onMounted(() => {
    setupAccount('admin')
  })

  // 设置账号
  const setupAccount = (key: AccountKey) => {
    const selectedAccount = accounts.value.find((account: Account) => account.key === key)
    formData.account = key
    formData.username = selectedAccount?.userName ?? ''
    formData.password = selectedAccount?.password ?? ''
  }

  // 登录
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      // 表单验证
      const valid = await formRef.value.validate()
      if (!valid) return

      // 拖拽验证
      if (!isPassing.value) {
        isClickPass.value = true
        return
      }

      loading.value = true

      // 登录请求
      const { username, password } = formData

      const { token, refreshToken } = await fetchLogin({
        username: username,
        password
      })

      // 验证token
      if (!token) {
        throw new Error('Login failed - no token received')
      }

      // 存储 token 和登录状态
      userStore.setToken(token, refreshToken)
      userStore.setLoginStatus(true)

      // 登录成功处理
      showLoginSuccessNotice()

      // 获取 redirect 参数，如果存在则跳转到指定页面，否则跳转到首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } catch (error) {
      // 处理 HttpError
      if (error instanceof HttpError) {
        // console.log(error.code)
      } else {
        // 处理非 HttpError
        // ElMessage.error('登录失败，请稍后重试')
        console.error('[Login] Unexpected error:', error)
      }
    } finally {
      loading.value = false
      resetDragVerify()
    }
  }

  // 重置拖拽验证
  const resetDragVerify = () => {
    dragVerify.value.reset()
  }

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        duration: 2500,
        zIndex: 10000,
        message: `${t('login.success.message')}, ${systemName}!`
      })
    }, 1000)
  }
</script>

<style scoped>
  @import './style.css';
</style>

<style lang="scss" scoped>
  /* 页面整体背景 - Figma 设计稿 */
  .login-page {
    background-color: black;
    background-image: v-bind('bgImageUrl');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  .dark .login-page {
    background-color: #070707;
  }

  :deep(.el-select__wrapper) {
    height: 40px !important;
  }

  .login-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: Inter, sans-serif;
    color: #1a1a1e;
    perspective: 2000px;
  }

  // .login-box::before {
  //   content: '';
  //   position: absolute;
  //   width: 140%;
  //   height: 140%;
  //   background:
  //     radial-gradient(circle at 20% 30%, rgba(0, 229, 255, 0.08) 0%, transparent 40%),
  //     radial-gradient(circle at 80% 70%, rgba(112, 0, 255, 0.08) 0%, transparent 40%);
  //   animation: nebula-float 20s ease-in-out infinite alternate;
  //   z-index: -1;
  // }

  @keyframes nebula-float {
    from {
      transform: translate(-10%, -10%) rotate(0deg);
    }

    to {
      transform: translate(5%, 5%) rotate(5deg);
    }
  }

  .card-frame {
    position: relative;
    width: 360px;
    height: 480px;
    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    transform-style: preserve-3d;
  }

  .card-frame:hover {
    transform: rotateY(10deg) rotateX(5deg) scale(1.02);
  }

  .laser-border {
    position: absolute;
    inset: -2px;
    z-index: 1;
    overflow: hidden;
    border-radius: 32px;
  }

  .laser-border::before {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    content: '';
    background: conic-gradient(transparent 70%, #00d2ff, #9d50bb, transparent 90%);
    animation: rotate-border 3s linear infinite;
  }

  .laser-border::after {
    position: absolute;
    inset: 0;
    content: '';
    background: inherit;
    filter: blur(15px);
    opacity: 0.2;
    animation: pulse-glow 4s ease-in-out infinite;
  }

  .card-body {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 30px;
    overflow: hidden;
    background: rgb(255 255 255 / 70%);
    backdrop-filter: blur(40px) saturate(200%);
    border: 1px solid rgb(255 255 255 / 80%);
    border-radius: 30px;
    box-shadow: 0 40px 80px -20px rgb(0 0 0 / 8%);
  }

  .header {
    // margin-bottom: 50px;
  }

  .system-tag {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 700;
    color: var(--el-color-primary);
    text-transform: uppercase;
    letter-spacing: 5px;
  }

  .main-title {
    margin-bottom: 16px;
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
    color: #000;
    letter-spacing: -1px;
  }

  .metric-label {
    display: block;
    margin-bottom: 4px;
    font-size: 0.65rem;
    color: rgb(0 0 0 / 40%);
    text-transform: uppercase;
  }

  .metric-value {
    font-size: 1.1rem;
    font-weight: 400;
    color: #333;
  }

  .description {
    margin-bottom: auto;
    font-size: 0.85rem;
    font-weight: 400;
    line-height: 1.6;
    color: rgb(0 0 0 / 60%);
  }

  .btn-container {
    margin-top: 30px;
  }

  .action-btn {
    position: relative;
    width: 100%;
    padding: 18px;
    overflow: hidden;
    font-size: 0.8rem;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 3px;
    cursor: pointer;
    background: #000;
    border: none;
    border-radius: 15px;
    box-shadow: 0 10px 20px rgb(0 0 0 / 10%);
    transition: all 0.4s ease;
  }

  .action-btn:hover {
    letter-spacing: 5px;
    box-shadow: 0 15px 30px rgb(0 0 0 / 20%);
    transform: translateY(-2px);
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgb(0 0 0 / 2%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(0 0 0 / 2%) 1px, transparent 1px);
    background-size: 30px 30px;
    opacity: 1;
  }

  @keyframes rotate-border {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse-glow {
    0%,
    100% {
      opacity: 0.1;
    }

    50% {
      opacity: 0.3;
    }
  }

  .sweep {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    pointer-events: none;
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / 60%), transparent);
    transition: 0.8s;
    transform: skewX(-25deg);
  }

  .card-frame:hover .sweep {
    left: 150%;
  }
</style>
