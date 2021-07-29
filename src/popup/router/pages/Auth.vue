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
      console.log(this.$route, location.search);

      const params = new URLSearchParams(location.search);
      console.log("PARAMS", params);
      localStorage.setItem("  ", JSON.stringify(this.$route.query))
    }
    
};


</script>

<style>

</style>
