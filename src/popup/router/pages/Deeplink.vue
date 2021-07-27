<template>
  <div>
  </div>
</template>

<script>

export default {
  name: 'Deeplink',
  components: {
  },
  data() {
    return {
  
    };
  },
  created() {   
    // console.log('Inside deeplink page')
    // console.log(this.$route.query)
    // console.log(this.$route.query.url)
    //Only for deeplinking
    if(this.$route.query.url && this.$route.query.url !=''){
      this.$router.push('/account?url=' + this.$route.query.url);
    }

  },
  methods: {
  }
};
</script>

