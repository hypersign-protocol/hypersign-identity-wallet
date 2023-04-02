<template>
    <div class="chat-container popup">
        <div class="chat-header">{{ did }}</div>

        <div class="chat-messages">
            <div v-for="(message, index) in messages" :key="index"
                :class="['chat-message', message.user === 'Me' ? 'chat-message-right' : 'chat-message-left']">
                <div class="chat-message-text">{{ message.text }}</div>
                <div class="chat-message-timestamp">{{ formatTimestamp(message.timestamp) }}</div>
            </div>
        </div>
        <form>
            <div class="chat-input">
                <button type="button" class="attachment-btn">
                    <img src="../../../icons/attachment.svg" alt="" srcset="">
                </button>
                <input type="text" v-model="newMessageText" placeholder="Type a message...">

                <button @click="sendMessage" type="submit"><img src="../../../icons/paper-plane.svg" alt=""
                        srcset=""></button>
            </div>
        </form>
    </div>
</template>

<script>





export default {

    created() {
        this.did=this.$route.params.did
    },

    data() {
        return {
            did:'',
            messages: [
                { user: 'John', text: `If this still doesn't meet your requirements, please let me know and I will try to adjust it further.`, timestamp: '2022-04-01T10:30:00' },
                { user: 'Me', text: 'Hi there!', timestamp: '2022-04-01T10:30:00' },

            ],
            newMessageText: '',
        }
    },
    methods: {
        sendMessage() {
            const timestamp = new Date().toISOString();
            this.messages.push({
                user: 'Me',
                text: this.newMessageText,
                timestamp,
            });
            this.newMessageText = '';
        },
        formatTimestamp(timestamp) {
            const date = new Date(timestamp);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        },
    },

}
</script>
<style>


input:focus {
    outline: none;
}

.chat-container {
    display: flex;
    flex-direction: column;
    height: 90vh;
    font-family: sans-serif;
}

.chat-header {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    background-color: #0000006b;
    color: #FFF;
    font-size: 15px;
    font-weight: bold;
    border-radius: 5px;
}

.chat-messages {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px;
    overflow-y: auto;
    background-color: #F2F2F2;
}

.chat-message {
    display: flex;
    flex-direction: column;
    max-width: 70%;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 10px;
    color: #333;
    background-color: #FFF;
    box-shadow: 1px 1px 2px #DDD;
}

.chat-message-right {
    align-self: flex-end;
    background-color: #00000021;
    color: #333;
    box-shadow: 1px 1px 2px #DDD;
}

.chat-message-left {
    align-self: flex-start;
    background-color: #FFF;
    color: #333;
    box-shadow: 1px 1px 2px #DDD;
}

.chat-message-text {
    font-size: 16px;
    line-height: 1.4;
    margin-bottom: 5px;
}

.chat-message-timestamp {
    font-size: 12px;
    color: #999;
    align-self: flex-end;
    margin-top: 5px;
    margin-left: 5px;
}

.chat-input {
    display: flex;
    align-items: center;
    height: 60px;
    background-color: #F2F2F2;
    border: 1px solid #0000006b;
}

.chat-input input {
    flex: 1;
    padding: 10px;
    border: none;
    font-size: 16px;
}

.chat-input button {
    width: 50px;
    height: 40px;
    margin-right: 10px;
    margin-left: 10px;

    background-color: gray;
    color: #FFF;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
}

.chat-input button:hover {
    background-color: black;
}</style>
