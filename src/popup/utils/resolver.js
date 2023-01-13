import {HIDNODE_REST} from './hsConstants'; 
export const didResolver = async (did) => {
    const response = await fetch(`${HIDNODE_REST}hypersign-protocol/hidnode/ssi/did/${did}`);
    const data = await response.json();
    return data;
}

