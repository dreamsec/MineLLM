// import { defineStore } from "pinia"

// interface AIState {
//   isReply?: boolean;
//   // 可以添加其他属性
// }

// export const useAIStore = defineStore("ai", {
//   state: () => ({
//     states: {} as Record<string, AIState>
//   }),
//   actions:{
//     setIsReply(id:string,isReply:boolean){
//       const currentState = this.states[id] || {};
//       this.states = {
//         ...this.states,
//         [id]: {
//           ...currentState,
//           isReply
//         }
//       };
//     }
//   }
// })

import { defineStore } from "pinia"
import { reactive } from "vue" // 1. 添加了reactive导入

interface AIState {
  isReply?: boolean;
  // 可以添加其他属性
}

export const useAIStore = defineStore("ai", () => { // 2. 改为箭头函数形式
  // 使用reactive替代原来的state
  const states = reactive<Record<string, AIState>>({})

  // 将原来的action转换为普通函数
  const setIsReply = (id: string, isReply: boolean) => {
    const currentState = states[id] || {}
    // 在组合式API中，我们需要手动更新reactive对象
    states[id] = {
      ...currentState,
      isReply
    }
  }

  // 导出状态和方法
  return {
    states,
    setIsReply
  }
})