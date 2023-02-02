import edvService from "../popup/utils/edvService"
export default {
    methods: {
        async verifyToken() {
            try {

                const edvServiceInstance = new edvService()

                const data = await edvServiceInstance.verifyToken()
                //    console.log(data);
            } catch (error) {
                return error
            }
        }
    },
}