<template>
  
  <div>
      sdfnkjsdfn
  </div>
</template>

<script>



export default {
    name: 'Auth',
    components: {},
    mounted(){
      console.log(this.$route.query);
      localStorage.setItem("query", JSON.stringify(this.$route.query))
    }
    
};


</script>

<style>

</style>
