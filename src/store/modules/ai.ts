import { defineStore } from "pinia"

interface AIState {
  isReply?: boolean;
  // 可以添加其他属性
}

export const useAIStore = defineStore("ai", {
  state: () => ({
    states: {} as Record<string, AIState>
  }),
  actions:{
    setIsReply(id:string,isReply:boolean){
      const currentState = this.states[id] || {};
      this.states = {
        ...this.states,
        [id]: {
          ...currentState,
          isReply
        }
      };
    }
  }
})
