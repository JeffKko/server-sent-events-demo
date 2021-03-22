<template>
  <div class="chat-box" ref="$chatBox">
    <div class="chat-box__message" v-for="chatEvent in messageList" :key="chatEvent.id">
      <div class="chat-box__message__text">{{ chatEvent.message }}</div>
      <div class="chat-box__message__datetime">{{ toDatetimeString(chatEvent.id) }}</div>
    </div>
  </div>
  <div class="action-tool">
    <input class="action-tool__input" type="text" v-model="text">
    <button class="action-tool__submit" @click="sendMessage">Send</button>
  </div>
</template>

<script>
import { onMounted, onBeforeMount, onUnmounted, ref } from 'vue'

class ChatEvent {
  constructor(id, message) {
    this.id = id
    this.message = message
  }
}

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  setup(props, context) {
    const text = ref('')
    const messageList = ref([])
    const $chatBox = ref(null)

    onBeforeMount(() => {
      console.log('test circle ci')

      const eventSource = new EventSource(`${API_ENDPOINT}/event`)
      eventSource.addEventListener('ping', function(e) { console.log(e.data) })

      //if no events specified
      eventSource.addEventListener('message', function(e) {
        console.log(JSON.parse(e.data))
        messageList.value.push(JSON.parse(e.data))
      })

      eventSource.addEventListener('open', function(e) {
        console.log('Connected')
      }, false)

      eventSource.addEventListener('error', function(e) {
        console.log('error')
        console.log(e.eventPhase)
        console.log(e.target.readyState)

        if (e.eventPhase === EventSource.CLOSED) {
          // eventSource.close()
        }
        if (e.target.readyState === EventSource.CLOSED) {
          console.log('Disconnected')
        }
        else if (e.target.readyState === EventSource.CONNECTING) {
          messageList.value = []
          console.log('Connecting...')
        }
      }, false)
    })

    function toDatetimeString(timestamp) {
      const date = new Date(timestamp)
      return `${date.getMonth() + 1}/${date.getDate()} ${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
    }

    function sendMessage() {
      if (!text.value.trim()) return

      const data = { message: text.value }
      const url = `${API_ENDPOINT}/message`

      text.value = ''

      fetch(url, {
        body: JSON.stringify(data),
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        method: 'POST',
        mode: 'cors',
      })
      .then(response => {
        // console.log(response.json())
        $chatBox.value.scrollTop = $chatBox.value.scrollHeight
      })
    }

    return {
      text,
      messageList,
      sendMessage,
      $chatBox,
      toDatetimeString,
    }
  }
}
</script>
<style>
.chat-box {
  display: flex;
  flex-direction: column;
  background-color: #2c3e50;
  width: 100%;
  height: calc(100% - 48px);
  max-height: calc(100% - 48px);
  overflow: auto;
  border: 1px solid #95a5a6;
  box-sizing: border-box;
  text-align: left;
  padding: 24px;
}

.chat-box__message +.chat-box__message {
  margin-top: 8px;
}

.chat-box__message__text {
  display: inline-block;
  background-color: #7f8c8d;
  color: #ecf0f1;
  padding: 12px;
  border-radius: 15px;
}

.chat-box__message__datetime {
  display: inline-block;
  color: #95a5a6;
  margin-left: 8px;
  font-size: 12px;
  vertical-align: bottom;
}

.action-tool {
  width: 100%;
  height: 48px;
  background-color: #34495e;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.action-tool__input {
  width: calc(80% - 16px);
  height: calc(100% - 16px);
  border: 1px solid #bdc3c7;
  border-radius: 16px;
  outline: 0;
  font-size: 18px;
  padding: 0 12px;
  margin-right: 16px;
}

.action-tool__submit {
  width: calc(20%);
  height: calc(100% - 16px);
  border: 0;
  outline: 0;
  border-radius: 16px;
  padding: 0;
  margin: 0;
  background-color: #1abc9c;
  cursor: pointer;
}
</style>
