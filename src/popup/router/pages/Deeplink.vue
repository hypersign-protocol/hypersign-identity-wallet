<template>
    <div></div>
</template>

<script>
export default {
    created() {
       this.$router.push(`/account?url=${this.$route.query.url}`); 
    }
}
</script>