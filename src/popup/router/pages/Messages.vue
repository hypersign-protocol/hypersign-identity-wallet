<template>
    <div class="popup">
        <Panel>
            <PanelItem
                :title= "`did:hid:testnet:z6khjagkjag`"
                :to="`message/did:hid:testnet:z6khjagkjag`"
                :info= "`Last Message`"
                />


                <PanelItem
                :title= "`did:hid:testnet:z6khjagkjags2`"
                :to="`message/did:hid:testnet:z6khjagkjags2`"
                :info= "`Last Message`"
                />
        </Panel>


        <div style="justify-content: center; display: flex">
            <button class="round-button" value="Scan Qr">
                <img src="../../../icons/abstract-user-flat-4.png" class="round-button-qr" />
            </button>
        </div>
    </div>
</template>


<script>
import Panel from '../components/Panel';
import PanelItem from '../components/PanelItem';
export default {
    components:{PanelItem, Panel},
    data() {
        return {
            did: '',
            userName: '',
            lastmsg: '',

        }
    }
}

</script>