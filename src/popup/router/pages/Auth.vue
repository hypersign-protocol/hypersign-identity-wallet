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

      const accessToken = routeHash.split("&")[0].split("=")[1];
      const authToken = routeHash.split("&")[5].split("=")[1];

      localStorage.setItem("accessToken", JSON.stringify(accessToken))
      localStorage.setItem("authToken", JSON.stringify(authToken))
      this.$router.push({path: "/", params: {
        authToken: authToken, accessToken: accessToken
      }})
    }
    
};


</script>

<style>

</style>
