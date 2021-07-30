<template>
  
  <div class="auth">
      sdfnkjsdfn
  </div>
</template>

<script>

export default {
    name: 'Auth',
    components: {},
    
    mounted(){
      const routeHash = this.$route.hash;

      console.log(routeHash);

      const accessToken = routeHash.split("&")[0].split("=")[1];
      const authToken = routeHash.split("&")[5].split("=")[1];

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("authToken", authToken)
      this.$router.push({path: "/", params: {
        authToken: authToken, accessToken: accessToken
      }})
    }
    
};


</script>

<style>

</style>
