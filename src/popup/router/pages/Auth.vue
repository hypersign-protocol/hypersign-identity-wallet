<template>
</template>

<script>

export default {
    name: 'Auth',
    components: {},
    
    mounted(){
      const routeHash = this.$route.hash;


      const accessToken = routeHash.split("&")[0].split("=")[1];
      const authToken = routeHash.split("&")[5].split("=")[1];

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("authToken", authToken)
      this.$router.push({path: "/", query: {
        authToken: authToken, accessToken: accessToken
      }})

    }
    
};


</script>

<style>

</style>
