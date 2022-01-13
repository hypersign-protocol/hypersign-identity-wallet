<template>
</template>

<script>

import {  HYPERSIGN_AUTH_PROVIDER } from '../../utils/hsConstants'
export default {
    name: 'Auth',
    components: {},
    
    mounted(){
      const routeHash = this.$route.hash;


      const accessToken = routeHash.split("&")[0].split("=")[1];
      const authToken = routeHash.split("&")[5].split("=")[1];

      // localStorage.setItem("accessToken", accessToken)
      // localStorage.setItem("authToken", authToken)
      this.$router.push({path: "/", query: {
        authToken: authToken, accessToken: accessToken,
        provider: HYPERSIGN_AUTH_PROVIDER.GOOGLE
      }})

    }
    
};


</script>

<style>

</style>
