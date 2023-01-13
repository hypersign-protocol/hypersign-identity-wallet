import Vue from 'vue';
import store from '.';
import { defaultNetwork } from '../popup/utils/constants';

export default {
    updateAccount(state, payload) {
        state.account = payload;
    },
    updateBalance(state, payload) {
        state.balance = payload;
    },
    switchNetwork(state, payload) {
        state.current.network = payload;
    },
    switchLoggedIn(state, payload) {
        state.isLoggedIn = payload;
    },
    
    updateLatestTransactions(state, payload) {
        state.transactions.latest = payload;
    },
    setPendingTxs(state, payload) {
        state.transactions.pending = payload;
    },
    setActiveAccount(state, payload) {
        state.account.publicKey = payload.publicKey;
        state.activeAccount = payload.index;
    },
    setNames(state, { names }) {
        state.names = names;
    },
    setUserNetwork(state, { index, ...network }) {
        if (index !== undefined) state.userNetworks[index] = network;
        else state.userNetworks.push({ ...defaultNetwork, ...network });
    },
    deleteUserNetwork(state, index) {
        state.userNetworks = state.userNetworks.filter((el, idx) => idx !== index);
    },
    initSdk(state, payload) {
        state.sdk = payload;
    },
    setMiddleware(state, payload) {
        state.middleware = payload;
    },
    setEncryptedWallet(state, payload) {
        state.encryptedWallet = payload;
    },
    setTipping(state, payload) {
        state.tipping = payload;
    },
    setMainLoading(state, payload) {
        state.mainLoading = payload;
    },
    setNodeStatus(state, payload) {
        state.nodeStatus = payload;
    },
    setCurrentCurrency(state, currency) {
        state.current.currency = currency;
    },
    setCurrencies(state, payload) {
        state.currencies = payload;
    },
    setNextCurrencyFetch(state, payload) {
        state.nextCurrenciesFetch = payload;
    },
    addNotification(state, payload) {
        state.notifications = [
            ...state.notifications,
            {
                ...payload,
                wallet: true,
                status: 'CREATED',
                createdAt: new Date().toISOString(),
            },
        ];
    },
    setNotificationsStatus(state, { createdAt, status }) {
        const index = state.notifications.findIndex(n => n.createdAt === createdAt);
        Vue.set(state.notifications[index], 'status', status);
    },
    setNotificationSettings(state, payload) {
        state.notificationSettings = payload;
    },
    setChainNames(state, payload) {
        state.chainNames = payload;
    },
    setTipDetails(state, payload) {
        state.tip = payload;
    },
    setTxQueue(state, payload) {
        state.txQueue = [...state.txQueue, payload];
    },
    addConnectedAepp(state, { host, account }) {
        state.connectedAepps = { ...state.connectedAepps, [host]: [account] };
    },
    setHSkeys(state, payload) {
        const { status, hdPathIndex, didDoc, did, keys, selected } = payload;

        ////HS_TODO
        if (selected == true) {
            state.hypersign.did = payload.did;
            state.hypersign.didDoc = payload.didDoc;
            state.hypersign.keys = payload.keys;
        }


        state.hypersign.dids[did] = {
            didDoc,
            hdPathIndex,
            status,
            keys,
        }

    
    },
    restoreHypersign(state, payload) {
        Object.assign(state.hypersign, payload);
    },
    addHSVerifiableCredential(state, payload) {
        ////HS_TODO
        state.hypersign.credentials.push(payload)
    },
    removeHSVerifiableCredential(state, payload) {
        ////HS_TODO
        state.hypersign.credentials = state.hypersign.credentials.filter((el) => el.id !== payload.id);
  
    },
    setThridPartyAuth(state, payload) {
        const thridPartyAuth = state.hypersign.thridPartyAuths.find(x => x.provider === payload.provider)
        if (!thridPartyAuth) {
            state.hypersign.thridPartyAuths.push(payload);
        }
    },
    clearThridPartyAuth(state, payload) {
        const indexToRemove = state.hypersign.thridPartyAuths.findIndex(x => x.provider === payload.provider)
        state.hypersign.thridPartyAuths.splice(indexToRemove, 1);
    },
    addRequestingAppInfo(state, payload) {
        ////HS_TODO
        state.hypersign.requestingAppInfo = payload
    },
    clearRequestingAppInfo(state, payload) {
        ////HS_TODO
        state.hypersign.requestingAppInfo = ''
    },
    addHypersignAuthDid(state, payload) {
        state.hypersign.hsAuthDID = payload;
    },
    addHSVerifiableCredentialTemp(state, payload) {
        ////HS_TODO
        state.hypersign.credentialsTemp.push(payload)
    },
    removeHSVerifiableCredentialTemp(state, payload) {
        ////HS_TODO
        state.hypersign.credentialsTemp = state.hypersign.credentialsTemp.filter((el) => el.id !== payload.id);
    },
    clearHSVerifiableCredentialTemp(state, payload) {
        ////HS_TODO
        state.hypersign.credentialsTemp = []
    },
    addHSProfile(state, payload) {
        state.hypersign.profile = payload
    },
    updateConnectedAepp(state, { host, account }) {
        state.connectedAepps = {
            ...state.connectedAepps,
            [host]: [...state.connectedAepps[host].accounts, account],
        };
    },
    setMnemonic(state, payload) {
        state.mnemonic = payload;
    },
    setBackedUpSeed(state, payload) {
        state.backedUpSeed = payload;
    },
    setTourRunning(state, payload) {
        state.tourRunning = payload;
    },

    setDontGoBack(state, payload) {
        state.dontGoBack = payload;

    },
    setTourStatusBar(state, payload) {
        state.tourStartBar = payload;
    },
    setProfile(state, payload) {
        state.profile = payload
    },
    setPassword(state, payload) {
        state.password = payload
    },
    setTippingAddress(state, payload) {
        state.tippingAddress = payload;
    },
    setSaveErrorLog(state) {
        state.saveErrorLog = !state.saveErrorLog;
    },
    setLoginTargetLocation(state, location) {
        state.loginTargetLocation = location;
    },
};