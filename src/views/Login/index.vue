<script lang="ts" setup>
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user"
import { User, Lock } from "@element-plus/icons-vue"
import ThemeSwitch from "@/components/ThemeSwitch/index.vue"
import { type FormInstance, type FormRules } from "element-plus"
import { type ILoginRequestData } from "@/api/login/types/login"

const router = useRouter()
const loginFormRef = ref<FormInstance | null>(null)

/** 登录按钮 Loading */
const loading = ref(false)
/** 验证码图片 URL */
const codeUrl = ref("")
/** 登录表单数据 */
const loginForm: ILoginRequestData = reactive({
  username: "",
  password: "",
  code: ""
})
/** 登录表单校验规则 */
const loginFormRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 4, max: 20, message: "长度在 4 到 20 个字符", trigger: "blur" }
  ]
}
/** 登录逻辑 */
const handleLogin = () => {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      useUserStore()
        .login({
          username: loginForm.username,
          password: loginForm.password,
          code: loginForm.code
        })
        .then(() => {
          router.push({ path: "/" })
        })
        .catch(() => {
          loginForm.password = ""
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}

const handleRegister = () => {
  router.push({ path: "/register" })
}
</script>

<template>
  <div class="login-container">
    <ThemeSwitch class="theme-switch" />
    <div class="login-card">
      <div class="title">
        <div class="image">
<!--          <img src="@/assets/layout/miner.png" />-->
          <span class="system_title system_title_main">煤矿设备运维大模型平台</span>
        </div>
      </div>
      <div class="content">
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input
              v-model.trim="loginForm.username"
              placeholder="用户名"
              type="text"
              tabindex="1"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model.trim="loginForm.password"
              placeholder="密码"
              type="password"
              tabindex="2"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>
          <div class="button-group">
            <el-button :loading="loading" @click.prevent="handleLogin">登 录</el-button>
            <el-button :loading="loading" @click.prevent="handleRegister">注 册</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    animation: float 20s ease-in-out infinite;
  }

  .theme-switch {
    position: fixed;
    top: 5%;
    right: 5%;
    cursor: pointer;
    z-index: 1000;
  }

  .login-card {
    width: 480px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    overflow: hidden;
    position: relative;
    z-index: 10;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #00d4ff, #090979, #00d4ff);
      animation: shimmer 3s ease-in-out infinite;
    }

    .title {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 140px;
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(9, 9, 121, 0.1));
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      img {
        position: absolute;
        top: 40px;
        left: 70px;
        height: 80px;
        width: auto;
      }
    }

    .content {
      padding: 40px 50px 50px 50px;

      :deep(.el-form-item) {
        margin-bottom: 24px;
      }

      :deep(.el-input) {
        .el-input__wrapper {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;

          &:hover {
            border-color: rgba(0, 212, 255, 0.5);
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
          }

          &:focus-within {
            border-color: #00d4ff;
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
          }
        }

        .el-input__inner {
          color: #ffffff;
          background: transparent;
          border: none;
          font-size: 16px;

          &::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }

      :deep(.el-input-group__append) {
        padding: 0;
        overflow: hidden;
        .el-image {
          width: 100px;
          height: 40px;
          border-left: 0px;
          user-select: none;
          cursor: pointer;
          text-align: center;
        }
      }

      .button-group {
        display: flex;
        gap: 16px;
        margin-top: 32px;

        .el-button {
          flex: 1;
          height: 48px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
          }

          &:hover::before {
            left: 100%;
          }

          &:first-child {
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);

            &:hover {
              background: linear-gradient(135deg, #33e0ff, #00ccff);
              transform: translateY(-2px);
              box-shadow: 0 8px 30px rgba(0, 212, 255, 0.6);
            }
          }

          &:last-child {
            background: linear-gradient(135deg, #667eea, #764ba2);
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);

            &:hover {
              background: linear-gradient(135deg, #8a7eff, #9b59b6);
              transform: translateY(-2px);
              box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
            }
          }
        }
      }
    }
  }
}

.system_title_main {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #00d4ff, #090979, #00d4ff);
    border-radius: 1px;
    animation: glow 2s ease-in-out infinite alternate;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.5); }
  100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.8), 0 0 30px rgba(0, 212, 255, 0.4); }
}
</style>
