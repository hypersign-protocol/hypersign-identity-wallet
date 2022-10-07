import { Bip39, Slip10, Slip10RawIndex, Slip10Curve } from '@cosmjs/crypto';

function makeSSIWalletPath(minHardIndex) {
    return [
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.hardened(118),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.hardened(minHardIndex),

    ];
}

export async function generateMnemonicToHDSeed(mnemonic, minHardIndex = 0) {
    console.log("mnemonic", mnemonic);
    const seed = Bip39.decode(mnemonic)
    const slipPathKeys = Slip10.derivePath(Slip10Curve.Ed25519, seed, makeSSIWalletPath(minHardIndex))
    const seedHD = slipPathKeys.privkey
    return seedHD;
}