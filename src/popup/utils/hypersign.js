export function getSchemaIdFromSchemaUrl(schemaUrl) {
    if (!schemaUrl) throw new Error('SchemaUrl must be passed')
    const schUrl = new URL(schemaUrl)
    const t = schUrl.pathname.split('/hypersign-protocol/hidnode/ssi/schema/');
    const schemaID = schemaUrl.endsWith(':') ? t[1].substring(0, t[1].length - 1)  : t[1];
    return schemaID
}

