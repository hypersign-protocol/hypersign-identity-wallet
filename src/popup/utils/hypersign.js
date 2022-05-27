export function getSchemaIdFromSchemaUrl(schemaUrl) {
    if (!schemaUrl) throw new Error('SchemaUrl must be passed')
    const schUrl = new URL(schemaUrl)
    let path = schUrl.pathname;
    const schemaIDWithColon = path.substr('/hypersign-protocol/hidnode/ssi/schema/'.length, path.length - 1)
    const schemaID = schemaIDWithColon.substring(0, schemaIDWithColon.length - 1)
    return schemaID
}