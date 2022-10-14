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
      const payload = {
        provider: 'Google',
        accessToken,
        authToken
      }
      
      this.$store.commit('setThridPartyAuth', payload);

      this.$router.push({path: "/"})

    }
    
};


</script>

<style>

</style>
