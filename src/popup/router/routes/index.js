import Index from '../pages/Index';
import Account from '../pages/Account';
import Settings from '../pages/Settings';
import GeneralSettings from '../pages/GeneralSettings';
import SecuritySettings from '../pages/SecuritySettings';
import BackupWallet from '../pages/BackupWallet';
// import BackupWalletEdv from '../pages/BackupWalletEdv';
import RestoreWallet from '../pages/RestoreWallet';
// import RestoreWalletEdv from '../pages/RestoreWalletEdv';
import AskPinBackUp from '../pages/AskPinBackUp'
import AskPinLockRecover from '../pages/AskPinLockRecover'
import AboutSettings from '../pages/AboutSettings';
import TermsOfService from '../pages/TermsOfService';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import ImportAccount from '../pages/ImportAccount';
import Intro from '../pages/Intro';
import Networks from '../pages/Networks';
import NotFound from '../pages/NotFound';
import Address from '../pages/Address';
import webIframePopups from './web-iframe-popups';
import BusinessCard from '../pages/BusinessCard';
import CertificateCard from "../pages/CertificateCard"
// Hypersign related
import Credentials from '../pages/Credentials';
import CredentialIssue from '../pages/CredentialIssue';
import Dids from '../pages/DIDs';

import Transactions from '../pages/Transactions';
import TransactionDetails from '../pages/TransactionDetails';
import SignSchema from '../pages/SignSchema';
import SignCredential from '../pages/SignCredential';
import SignDid from '../pages/SignDid';
import UpdateDid from '../pages/UpdateDid';
import SharedCredential from '../pages/SharedCredential';
import Profile from '../pages/Profile';
import Transfer from '../pages/Transfer';
import CredentialsDetails from '../pages/CredentialsDetails';
import DidsDetails from '../pages/DidsDetails';
import CredentialsDetailsTemp from '../pages/CredentialsDetailsTemp';
import CredentialsDetailsAuthorize from '../pages/CredentialsDetailsAuthorize';
import Deeplink from '../pages/Deeplink';
import Auth from "../pages/Auth";
import Vue from 'vue';
import VueMeta from "vue-meta"
Vue.use(VueMeta);
export default [{
    path: '/',
    component: Index,
    meta: {
        title: '',
        navigation: false,
        ifNotAuthOnly: true,
        notPersist: true,
    },
},
{
    path: '/account',
    name: 'account',
    component: Account,
},

{
    path: "/auth/:authType",
    name: "Auth",
    component: Auth,
    meta: {
        title: 'Auth',
        navigation: false,
        ifNotAuthOnly: true,
        notPersist: true,
    },

},
{
    path: "/schema", // sign schema
    name: "IssueSchema",
    component: SignSchema,
    meta: {
        title: 'IssueSchema',
    },
},
{
    path: "/signcredential", // sign schema
    name: "SignCredential",
    component: SignCredential,
    meta: {
        title: 'SignCredential',
    },
},
{
    path: "/signdid", // sign schema
    name: "SignDid",
    component: SignDid,
    meta: {
        title: 'SignDid',
    },
}, {
    path: "/updatedid", // sign schema
    name: "UpdateDid",
    component: UpdateDid,
    meta: {
        title: 'SignDid',
    },
},
{
    path: '/deeplink',
    name: 'deeplink',
    component: Deeplink,
},
{
    path: '/settings',
    component: Settings,
    meta: {
        title: 'settings',
    },
},
{
    path: '/generalSettings',
    component: GeneralSettings,
    meta: {
        title: 'general',
    },
},
{
    path: '/securitySettings',
    name: 'settings-security',
    component: SecuritySettings,
    meta: {
        title: 'security',
    },
},
{
    path: '/backupWallet',
    name: 'backup-wallet',
    component: BackupWallet,
    meta: {
        title: 'backup-wallet',
    },
},

{
    path: '/askpinbackup',
    name: 'ask-pin',
    component: AskPinBackUp,
    meta: {
        title: 'backup-wallet',
    },
},
{
    path: '/askpinrecover',
    name: 'ask-pin-recover-lock',
    component: AskPinLockRecover,
    meta: {
        title: 'restore-wallet',
        ifNotAuthOnly:true
    },
},
// {
//     path: '/backupWalletEdv',
//     name: 'backup-wallet-edv',
//     component: BackupWalletEdv,
//     meta: {
//         title: 'backup-wallet',
//     },
// },
{
    path: '/restoreWallet',
    name: 'restore-wallet',
    component: RestoreWallet,
    meta: {
        title: 'restore-wallet',
        ifNotAuthOnly: true
    },
},


// {
//     path: '/restoreWalletEdv',
//     name: 'restore-wallet-edv',
//     component: RestoreWalletEdv,
//     meta: {
//         title: 'restore-wallet',
//         ifNotAuthOnly: true
//     },
// },

{
    path: '/aboutSettings',
    component: AboutSettings,
    meta: {
        title: 'about',
    },
},
{
    path: '/termsOfService',
    component: TermsOfService,
    meta: {
        title: 'terms',
        ifNotAuth: true,
    },
},
{
    path: '/privacyPolicy',
    component: PrivacyPolicy,
    meta: {
        title: 'privacy',
    },
},
{
    path: '/importAccount',
    component: ImportAccount,
    meta: {
        title: 'importAccount',
        ifNotAuthOnly: true,
    },
},
{
    path: '/intro',
    component: Intro,
    meta: {
        ifNotAuthOnly: true,
        notPersist: true,
    },
},
{
    path: '/networks',
    component: Networks,
    props: true,
    meta: {
        title: 'networks',
    },
},
{
    name: 'address',
    path: '/address',
    component: Address,
    meta: {
        title: 'address',
        notPersist: true,
    },
},
{
    name: 'not-found',
    path: '*',
    component: NotFound,
    meta: {
        ifNotAuth: true,
    },
},
{
    name: 'profile',
    path: '/profile',
    component: Profile,
    props: true,
    meta: {
        title: 'profile',
    },
},
{
    name: 'transfer',
    path: '/transfer',
    component: Transfer,
    props: true,
    meta: {
        title: 'transfer',
    },
},
{
    name: 'credential',
    path: '/credential',
    component: Credentials,
    props: true,
    meta: {
        title: 'credential',
    },
},
{
    name: 'credential',
    path: '/credential/issue',
    component: CredentialIssue,
    props: true,
    meta: {
        title: 'issueCredential',
    },
},
{
    name: 'did',
    path: '/did',
    component: Dids,
    props: true,
    meta: {
        title: 'Did',
    },
},
{
    name: 'DidsDetails',
    path: '/did/:did',
    component: DidsDetails,
    props: true,
    meta: {
        title: 'DidsDetails',
    }
}
    ,
{
    name: 'transactions',
    path: '/transactions',
    component: Transactions,
    props: true,
    meta: {
        title: 'transactions',
    },
},
{
    name: 'transactionDetails',
    path: '/transaction/:txhash',
    component: TransactionDetails,
    props: true,
    meta: {
        title: 'transactionDetails',
    },
},
{
    name: 'credentialDetails',
    path: '/credential/:credentialId',
    component: CredentialsDetails,
    props: true,
    meta: {
        title: 'credentialDetails',
    }
},
{
    name: 'sharedCredential',
    path: '/businesscard/:vp',
    component: BusinessCard,
    props: true,
    meta: {
        title: 'sharedCredential',
        ifNotAuth: true,
        navigation: false,
        notPersist: true,

    },

},
{
    name: 'certificateCard',
    path: '/certificatecard/:vp',
    component: CertificateCard,
    props: true,
    meta: {
        title: 'CertificateCard',               
        ifNotAuth: true,
        navigation: false,
        notPersist: true,
        

    },

}
    ,

{
    name: 'CredentialsDetailsTemp',
    path: '/credential/temp/:credentialId',
    component: CredentialsDetailsTemp,
    props: true,
    meta: {
        title: 'credentialDetailsTemp'
    }
},

{
    name: 'CredentialsDetailsAuthorize',
    path: '/credential/authorize/:credentialId',
    component: CredentialsDetailsAuthorize,
    props: true,
    meta: {
        title: 'credentialDetailsAuthorize'
    }
},
...webIframePopups,
];