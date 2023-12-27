import EdvService from '../popup/utils/edvService';

export default {
  methods: {
    async verifyToken() {
      try {
        const edvServiceInstance = new EdvService();

        const data = await edvServiceInstance.verifyToken();
        return data;
      } catch (error) {
        return error.response;
      }
    },
  },
};
